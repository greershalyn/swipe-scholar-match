
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

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
      throw new Error('Missing environment variables');
    }

    // Parse request body
    const { userProfile, page = 1 } = await req.json();
    console.log('Processing request for user profile:', userProfile?.id, 'page:', page);

    if (!userProfile?.id) {
      console.error('Invalid user profile');
      throw new Error('Valid user profile is required');
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Call OpenAI search with timeout
    console.log('Calling openai-scholarship-search...');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000); // 25 second timeout

    try {
      const response = await supabase.functions.invoke('openai-scholarship-search', {
        body: { userProfile },
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (response.error) {
        console.error('OpenAI search failed:', response.error);
        // Return a 200 status with empty scholarships array instead of throwing
        return new Response(
          JSON.stringify({
            success: true,
            scholarships: []
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
          }
        );
      }

      if (!response.data?.scholarships || !Array.isArray(response.data.scholarships)) {
        console.error('Invalid response format:', response.data);
        // Return a 200 status with empty scholarships array
        return new Response(
          JSON.stringify({
            success: true,
            scholarships: []
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
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
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    } catch (error) {
      clearTimeout(timeout);
      if (error.name === 'AbortError') {
        // Return a 200 status with empty scholarships array for timeout
        return new Response(
          JSON.stringify({
            success: true,
            scholarships: []
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
          }
        );
      }
      throw error;
    }

  } catch (error) {
    console.error('Error in discover-scholarships function:', error);
    // Return a 200 status with empty scholarships array for any error
    return new Response(
      JSON.stringify({
        success: true,
        scholarships: []
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  }
});
