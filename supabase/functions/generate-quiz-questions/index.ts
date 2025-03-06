
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const openAiApiKey = Deno.env.get('OPENAI_API_KEY')!;
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

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
    const { category, section } = await req.json();
    
    console.log(`Generating questions for ${section} - ${category}`);

    // Create the prompt for OpenAI
    const prompt = generatePrompt(section, category);
    
    // Call OpenAI API
    const openAiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a specialized AI that creates high-quality standardized test questions. Your questions should be accurate, educational, and formatted according to the requested JSON structure.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
      }),
    });

    const openAiData = await openAiResponse.json();
    
    if (!openAiData.choices || !openAiData.choices[0]) {
      throw new Error('Invalid response from OpenAI API');
    }

    // Extract the generated content
    const generatedContent = openAiData.choices[0].message.content;
    
    // Parse the JSON response
    let questions;
    try {
      // Find the JSON part in the response (in case there's any additional text)
      const jsonStartIndex = generatedContent.indexOf('[');
      const jsonEndIndex = generatedContent.lastIndexOf(']') + 1;
      const jsonStr = generatedContent.substring(jsonStartIndex, jsonEndIndex);
      questions = JSON.parse(jsonStr);
      
      // Add unique IDs to each question
      questions = questions.map(q => ({
        ...q,
        id: `ai-${section}-${category}-${crypto.randomUUID().slice(0, 8)}`
      }));
      
    } catch (error) {
      console.error('Error parsing OpenAI response:', error);
      console.log('OpenAI raw response:', generatedContent);
      throw new Error('Failed to parse questions from OpenAI response');
    }

    return new Response(
      JSON.stringify({ success: true, questions }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-quiz-questions function:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

function generatePrompt(section: string, category: string): string {
  let basePrompt = `Generate 3 new high-quality multiple-choice questions for the ${category} section of the ${section.toUpperCase()} standardized test. 

Each question should have:
1. A clear question statement
2. Four possible answers (options as strings)
3. The correct answer (matching one of the four options exactly)
4. A detailed explanation of why the correct answer is right

Format the questions as a JSON array following this structure:
[
  {
    "question": "Question text here",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "The exact text of the correct option",
    "explanation": "Detailed explanation of the answer"
  }
]

`;

  // Add specific instructions based on category
  switch (category.toLowerCase()) {
    case 'english':
    case 'reading & writing':
      basePrompt += `Focus on grammar, punctuation, clarity, organization, and reading comprehension. For grammar questions, you can use HTML to highlight specific text like this: "Select the best version of the <span class='bg-yellow-200 px-1'>underlined</span> text."`;
      break;
    case 'math':
      basePrompt += `Focus on algebra, geometry, statistics, and functions with clear, step-by-step explanations. Use numbers and calculations suitable for high school students.`;
      break;
    case 'reading':
      basePrompt += `Focus on reading comprehension, analysis, and inference with questions that test critical thinking about text passages.`;
      break;
    case 'science':
      basePrompt += `Focus on data interpretation, experimental design, and scientific reasoning with questions about research scenarios, graphs, and scientific concepts.`;
      break;
    case 'writing':
      basePrompt += `Focus on essay construction, rhetorical strategies, and argumentation with questions about writing organization and style.`;
      break;
    case 'digital sat format':
      basePrompt += `Focus on the format, structure, and strategies specific to the digital version of the SAT.`;
      break;
    case 'practice tests':
      basePrompt += `Focus on best practices for taking and reviewing practice tests, with questions about test-taking strategies.`;
      break;
  }

  return basePrompt;
}
