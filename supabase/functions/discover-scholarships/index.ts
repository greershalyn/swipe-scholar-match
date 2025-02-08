
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import { corsHeaders } from './config.ts';
import { fetchScholarshipsFromOpenAI } from './openaiService.ts';
import { storeScholarships } from './dbService.ts';
import { UserProfile } from './types.ts';

const openAiApiKey = Deno.env.get('OPENAI_API_KEY')!;
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    });
  }

  try {
    const { userProfile } = await req.json();
    console.log('Received user profile:', userProfile);
    
    if (!openAiApiKey) {
      console.error('OpenAI API key not configured');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'OpenAI API key not configured',
          status: 'setup_pending',
          details: 'OpenAI API key setup required'
        }),
        {
          status: 503,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const scholarshipsData = await fetchScholarshipsFromOpenAI(userProfile as UserProfile, openAiApiKey);
    await storeScholarships(scholarshipsData.scholarships, supabase);

    return new Response(
      JSON.stringify({ 
        success: true, 
        count: scholarshipsData.scholarships.length,
        message: `Successfully processed ${scholarshipsData.scholarships.length} scholarships`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in discover-scholarships function:', error);
    
    if (error.message.includes('billing')) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'OpenAI API is temporarily unavailable. The service is being set up and should be available shortly. Please try again in a few minutes.',
          status: 'setup_pending',
          details: 'OpenAI billing setup in progress'
        }),
        {
          status: 503,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        details: error instanceof Error ? error.stack : undefined
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
