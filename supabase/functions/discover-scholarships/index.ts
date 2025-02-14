
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import { fetchLocalScholarships, insertScholarships } from './scholarshipService.ts';
import { generateScholarships } from './openaiService.ts';
import { transformScholarships } from './scholarshipTransformer.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Max-Age': '86400',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    });
  }

  try {
    const requestData = await req.json();
    console.log('Received request data:', JSON.stringify(requestData, null, 2));

    if (!requestData.userProfile) {
      throw new Error('User profile is required');
    }

    const userProfile = requestData.userProfile;
    const timestamp = requestData.timestamp || Date.now();
    const forceRefresh = requestData.forceRefresh || false;
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // First, try to find local scholarships
    const localScholarships = await fetchLocalScholarships(supabase, userProfile, timestamp);

    // If we have enough local scholarships and not forcing refresh, return them
    if (localScholarships && localScholarships.length >= 5 && !forceRefresh) {
      console.log('Found sufficient local scholarships:', localScholarships.length);
      return new Response(
        JSON.stringify({
          success: true,
          scholarships: localScholarships
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }

    // Generate new scholarships
    const openAiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      console.log('Generating new scholarships with OpenAI...');
      const scholarshipsData = await generateScholarships(openAiApiKey, userProfile);
      const validatedScholarships = transformScholarships(scholarshipsData);
      
      // Combine with any local scholarships we found
      const allScholarships = [
        ...validatedScholarships,
        ...(localScholarships || [])
      ];

      // Insert new scholarships
      await insertScholarships(supabase, validatedScholarships);

      console.log(`Returning ${allScholarships.length} scholarships`);
      return new Response(
        JSON.stringify({
          success: true,
          scholarships: allScholarships
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );

    } catch (error) {
      console.error('Error generating scholarships:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in discover-scholarships function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        scholarships: []
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  }
});
