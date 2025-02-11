
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Content-Type': 'application/json'
};

serve(async (req: Request) => {
  console.log('Received request:', req.method);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request');
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
          headers: corsHeaders,
          status: 500
        }
      );
    }

    // Parse request body
    let body;
    try {
      body = await req.json();
    } catch (error) {
      console.error('Error parsing request body:', error);
      return new Response(
        JSON.stringify({
          error: 'Invalid request body',
          success: false,
          scholarships: []
        }),
        {
          headers: corsHeaders,
          status: 400
        }
      );
    }

    const { userProfile, page = 1, timestamp = Date.now() } = body;
    console.log('Processing request for user profile:', userProfile?.id, 'page:', page, 'timestamp:', timestamp);

    if (!userProfile?.id) {
      console.error('Invalid user profile');
      return new Response(
        JSON.stringify({
          error: 'Invalid user profile',
          success: false,
          scholarships: []
        }),
        {
          headers: corsHeaders,
          status: 400
        }
      );
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Skip cache and always call OpenAI search when timestamp is provided
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
            headers: corsHeaders,
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
            headers: corsHeaders,
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
          headers: corsHeaders,
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
          headers: corsHeaders,
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
        headers: corsHeaders,
        status: 500
      }
    );
  }
});
