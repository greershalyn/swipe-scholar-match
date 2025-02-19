
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

    const prompt = `As an expert writing consultant, analyze this scholarship essay topic and personal response to generate three distinct, compelling essay approaches. Each approach should offer unique insights while fulfilling the scholarship's requirements.

Essay Topic: "${essayTopic}"
Personal Response: "${personalResponse}"

First, analyze the scholarship prompt to identify:
1. Core values and qualities being sought
2. Type of experience or growth being evaluated
3. Specific requirements or criteria

Then, deeply analyze the personal response to find:
1. Key emotional moments and conflicts
2. Evidence of personal growth and learning
3. Unique perspectives or approaches
4. Connection to future goals and aspirations

Generate three distinct essay frameworks that:
1. Each offer a unique angle on the story
2. Use different storytelling techniques
3. Connect directly to scholarship values
4. Show clear progression and growth

For each framework, provide:
1. A compelling title that captures the essence
2. An engaging hook that draws readers in
3. A clear outline of the main points
4. Connection to college/career goals

Format the response as a JSON object with three frameworks (framework1, framework2, framework3), each containing:
- title: engaging title for the approach
- hook: powerful opening paragraph
- talkingPoints: array of main themes to explore
{
  framework1: {
    title: string,
    hook: string,
    talkingPoints: [{ theme: string }]
  },
  framework2: {...},
  framework3: {...}
}`;

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
            content: 'You are an expert writing consultant specializing in scholarship essays. You excel at finding unique angles and compelling narratives in personal stories.'
          },
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
