
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

const openAiApiKey = Deno.env.get('OPENAI_API_KEY')!;

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
    const timeout = setTimeout(() => controller.abort(), 10000); // Increased timeout to 10 seconds

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
    const { userProfile, page = 1 } = await req.json();
    console.log('Received user profile for scholarship search:', userProfile, 'page:', page);

    if (!openAiApiKey) {
      console.error('OpenAI API key not configured');
      throw new Error('OpenAI API key not configured');
    }

    const currentDate = new Date();
    const sixMonthsFromNow = new Date();
    sixMonthsFromNow.setMonth(currentDate.getMonth() + 6);

    const trustedDomainsString = TRUSTED_SCHOLARSHIP_DOMAINS.map(domain => `- ${domain}`).join('\n');

    const searchPrompt = `
      Find 5 currently available scholarships for a student with the following profile:
      - Major: ${userProfile.intended_major || 'Any'}
      - GPA: ${userProfile.gpa || 'Not specified'}
      - Education Level: ${userProfile.current_education_level || 'Any'}
      - Ethnicity: ${userProfile.ethnicity || 'Not specified'}
      - First Generation Student: ${userProfile.first_generation_student ? 'Yes' : 'No'}
      
      IMPORTANT GUIDELINES:
      1. Only provide scholarships with deadlines between ${currentDate.toISOString().split('T')[0]} and ${sixMonthsFromNow.toISOString().split('T')[0]}.
      2. Prioritize scholarships from these trusted domains:
      ${trustedDomainsString}
      3. URLs must be from actual scholarship websites, not placeholder or example domains.
      4. Each scholarship must have a specific, detailed title that matches the provider organization.
      5. Requirements must be specific and match the actual scholarship criteria.
      6. Description should include key details about the scholarship purpose and eligibility.
      
      For each scholarship, provide:
      1. Title (be specific and descriptive)
      2. Amount (in USD)
      3. Application deadline (must be a date between today and 6 months from now)
      4. Detailed eligibility requirements
      5. Provider/organization name (must be a real organization)
      6. Application URL (must be from a real scholarship website)
      7. A detailed description (2-3 sentences)
      
      Return ONLY a JSON object with a "scholarships" array containing these fields, WITH UNIQUE IDs for each scholarship:
      {
        "scholarships": [
          {
            "id": string (UUID v4),
            "title": string,
            "amount": number,
            "deadline": string (ISO date),
            "requirements": string[],
            "provider": string,
            "url": string,
            "description": string,
            "is_active": true
          }
        ]
      }
    `;

    console.log('Sending prompt to OpenAI');

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
            content: 'You are a scholarship research assistant. Generate scholarships ONLY from reputable scholarship websites and trusted sources. Focus on accuracy and verifiability. Each scholarship must be from a real organization with a valid, accessible URL. Ensure all dates are in the future and within the specified timeframe.'
          },
          {
            role: 'user',
            content: searchPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
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
      console.error('Error parsing OpenAI response:', parseError, '\nResponse content:', data.choices[0].message.content);
      throw new Error('Failed to parse OpenAI response');
    }

    // Verify URLs before returning scholarships
    const verifiedScholarships = [];
    for (const scholarship of scholarships.scholarships) {
      const isUrlValid = await verifyUrl(scholarship.url);
      if (isUrlValid) {
        verifiedScholarships.push(scholarship);
      } else {
        console.log(`Skipping scholarship with invalid URL: ${scholarship.url}`);
      }
    }

    // Only return error if no valid scholarships were found
    if (verifiedScholarships.length === 0) {
      console.error('No valid scholarships found after URL verification');
      throw new Error('No valid scholarships found after URL verification');
    }
    
    return new Response(JSON.stringify({ scholarships: verifiedScholarships }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });
  } catch (error) {
    console.error('Error in openai-scholarship-search function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'An unexpected error occurred'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
