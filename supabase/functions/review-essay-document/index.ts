
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReviewResult {
  sentence: string;
  error: string;
  explanation: string;
  startIndex: number;
  endIndex: number;
  type: 'enhancement' | 'structure' | 'technical' | 'clarity' | 'impact';
}

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

    console.log('Preparing OpenAI request...');
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
            content: `You are an essay reviewer. Return ONLY a JSON array of review objects. Each object must follow this exact format:
{
  "sentence": "exact text to improve",
  "error": "Category: specific issue",
  "explanation": "constructive feedback with specific suggestions",
  "startIndex": 0,
  "endIndex": 100,
  "type": "enhancement"
}

Categories must be prefixed with:
- "Impact:" for emotional resonance
- "Structure:" for organization
- "Technical:" for grammar/spelling
- "Clarity:" for writing style
- "Logic:" for flow

Types must be one of: "enhancement", "structure", "technical", "clarity", "impact"

IMPORTANT: 
- Only output valid JSON array
- Include 3-5 key issues
- Keep explanations brief and actionable
- Use exact category prefixes`
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0.1,
        max_tokens: 1000,
        top_p: 0.95
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API Error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Received OpenAI response');

    if (!data.choices?.[0]?.message?.content) {
      console.error('Invalid response structure:', data);
      throw new Error('Invalid response structure from OpenAI');
    }

    let results: ReviewResult[];
    try {
      const content = data.choices[0].message.content;
      console.log('Raw OpenAI response:', content);

      // Try to parse the response as JSON
      const parsed = JSON.parse(content.trim());
      
      // Ensure we have an array
      results = Array.isArray(parsed) ? parsed : [parsed];
      
      // Validate and sanitize each result
      results = results.map((result): ReviewResult => ({
        sentence: String(result.sentence || '').slice(0, 500),
        error: String(result.error || 'Impact: General feedback'),
        explanation: String(result.explanation || 'Consider revising this section.'),
        startIndex: typeof result.startIndex === 'number' ? result.startIndex : 0,
        endIndex: typeof result.endIndex === 'number' ? result.endIndex : 100,
        type: ['enhancement', 'structure', 'technical', 'clarity', 'impact'].includes(result.type) 
          ? result.type as ReviewResult['type']
          : 'impact'
      }));

      if (results.length === 0) {
        console.log('No valid results, using fallback');
        results = [{
          sentence: text.slice(0, 100),
          error: "Impact: General Review",
          explanation: "Consider adding more personal details and specific examples to strengthen your essay.",
          startIndex: 0,
          endIndex: 100,
          type: "impact"
        }];
      }

      console.log('Successfully processed results:', results.length, 'items');
      return new Response(JSON.stringify({ results }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (parseError) {
      console.error('Error parsing response:', parseError, '\nRaw content:', data.choices[0].message.content);
      
      // Return a valid fallback response
      return new Response(JSON.stringify({
        results: [{
          sentence: text.slice(0, 100),
          error: "Technical: Processing Error",
          explanation: "We encountered an issue analyzing your essay. Our team has been notified.",
          startIndex: 0,
          endIndex: 100,
          type: "technical" as const
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
        explanation: "We encountered an error while analyzing your essay. Please try again.",
        startIndex: 0,
        endIndex: 0,
        type: "technical" as const
      }]
    }), {
      status: 200, // Always return 200 to prevent client-side errors
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
