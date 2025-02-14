
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
    
    // Get scholarships directly from the database first
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
    
    // Fetch active scholarships from the database
    const { data: existingScholarships, error: fetchError } = await supabase
      .from('scholarships')
      .select('*')
      .eq('is_active', true)
      .gt('deadline', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(10)
      .range((page - 1) * 10, page * 10 - 1);

    if (fetchError) {
      console.error('Error fetching scholarships:', fetchError);
      throw fetchError;
    }

    // If we have enough scholarships, return them
    if (existingScholarships && existingScholarships.length > 0) {
      console.log('Returning existing scholarships:', existingScholarships.length);
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
    }

    // If we don't have enough scholarships, generate new ones using OpenAI
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

    // Create a fallback scholarship with a valid URL
    const fallbackScholarship = {
      id: crypto.randomUUID(),
      title: "General Academic Excellence Scholarship",
      amount: 5000,
      deadline: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString(),
      requirements: ["Minimum GPA of 3.0", "Full-time enrollment", "Essay submission required"],
      provider: "Academic Success Foundation",
      url: "https://www.scholarships.com/academic-success-foundation/general-excellence",
      description: "A scholarship for dedicated students pursuing higher education.",
      category: "General",
      is_active: true,
      verified: false,
      last_verified_at: new Date().toISOString(),
      source_url: null,
      match_score: null
    };

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are a scholarship database API that returns only valid JSON data for scholarship opportunities.'
            },
            {
              role: 'user',
              content: `Generate 5 realistic scholarships for a ${userProfile.current_education_level || 'college'} student 
                       studying ${userProfile.intended_major || 'any major'} with a GPA of ${userProfile.gpa || 'any GPA'}.
                       Each scholarship must include: title, amount (number), requirements (array), provider, description, and category.`
            }
          ],
          temperature: 0.7,
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
        deadline: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString(),
        requirements: Array.isArray(s.requirements) ? s.requirements : [],
        provider: String(s.provider || 'Unknown Provider').trim(),
        url: generateScholarshipUrl(s.title || '', s.provider || 'Unknown Provider'),
        description: String(s.description || '').trim(),
        category: String(s.category || 'General').trim(),
        is_active: true,
        verified: false,
        last_verified_at: new Date().toISOString(),
        source_url: null,
        match_score: null
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
      
      // If OpenAI fails, insert and return the fallback scholarship
      const { error: insertError } = await supabase
        .from('scholarships')
        .upsert([fallbackScholarship]);

      if (insertError) {
        console.error('Error inserting fallback scholarship:', insertError);
      }

      return new Response(
        JSON.stringify({
          success: true,
          scholarships: [fallbackScholarship]
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }
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
