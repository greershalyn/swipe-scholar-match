import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SchoolMatchRequest {
  program: string;
  interests: string;
  budget: string;
  states: string[];
}

interface SchoolMatch {
  name: string;
  location: string;
  program: string;
  estimatedCost: string;
  description: string;
  ranking: string;
  admissionRate: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (!openAIApiKey) {
    return new Response(
      JSON.stringify({ error: 'OpenAI API key not configured' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  try {
    const { program, interests, budget, states }: SchoolMatchRequest = await req.json();

    // Build the prompt for OpenAI
    const budgetRange = getBudgetRange(budget);
    const statesString = states.length > 0 ? states.join(', ') : 'any state';
    
    const prompt = `Find the top 8 schools and universities that match these criteria:
    
    Program/Major: ${program}
    Budget Range: ${budgetRange}
    Preferred States: ${statesString}
    Additional Interests: ${interests || 'None specified'}
    
    For each school, provide:
    1. School name
    2. Location (City, State)
    3. Specific program name that matches their major
    4. Estimated annual cost (tuition + fees)
    5. Brief description highlighting why it's a good match
    6. National or program ranking if available
    7. Admission rate percentage
    
    Focus on schools that are realistic matches based on the budget and have strong programs in the specified field. Include a mix of public and private institutions if appropriate for the budget range.
    
    Return the results as a JSON object with a "schools" array containing the school information.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are an expert college counselor with extensive knowledge of universities and colleges across the United States. You help students find schools that match their academic interests, financial constraints, and location preferences. Always provide accurate, realistic information about costs, admission rates, and program quality.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.choices?.[0]?.message?.content) {
      throw new Error('No content in OpenAI response');
    }

    let schoolData;
    try {
      schoolData = JSON.parse(data.choices[0].message.content);
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      throw new Error('Failed to parse school recommendations');
    }

    // Validate and clean the data
    const schools = schoolData.schools?.map((school: any) => ({
      name: school.name || 'Unknown School',
      location: school.location || 'Location not specified',
      program: school.program || program,
      estimatedCost: school.estimatedCost || 'Cost not available',
      description: school.description || 'No description available',
      ranking: school.ranking || 'Ranking not available',
      admissionRate: school.admissionRate || 'Rate not available'
    })) || [];

    return new Response(
      JSON.stringify({ schools }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in school-matcher function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
        schools: []
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function getBudgetRange(budget: string): string {
  switch (budget) {
    case 'under-20k':
      return 'Under $20,000 per year';
    case '20k-40k':
      return '$20,000 - $40,000 per year';
    case '40k-60k':
      return '$40,000 - $60,000 per year';
    case '60k-80k':
      return '$60,000 - $80,000 per year';
    case 'over-80k':
      return 'Over $80,000 per year';
    default:
      return 'Budget not specified';
  }
}