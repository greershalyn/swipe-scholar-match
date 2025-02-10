
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import { corsHeaders } from './config.ts';
import { UserProfile } from './types.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

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
    console.log('Request method:', req.method);
    console.log('Request headers:', Object.fromEntries(req.headers.entries()));

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    if (!req.body) {
      throw new Error('Request body is required');
    }

    const { userProfile } = await req.json();
    console.log('Processing scholarship discovery for user profile:', userProfile);

    // Step 1: Search for scholarships using OpenAI
    console.log('Calling openai-scholarship-search function...');
    const { data: searchData, error: searchError } = await supabase.functions.invoke('openai-scholarship-search', {
      body: { userProfile }
    });

    if (searchError) {
      console.error('Error from openai-scholarship-search:', searchError);
      throw new Error(`Failed to search for scholarships: ${searchError.message}`);
    }

    console.log('Scholarships found:', searchData);

    if (!searchData?.scholarships || !Array.isArray(searchData.scholarships)) {
      throw new Error('Invalid scholarship data received from search');
    }

    // Step 2: Store the found scholarships
    console.log('Calling store-scholarships function...');
    const { data: storeData, error: storeError } = await supabase.functions.invoke('store-scholarships', {
      body: { scholarships: searchData.scholarships }
    });

    if (storeError) {
      console.error('Error from store-scholarships:', storeError);
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
