
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

    // Always try to generate new scholarships first when forced
    let generatedScholarships = [];
    if (forceRefresh) {
      console.log('Force refresh requested, generating new scholarships...');
      const openAiApiKey = Deno.env.get('OPENAI_API_KEY');
      if (!openAiApiKey) {
        throw new Error('OpenAI API key not configured');
      }

      const scholarshipsData = await generateScholarships(openAiApiKey, userProfile);
      const validatedScholarships = transformScholarships(scholarshipsData);
      generatedScholarships = await insertScholarships(supabase, validatedScholarships);
      console.log(`Generated and inserted ${generatedScholarships.length} new scholarships`);
    }

    // Then fetch local scholarships (including any we just generated)
    const localScholarships = await fetchLocalScholarships(supabase, userProfile, timestamp);
    
    // Combine both sources, prioritizing new scholarships
    const allScholarships = [
      ...generatedScholarships,
      ...(localScholarships || [])
    ].slice(0, 10); // Limit to 10 scholarships

    if (!allScholarships.length) {
      console.log('No scholarships found, generating new ones...');
      const openAiApiKey = Deno.env.get('OPENAI_API_KEY');
      if (!openAiApiKey) {
        throw new Error('OpenAI API key not configured');
      }

      const scholarshipsData = await generateScholarships(openAiApiKey, userProfile);
      const validatedScholarships = transformScholarships(scholarshipsData);
      const newScholarships = await insertScholarships(supabase, validatedScholarships);
      allScholarships.push(...newScholarships);
    }

    console.log(`Returning ${allScholarships.length} total scholarships`);
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
