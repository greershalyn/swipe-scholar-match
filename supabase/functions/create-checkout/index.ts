
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { Stripe } from 'https://esm.sh/stripe@12.5.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Create Supabase client
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Received checkout request');
    
    // Verify that we have a Stripe key configured
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      console.error('Missing STRIPE_SECRET_KEY environment variable');
      return new Response(
        JSON.stringify({ error: 'Stripe is not properly configured.' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }
    
    // Parse request body
    const body = await req.text();
    console.log('Request body:', body);
    
    let requestData;
    try {
      requestData = JSON.parse(body);
    } catch (e) {
      console.error('Error parsing request body:', e);
      return new Response(
        JSON.stringify({ error: 'Invalid request format' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }
    
    const { profile_id, return_url, timestamp, is_new_user } = requestData;
    console.log('Profile ID:', profile_id);
    console.log('Return URL:', return_url);
    console.log('Timestamp:', timestamp);
    console.log('Is new user:', is_new_user);
    console.log('Using Stripe key type:', stripeKey.startsWith('sk_test') ? 'TEST MODE' : 'LIVE MODE');

    if (!profile_id) {
      console.error('Missing profile_id in request');
      return new Response(
        JSON.stringify({ error: 'Profile ID is required' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    if (!return_url) {
      console.error('Missing return_url in request');
      return new Response(
        JSON.stringify({ error: 'Return URL is required' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }
    
    // Get user profile to pre-populate checkout if possible
    let userEmail = null;
    try {
      console.log('Fetching user data for profile ID:', profile_id);
      const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(profile_id);
      
      if (userError) {
        console.error('Error fetching user data:', userError.message);
      } else if (userData?.user?.email) {
        userEmail = userData.user.email;
        console.log('Found user email:', userEmail);
      } else {
        console.log('User found but no email available');
      }
    } catch (e) {
      console.error('Error in user fetch operation:', e);
    }

    // Get the proper price ID based on mode (test vs live)
    const isTestMode = stripeKey.startsWith('sk_test');
    
    // Use environment variable STRIPE_PRICE_ID if available, otherwise use defaults
    let priceId = Deno.env.get('STRIPE_PRICE_ID');

    if (!priceId) {
      // Fallback price IDs if environment variable is not set
      priceId = isTestMode
        ? 'price_1QwuhW2KAO6RCCuYpy5ZDxxF' // Test mode default price
        : 'price_1QyNW02KAO6RCCuYHj2sUkQe'; // Live mode default price
    }
    
    console.log('Using price ID:', priceId, 'in', isTestMode ? 'TEST MODE' : 'LIVE MODE');
    
    // Create Stripe checkout session
    try {
      console.log('Creating Stripe checkout session...');
      
      // Build success URL with appropriate parameters
      let successUrl = `${return_url}?success=true&session_id={CHECKOUT_SESSION_ID}&timestamp=${encodeURIComponent(timestamp || '')}`;
      
      // Add is_new_user flag to the success URL if this is a new user
      if (is_new_user) {
        successUrl += '&new_user=true';
      }
      
      // Define checkout session parameters with enhanced metadata
      const sessionParams = {
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: successUrl,
        cancel_url: `${return_url}?success=false&timestamp=${encodeURIComponent(timestamp || '')}`,
        client_reference_id: profile_id,
        customer_email: userEmail,
        metadata: {
          profile_id: profile_id,
          checkout_timestamp: timestamp || new Date().toISOString(),
          source: 'swipescholar-webapp',
          is_new_user: is_new_user ? 'true' : 'false'
        },
        subscription_data: {
          metadata: {
            profile_id: profile_id,
            checkout_timestamp: timestamp || new Date().toISOString(),
            source: 'swipescholar-webapp',
            is_new_user: is_new_user ? 'true' : 'false'
          }
        }
      };
      
      console.log('Session parameters:', JSON.stringify(sessionParams, null, 2));
      
      const session = await stripe.checkout.sessions.create(sessionParams);
      
      if (!session?.url) {
        console.error('No session URL returned from Stripe');
        throw new Error('Failed to create checkout session URL');
      }

      console.log('Checkout session created successfully:', {
        sessionId: session.id,
        url: session.url
      });

      return new Response(
        JSON.stringify({ url: session.url }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      );
    } catch (stripeError) {
      console.error('Stripe checkout creation error:', stripeError);
      
      return new Response(
        JSON.stringify({ 
          error: stripeError.message || 'Failed to create checkout session',
          details: JSON.stringify(stripeError)
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        },
      );
    }
  } catch (error) {
    console.error('General error in checkout function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred',
        details: JSON.stringify(error)
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
})
