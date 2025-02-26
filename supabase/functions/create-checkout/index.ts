
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { Stripe } from 'https://esm.sh/stripe@12.5.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

const PREMIUM_PRICE_ID = 'price_XXXXX' // You'll need to replace this with your actual Stripe Price ID

serve(async (req) => {
  try {
    const { profile_id, return_url } = await req.json()
    
    if (!profile_id) {
      throw new Error('Missing profile ID')
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: PREMIUM_PRICE_ID,
          quantity: 1,
        },
      ],
      success_url: `${return_url}?success=true`,
      cancel_url: `${return_url}?success=false`,
      client_reference_id: profile_id,
      subscription_data: {
        metadata: {
          profile_id,
        },
      },
    })

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
