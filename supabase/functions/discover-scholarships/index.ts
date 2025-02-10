
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import { corsHeaders } from './config.ts';
import { UserProfile } from './types.ts';

console.log('Starting discover-scholarships function...');

serve(async (req: Request) => {
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

    console.log('Environment check:', { 
      hasSupabaseUrl: !!supabaseUrl, 
      hasSupabaseKey: !!supabaseKey 
    });

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing environment variables');
    }

    console.log('Request method:', req.method);
    console.log('Request headers:', Object.fromEntries(req.headers.entries()));

    const { userProfile } = await req.json();
    console.log('Received user profile:', userProfile);

    if (!userProfile) {
      throw new Error('User profile is required');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Step 1: Search for scholarships using OpenAI
    console.log('Calling openai-scholarship-search function...');
    const { data: searchData, error: searchError } = await supabase.functions.invoke('openai-scholarship-search', {
      body: { userProfile }
    });

    if (searchError) {
      console.error('OpenAI search error:', searchError);
      throw new Error(`Failed to search for scholarships: ${searchError.message}`);
    }

    console.log('OpenAI search results:', searchData);

    if (!searchData?.scholarships || !Array.isArray(searchData.scholarships)) {
      throw new Error('Invalid scholarship data received from search');
    }

    // Step 2: Store the found scholarships
    console.log('Calling store-scholarships function...');
    const { data: storeData, error: storeError } = await supabase.functions.invoke('store-scholarships', {
      body: { scholarships: searchData.scholarships }
    });

    if (storeError) {
      console.error('Store error:', storeError);
      throw new Error(`Failed to store scholarships: ${storeError.message}`);
    }

    console.log('Store result:', storeData);

    return new Response(
      JSON.stringify({ 
        success: true, 
        ...storeData,
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
