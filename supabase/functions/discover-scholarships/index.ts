
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import { corsHeaders } from './config.ts';
import { UserProfile } from './types.ts';

console.log('Starting discover-scholarships function...');

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: {
        ...corsHeaders,
        'Access-Control-Max-Age': '86400',
      },
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

    // Parse request body and validate inputs
    const { userProfile, page = 1 } = await req.json();
    console.log('Processing request for user profile:', userProfile?.id, 'page:', page);

    if (!userProfile?.id) {
      console.error('Invalid user profile:', userProfile);
      throw new Error('Valid user profile is required');
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Call OpenAI search with retries
    console.log('Calling openai-scholarship-search...');
    let retries = 3;
    let searchResult;
    while (retries > 0) {
      try {
        searchResult = await supabase.functions.invoke('openai-scholarship-search', {
          body: { userProfile }
        });
        if (!searchResult.error) break;
        retries--;
        if (retries > 0) await new Promise(r => setTimeout(r, 1000));
      } catch (e) {
        console.error('Attempt failed:', e);
        retries--;
        if (retries === 0) throw e;
        await new Promise(r => setTimeout(r, 1000));
      }
    }

    if (searchResult?.error) {
      console.error('OpenAI search error:', searchResult.error);
      throw new Error(`Failed to search for scholarships: ${searchResult.error.message}`);
    }

    if (!searchResult?.data?.scholarships || !Array.isArray(searchResult.data.scholarships)) {
      console.error('Invalid scholarship data received:', searchResult?.data);
      throw new Error('Invalid scholarship data received from search');
    }

    // Store scholarships with retries
    console.log('Storing scholarships...');
    retries = 3;
    let storeResult;
    while (retries > 0) {
      try {
        storeResult = await supabase.functions.invoke('store-scholarships', {
          body: { scholarships: searchResult.data.scholarships }
        });
        if (!storeResult.error) break;
        retries--;
        if (retries > 0) await new Promise(r => setTimeout(r, 1000));
      } catch (e) {
        console.error('Store attempt failed:', e);
        retries--;
        if (retries === 0) throw e;
        await new Promise(r => setTimeout(r, 1000));
      }
    }

    if (storeResult?.error) {
      console.error('Store error:', storeResult.error);
      throw new Error(`Failed to store scholarships: ${storeResult.error.message}`);
    }

    console.log('Successfully processed request');
    return new Response(
      JSON.stringify({
        success: true,
        ...storeResult?.data,
        scholarships: searchResult.data.scholarships
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('Error in discover-scholarships function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'An unexpected error occurred'
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});
