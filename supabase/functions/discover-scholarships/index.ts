
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
  // Handle CORS preflight requests first
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

    let body;
    try {
      body = await req.json();
    } catch (error) {
      console.error('Error parsing request body:', error);
      return new Response(
        JSON.stringify({
          error: 'Invalid JSON format',
          success: false,
          scholarships: []
        }),
        {
          headers: { ...corsHeaders },
          status: 400
        }
      );
    }

    const { userProfile } = body;
    
    if (!userProfile || !validateUserProfile(userProfile)) {
      console.error('Invalid user profile format');
      return new Response(
        JSON.stringify({
          error: 'Invalid user profile format',
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

    try {
      const response = await supabase.functions.invoke('openai-scholarship-search', {
        body: { userProfile }
      });

      if (response.error) {
        throw response.error;
      }

      return new Response(
        JSON.stringify({
          success: true,
          scholarships: response.data?.scholarships || []
        }),
        {
          headers: { ...corsHeaders },
          status: 200
        }
      );
    } catch (error) {
      console.error('Error in OpenAI search:', error);
      return new Response(
        JSON.stringify({
          error: error.message || 'Failed to fetch scholarships',
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
        error: error.message || 'An unexpected error occurred',
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
