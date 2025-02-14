
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import { UserProfile } from './types.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Max-Age': '86400',
};

serve(async (req: Request) => {
  // Always handle CORS preflight requests first
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    });
  }

  try {
    if (req.method !== 'POST') {
      throw new Error('Method not allowed');
    }

    const contentType = req.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Content-Type must be application/json');
    }

    const { userProfile } = await req.json();

    if (!userProfile) {
      throw new Error('User profile is required');
    }

    console.log('Received request with userProfile:', JSON.stringify(userProfile, null, 2));

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Calling openai-scholarship-search function...');

    // Call openai-scholarship-search function
    const { data: aiResponse, error: aiError } = await supabase.functions.invoke(
      'openai-scholarship-search',
      {
        body: { userProfile }
      }
    );

    if (aiError) {
      console.error('Error from openai-scholarship-search:', aiError);
      throw aiError;
    }

    if (!aiResponse?.scholarships) {
      console.log('No scholarships returned from AI search');
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

    // Process scholarships to ensure they have valid data
    const scholarships = aiResponse.scholarships.map(scholarship => {
      // Remove any existing ID to let Supabase handle UUID generation
      const { id, ...rest } = scholarship;
      return {
        ...rest,
        url: rest.url || `https://example.com/scholarship/${crypto.randomUUID()}`,
        requirements: Array.isArray(rest.requirements) ? rest.requirements : [],
        category: rest.category || 'General'
      };
    });

    console.log('Processed scholarships:', JSON.stringify(scholarships, null, 2));

    return new Response(
      JSON.stringify({ 
        success: true,
        scholarships 
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
        status: error.status || 500 
      }
    );
  }
});
