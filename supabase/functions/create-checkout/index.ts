
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@12.4.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Parse the request body
    const { returnUrl, cancelUrl } = await req.json();
    console.log('Received URLs:', { returnUrl, cancelUrl });

    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')
    if (!stripeKey) {
      console.error('Stripe key missing');
      throw new Error('Missing Stripe secret key')
    }

    console.log('Initializing Stripe...');
    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
    })

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.error('No auth header found');
      throw new Error('No authorization header')
    }

    const token = authHeader.replace('Bearer ', '')

    console.log('Verifying user token...');
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser(token)

    if (userError || !user) {
      console.error('User verification failed:', userError);
      throw new Error('Invalid user token')
    }

    // Ensure success_url and cancel_url include required query parameters
    const success_url = `${returnUrl}?session_id={CHECKOUT_SESSION_ID}`;
    const cancel_url = `${cancelUrl}`;
    
    console.log('Creating checkout session with URLs:', {
      success_url,
      cancel_url
    });

    const sessionParams = {
      payment_method_types: ['card'],
      line_items: [
        {
          price: 'price_1Qw8Ds2KAO6RCCuY7p3eTjfa',
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url,
      cancel_url,
      client_reference_id: user.id,
      customer_email: user.email,
      metadata: {
        profile_id: user.id,
      },
      // Add additional required parameters
      billing_address_collection: 'required',
      payment_method_collection: 'always',
      allow_promotion_codes: true,
      customer_creation: 'always',
    };

    console.log('Creating session with params:', JSON.stringify(sessionParams, null, 2));

    const session = await stripe.checkout.sessions.create(sessionParams);

    console.log('Session created:', {
      id: session.id,
      url: session.url,
      status: session.status,
    });

    if (!session?.url) {
      console.error('No session URL in response');
      throw new Error('Failed to create checkout session - no URL returned')
    }

    return new Response(
      JSON.stringify({ 
        sessionUrl: session.url,
        sessionId: session.id 
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )
  } catch (error) {
    console.error('Error in checkout function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.toString()
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 400,
      }
    )
  }
})
