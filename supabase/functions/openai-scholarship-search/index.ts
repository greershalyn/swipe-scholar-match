
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAiApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
    if (!openAiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { userProfile } = await req.json();

    const currentDate = new Date();
    const sixMonthsFromNow = new Date();
    sixMonthsFromNow.setMonth(currentDate.getMonth() + 6);

    const searchPrompt = `
      Find 10 currently available scholarships for a student with the following profile:
      - Major: ${userProfile.intended_major || 'Any'}
      - Education Level: ${userProfile.current_education_level || 'Any'}
      - Location: ${userProfile.state ? `${userProfile.state}, USA` : 'Any'}
      
      Requirements:
      1. Provide EXACTLY 10 unique scholarships
      2. Each scholarship must have different requirements and amounts
      3. All deadlines must be between ${currentDate.toISOString().split('T')[0]} and ${sixMonthsFromNow.toISOString().split('T')[0]}
      4. Focus on local scholarships if location is provided
      5. Include specific eligibility criteria
      
      Return ONLY valid JSON with a "scholarships" array containing these fields for each scholarship:
      - title (string)
      - amount (number)
      - deadline (ISO date string)
      - requirements (string array)
      - provider (string)
      - url (string)
      - description (string)
      - category (string)
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
            content: 'You are a scholarship search assistant that provides detailed, accurate scholarship information.'
          },
          {
            role: 'user',
            content: searchPrompt
          }
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const scholarships = JSON.parse(data.choices[0].message.content);

    return new Response(
      JSON.stringify(scholarships),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error in openai-scholarship-search function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        scholarships: [] 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
