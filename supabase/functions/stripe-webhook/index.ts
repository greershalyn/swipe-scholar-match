
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { Stripe } from 'https://esm.sh/stripe@12.5.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  
  if (!signature) {
    return new Response('No signature', { status: 400 })
  }

  try {
    const body = await req.text()
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SIGNING_SECRET')
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret!)

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const customerId = session.customer as string
        const subscriptionId = session.subscription as string
        const profileId = session.client_reference_id

        if (!profileId) {
          throw new Error('No profile ID')
        }

        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        
        await supabaseAdmin.from('subscriptions').upsert({
          profile_id: profileId,
          status: subscription.status,
          subscription_type: 'premium',
          amount_cents: subscription.items.data[0].price.unit_amount,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        })
        break
      }
      
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const profileId = subscription.metadata.profile_id

        if (!profileId) {
          throw new Error('No profile ID in metadata')
        }

        await supabaseAdmin.from('subscriptions').upsert({
          profile_id: profileId,
          status: subscription.status,
          subscription_type: 'premium',
          amount_cents: subscription.items.data[0].price.unit_amount,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        })
        break
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Webhook error:', err)
    return new Response('Webhook Error: ' + (err as Error).message, { status: 400 })
  }
})
