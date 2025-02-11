
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

    const { userProfile, page = 1 } = await req.json();
    console.log('Received request with user profile:', userProfile, 'page:', page);

    if (!userProfile) {
      console.error('User profile is missing');
      throw new Error('User profile is required');
    }

    // Create Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Step 1: Search for scholarships using OpenAI
    console.log('Calling openai-scholarship-search...');
    const searchResult = await supabase.functions.invoke('openai-scholarship-search', {
      body: { userProfile }
    });

    if (searchResult.error) {
      console.error('OpenAI search error:', searchResult.error);
      throw new Error(`Failed to search for scholarships: ${searchResult.error.message}`);
    }

    const searchData = searchResult.data;
    if (!searchData?.scholarships || !Array.isArray(searchData.scholarships)) {
      console.error('Invalid scholarship data received:', searchData);
      throw new Error('Invalid scholarship data received from search');
    }

    // Step 2: Store the found scholarships
    console.log('Calling store-scholarships...');
    const storeResult = await supabase.functions.invoke('store-scholarships', {
      body: { scholarships: searchData.scholarships }
    });

    if (storeResult.error) {
      console.error('Store error:', storeResult.error);
      throw new Error(`Failed to store scholarships: ${storeResult.error.message}`);
    }

    console.log('Successfully processed request');
    return new Response(
      JSON.stringify({ 
        success: true, 
        ...storeResult.data,
        scholarships: searchData.scholarships
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
