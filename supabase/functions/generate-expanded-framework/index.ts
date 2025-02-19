
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

    const prompt = `As an expert writing consultant, create a detailed, personalized essay framework based on this scholarship topic and personal story. Focus on crafting a compelling narrative that showcases personal growth and aligns with scholarship values.

Essay Topic: "${essayTopic}"
Personal Response: "${personalResponse}"
Selected Approach: "${selectedApproach}"

Analyze and incorporate:
1. Emotional depth and authenticity
2. Clear progression and character development
3. Specific examples and vivid details
4. Connection to scholarship values
5. Future impact and aspirations

Create a comprehensive framework with:

1. Title: A creative, engaging title that captures the essence of their story.

2. Hook: A powerful opening that:
   - Uses vivid imagery or dialogue
   - Creates immediate emotional connection
   - Sets up the essay's central theme
   - Draws from a specific moment in their story

3. Three detailed talking points that each:
   - Begin with a specific example or moment
   - Show emotional depth and reflection
   - Demonstrate personal growth
   - Connect to broader themes
   - Provide clear transition guidance

4. Conclusion that:
   - Brings the journey full circle
   - Shows personal transformation
   - Links to college/future impact
   - Reinforces scholarship values

Requirements:
- Use specific details and quotes from their story
- Each talking point must explore a different aspect
- Include emotional storytelling elements
- Connect each point to future success
- Maintain focus on scholarship criteria

Format the response as a JSON object with:
{
  title: string,
  hook: string,
  talkingPoints: [{
    title: string,
    points: string[]
  }],
  conclusion: string
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
            content: 'You are an expert writing consultant specializing in transforming personal experiences into compelling scholarship essays. You excel at finding specific, meaningful details and creating clear, actionable guidance.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    console.log('AI Expanded Framework Response:', data.choices[0].message.content);

    return new Response(JSON.stringify({ framework: data.choices[0].message.content }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-expanded-framework function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
