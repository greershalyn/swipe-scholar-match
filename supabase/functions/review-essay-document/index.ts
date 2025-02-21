
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
    const { text } = await req.json();
    console.log('Starting essay review process, text length:', text?.length);

    if (!text || typeof text !== 'string') {
      throw new Error('Missing or invalid essay text');
    }

    if (text.trim().length < 50) {
      throw new Error('Essay text is too short for meaningful analysis');
    }

    if (!openAIApiKey) {
      console.error('OpenAI API key not found');
      throw new Error('OpenAI API key is not configured');
    }

    console.log('Preparing OpenAI request...');
    const requestBody = {
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are an experienced writing teacher and scholarship essay mentor who provides thoughtful, constructive feedback. Analyze essays through multiple lenses:

1. Emotional Impact & Personal Connection:
   - Identify opportunities to deepen emotional resonance
   - Suggest ways to make personal stories more vivid
   - Help connect experiences to future goals
   - Point out where adding sensory details could strengthen the narrative

2. Logical Flow & Argumentation:
   - Evaluate the progression of ideas
   - Identify areas needing stronger evidence
   - Suggest ways to strengthen arguments
   - Check for effective use of examples

3. Structure & Organization:
   - Assess paragraph organization and transitions
   - Review topic sentences and conclusions
   - Evaluate the overall essay structure
   - Suggest improvements for better flow

4. Clarity & Style:
   - Identify unclear or complex sentences
   - Point out redundancies and wordiness
   - Suggest more impactful phrasing
   - Check for active vs. passive voice

5. Technical Accuracy:
   - Note grammar and spelling issues
   - Check punctuation
   - Identify formatting inconsistencies

For each issue found, return an object in this format:
{
  "sentence": "exact text with issue",
  "error": "Category: specific issue type",
  "explanation": "detailed explanation that includes:
    - Why this needs attention
    - How it could be improved
    - Reflective questions to guide revision
    - Specific suggestions for enhancement",
  "startIndex": number,
  "endIndex": number,
  "type": "enhancement" | "structure" | "technical" | "clarity" | "impact"
}

Provide feedback that encourages critical thinking and deeper reflection. Frame suggestions as opportunities for improvement rather than corrections. Include reflective questions that help students think more deeply about their writing.

Categories should be prefixed with one of:
- "Impact:" for emotional resonance and personal connection
- "Logic:" for argument structure and evidence
- "Structure:" for organization and flow
- "Clarity:" for writing style and expression
- "Technical:" for grammar, spelling, and punctuation`
        },
        {
          role: 'user',
          content: text
        }
      ],
      temperature: 0.3,
      max_tokens: 2000,
      presence_penalty: 0,
      frequency_penalty: 0
    };

    console.log('Sending request to OpenAI...');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      throw new Error(`OpenAI API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    console.log('OpenAI response received');

    if (!data.choices?.[0]?.message?.content) {
      console.error('Invalid OpenAI response format:', data);
      throw new Error('Invalid response format from OpenAI');
    }

    let results;
    try {
      const content = data.choices[0].message.content;
      console.log('Parsing OpenAI response content:', content);
      
      results = typeof content === 'string' ? JSON.parse(content) : content;
      
      if (!Array.isArray(results)) {
        console.error('Non-array results:', results);
        throw new Error('Results are not in array format');
      }

      if (results.length === 0) {
        results = [{
          sentence: text.substring(0, 100),
          error: "Impact: General Review",
          explanation: "Consider how you might deepen the personal connection in your essay. What specific experiences or moments could you elaborate on to make your story more compelling? How does this connect to your future goals?",
          startIndex: 0,
          endIndex: 100,
          type: "impact"
        }];
      }

      console.log('Successfully processed results:', results.length, 'suggestions found');
      
      return new Response(JSON.stringify({ results }), {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
      });
    } catch (error) {
      console.error('Error processing results:', error);
      throw new Error(`Failed to process review results: ${error.message}`);
    }
  } catch (error) {
    console.error('Essay review error:', error);
    
    return new Response(
      JSON.stringify({
        error: 'Essay review failed',
        details: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
      }
    );
  }
});
