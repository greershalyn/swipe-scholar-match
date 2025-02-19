
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

    const prompt = `As an expert writing consultant, analyze this scholarship essay prompt and personal response to generate three completely unique and compelling essay frameworks. Each framework must be distinct in style, approach, and narrative structure.

Essay Prompt: "${essayTopic}"
Personal Response: "${personalResponse}"

First, identify:
1. Core themes in the prompt (e.g., leadership, resilience, innovation)
2. Key qualities the scholarship committee seeks
3. Multiple angles in the personal response
4. Unique or emotionally compelling elements

Then, generate three distinct essay frameworks, each using a different writing style:
Framework 1: Use a narrative/storytelling approach with emotional depth
Framework 2: Employ an analytical/reflective style with unique insights
Framework 3: Create an innovative structure (metaphorical, thematic, or unconventional)

For each framework, provide:
1. A unique title that captures the specific angle
2. A compelling hook that uses the chosen writing style
3. Three distinct talking points that:
   - Connect personally to the prompt
   - Build upon different aspects of the experience
   - Link to future academic/professional goals
4. A brief outline of how to conclude powerfully

IMPORTANT:
- Ensure each framework has a completely different perspective
- Use varied vocabulary and sentence structures
- Employ different literary techniques
- Make each suggestion feel fresh and original
- Avoid repeating themes or approaches

Format the response as a JSON object with three distinct sections, each containing title, hook, and talking points with their themes.`;

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
            content: 'You are an expert writing consultant who specializes in crafting unique, compelling scholarship essays. You excel at finding different angles and approaches for the same story.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8, // Increased for more creative variety
      }),
    });

    const data = await response.json();
    console.log('AI Response:', data.choices[0].message.content);

    return new Response(JSON.stringify({ suggestion: data.choices[0].message.content }), {
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
