
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
    console.log('Received user profile:', JSON.stringify(userProfile, null, 2));

    const currentDate = new Date();
    const sixMonthsFromNow = new Date();
    sixMonthsFromNow.setMonth(currentDate.getMonth() + 6);

    const searchPrompt = `
      As a scholarship search assistant, find 10 currently available scholarships for a student with the following profile:
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

    console.log('Sending prompt to OpenAI:', searchPrompt);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
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
        temperature: 0.7,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error response:', errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const openAIData = await response.json();
    console.log('OpenAI raw response:', openAIData);
    
    if (!openAIData.choices?.[0]?.message?.content) {
      throw new Error('No content in OpenAI response');
    }

    const scholarships = JSON.parse(openAIData.choices[0].message.content);
    console.log('Parsed scholarships:', scholarships);

    if (!scholarships.scholarships || !Array.isArray(scholarships.scholarships)) {
      throw new Error('Invalid scholarship data format from OpenAI');
    }

    // Validate and clean each scholarship
    const validatedScholarships = scholarships.scholarships.map(s => ({
      title: String(s.title || 'Untitled Scholarship'),
      amount: Number(s.amount) || 0,
      deadline: new Date(s.deadline).toISOString(),
      requirements: Array.isArray(s.requirements) ? s.requirements.map(String) : [],
      provider: String(s.provider || 'Unknown Provider'),
      url: String(s.url || `https://example.com/scholarship/${crypto.randomUUID()}`),
      description: String(s.description || ''),
      category: String(s.category || 'General')
    }));

    console.log('Returning validated scholarships:', validatedScholarships);

    return new Response(
      JSON.stringify({
        scholarships: validatedScholarships
      }),
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
        status: 200 // Return 200 to ensure error message gets through
      }
    );
  }
});
