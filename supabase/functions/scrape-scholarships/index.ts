
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY')!;
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
    const { url } = await req.json();
    console.log('Scraping scholarship data from:', url);

    // Call Firecrawl API to scrape the website
    const crawlResponse = await fetch('https://api.firecrawl.co/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        scrapeOptions: {
          formats: ['markdown', 'html'],
          selectors: {
            title: 'h1, .scholarship-title',
            amount: '.amount, .scholarship-amount',
            deadline: '.deadline, .scholarship-deadline',
            description: '.description, .scholarship-description',
            requirements: '.requirements, .scholarship-requirements',
          }
        }
      })
    });

    const crawlData = await crawlResponse.json();
    
    if (!crawlData.success) {
      throw new Error('Failed to scrape website');
    }

    // Process the scraped data and store it in Supabase
    const scholarshipData = {
      title: crawlData.data.title || 'Untitled Scholarship',
      description: crawlData.data.description || '',
      amount: parseFloat(crawlData.data.amount?.replace(/[^0-9.]/g, '') || '0'),
      deadline: new Date(crawlData.data.deadline || Date.now() + 7776000000), // Default to 90 days from now
      category: 'General',
      requirements: Array.isArray(crawlData.data.requirements) ? 
        crawlData.data.requirements : 
        [crawlData.data.requirements || 'No specific requirements listed'],
      url: url,
      provider: new URL(url).hostname.replace('www.', ''),
      last_crawled_at: new Date(),
    };

    const { data: insertedScholarship, error } = await supabase
      .from('scholarships')
      .insert([scholarshipData])
      .select()
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true, scholarship: insertedScholarship }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in scrape-scholarships function:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

