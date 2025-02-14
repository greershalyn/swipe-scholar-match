
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

    const requestData = await req.json();
    console.log('Request data:', JSON.stringify(requestData, null, 2));

    if (!requestData.userProfile) {
      throw new Error('User profile is required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Calling openai-scholarship-search function...');

    // Call openai-scholarship-search function with explicit error handling
    try {
      console.log('Sending user profile to AI search:', JSON.stringify(requestData.userProfile, null, 2));

      const { data: aiResponse, error: aiError } = await supabase.functions.invoke(
        'openai-scholarship-search',
        {
          body: { userProfile: requestData.userProfile }
        }
      );

      console.log('AI Search Response:', JSON.stringify(aiResponse, null, 2));
      console.log('AI Search Error:', aiError);

      if (aiError) {
        console.error('Error from openai-scholarship-search:', aiError);
        throw aiError;
      }

      if (!aiResponse) {
        throw new Error('No response from AI search');
      }

      if (!aiResponse.scholarships || !Array.isArray(aiResponse.scholarships)) {
        console.log('No scholarships or invalid format returned from AI search');
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
      const processedScholarships = aiResponse.scholarships.map(scholarship => {
        // Remove any existing ID to let Supabase handle UUID generation
        const { id, ...rest } = scholarship;
        const processedScholarship = {
          ...rest,
          url: rest.url || `https://example.com/scholarship/${crypto.randomUUID()}`,
          requirements: Array.isArray(rest.requirements) ? rest.requirements : [],
          category: rest.category || 'General',
          amount: typeof rest.amount === 'number' ? rest.amount : 0,
          deadline: rest.deadline || new Date().toISOString(),
          description: rest.description || '',
          provider: rest.provider || 'Unknown Provider',
          title: rest.title || 'Untitled Scholarship'
        };
        console.log('Processed scholarship:', JSON.stringify(processedScholarship, null, 2));
        return processedScholarship;
      });

      for (const scholarship of processedScholarships) {
        try {
          const { error: insertError } = await supabase
            .from('scholarships')
            .insert([scholarship]);

          if (insertError) {
            console.error('Error inserting scholarship:', insertError, scholarship);
          } else {
            console.log('Successfully inserted scholarship:', scholarship.title);
          }
        } catch (error) {
          console.error('Exception inserting scholarship:', error, scholarship);
        }
      }

      return new Response(
        JSON.stringify({ 
          success: true,
          scholarships: processedScholarships 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    } catch (aiError) {
      console.error('Error in AI scholarship search:', aiError);
      throw new Error(`AI search failed: ${aiError.message}`);
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
        status: 200 // Return 200 even for errors to ensure the error message gets through
      }
    );
  }
});
