
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { essayTopic, personalResponse, selectedApproach } = await req.json();
    console.log('Received request:', { essayTopic, personalResponse, selectedApproach });

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const prompt = `Create a detailed essay framework as a JSON object with this exact structure:
{
  "title": "string (engaging title that captures main theme)",
  "hook": "string (compelling opening paragraph)",
  "talkingPoints": [
    {
      "title": "string (section heading)",
      "points": ["string (4-5 specific development points)"]
    }
  ],
  "conclusion": "string (forward-looking closing paragraph)"
}

Use this information:
Topic: "${essayTopic}"
Personal Response: "${personalResponse}"
Selected Approach: ${JSON.stringify(selectedApproach)}

Guidelines:
- Create 3-4 talking points with 4-5 specific points each
- Use actual details from the personal response
- Make sure response is valid JSON
- Focus on personal growth and concrete examples`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert writing consultant. You must return ONLY valid JSON that matches the exact structure requested, with no additional text or explanation.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    console.log('Raw OpenAI response:', data);

    if (!data.choices?.[0]?.message?.content) {
      console.error('Invalid response structure from OpenAI');
      throw new Error('Invalid response from OpenAI');
    }

    const content = data.choices[0].message.content;
    console.log('OpenAI content:', content);

    // Validate JSON structure
    let parsedFramework;
    try {
      parsedFramework = JSON.parse(content);
      console.log('Parsed framework:', parsedFramework);

      if (!parsedFramework.title || !parsedFramework.hook || 
          !Array.isArray(parsedFramework.talkingPoints) || !parsedFramework.conclusion) {
        throw new Error('Missing required fields in framework');
      }
    } catch (error) {
      console.error('JSON parsing error:', error);
      throw new Error('Invalid JSON format in response');
    }

    return new Response(JSON.stringify({ framework: parsedFramework }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-expanded-framework function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Check function logs for more information'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
