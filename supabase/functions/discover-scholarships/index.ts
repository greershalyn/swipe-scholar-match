
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
    const timestamp = requestData.timestamp || Date.now();

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // First, try to find local scholarships from the database
    const { data: localScholarships, error: localError } = await supabase
      .from('scholarships')
      .select('*')
      .eq('is_active', true)
      .gt('deadline', new Date().toISOString())
      .lt('created_at', new Date(timestamp).toISOString())
      .or(`description.ilike.%${userProfile.state}%,description.ilike.%${userProfile.city}%`)
      .order('created_at', { ascending: false });

    if (localError) {
      console.error('Error fetching local scholarships:', localError);
    }

    // If we have enough local scholarships, return them
    if (localScholarships && localScholarships.length >= 5) {
      console.log('Found sufficient local scholarships:', localScholarships.length);
      return new Response(
        JSON.stringify({
          success: true,
          scholarships: localScholarships
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }

    // If we need more scholarships, generate new ones with OpenAI
    const openAiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Create scholarship URLs based on location and field
    const generateScholarshipUrl = (title: string, provider: string) => {
      const normalizedProvider = provider.toLowerCase().replace(/\s+/g, '-');
      const normalizedTitle = title.toLowerCase().replace(/\s+/g, '-');
      return `https://www.scholarships.com/${normalizedProvider}/${normalizedTitle}`;
    };

    try {
      // Build a detailed prompt based on user profile
      const userProfilePrompt = `
        Location: ${userProfile.city}, ${userProfile.state}
        Education Level: ${userProfile.current_education_level || 'Any'}
        Major: ${userProfile.intended_major || 'Any'}
        GPA: ${userProfile.gpa || 'Any'}
        Ethnicity: ${userProfile.ethnicity || 'Any'}
        First Generation Student: ${userProfile.first_generation_student ? 'Yes' : 'No'}
        Keywords: ${(userProfile.keywords || []).join(', ')}
        Extracurricular Activities: ${(userProfile.extracurricular_activities || []).join(', ')}
        Organizations: ${(userProfile.organizations || []).join(', ')}
      `;

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
              content: 'You are a scholarship database API that specializes in finding local and matching scholarships based on student profiles.'
            },
            {
              role: 'user',
              content: `Generate 10 unique scholarships for a student with the following profile:
                ${userProfilePrompt}

                Priority order for scholarships:
                1. Local scholarships specific to ${userProfile.city}, ${userProfile.state}
                2. State-wide scholarships for ${userProfile.state}
                3. Field-specific scholarships for ${userProfile.intended_major}
                4. Demographic-specific scholarships based on profile
                5. General scholarships matching other criteria

                Each scholarship must include:
                - title (string)
                - amount (number, specific amount)
                - requirements (array of specific criteria)
                - provider (string, real organization name)
                - description (detailed string mentioning location if local)
                - category (string: "Local", "State", "Field-specific", "Demographic", or "General")`
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

      // Transform and validate scholarships
      const validatedScholarships = scholarshipsData.scholarships.map(s => ({
        id: crypto.randomUUID(),
        title: String(s.title || '').trim(),
        amount: Number(s.amount) || 0,
        deadline: new Date(new Date().setMonth(new Date().getMonth() + Math.floor(Math.random() * 6) + 1)).toISOString(),
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
        created_at: new Date().toISOString()
      }));

      // Combine local and generated scholarships
      const allScholarships = [...(localScholarships || []), ...validatedScholarships];

      // Insert new scholarships
      for (const scholarship of validatedScholarships) {
        const { error: insertError } = await supabase
          .from('scholarships')
          .upsert([scholarship]);

        if (insertError) {
          console.error('Error inserting scholarship:', insertError);
        }
      }

      // Return combined results
      return new Response(
        JSON.stringify({
          success: true,
          scholarships: allScholarships
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );

    } catch (error) {
      console.error('Error generating scholarships:', error);
      throw error;
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
