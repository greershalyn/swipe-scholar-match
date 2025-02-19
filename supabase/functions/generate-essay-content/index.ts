
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

    const prompt = `As a writing consultant, analyze this scholarship essay prompt and personal response to generate a sophisticated essay framework.

Essay Prompt: "${essayTopic}"
Personal Response: "${personalResponse}"

First, determine the most effective writing style based on the content:
- Narrative/Storytelling (for personal transformation or emotional experiences)
- Persuasive/Argumentative (for leadership or advocacy topics)
- Reflective/Philosophical (for values and lessons learned)
- Descriptive/Immersive (for creativity and passion topics)

Then generate a detailed essay framework that includes:
1. A compelling title that reflects the unique experience
2. A powerful opening hook in the chosen writing style
3. Three distinct talking points that:
   - Have unique themes tied to the personal experience
   - Include specific details from the response
   - Connect to college and future aspirations
4. A forward-looking conclusion

Format the response as a JSON object with clear sections.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an expert writing consultant specializing in scholarship essays.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    const suggestion = data.choices[0].message.content;

    return new Response(JSON.stringify({ suggestion }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-essay-content function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
