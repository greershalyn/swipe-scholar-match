
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

    const systemPrompt = `You are a seasoned professor who has helped thousands of students craft compelling scholarship essays. 
Your role is to guide students in making their essays unique, personal, and persuasive. You excel at:
- Helping students uncover meaningful personal experiences that connect to their essay topics
- Encouraging authentic storytelling that showcases their unique perspectives
- Providing structured guidance while maintaining the student's authentic voice
- Pushing students to think critically about their experiences and their significance

For each framework suggestion you provide, ensure you:
1. Start with a thought-provoking hook that relates to their personal response
2. Guide them to explore deeper personal connections to the topic
3. Help structure their thoughts in a way that flows naturally
4. Encourage specific examples and vivid details from their experiences`;

    const userPrompt = `Based on this scholarship essay topic and the student's initial thoughts, provide three distinct 
frameworks that will help them craft a compelling personal narrative.

Essay Topic: "${essayTopic}"
Student's Initial Response: "${personalResponse}"

For each framework, create a response in this JSON format that:
1. Asks probing questions to help them dig deeper into their experience
2. Suggests a clear narrative structure
3. Highlights opportunities for personal reflection

Provide the response in this exact JSON format:
{
  "framework1": {
    "title": "string (engaging approach focused on personal growth)",
    "hook": "string (thought-provoking opening that connects to their response)",
    "talkingPoints": [
      {
        "theme": "string (key narrative element)",
        "rationale": "string (why this angle resonates)",
        "reflectionPrompt": "string (question to deepen their thinking)",
        "developmentSuggestion": "string (how to expand this point)"
      }
    ]
  },
  "framework2": {
    // same structure but focused on impact and leadership
  },
  "framework3": {
    // same structure but focused on innovation and future vision
  }
}

Focus on helping them develop their unique voice while maintaining academic professionalism.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
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
