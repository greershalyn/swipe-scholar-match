
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
    console.log('Starting essay review process');

    if (!text || typeof text !== 'string') {
      throw new Error('Missing or invalid essay text');
    }

    if (text.trim().length < 50) {
      throw new Error('Essay text is too short for meaningful analysis');
    }

    if (!openAIApiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    console.log('Sending text to OpenAI for analysis...');
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',  // Using the correct model name
          messages: [
            {
              role: 'system',
              content: `You are an expert proofreader and editor specialized in academic writing.
              You must thoroughly analyze the provided text for ANY and ALL writing issues, no matter how minor.
              
              For EVERY sentence, check for:
              1. Grammar errors (subject-verb agreement, tense consistency, etc.)
              2. Punctuation mistakes (commas, periods, semicolons, etc.)
              3. Spelling errors
              4. Word choice and vocabulary appropriateness
              5. Run-on sentences or sentence fragments
              6. Clarity and conciseness issues
              7. Academic tone and formality
              
              You MUST provide specific feedback for EACH issue found by:
              1. Quoting the exact problematic text
              2. Identifying the specific type of error
              3. Explaining why it's incorrect
              4. Suggesting how to fix it
              
              Format each issue as a JSON object with:
              {
                "sentence": "exact problematic text",
                "error": "specific error type (e.g., 'Subject-Verb Agreement Error', 'Missing Comma', etc.)",
                "explanation": "detailed explanation of why it's wrong and how to fix it",
                "startIndex": number where issue begins in the sentence,
                "endIndex": number where issue ends in the sentence
              }

              Return ALL findings in a JSON array. You MUST find at least one issue to improve - 
              even well-written text can be enhanced for clarity or style.
              
              Never return an empty array or skip analysis of any sentence.`
            },
            {
              role: 'user',
              content: text
            }
          ],
          temperature: 0.3,
          max_tokens: 3000
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenAI API error:', errorText);
        throw new Error(`OpenAI API error: ${errorText}`);
      }

      const data = await response.json();
      console.log('Raw OpenAI response:', JSON.stringify(data, null, 2));

      if (!data.choices?.[0]?.message?.content) {
        throw new Error('Invalid response format from OpenAI');
      }

      let results;
      try {
        const content = data.choices[0].message.content;
        results = typeof content === 'string' ? JSON.parse(content) : content;
        
        if (!Array.isArray(results)) {
          throw new Error('Results are not in array format');
        }

        if (results.length === 0) {
          console.error('AI returned no results, which should not happen given the prompt');
          results = [{
            sentence: text.substring(0, 100),
            error: "Style Improvement Needed",
            explanation: "While no major grammatical errors were found, consider enhancing clarity and impact by varying sentence structure and using more precise vocabulary.",
            startIndex: 0,
            endIndex: 100
          }];
        }

        console.log('Analysis complete:', results.length, 'issues found');
        
        return new Response(JSON.stringify({ results }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (error) {
        console.error('Error parsing OpenAI response:', error);
        throw new Error('Failed to parse AI review results');
      }
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error(`Failed to communicate with OpenAI: ${error.message}`);
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
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
