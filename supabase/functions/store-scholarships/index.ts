
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import { Scholarship } from '../discover-scholarships/types.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    });
  }

  try {
    const { scholarships } = await req.json();
    console.log('Received scholarships to store:', scholarships);

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const storedCount = await storeScholarships(scholarships, supabase);

    return new Response(
      JSON.stringify({ 
        success: true, 
        count: storedCount,
        message: `Successfully stored ${storedCount} scholarships`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in store-scholarships function:', error);
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

async function storeScholarships(scholarships: Scholarship[], supabase: ReturnType<typeof createClient>): Promise<number> {
  let storedCount = 0;

  for (const scholarship of scholarships) {
    const { data: existingScholarship, error: checkError } = await supabase
      .from('scholarships')
      .select('id')
      .eq('url', scholarship.url)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing scholarship:', checkError);
      continue;
    }

    if (!existingScholarship) {
      const { error: insertError } = await supabase
        .from('scholarships')
        .insert([{
          title: scholarship.title,
          amount: scholarship.amount,
          deadline: new Date(scholarship.deadline),
          requirements: scholarship.requirements,
          provider: scholarship.provider,
          url: scholarship.url,
          description: scholarship.description,
          category: 'General',
          verified: true,
          is_active: true,
          last_verified_at: new Date(),
        }]);

      if (insertError) {
        console.error('Error inserting scholarship:', insertError);
      } else {
        storedCount++;
      }
    }
  }

  return storedCount;
}
