
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

    console.log('Processing webhook event:', event.type)

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const profileId = session.client_reference_id

        if (!profileId) {
          throw new Error('No profile ID in session')
        }

        console.log('Processing completed checkout for profile:', profileId)

        // Immediately update the profile's subscription tier
        const { error: profileError } = await supabaseAdmin
          .from('profiles')
          .update({ subscription_tier: 'premium' })
          .eq('id', profileId)

        if (profileError) {
          console.error('Error updating profile:', profileError)
          throw profileError
        }

        // Create or update subscription record
        const { error: subscriptionError } = await supabaseAdmin
          .from('subscriptions')
          .upsert({
            profile_id: profileId,
            status: 'active',
            subscription_type: 'premium',
            amount_cents: session.amount_total,
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
          })

        if (subscriptionError) {
          console.error('Error updating subscription:', subscriptionError)
          throw subscriptionError
        }

        console.log('Successfully processed checkout session')
        break
      }
      
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const profileId = subscription.metadata.profile_id

        if (!profileId) {
          throw new Error('No profile ID in metadata')
        }

        // Update profile subscription tier based on subscription status
        const newTier = subscription.status === 'active' ? 'premium' : 'free'
        
        const { error: profileError } = await supabaseAdmin
          .from('profiles')
          .update({ subscription_tier: newTier })
          .eq('id', profileId)

        if (profileError) {
          console.error('Error updating profile:', profileError)
          throw profileError
        }

        // Update subscription record
        const { error: subscriptionError } = await supabaseAdmin
          .from('subscriptions')
          .upsert({
            profile_id: profileId,
            status: subscription.status,
            subscription_type: 'premium',
            amount_cents: subscription.items.data[0].price.unit_amount,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          })

        if (subscriptionError) {
          console.error('Error updating subscription:', subscriptionError)
          throw subscriptionError
        }

        console.log('Successfully processed subscription update')
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
