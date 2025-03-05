
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
      throw new Error('Stripe is not properly configured');
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
        },
      );
    }
    
    const { profile_id, return_url } = requestData;
    console.log('Profile ID:', profile_id);
    console.log('Return URL:', return_url);

    if (!profile_id) {
      return new Response(
        JSON.stringify({ error: 'Profile ID is required' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        },
      );
    }

    if (!return_url) {
      return new Response(
        JSON.stringify({ error: 'Return URL is required' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        },
      );
    }
    
    // Get user profile to pre-populate checkout if possible
    let userEmail = null;
    try {
      console.log('Fetching user data for profile ID:', profile_id);
      const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(profile_id);
      
      if (userError) {
        console.error('Error fetching user data:', userError.message);
        // Continue without email, don't fail the checkout
      } else if (userData?.user?.email) {
        userEmail = userData.user.email;
        console.log('Found user email:', userEmail);
      } else {
        console.log('User found but no email available');
      }
    } catch (e) {
      console.error('Error in user fetch operation:', e);
      // Continue without email, don't fail the checkout
    }

    const priceId = Deno.env.get('STRIPE_PRICE_ID');
    console.log('Using price ID:', priceId);
    
    if (!priceId) {
      console.warn('No STRIPE_PRICE_ID env variable set, using fallback value');
    }

    // Create Stripe checkout session
    try {
      console.log('Creating Stripe checkout session...');
      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId || 'price_1QwuhW2KAO6RCCuYpy5ZDxxF', // Use environment variable if available
            quantity: 1,
          },
        ],
        success_url: `${return_url}?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${return_url}?success=false`,
        client_reference_id: profile_id,
        customer_email: userEmail,
        metadata: {
          profile_id: profile_id,
        },
        subscription_data: {
          metadata: {
            profile_id: profile_id
          }
        },
        payment_intent_data: {
          metadata: {
            profile_id: profile_id
          }
        }
      });

      console.log('Checkout session created:', {
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
          error: `Stripe error: ${stripeError.message}`,
          details: stripeError 
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
        error: error.message || 'Unknown error occurred',
        details: JSON.stringify(error)
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
})
