
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import { corsHeaders } from './config.ts';
import { UserProfile } from './types.ts';

console.log('Starting discover-scholarships function...');

serve(async (req: Request) => {
  // Handle CORS preflight requests first
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      headers: {
        ...corsHeaders,
        'Access-Control-Max-Age': '86400',
        'Content-Type': 'text/plain',
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
      console.error('Invalid user profile');
      throw new Error('Valid user profile is required');
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Call OpenAI search with better error handling and timeout
    console.log('Calling openai-scholarship-search...');
    let retries = 2;
    let searchResult;
    
    while (retries >= 0) {
      try {
        const response = await Promise.race([
          supabase.functions.invoke('openai-scholarship-search', {
            body: { userProfile },
            headers: { ...corsHeaders }
          }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Search timeout')), 12000)
          )
        ]);

        console.log('Search response:', response);

        if (!response.error) {
          searchResult = response;
          break;
        }
        
        console.error(`Attempt failed, ${retries} retries left:`, response.error);
        retries--;
        
        if (retries >= 0) {
          await new Promise(r => setTimeout(r, 2000)); // Increased delay between retries
        }
      } catch (error) {
        console.error('Search attempt failed:', error);
        retries--;
        
        if (retries >= 0) {
          console.log(`Retrying... ${retries} attempts left`);
          await new Promise(r => setTimeout(r, 2000));
        } else {
          throw new Error('Failed to search for scholarships after all retries');
        }
      }
    }

    if (!searchResult?.data?.scholarships || !Array.isArray(searchResult.data.scholarships)) {
      console.error('Invalid scholarship data received:', searchResult);
      throw new Error('Invalid scholarship data received from search');
    }

    console.log('Successfully processed request');
    return new Response(
      JSON.stringify({
        success: true,
        scholarships: searchResult.data.scholarships
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200
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
          'Content-Type': 'application/json',
        }
      }
    );
  }
});
