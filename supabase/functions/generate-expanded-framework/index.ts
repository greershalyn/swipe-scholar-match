
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

    const prompt = `As an expert writing consultant, analyze this scholarship essay topic and personal story to create a detailed, emotionally resonant essay framework. Your goal is to help the student craft a compelling narrative that authentically showcases their experience while directly addressing the scholarship criteria.

TOPIC: "${essayTopic}"
PERSONAL STORY: "${personalResponse}"
SELECTED APPROACH: "${selectedApproach}"

First, analyze their story for:
1. Key emotional moments and turning points
2. Specific examples of growth or learning
3. Unique perspectives or insights
4. Personal values demonstrated
5. Future aspirations mentioned

Then create a detailed essay framework that:
1. Uses their actual experiences and words
2. Demonstrates deep reflection and self-awareness
3. Shows clear cause-and-effect relationships
4. Connects their past experiences to future goals
5. Addresses the scholarship criteria directly

Generate a comprehensive outline with:

1. TITLE: Create an engaging, specific title that captures their unique story angle.

2. HOOK: Write a powerful opening paragraph that:
   - Opens with a vivid moment from their story
   - Creates immediate emotional connection
   - Introduces the central theme
   - Uses their own words or experiences where possible

3. MAIN SECTIONS: Develop 3-4 detailed talking points that:
   - Start with specific examples from their story
   - Show deep reflection and personal growth
   - Connect to broader themes and values
   - Lead logically to the next point
   - Include specific guidance for development

4. CONCLUSION: Create a forward-looking ending that:
   - Reflects on their journey
   - Shows how they've changed
   - Connects to college/career goals
   - Reinforces scholarship values

Format response as JSON:
{
  "title": "string",
  "hook": "string",
  "talkingPoints": [{
    "title": "string",
    "points": ["string"]
  }],
  "conclusion": "string"
}

Each talking point should have 4-5 specific bullet points that guide essay development.`;

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
            content: 'You are an expert writing consultant specializing in scholarship essays. You excel at finding meaningful details in personal stories and transforming them into compelling narratives. You always provide specific, actionable guidance based on the actual content of student responses.'
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
