
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

    // Get the JWT token from the authorization header
    const token = authHeader.replace('Bearer ', '')

    console.log('Verifying user token...');
    // Verify the JWT token and get the user
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser(token)

    if (userError || !user) {
      console.error('User verification failed:', userError);
      throw new Error('Invalid user token')
    }

    console.log('Creating Stripe checkout session...');
    
    // Ensure we have valid URLs
    const success_url = returnUrl || req.headers.get('origin') + '/questionnaire';
    const cancel_url = cancelUrl || req.headers.get('origin') + '/essay-assistant';
    
    console.log('Using URLs:', { success_url, cancel_url });

    // Create Stripe checkout session with explicit price ID
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Premium Subscription',
              description: 'Access to premium features including AI Essay Assistant',
            },
            unit_amount: 1000, // $10.00
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url,
      cancel_url,
      customer_email: user.email,
      metadata: {
        profile_id: user.id,
      },
    })

    if (!session.url) {
      console.error('No session URL created');
      throw new Error('Failed to create checkout session')
    }

    console.log('Checkout session created successfully:', {
      sessionId: session.id,
      url: session.url
    });

    // Return the session URL
    return new Response(
      JSON.stringify({ sessionUrl: session.url }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )
  } catch (error) {
    console.error('Error creating checkout session:', error);
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
