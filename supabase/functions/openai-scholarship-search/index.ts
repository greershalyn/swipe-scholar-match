
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAiApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Content-Type': 'application/json'
};

const TRUSTED_SCHOLARSHIP_DOMAINS = [
  'scholarshipowl.com',
  'scholarships.com',
  'fastweb.com',
  'collegescholarships.org',
  'chegg.com',
  'cappex.com',
  'unigo.com',
  'niche.com',
  'goingmerry.com',
  'petersons.com'
];

async function verifyUrl(url: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    clearTimeout(timeout);
    return response.ok;
  } catch (error) {
    console.log(`URL verification failed for ${url}:`, error.message);
    return false;
  }
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    });
  }

  try {
    const { userProfile } = await req.json();
    console.log('Received user profile for scholarship search:', userProfile);

    if (!openAiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const currentDate = new Date();
    const sixMonthsFromNow = new Date();
    sixMonthsFromNow.setMonth(currentDate.getMonth() + 6);

    const trustedDomainsString = TRUSTED_SCHOLARSHIP_DOMAINS.map(domain => `- ${domain}`).join('\n');

    // Build location context from user profile
    const locationContext = [];
    if (userProfile.city && userProfile.state) {
      locationContext.push(`- City: ${userProfile.city}`);
      locationContext.push(`- State: ${userProfile.state}`);
    }
    if (userProfile.college_university) {
      locationContext.push(`- School: ${userProfile.college_university}`);
    }

    const searchPrompt = `
      Find 5 currently available scholarships for a student with the following profile:
      - Major: ${userProfile.intended_major || 'Any'}
      - GPA: ${userProfile.gpa || 'Not specified'}
      - Education Level: ${userProfile.current_education_level || 'Any'}
      - Ethnicity: ${userProfile.ethnicity || 'Not specified'}
      - First Generation Student: ${userProfile.first_generation_student ? 'Yes' : 'No'}
      
      Location Information:
      ${locationContext.length > 0 ? locationContext.join('\n') : '- No location specified'}
      
      IMPORTANT GUIDELINES:
      1. Only provide scholarships with deadlines between ${currentDate.toISOString().split('T')[0]} and ${sixMonthsFromNow.toISOString().split('T')[0]}.
      2. PRIORITIZE LOCAL SCHOLARSHIPS:
         - If city/state is provided, prioritize scholarships specific to that region
         - If a school is specified, look for scholarships specific to that institution
         - Include state-specific scholarships when available
      3. Use these trusted domains:
      ${trustedDomainsString}
      4. URLs must be from actual scholarship websites, not placeholder or example domains.
      5. Each scholarship must have a specific, detailed title that matches the provider organization.
      6. Requirements must be specific and match the actual scholarship criteria.
      7. Description should include key details about the scholarship purpose and eligibility.
      8. If location information is provided, explicitly mention any local relevance in the description.
      
      Return ONLY valid JSON with a "scholarships" array containing these fields:
      - id: string (UUID v4)
      - title: string
      - amount: number
      - deadline: string (ISO date)
      - requirements: string[]
      - provider: string
      - url: string
      - description: string
      - is_active: boolean
      - category: string (use "Local" for location-specific scholarships)
    `;

    console.log('Sending prompt to OpenAI:', searchPrompt);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: 'You are a scholarship research assistant specializing in finding local and institutional scholarships. Generate scholarships ONLY from reputable scholarship websites and trusted sources, with a focus on location-specific opportunities when available. Focus on accuracy and verifiability. Each scholarship must be from a real organization with a valid, accessible URL. Ensure all dates are in the future and within the specified timeframe.'
          },
          {
            role: 'user',
            content: searchPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error response:', errorData);
      throw new Error(`OpenAI API error: ${response.status} ${errorData}`);
    }

    const data = await response.json();
    console.log('OpenAI API response received:', data);
    
    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response format from OpenAI');
    }

    let scholarships;
    try {
      scholarships = JSON.parse(data.choices[0].message.content);
      console.log('Successfully parsed scholarships data:', scholarships);
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      throw new Error('Failed to parse OpenAI response');
    }

    // Return empty array if no scholarships found
    if (!scholarships.scholarships || !Array.isArray(scholarships.scholarships)) {
      console.log('No scholarships found in OpenAI response, returning empty array');
      return new Response(
        JSON.stringify({ scholarships: [] }), 
        {
          headers: corsHeaders,
          status: 200
        }
      );
    }

    // Verify URLs before returning scholarships
    const verifiedScholarships = [];
    for (const scholarship of scholarships.scholarships) {
      const isUrlValid = await verifyUrl(scholarship.url);
      if (isUrlValid) {
        // Add location relevance score based on user profile
        let locationRelevance = 0;
        if (userProfile.state && 
            (scholarship.description.toLowerCase().includes(userProfile.state.toLowerCase()) ||
             scholarship.title.toLowerCase().includes(userProfile.state.toLowerCase()))) {
          locationRelevance += 30;
        }
        if (userProfile.city && 
            (scholarship.description.toLowerCase().includes(userProfile.city.toLowerCase()) ||
             scholarship.title.toLowerCase().includes(userProfile.city.toLowerCase()))) {
          locationRelevance += 40;
        }
        if (userProfile.college_university && 
            (scholarship.description.toLowerCase().includes(userProfile.college_university.toLowerCase()) ||
             scholarship.title.toLowerCase().includes(userProfile.college_university.toLowerCase()))) {
          locationRelevance += 50;
        }
        
        verifiedScholarships.push({
          ...scholarship,
          location_relevance: locationRelevance
        });
      } else {
        console.log(`Skipping scholarship with invalid URL: ${scholarship.url}`);
      }
    }

    // Sort scholarships by location relevance, with ties broken by other factors
    const sortedScholarships = verifiedScholarships.sort((a, b) => {
      if (a.location_relevance !== b.location_relevance) {
        return b.location_relevance - a.location_relevance;
      }
      // If location relevance is the same, sort by amount
      return b.amount - a.amount;
    });
    
    console.log('Returning sorted and verified scholarships:', sortedScholarships);
    
    return new Response(
      JSON.stringify({ scholarships: sortedScholarships }), 
      {
        headers: corsHeaders,
        status: 200
      }
    );
  } catch (error) {
    console.error('Error in openai-scholarship-search function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred',
        scholarships: []
      }),
      { 
        headers: corsHeaders,
        status: 500
      }
    );
  }
});
