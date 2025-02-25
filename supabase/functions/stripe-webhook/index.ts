
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from "https://esm.sh/stripe@12.4.0"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    })

    const signature = req.headers.get('stripe-signature')
    if (!signature) {
      throw new Error('No Stripe signature found')
    }

    const body = await req.text()
    
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SIGNING_SECRET') || ''
    )

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const profile_id = session.metadata?.profile_id
        const subscription = session.subscription as string

        if (profile_id) {
          // Get subscription details
          const subscriptionData = await stripe.subscriptions.retrieve(subscription)
          
          await supabaseClient
            .from('subscriptions')
            .upsert({
              profile_id: profile_id,
              status: 'active',
              subscription_type: 'premium',
              amount_cents: 1000,
              current_period_start: new Date(subscriptionData.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscriptionData.current_period_end * 1000).toISOString(),
            })

          await supabaseClient
            .from('profiles')
            .update({ subscription_tier: 'premium' })
            .eq('id', profile_id)

          console.log('Successfully updated subscription for profile:', profile_id)
        }
        break
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Error processing webhook:', err)
    return new Response(
      JSON.stringify({ error: err.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
