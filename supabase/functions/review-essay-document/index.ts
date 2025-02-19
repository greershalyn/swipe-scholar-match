
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

    if (!openAIApiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    console.log('Sending text to OpenAI for analysis...');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a professional essay reviewer. Analyze the essay for grammar, punctuation, 
            sentence structure, and clarity issues. DO NOT rewrite any content. Instead:
            1. Identify specific issues
            2. Explain why each issue needs attention
            3. Format your response as a JSON array of objects with these properties:
               - sentence: the problematic sentence
               - error: brief description of the issue
               - explanation: detailed explanation of why it's an issue
               - startIndex: where the issue begins in the sentence
               - endIndex: where the issue ends in the sentence`
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      }),
    });

    const responseText = await response.text();
    console.log('OpenAI raw response:', responseText);

    if (!response.ok) {
      console.error('OpenAI API error:', responseText);
      throw new Error(`Failed to process essay with AI: ${responseText}`);
    }

    const data = JSON.parse(responseText);
    let results;
    try {
      results = data.choices[0].message.content;
      // Try to parse if it's a string, otherwise use as-is if it's already an array
      if (typeof results === 'string') {
        results = JSON.parse(results);
      }
      
      if (!Array.isArray(results)) {
        throw new Error('Results are not in array format');
      }

      console.log('Successfully parsed OpenAI response into array format');
    } catch (error) {
      console.error('Error parsing OpenAI response:', error);
      results = [{
        sentence: "Unable to parse AI response",
        error: "AI Response Format Error",
        explanation: "The AI provided feedback but not in the expected format. Please try again.",
        startIndex: 0,
        endIndex: 0
      }];
    }

    console.log('Successfully generated review results:', results.length, 'issues found');

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Essay review error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Essay review failed', 
        details: error.message,
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
