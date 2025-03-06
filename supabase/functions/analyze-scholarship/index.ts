
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

    // First, validate the scholarship URL
    let urlValidationResult;
    if (scholarship.url) {
      urlValidationResult = await validateScholarshipUrl(scholarship.url);
      
      // If URL validation failed and we need to update it
      if (!urlValidationResult.valid && urlValidationResult.suggestedUrl) {
        // Update the scholarship with the new URL
        const { error: updateError } = await supabase
          .from('scholarships')
          .update({ 
            url: urlValidationResult.suggestedUrl,
            last_verified_at: new Date().toISOString()
          })
          .eq('id', scholarshipId);
          
        if (updateError) {
          console.error('Error updating scholarship URL:', updateError);
        } else {
          // Update our local copy for the analysis
          scholarship.url = urlValidationResult.suggestedUrl;
        }
      }
    }

    // Prepare the analysis prompt
    const analysisPrompt = `
      Analyze this scholarship opportunity for the given student profile:

      Scholarship:
      - Title: ${scholarship.title}
      - Amount: $${scholarship.amount}
      - Requirements: ${scholarship.requirements.join(', ')}
      - Description: ${scholarship.description}
      - URL Status: ${urlValidationResult ? 
        (urlValidationResult.valid ? 'Valid direct link available' : 'No direct application link found') 
        : 'URL not verified'}

      Student Profile:
      - GPA: ${userProfile.gpa || 'Not specified'}
      - Major: ${userProfile.intended_major || 'Not specified'}
      - Education Level: ${userProfile.current_education_level || 'Not specified'}
      - Ethnicity: ${userProfile.ethnicity || 'Not specified'}
      - First Generation Student: ${userProfile.first_generation_student ? 'Yes' : 'No'}
      
      Please analyze:
      1. Match percentage (0-100)
      2. Key eligibility factors
      3. Potential red flags ${urlValidationResult && !urlValidationResult.valid ? '(including the lack of a direct application link)' : ''}
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
      JSON.stringify({ 
        success: true, 
        analysis,
        urlValidation: urlValidationResult || { valid: false, message: "URL not verified" }
      }),
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

// Function to validate a scholarship URL
async function validateScholarshipUrl(url: string): Promise<{
  valid: boolean;
  message: string;
  suggestedUrl?: string;
  status?: number;
}> {
  try {
    // Basic URL validation
    try {
      new URL(url);
    } catch {
      return {
        valid: false,
        message: "Invalid URL format",
        suggestedUrl: null
      };
    }

    // Check for search engine URLs that aren't direct links
    if (url.includes('google.com/search') || 
        url.includes('bing.com/search') ||
        url.includes('yahoo.com/search')) {
      return {
        valid: false,
        message: "This is a search engine URL, not a direct application link",
        suggestedUrl: null
      };
    }

    // Try to make a HEAD request to check if the URL is accessible
    // Note: This won't work in all Deno environments due to CORS limitations
    try {
      const response = await fetch(url, {
        method: 'HEAD',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; ScholarshipValidator/1.0)'
        }
      });

      if (!response.ok) {
        return {
          valid: false,
          message: `URL returned status code: ${response.status}`,
          status: response.status,
          suggestedUrl: null
        };
      }

      // If we got redirected, check the final URL
      const finalUrl = response.url;
      if (finalUrl !== url) {
        console.log(`URL redirected from ${url} to ${finalUrl}`);
        
        // If it redirected to a homepage or very different URL, it might not be a direct link
        if (isLikelyHomepage(finalUrl)) {
          return {
            valid: false,
            message: "URL redirects to what appears to be a homepage, not a specific scholarship page",
            suggestedUrl: finalUrl,
            status: response.status
          };
        }
      }

      return {
        valid: true,
        message: "URL is accessible",
        status: response.status
      };
    } catch (error) {
      console.error("Error fetching URL:", error);
      
      // If we can't check the URL directly, we'll be conservative and consider it potentially valid
      // but we'll note the issue
      return {
        valid: true,
        message: "URL couldn't be verified due to CORS or network constraints, but format appears valid"
      };
    }
  } catch (error) {
    console.error("Error in validateScholarshipUrl:", error);
    return {
      valid: false,
      message: `URL validation error: ${error.message}`,
      suggestedUrl: null
    };
  }
}

// Helper function to check if a URL likely points to a homepage rather than a specific scholarship page
function isLikelyHomepage(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    
    // If the path is just "/" or very short, it's likely a homepage
    if (parsedUrl.pathname === "/" || parsedUrl.pathname.length < 3) {
      return true;
    }
    
    // Check for common homepage indicators in the path
    const homepageIndicators = [
      "index", "home", "main", "default", "welcome"
    ];
    
    if (homepageIndicators.some(indicator => 
      parsedUrl.pathname.toLowerCase().includes(indicator)
    )) {
      return true;
    }
    
    return false;
  } catch {
    return false;
  }
}
