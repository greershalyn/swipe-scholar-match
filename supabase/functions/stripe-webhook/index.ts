
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
  console.log('Webhook received request:', {
    method: req.method,
    headers: Object.fromEntries(req.headers.entries()),
  });

  const signature = req.headers.get('stripe-signature')
  
  if (!signature) {
    console.log('Missing stripe-signature header');
    return new Response('No signature', { status: 400 })
  }

  try {
    const body = await req.text()
    console.log('Webhook received body:', body.substring(0, 100) + '...');  // Log first 100 chars for safety
    
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SIGNING_SECRET')
    console.log('Webhook secret present:', !!webhookSecret);
    
    if (!webhookSecret) {
      throw new Error('Missing STRIPE_WEBHOOK_SIGNING_SECRET environment variable')
    }
    
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    console.log('Event constructed successfully:', event.type);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const profileId = session.client_reference_id
        
        if (!profileId) {
          console.error('Missing profile_id in session:', session);
          throw new Error('No profile ID in session')
        }

        console.log('Processing completed checkout for profile:', {
          profileId,
          sessionId: session.id,
          amount: session.amount_total,
        });

        // Immediately update the profile's subscription tier
        const { error: profileError } = await supabaseAdmin
          .from('profiles')
          .update({ subscription_tier: 'premium' })
          .eq('id', profileId)

        if (profileError) {
          console.error('Error updating profile:', profileError)
          throw profileError
        }
        console.log('Successfully updated profile subscription tier to premium');

        // Create or update subscription record
        const subscriptionData = {
          profile_id: profileId,
          status: 'active',
          subscription_type: 'premium',
          amount_cents: session.amount_total,
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        }

        // Check if subscription already exists
        const { data: existingSubscription } = await supabaseAdmin
          .from('subscriptions')
          .select('id')
          .eq('profile_id', profileId)
          .maybeSingle()

        let subscriptionError
        if (existingSubscription) {
          // Update existing subscription
          const { error } = await supabaseAdmin
            .from('subscriptions')
            .update(subscriptionData)
            .eq('id', existingSubscription.id)
          
          subscriptionError = error
        } else {
          // Insert new subscription
          const { error } = await supabaseAdmin
            .from('subscriptions')
            .insert([subscriptionData])
          
          subscriptionError = error
        }

        if (subscriptionError) {
          console.error('Error updating subscription:', subscriptionError)
          throw subscriptionError
        }
        console.log('Successfully created/updated subscription record');

        break
      }
      
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const profileId = subscription.metadata.profile_id

        if (!profileId) {
          console.error('Missing profile_id in subscription metadata:', subscription);
          throw new Error('No profile ID in metadata')
        }

        console.log('Processing subscription update:', {
          profileId,
          subscriptionId: subscription.id,
          status: subscription.status,
        });

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
        console.log('Successfully updated profile subscription tier to:', newTier);

        // Update subscription record
        const { error: subscriptionError } = await supabaseAdmin
          .from('subscriptions')
          .upsert({
            profile_id: profileId,
            status: subscription.status,
            subscription_type: 'premium',
            amount_cents: subscription.items.data[0].price?.unit_amount || 0,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          })

        if (subscriptionError) {
          console.error('Error updating subscription:', subscriptionError)
          throw subscriptionError
        }
        console.log('Successfully updated subscription record');

        break
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const profileId = paymentIntent.metadata?.profile_id
        
        if (profileId) {
          console.log('Processing successful payment for profile:', {
            profileId,
            paymentId: paymentIntent.id,
            amount: paymentIntent.amount,
          });
          
          // Update the profile's subscription tier
          const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .update({ subscription_tier: 'premium' })
            .eq('id', profileId)
  
          if (profileError) {
            console.error('Error updating profile after payment:', profileError)
            throw profileError
          }
          console.log('Successfully updated profile tier after payment');
        } else {
          console.log('Payment succeeded but no profile_id in metadata');
        }
        
        break
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (err) {
    console.error('Detailed webhook error:', {
      error: err,
      message: err.message,
      stack: err.stack,
    });
    return new Response('Webhook Error: ' + (err as Error).message, { status: 400 })
  }
})
