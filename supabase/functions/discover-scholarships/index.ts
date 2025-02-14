
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
    if (req.method !== 'POST') {
      throw new Error('Method not allowed');
    }

    const contentType = req.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Content-Type must be application/json');
    }

    const requestData = await req.json();
    console.log('Received request data:', JSON.stringify(requestData, null, 2));

    if (!requestData.userProfile) {
      throw new Error('User profile is required');
    }

    // Generate sample scholarship data for testing
    const sampleScholarships = [
      {
        title: "Sample Scholarship 1",
        amount: 5000,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        requirements: ["Sample requirement 1", "Sample requirement 2"],
        provider: "Sample Provider",
        url: "https://example.com/scholarship1",
        description: "This is a sample scholarship for testing",
        category: "General"
      },
      {
        title: "Sample Scholarship 2",
        amount: 2500,
        deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days from now
        requirements: ["Sample requirement 3", "Sample requirement 4"],
        provider: "Another Provider",
        url: "https://example.com/scholarship2",
        description: "Another sample scholarship for testing",
        category: "Merit-based"
      }
    ];

    // Insert sample scholarships into the database
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Process scholarships and insert them
    const processedScholarships = sampleScholarships.map(scholarship => ({
      ...scholarship,
      id: crypto.randomUUID(),
      requirements: Array.isArray(scholarship.requirements) ? scholarship.requirements : [],
      amount: typeof scholarship.amount === 'number' ? scholarship.amount : 0,
    }));

    for (const scholarship of processedScholarships) {
      try {
        const { error: insertError } = await supabase
          .from('scholarships')
          .insert([scholarship])
          .select()
          .single();

        if (insertError) {
          console.error('Error inserting scholarship:', insertError);
        } else {
          console.log('Successfully inserted scholarship:', scholarship.title);
        }
      } catch (error) {
        console.error('Exception inserting scholarship:', error);
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
