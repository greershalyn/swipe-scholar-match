
// Required for fetch in Deno environment
import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
  // Handle CORS preflight requests
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
    const page = requestData.page || 1;
    
    // Get scholarships directly from the database first
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Fetch scholarships from the database
    const { data: existingScholarships, error: fetchError } = await supabase
      .from('scholarships')
      .select('*')
      .eq('is_active', true)
      .gt('deadline', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(10)
      .range((page - 1) * 10, page * 10 - 1);

    if (fetchError) {
      console.error('Error fetching scholarships:', fetchError);
      throw fetchError;
    }

    // If we have enough scholarships, return them
    if (existingScholarships && existingScholarships.length > 0) {
      console.log('Returning existing scholarships:', existingScholarships);
      return new Response(
        JSON.stringify({
          success: true,
          scholarships: existingScholarships
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }

    // If we don't have enough scholarships, generate new ones using OpenAI
    const openAiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const currentDate = new Date();
    const sixMonthsFromNow = new Date();
    sixMonthsFromNow.setMonth(currentDate.getMonth() + 6);

    const searchPrompt = `
      As a scholarship search assistant, find 5 currently available scholarships for a student with the following profile:
      - Major: ${userProfile.intended_major || 'Any'}
      - Education Level: ${userProfile.current_education_level || 'Any'}
      - Location: ${userProfile.state ? `${userProfile.state}, USA` : 'Any'}
      - GPA: ${userProfile.gpa || 'Not specified'}
      - SAT Score: ${userProfile.sat_score || 'Not specified'}
      - ACT Score: ${userProfile.act_score || 'Not specified'}
      
      Return ONLY a valid JSON object with this exact structure:
      {
        "scholarships": [
          {
            "title": "string",
            "amount": number,
            "deadline": "YYYY-MM-DD",
            "requirements": ["string"],
            "provider": "string",
            "url": "string",
            "description": "string",
            "category": "string"
          }
        ]
      }`;

    console.log('Making OpenAI API request with prompt:', searchPrompt);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a JSON-only response API. Only return valid JSON objects with scholarships data.'
          },
          {
            role: 'user',
            content: searchPrompt
          }
        ],
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const openAIData = await response.json();
    console.log('OpenAI response:', JSON.stringify(openAIData, null, 2));

    const content = openAIData.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content in OpenAI response');
    }

    console.log('Raw content from OpenAI:', content);

    let scholarshipsData;
    try {
      scholarshipsData = JSON.parse(content);
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      throw new Error('Invalid JSON from OpenAI');
    }

    if (!scholarshipsData.scholarships || !Array.isArray(scholarshipsData.scholarships)) {
      throw new Error('Invalid scholarship data format');
    }

    // Transform and validate scholarships
    const validatedScholarships = scholarshipsData.scholarships.map(s => ({
      id: crypto.randomUUID(),
      title: s.title,
      amount: Number(s.amount),
      deadline: new Date(s.deadline).toISOString(),
      requirements: s.requirements || [],
      provider: s.provider || 'Unknown Provider',
      url: s.url || `https://example.com/scholarship/${crypto.randomUUID()}`,
      description: s.description || '',
      category: s.category || 'General',
      is_active: true,
      verified: false,
      last_verified_at: new Date().toISOString()
    }));

    // Insert new scholarships
    for (const scholarship of validatedScholarships) {
      const { error: insertError } = await supabase
        .from('scholarships')
        .upsert([scholarship]);

      if (insertError) {
        console.error('Error inserting scholarship:', insertError);
      }
    }

    console.log('Returning validated scholarships:', validatedScholarships);
    return new Response(
      JSON.stringify({
        success: true,
        scholarships: validatedScholarships
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
