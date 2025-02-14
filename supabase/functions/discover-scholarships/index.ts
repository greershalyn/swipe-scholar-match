
// Required for fetch in Deno environment
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import { UserProfile } from './types.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Max-Age': '86400',
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    });
  }

  try {
    const requestData = await req.json();
    console.log('Received request data:', JSON.stringify(requestData, null, 2));

    if (!requestData.userProfile) {
      throw new Error('User profile is required');
    }

    const userProfile = requestData.userProfile;
    const page = requestData.page || 1;
    const timestamp = requestData.timestamp || Date.now(); // Use timestamp for cache busting
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // First, clear any test data that might be causing issues
    const { error: cleanupError } = await supabase
      .from('scholarships')
      .delete()
      .eq('is_active', false);

    if (cleanupError) {
      console.error('Error cleaning up test data:', cleanupError);
    }
    
    // Fetch active scholarships from the database, using timestamp to get newer results
    const { data: existingScholarships, error: fetchError } = await supabase
      .from('scholarships')
      .select('*')
      .eq('is_active', true)
      .gt('deadline', new Date().toISOString())
      .lt('created_at', new Date(timestamp).toISOString()) // Only get scholarships created before this request
      .order('created_at', { ascending: false })
      .limit(10)
      .range((page - 1) * 10, page * 10 - 1);

    if (fetchError) {
      console.error('Error fetching scholarships:', fetchError);
      throw fetchError;
    }

    // Generate new scholarships if we don't have enough or if explicitly requested by timestamp
    if (!existingScholarships || existingScholarships.length < 10 || requestData.forceRefresh) {
      console.log('Generating new scholarships...');
      const openAiApiKey = Deno.env.get('OPENAI_API_KEY');
      if (!openAiApiKey) {
        throw new Error('OpenAI API key not configured');
      }

      // Create scholarship URLs based on major/field
      const generateScholarshipUrl = (title: string, provider: string) => {
        const normalizedProvider = provider.toLowerCase().replace(/\s+/g, '-');
        const normalizedTitle = title.toLowerCase().replace(/\s+/g, '-');
        return `https://www.scholarships.com/${normalizedProvider}/${normalizedTitle}`;
      };

      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: 'You are a scholarship database API that returns only valid JSON data for unique scholarship opportunities. Never repeat the same scholarship twice.'
              },
              {
                role: 'user',
                content: `Generate 10 unique and diverse scholarships for a ${userProfile.current_education_level || 'college'} student 
                         studying ${userProfile.intended_major || 'any major'} with a GPA of ${userProfile.gpa || 'any GPA'}.
                         Ensure each scholarship has a different focus area, amount range, and requirements.
                         Include niche and specialized opportunities.
                         Each scholarship must include: title, amount (number), requirements (array), provider, description, and category.`
              }
            ],
            temperature: 0.9, // Increased for more variety
            response_format: { type: "json_object" }
          }),
        });

        if (!response.ok) {
          throw new Error(`OpenAI API error: ${response.status}`);
        }

        const openAIData = await response.json();
        
        if (!openAIData.choices?.[0]?.message?.content) {
          throw new Error('Invalid response format from OpenAI');
        }

        const scholarshipsData = JSON.parse(openAIData.choices[0].message.content);
        
        if (!scholarshipsData.scholarships || !Array.isArray(scholarshipsData.scholarships)) {
          throw new Error('Invalid scholarship data format from OpenAI');
        }

        // Transform and validate scholarships with proper URLs
        const validatedScholarships = scholarshipsData.scholarships.map(s => ({
          id: crypto.randomUUID(),
          title: String(s.title || '').trim(),
          amount: Number(s.amount) || 0,
          deadline: new Date(new Date().setMonth(new Date().getMonth() + Math.floor(Math.random() * 6) + 1)).toISOString(), // Random deadline 1-6 months ahead
          requirements: Array.isArray(s.requirements) ? s.requirements : [],
          provider: String(s.provider || 'Unknown Provider').trim(),
          url: generateScholarshipUrl(s.title || '', s.provider || 'Unknown Provider'),
          description: String(s.description || '').trim(),
          category: String(s.category || 'General').trim(),
          is_active: true,
          verified: false,
          last_verified_at: new Date().toISOString(),
          source_url: null,
          match_score: null,
          created_at: new Date().toISOString() // Ensure new scholarships have current timestamp
        }));

        // Insert scholarships
        for (const scholarship of validatedScholarships) {
          const { error: insertError } = await supabase
            .from('scholarships')
            .upsert([scholarship]);

          if (insertError) {
            console.error('Error inserting scholarship:', insertError);
          }
        }

        return new Response(
          JSON.stringify({
            success: true,
            scholarships: validatedScholarships
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
          }
        );

      } catch (openAIError) {
        console.error('OpenAI Error:', openAIError);
        throw openAIError;
      }
    }

    // Return existing scholarships if we have enough
    return new Response(
      JSON.stringify({
        success: true,
        scholarships: existingScholarships
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
    
  } catch (error) {
    console.error('Error in discover-scholarships function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        scholarships: []
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  }
});
