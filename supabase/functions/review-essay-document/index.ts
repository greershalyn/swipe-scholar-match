
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

    console.log('Sending text to OpenAI for analysis...');
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
            content: `You are an experienced writing teacher analyzing scholarship essays. You must ONLY respond with a JSON array containing feedback objects. Each object must strictly follow this format:

[{
  "sentence": "(exact problematic text)",
  "error": "(category prefix): (specific issue)",
  "explanation": "(constructive feedback with bullet points explaining why and how to improve)",
  "startIndex": 0,
  "endIndex": 100,
  "type": "enhancement" | "structure" | "technical" | "clarity" | "impact"
}]

Category prefixes must be one of:
- "Impact:" for emotional resonance
- "Logic:" for argument flow
- "Structure:" for organization
- "Clarity:" for writing style
- "Technical:" for grammar/spelling

Analyze for:
1. Emotional Impact (personal stories, vivid details)
2. Structure (organization, transitions)
3. Technical accuracy (grammar, punctuation)
4. Clarity (complex sentences, wordiness)
5. Logic (argument flow, evidence)

Important:
- Response MUST be a valid JSON array
- Each feedback object MUST include all fields
- Keep explanations clear and actionable
- Include 3-5 key issues to focus on
- Use the exact prefixes specified above`
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0.1, // Reduced for more consistent output
        max_tokens: 1500, // Adjusted for reasonable response length
        top_p: 0.9,
        frequency_penalty: 0.0,
        presence_penalty: 0.0
      })
    });

    if (!response.ok) {
      console.error('OpenAI API Error:', response.status, response.statusText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Received response from OpenAI');

    if (!data.choices?.[0]?.message?.content) {
      console.error('Invalid OpenAI response format');
      throw new Error('Invalid response format from OpenAI');
    }

    try {
      const content = data.choices[0].message.content;
      console.log('Attempting to parse response content');
      
      let results = JSON.parse(content);
      
      // Ensure results is an array
      if (!Array.isArray(results)) {
        console.log('Converting non-array result to array');
        results = [results];
      }

      // Validate and sanitize each result
      results = results.map(result => {
        console.log('Validating result:', result);
        return {
          sentence: String(result.sentence || '').slice(0, 500),
          error: String(result.error || 'Impact: General feedback'),
          explanation: String(result.explanation || 'Consider revising this section.'),
          startIndex: Number(result.startIndex) || 0,
          endIndex: Number(result.endIndex) || 100,
          type: ['enhancement', 'structure', 'technical', 'clarity', 'impact'].includes(result.type) 
            ? result.type 
            : 'impact'
        };
      });

      // Ensure we have at least one result
      if (results.length === 0) {
        console.log('No results found, providing default feedback');
        results = [{
          sentence: text.slice(0, 100),
          error: "Impact: General Review",
          explanation: "Consider how you might deepen the personal connection in your essay. What specific experiences could you elaborate on?",
          startIndex: 0,
          endIndex: 100,
          type: "impact"
        }];
      }

      console.log('Successfully processed', results.length, 'feedback items');
      return new Response(JSON.stringify({ results }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      return new Response(JSON.stringify({
        results: [{
          sentence: text.slice(0, 100),
          error: "Technical: Processing Error",
          explanation: "We encountered an issue analyzing your essay. Consider breaking it into smaller sections if it's very long.",
          startIndex: 0,
          endIndex: 100,
          type: "technical"
        }]
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error('Function error:', error);
    return new Response(JSON.stringify({
      results: [{
        sentence: "Error analyzing essay",
        error: "Technical: Analysis Error",
        explanation: "We encountered an error while analyzing your essay. Please try again with a shorter text or check your connection.",
        startIndex: 0,
        endIndex: 0,
        type: "technical"
      }]
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
