
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const openAiApiKey = Deno.env.get('OPENAI_API_KEY')!;
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { scholarshipId, userProfile } = await req.json();
    
    // Fetch scholarship details
    const { data: scholarship, error: scholarshipError } = await supabase
      .from('scholarships')
      .select('*')
      .eq('id', scholarshipId)
      .single();

    if (scholarshipError) throw scholarshipError;

    // Prepare the analysis prompt
    const analysisPrompt = `
      Analyze this scholarship opportunity for the given student profile:

      Scholarship:
      - Title: ${scholarship.title}
      - Amount: $${scholarship.amount}
      - Requirements: ${scholarship.requirements.join(', ')}
      - Description: ${scholarship.description}

      Student Profile:
      - GPA: ${userProfile.gpa || 'Not specified'}
      - Major: ${userProfile.intended_major || 'Not specified'}
      - Education Level: ${userProfile.current_education_level || 'Not specified'}
      - Ethnicity: ${userProfile.ethnicity || 'Not specified'}
      - First Generation Student: ${userProfile.first_generation_student ? 'Yes' : 'No'}
      
      Please analyze:
      1. Match percentage (0-100)
      2. Key eligibility factors
      3. Potential red flags
      4. Application strategy
    `;

    // Call OpenAI API for analysis
    const openAiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a scholarship advisor helping students find and evaluate scholarship opportunities.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
      }),
    });

    const openAiData = await openAiResponse.json();
    const analysis = openAiData.choices[0].message.content;

    return new Response(
      JSON.stringify({ success: true, analysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-scholarship function:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
