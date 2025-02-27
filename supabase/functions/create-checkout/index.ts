
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { Stripe } from 'https://esm.sh/stripe@12.5.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders 
    });
  }

  try {
    // Get the request body
    const body = await req.json();
    const { profile_id, return_url } = body;
    
    if (!profile_id || !return_url) {
      throw new Error('Missing required fields: profile_id and return_url are required');
    }

    console.log('Creating checkout session with:', {
      profile_id,
      return_url,
      stripe_key_present: !!Deno.env.get('STRIPE_SECRET_KEY'),
    });

    // Create a checkout session with a test price
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: 'price_1QwuhW2KAO6RCCuYpy5ZDxxF',
          quantity: 1,
        },
      ],
      success_url: `${return_url}?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${return_url}?success=false`,
      client_reference_id: profile_id,
      metadata: {
        profile_id,
      },
    });

    console.log('Checkout session created successfully:', {
      sessionId: session.id,
      url: session.url,
    });

    return new Response(
      JSON.stringify({ url: session.url }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('Error in create-checkout:', error);
    
    return new Response(
      JSON.stringify({
        error: error.message,
        details: 'Failed to create checkout session'
      }),
      { 
        status: 400,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
})
