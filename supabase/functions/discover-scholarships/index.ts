
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import { UserProfile } from './types.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Content-Type': 'application/json'
};

function validateUserProfile(profile: any): profile is UserProfile {
  // Log the profile for debugging
  console.log('Validating profile:', JSON.stringify(profile, null, 2));

  if (!profile) {
    console.error('Profile is null or undefined');
    return false;
  }

  const requiredFields = [
    'id', 'full_name', 'birth_date', 'gender', 'ethnicity',
    'address', 'city', 'state', 'zip_code', 'current_education_level',
    'intended_major', 'first_generation_student', 'essay_personal_statement',
    'rewards_achievements', 'volunteering_experience', 'organizations',
    'keywords', 'high_school_graduated'
  ];

  const missingFields = requiredFields.filter(field => {
    const value = profile[field];
    // Allow null for birth_date
    if (field === 'birth_date') {
      return false;
    }
    if (Array.isArray(value)) {
      return false; // Arrays can be empty but must exist
    }
    return value === undefined;
  });

  if (missingFields.length > 0) {
    console.error('Missing required fields:', missingFields);
    return false;
  }

  // Validate types
  const validTypes = 
    typeof profile.id === 'string' &&
    typeof profile.full_name === 'string' &&
    Array.isArray(profile.rewards_achievements) &&
    Array.isArray(profile.volunteering_experience) &&
    Array.isArray(profile.organizations) &&
    Array.isArray(profile.keywords);

  if (!validTypes) {
    console.error('Invalid field types in profile');
    return false;
  }

  return true;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing environment variables');
      return new Response(
        JSON.stringify({
          error: 'Server configuration error',
          success: false,
          scholarships: []
        }),
        {
          headers: { ...corsHeaders },
          status: 500
        }
      );
    }

    // Parse request body with more detailed error handling
    let body;
    try {
      const text = await req.text();
      console.log('Raw request body:', text);
      
      try {
        body = JSON.parse(text);
        console.log('Parsed request body:', JSON.stringify(body, null, 2));
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        return new Response(
          JSON.stringify({
            error: 'Invalid JSON format',
            details: parseError.message,
            success: false,
            scholarships: []
          }),
          {
            headers: { ...corsHeaders },
            status: 400
          }
        );
      }
    } catch (error) {
      console.error('Error reading request body:', error);
      return new Response(
        JSON.stringify({
          error: 'Error reading request body',
          details: error.message,
          success: false,
          scholarships: []
        }),
        {
          headers: { ...corsHeaders },
          status: 400
        }
      );
    }

    const { userProfile, page = 1, timestamp = Date.now() } = body;
    console.log('Processing request with parameters:', {
      page,
      timestamp,
      userProfile: userProfile ? 'present' : 'missing'
    });

    if (!userProfile || !validateUserProfile(userProfile)) {
      console.error('Invalid user profile format:', JSON.stringify(userProfile, null, 2));
      return new Response(
        JSON.stringify({
          error: 'Invalid user profile format - check function logs for details',
          success: false,
          scholarships: []
        }),
        {
          headers: { ...corsHeaders },
          status: 400
        }
      );
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Call OpenAI search with a timeout
    console.log('Calling OpenAI search...');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000); // 25 second timeout

    try {
      const response = await supabase.functions.invoke('openai-scholarship-search', {
        body: { userProfile },
        signal: controller.signal,
      });

      clearTimeout(timeout);
      console.log('OpenAI search response:', response);

      if (response.error) {
        console.error('OpenAI search failed:', response.error);
        return new Response(
          JSON.stringify({
            error: response.error,
            success: false,
            scholarships: []
          }),
          {
            headers: { ...corsHeaders },
            status: 500
          }
        );
      }

      if (!response.data?.scholarships || !Array.isArray(response.data.scholarships)) {
        console.error('Invalid response format:', response.data);
        return new Response(
          JSON.stringify({
            error: 'Invalid response format',
            success: false,
            scholarships: []
          }),
          {
            headers: { ...corsHeaders },
            status: 500
          }
        );
      }

      console.log('Successfully processed request, found scholarships:', response.data.scholarships.length);
      return new Response(
        JSON.stringify({
          success: true,
          scholarships: response.data.scholarships
        }),
        {
          headers: { ...corsHeaders },
          status: 200
        }
      );
    } catch (error) {
      clearTimeout(timeout);
      console.error('Error in OpenAI search:', error);
      return new Response(
        JSON.stringify({
          error: error.message,
          success: false,
          scholarships: []
        }),
        {
          headers: { ...corsHeaders },
          status: 500
        }
      );
    }

  } catch (error) {
    console.error('Error in discover-scholarships function:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
        success: false,
        scholarships: []
      }),
      {
        headers: { ...corsHeaders },
        status: 500
      }
    );
  }
});
