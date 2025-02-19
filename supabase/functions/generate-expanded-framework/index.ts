
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

    const prompt = `As an expert writing consultant, analyze this scholarship essay topic and personal response to generate a detailed, specific essay framework. Focus on extracting meaningful insights and creating actionable guidance.

Essay Topic: "${essayTopic}"
Personal Response: "${personalResponse}"
Selected Approach: "${selectedApproach}"

First, deeply analyze:
1. Specific events, conflicts, and emotions in the user's story
2. Skills developed and lessons learned
3. Impact on personal growth and future aspirations
4. Connections to the scholarship's values

Then create a comprehensive essay framework with:

1. An emotionally engaging hook that:
   - Uses vivid imagery or dialogue from a key moment
   - Creates immediate emotional connection
   - Sets up the essay's central theme

2. Three detailed talking points that each:
   - Start with a specific example or moment
   - Explore emotional depth and personal growth
   - Connect to broader themes and future goals
   - Provide clear transition guidance

3. A powerful conclusion that:
   - Brings the journey full circle
   - Shows personal transformation
   - Links to college/future impact

REQUIREMENTS:
- Every section must include specific details from the user's story
- Each talking point must explore a different aspect (e.g., challenge, growth, impact)
- Include clear guidance on emotional storytelling elements
- Connect each point to college readiness/future success
- Avoid generic advice - everything must tie to the user's unique experience

Format the response as a JSON object with title, hook, talking points (each with title and specific points), and conclusion.`;

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
