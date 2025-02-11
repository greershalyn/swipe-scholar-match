
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

const openAiApiKey = Deno.env.get('OPENAI_API_KEY')!;

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    });
  }

  try {
    const { userProfile, page = 1 } = await req.json();
    console.log('Received user profile for scholarship search:', userProfile, 'page:', page);

    if (!openAiApiKey) {
      console.error('OpenAI API key not configured');
      throw new Error('OpenAI API key not configured');
    }

    const currentDate = new Date();
    const sixMonthsFromNow = new Date();
    sixMonthsFromNow.setMonth(currentDate.getMonth() + 6);

    const searchPrompt = `
      Find 5 current available scholarships for a student with the following profile:
      - Major: ${userProfile.intended_major || 'Any'}
      - GPA: ${userProfile.gpa || 'Not specified'}
      - Education Level: ${userProfile.current_education_level || 'Any'}
      - Ethnicity: ${userProfile.ethnicity || 'Not specified'}
      - First Generation Student: ${userProfile.first_generation_student ? 'Yes' : 'No'}
      
      IMPORTANT: Only provide scholarships with deadlines between ${currentDate.toISOString().split('T')[0]} and ${sixMonthsFromNow.toISOString().split('T')[0]}.
      
      For each scholarship, provide:
      1. Title
      2. Amount (in USD)
      3. Application deadline (must be a date between today and 6 months from now)
      4. Eligibility requirements
      5. Provider/organization name
      6. Application URL (use a realistic URL)
      7. A brief description (2-3 sentences)
      
      Return ONLY a JSON object with a "scholarships" array containing these fields, WITH UNIQUE IDs for each scholarship:
      {
        "scholarships": [
          {
            "id": string (UUID v4),
            "title": string,
            "amount": number,
            "deadline": string (ISO date),
            "requirements": string[],
            "provider": string,
            "url": string,
            "description": string,
            "is_active": true
          }
        ]
      }
    `;

    console.log('Sending prompt to OpenAI');

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
            content: 'You are a scholarship research assistant. Generate realistic scholarship opportunities based on the student profile. Use realistic organizations, URLs, and ONLY future deadlines within the next 6 months. Return only valid JSON with unique UUIDs for each scholarship.'
          },
          {
            role: 'user',
            content: searchPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error response:', errorData);
      throw new Error(`OpenAI API error: ${response.status} ${errorData}`);
    }

    const data = await response.json();
    console.log('OpenAI API response received');
    
    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response format from OpenAI');
    }

    const scholarships = JSON.parse(data.choices[0].message.content);
    console.log('Successfully parsed scholarships data');
    
    return new Response(JSON.stringify(scholarships), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });
  } catch (error) {
    console.error('Error in openai-scholarship-search function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'An unexpected error occurred'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
