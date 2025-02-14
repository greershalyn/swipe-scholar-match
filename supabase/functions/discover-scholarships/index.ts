
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import { UserProfile } from './types.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Request-Headers': '*',
  'Content-Type': 'application/json'
};

function validateUserProfile(profile: any): profile is UserProfile {
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
    if (field === 'birth_date') return false;
    if (Array.isArray(value)) return false;
    return value === undefined;
  });

  if (missingFields.length > 0) {
    console.error('Missing required fields:', missingFields);
    return false;
  }

  return true;
}

serve(async (req: Request) => {
  console.log('Received request:', req.method);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  try {
    console.log('Processing request body...');
    const body = await req.json().catch(err => {
      console.error('Error parsing request body:', err);
      throw new Error('Invalid request body');
    });

    console.log('Received body:', body);

    const { userProfile } = body;
    
    if (!userProfile) {
      console.error('No user profile provided');
      return new Response(
        JSON.stringify({
          error: 'No user profile provided',
          success: false,
          scholarships: []
        }),
        {
          headers: corsHeaders,
          status: 400
        }
      );
    }

    if (!validateUserProfile(userProfile)) {
      console.error('Invalid user profile format:', userProfile);
      return new Response(
        JSON.stringify({
          error: 'Invalid user profile format',
          success: false,
          scholarships: []
        }),
        {
          headers: corsHeaders,
          status: 400
        }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase configuration');
      return new Response(
        JSON.stringify({
          error: 'Server configuration error',
          success: false,
          scholarships: []
        }),
        {
          headers: corsHeaders,
          status: 500
        }
      );
    }

    console.log('Creating Supabase client...');
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Calling openai-scholarship-search function...');
    const response = await supabase.functions.invoke('openai-scholarship-search', {
      body: { userProfile }
    });

    if (response.error) {
      console.error('Error from openai-scholarship-search:', response.error);
      throw response.error;
    }

    console.log('Successfully received scholarships:', response.data);
    return new Response(
      JSON.stringify({
        success: true,
        scholarships: response.data?.scholarships || []
      }),
      {
        headers: corsHeaders,
        status: 200
      }
    );
  } catch (error) {
    console.error('Error in discover-scholarships function:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'An unexpected error occurred',
        success: false,
        scholarships: []
      }),
      {
        headers: corsHeaders,
        status: 500
      }
    );
  }
});
