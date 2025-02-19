
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
    const { essayTopic, personalResponse } = await req.json();
    console.log('Generating essay suggestions for:', { essayTopic, personalResponse });

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const systemPrompt = `You are an expert writing consultant specializing in scholarship essays. 
Your role is to analyze essay topics and personal responses to suggest three distinct writing approaches.
Each approach should guide the student to think critically about how to present their story effectively.

Guidelines:
- Focus on guiding thought processes, not pre-writing content
- Ensure each approach offers a unique perspective
- Help students understand why each approach would be effective
- Encourage deeper reflection about their experiences
- Consider both emotional depth and analytical clarity`;

    const userPrompt = `Please analyze this scholarship essay topic and personal response to generate three distinct writing approaches.

Essay Topic: "${essayTopic}"
Personal Response: "${personalResponse}"

Provide the response in this exact JSON format:
{
  "framework1": {
    "title": "string (engaging approach title)",
    "hook": "string (thought-provoking opening question or statement)",
    "talkingPoints": [
      {
        "theme": "string (key idea to explore)",
        "rationale": "string (why this angle is effective)",
        "reflectionPrompt": "string (question to deepen thinking)"
      }
    ]
  },
  "framework2": {
    // same structure as framework1
  },
  "framework3": {
    // same structure as framework1
  }
}

For each framework:
1. Focus on a distinct writing angle (narrative, analytical, innovative)
2. Explain why this approach would be effective
3. Include reflection prompts that encourage critical thinking
4. Avoid writing actual essay content
5. Help students discover their own unique perspective`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.8,
      }),
    });

    const data = await response.json();
    console.log('OpenAI response received');

    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response from OpenAI');
    }

    try {
      const parsedContent = JSON.parse(data.choices[0].message.content);
      console.log('Successfully parsed suggestions');
      
      return new Response(JSON.stringify({ suggestion: JSON.stringify(parsedContent) }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Error parsing OpenAI response:', error);
      throw new Error('Invalid JSON format in response');
    }
  } catch (error) {
    console.error('Error in generate-essay-content function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Check function logs for more information'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
