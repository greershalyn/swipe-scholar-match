
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
            content: `You are a professional essay reviewer with expertise in academic writing. 
            Your task is to thoroughly analyze the essay for the following aspects:
            
            1. Grammar and punctuation errors
            2. Sentence structure and clarity
            3. Word choice and vocabulary
            4. Paragraph organization
            5. Academic tone and style
            
            For each issue found, provide:
            - The exact problematic sentence or phrase
            - A clear description of the error
            - A detailed explanation of why it's an issue and how to improve it
            
            Format your response as a JSON array of objects with these properties:
            - sentence: the problematic sentence or phrase (exact quote)
            - error: concise description of the issue
            - explanation: detailed explanation with improvement suggestions
            - startIndex: start position of the issue in the sentence
            - endIndex: end position of the issue in the sentence
            
            Be thorough and identify ALL issues, no matter how minor. If the text is well-written, 
            still try to find at least 2-3 areas for potential improvement in style or clarity.
            Never return an empty array - there's always room for improvement.`
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0.7,
        max_tokens: 3000
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`Failed to process essay with AI: ${errorText}`);
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
        // Ensure we always provide at least some feedback
        results = [{
          sentence: text.substring(0, 100) + "...",
          error: "General Writing Style",
          explanation: "While the essay is generally well-written, consider making it more engaging by varying sentence structure and using more dynamic vocabulary. Even good writing can be improved.",
          startIndex: 0,
          endIndex: 100
        }];
      }

      console.log('Successfully parsed review results:', results.length, 'issues found');
    } catch (error) {
      console.error('Error parsing OpenAI response:', error);
      throw new Error('Failed to parse AI review results');
    }

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
