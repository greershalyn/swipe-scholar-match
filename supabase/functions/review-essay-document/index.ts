
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
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
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are an expert essay reviewer focusing on four key areas:

1. Spelling and Grammar:
   - Identify spelling errors
   - Check grammatical accuracy
   - Find punctuation mistakes

2. Conciseness and Clarity:
   - Point out unnecessary words or redundancies
   - Identify vague or ambiguous statements
   - Suggest clearer alternatives for complex phrases

3. Structure and Flow:
   - Evaluate paragraph organization
   - Check transition between ideas
   - Assess logical progression of arguments

4. Content and Impact:
   - Highlight areas needing more detail or evidence
   - Identify opportunities for stronger arguments
   - Suggest improvements for impact

Analyze the text and return your findings as a JSON array of objects. Each object should follow this format:
{
  "sentence": "exact text with issue",
  "error": "Category: specific issue type",
  "explanation": "detailed explanation of the issue and specific suggestions for improvement",
  "startIndex": number,
  "endIndex": number
}

Categories should be prefixed with one of: "Spelling/Grammar:", "Clarity:", "Structure:", or "Content:"`
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

      // Ensure we have at least one result
      if (results.length === 0) {
        results = [{
          sentence: text.substring(0, 100),
          error: "Content: General Review",
          explanation: "Consider enhancing clarity and impact by varying sentence structure and using more precise vocabulary.",
          startIndex: 0,
          endIndex: 100
        }];
      }

      console.log('Successfully processed results:', results.length, 'issues found');
      
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
