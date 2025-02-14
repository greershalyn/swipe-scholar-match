
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
    if (req.method !== 'POST') {
      throw new Error('Method not allowed');
    }

    const contentType = req.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Content-Type must be application/json');
    }

    const requestData = await req.json();
    console.log('Received request data:', JSON.stringify(requestData, null, 2));

    if (!requestData.userProfile) {
      throw new Error('User profile is required');
    }

    const userProfile = requestData.userProfile;
    const page = requestData.page || 1;
    
    const openAiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const currentDate = new Date();
    const sixMonthsFromNow = new Date();
    sixMonthsFromNow.setMonth(currentDate.getMonth() + 6);

    const searchPrompt = `
      As a scholarship search assistant, find 5 currently available scholarships for a student with the following profile:
      - Major: ${userProfile.intended_major || 'Any'}
      - Education Level: ${userProfile.current_education_level || 'Any'}
      - Location: ${userProfile.state ? `${userProfile.state}, USA` : 'Any'}
      - GPA: ${userProfile.gpa || 'Not specified'}
      - SAT Score: ${userProfile.sat_score || 'Not specified'}
      - ACT Score: ${userProfile.act_score || 'Not specified'}
      
      Please provide recommendations that meet these requirements:
      1. Each scholarship must be unique
      2. Include scholarships with varying award amounts
      3. Deadlines should be between ${currentDate.toISOString().split('T')[0]} and ${sixMonthsFromNow.toISOString().split('T')[0]}
      4. Include specific eligibility criteria
      5. Focus on local scholarships if location is provided
      
      Format the response as a JSON object with a "scholarships" array. Each scholarship should include:
      - title (string)
      - amount (number, just the number without $ or commas)
      - deadline (ISO date string)
      - requirements (array of strings)
      - provider (string)
      - url (string)
      - description (string)
      - category (string: e.g., "Academic", "Athletic", "Merit-based", "Need-based", "Field-specific")`;

    console.log('Making OpenAI API request...');
    
    try {
      console.log('OpenAI Request Configuration:', {
        model: 'gpt-3.5-turbo',
        temperature: 0.7,
        prompt_length: searchPrompt.length
      });

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a scholarship search assistant that provides detailed, accurate scholarship information in JSON format.'
            },
            {
              role: 'user',
              content: searchPrompt
            }
          ],
          temperature: 0.7
        }),
      });

      console.log('OpenAI Response Status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenAI API error response:', errorText);
        throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
      }

      const openAIData = await response.json();
      console.log('OpenAI Response Headers:', Object.fromEntries(response.headers.entries()));
      console.log('OpenAI raw response:', JSON.stringify(openAIData, null, 2));
      
      if (!openAIData.choices?.[0]?.message?.content) {
        throw new Error('No content in OpenAI response');
      }

      let scholarshipsData;
      try {
        const content = openAIData.choices[0].message.content;
        console.log('Raw OpenAI content:', content);
        scholarshipsData = JSON.parse(content);
        console.log('Parsed scholarships data:', JSON.stringify(scholarshipsData, null, 2));
      } catch (parseError) {
        console.error('Error parsing OpenAI response:', parseError);
        console.log('Failed content:', openAIData.choices[0].message.content);
        throw new Error('Failed to parse OpenAI response as JSON');
      }

      if (!scholarshipsData.scholarships || !Array.isArray(scholarshipsData.scholarships)) {
        console.error('Invalid data structure:', scholarshipsData);
        throw new Error('Invalid scholarship data format from OpenAI');
      }

      // Validate and clean each scholarship
      const validatedScholarships = scholarshipsData.scholarships.map(s => {
        const scholarship = {
          title: String(s.title || 'Untitled Scholarship'),
          amount: Number(s.amount) || 0,
          deadline: new Date(s.deadline).toISOString(),
          requirements: Array.isArray(s.requirements) ? s.requirements.map(String) : [],
          provider: String(s.provider || 'Unknown Provider'),
          url: String(s.url || `https://example.com/scholarship/${crypto.randomUUID()}`),
          description: String(s.description || ''),
          category: String(s.category || 'General'),
          id: crypto.randomUUID(),
          is_active: true,
          verified: false,
          last_verified_at: new Date().toISOString()
        };
        console.log('Validated scholarship:', scholarship);
        return scholarship;
      });

      // Insert scholarships into the database
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Missing Supabase configuration');
      }

      const supabase = createClient(supabaseUrl, supabaseKey);
      console.log('Inserting scholarships into database...');

      for (const scholarship of validatedScholarships) {
        try {
          const { data, error: insertError } = await supabase
            .from('scholarships')
            .upsert([scholarship], { 
              onConflict: 'id',
              ignoreDuplicates: false 
            })
            .select();

          if (insertError) {
            console.error('Error inserting scholarship:', insertError);
            throw insertError;
          } else {
            console.log('Successfully inserted scholarship:', scholarship.title);
          }
        } catch (error) {
          console.error('Exception inserting scholarship:', error);
          throw error;
        }
      }

      console.log('Successfully processed all scholarships');
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
    } catch (openaiError) {
      console.error('OpenAI API error:', openaiError);
      throw openaiError;
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
        status: 200 // Return 200 even for errors to ensure the error message gets through
      }
    );
  }
});
