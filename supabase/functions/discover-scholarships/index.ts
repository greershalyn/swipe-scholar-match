
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const openAiApiKey = Deno.env.get('OPENAI_API_KEY')!;
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userProfile } = await req.json();
    console.log('Received user profile:', userProfile);
    
    // Create a detailed prompt based on user profile
    const searchPrompt = `
      Find current available scholarships for a student with the following profile:
      - Major: ${userProfile.intended_major || 'Any'}
      - GPA: ${userProfile.gpa || 'Not specified'}
      - Education Level: ${userProfile.current_education_level || 'Any'}
      - Ethnicity: ${userProfile.ethnicity || 'Not specified'}
      - First Generation Student: ${userProfile.first_generation_student ? 'Yes' : 'No'}
      
      For each scholarship, provide:
      1. Title
      2. Amount (in USD)
      3. Application deadline
      4. Eligibility requirements
      5. Provider/organization name
      6. Application URL
      7. A brief description
      
      Return the data in a structured JSON format. Only include currently active scholarships with deadlines in the future.
      Format: {
        "scholarships": [{
          "title": string,
          "amount": number,
          "deadline": "YYYY-MM-DD",
          "requirements": string[],
          "provider": string,
          "url": string,
          "description": string
        }]
      }
    `;

    console.log('Sending prompt to OpenAI:', searchPrompt);

    const openAiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: 'You are a scholarship research assistant helping to find relevant scholarships for students. Only provide real, currently available scholarships.'
          },
          {
            role: 'user',
            content: searchPrompt
          }
        ],
      }),
    });

    if (!openAiResponse.ok) {
      const errorData = await openAiResponse.text();
      console.error('OpenAI API error response:', errorData);
      
      // Check for quota exceeded error
      if (errorData.includes('insufficient_quota')) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'OpenAI API quota exceeded. Please check your OpenAI account billing status.',
            quota_exceeded: true
          }),
          {
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      throw new Error(`OpenAI API error: ${errorData}`);
    }

    const openAiData = await openAiResponse.json();
    console.log('OpenAI API raw response:', openAiData);
    
    if (!openAiData.choices || !openAiData.choices[0] || !openAiData.choices[0].message) {
      console.error('Unexpected OpenAI response format:', openAiData);
      throw new Error('Invalid response format from OpenAI');
    }

    let scholarshipsData;
    try {
      scholarshipsData = JSON.parse(openAiData.choices[0].message.content);
      console.log('Parsed scholarships data:', scholarshipsData);
    } catch (error) {
      console.error('Failed to parse OpenAI response:', openAiData.choices[0].message.content);
      throw new Error('Invalid JSON response from OpenAI');
    }

    if (!scholarshipsData.scholarships || !Array.isArray(scholarshipsData.scholarships)) {
      console.error('Invalid scholarships data format:', scholarshipsData);
      throw new Error('Invalid scholarships data format');
    }

    // Insert scholarships into database
    for (const scholarship of scholarshipsData.scholarships) {
      const { data: existingScholarship, error: checkError } = await supabase
        .from('scholarships')
        .select('id')
        .eq('url', scholarship.url)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking existing scholarship:', checkError);
        continue;
      }

      if (!existingScholarship) {
        const { error: insertError } = await supabase
          .from('scholarships')
          .insert([{
            title: scholarship.title,
            amount: scholarship.amount,
            deadline: new Date(scholarship.deadline),
            requirements: scholarship.requirements,
            provider: scholarship.provider,
            url: scholarship.url,
            description: scholarship.description,
            category: 'General',
            verified: true,
            is_active: true,
            last_verified_at: new Date(),
          }]);

        if (insertError) {
          console.error('Error inserting scholarship:', insertError);
          continue;
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        count: scholarshipsData.scholarships.length,
        message: `Successfully processed ${scholarshipsData.scholarships.length} scholarships`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in discover-scholarships function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        details: error instanceof Error ? error.stack : undefined
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
