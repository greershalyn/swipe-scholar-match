
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from './config.ts';
import { UserProfile } from './types.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    });
  }

  try {
    const { userProfile } = await req.json();
    console.log('Orchestrating scholarship discovery for user profile:', userProfile);

    // Step 1: Search for scholarships using OpenAI
    const searchResponse = await fetch(`${supabaseUrl}/functions/v1/openai-scholarship-search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': req.headers.get('Authorization') || '',
      },
      body: JSON.stringify({ userProfile }),
    });

    if (!searchResponse.ok) {
      const error = await searchResponse.text();
      console.error('Error from openai-scholarship-search:', error);
      throw new Error('Failed to search for scholarships');
    }

    const scholarshipsData = await searchResponse.json();

    // Step 2: Store the found scholarships
    const storeResponse = await fetch(`${supabaseUrl}/functions/v1/store-scholarships`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': req.headers.get('Authorization') || '',
      },
      body: JSON.stringify({ scholarships: scholarshipsData.scholarships }),
    });

    if (!storeResponse.ok) {
      const error = await storeResponse.text();
      console.error('Error from store-scholarships:', error);
      throw new Error('Failed to store scholarships');
    }

    const storeResult = await storeResponse.json();

    return new Response(
      JSON.stringify({ 
        success: true, 
        ...storeResult
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in discover-scholarships orchestrator:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
