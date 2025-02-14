
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAiApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Request-Headers': '*',
  'Content-Type': 'application/json'
};

serve(async (req: Request) => {
  console.log('Received request to openai-scholarship-search:', req.method);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  try {
    if (!openAiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { userProfile } = await req.json();
    console.log('Processing scholarship search for user profile:', userProfile);

    const currentDate = new Date();
    const sixMonthsFromNow = new Date();
    sixMonthsFromNow.setMonth(currentDate.getMonth() + 6);

    // Build location context from user profile
    const locationContext = [];
    if (userProfile.city && userProfile.state) {
      locationContext.push(`- City: ${userProfile.city}`);
      locationContext.push(`- State: ${userProfile.state}`);
    }

    const searchPrompt = `
      Find 10 currently available scholarships for a student with the following profile:
      - Major: ${userProfile.intended_major || 'Any'}
      - Education Level: ${userProfile.current_education_level || 'Any'}
      - Location: ${locationContext.join(', ') || 'Not specified'}
      
      Requirements:
      1. Provide EXACTLY 10 unique scholarships
      2. Each scholarship must have different requirements and amounts
      3. All deadlines must be between ${currentDate.toISOString().split('T')[0]} and ${sixMonthsFromNow.toISOString().split('T')[0]}
      4. Focus on local scholarships if location is provided
      5. Include specific eligibility criteria
      
      Return ONLY valid JSON with a "scholarships" array containing these fields for each scholarship:
      - id (UUID v4)
      - title
      - amount (number)
      - deadline (ISO date)
      - requirements (string array)
      - provider
      - url
      - description
      - category
    `;

    console.log('Sending request to OpenAI...');
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
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('OpenAI API response received:', data);

    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response format from OpenAI');
    }

    const scholarships = JSON.parse(data.choices[0].message.content);
    console.log('Successfully parsed scholarships:', scholarships);

    return new Response(
      JSON.stringify(scholarships),
      {
        headers: corsHeaders,
        status: 200
      }
    );
  } catch (error) {
    console.error('Error in openai-scholarship-search function:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'An unexpected error occurred',
        scholarships: []
      }),
      {
        headers: corsHeaders,
        status: 500
      }
    );
  }
});
