
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { Stripe } from 'https://esm.sh/stripe@12.5.0'

// Initialize Stripe with the secret key
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Create Supabase admin client for database operations
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
    console.log('Received webhook event');
    
    // Get the signature from the headers
    const signature = req.headers.get('stripe-signature')
    if (!signature) {
      console.error('Missing Stripe signature header')
      return new Response(
        JSON.stringify({ error: 'Missing stripe-signature header' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get the raw request body
    const body = await req.text()
    console.log('Webhook request body length:', body.length);
    console.log('Webhook request body preview:', body.substring(0, 100) + '...');

    // Get the webhook secret
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SIGNING_SECRET')
    if (!webhookSecret) {
      console.error('Missing STRIPE_WEBHOOK_SIGNING_SECRET')
      return new Response(
        JSON.stringify({ error: 'Webhook secret is not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify and construct the event
    let event
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret
      )
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`)
      return new Response(
        JSON.stringify({ error: `Webhook signature verification failed: ${err.message}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Webhook event type: ${event.type}`);
    console.log('Event data:', JSON.stringify(event.data.object, null, 2).substring(0, 200) + '...');

    // Handle the event based on its type
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        console.log('Checkout session completed:', {
          sessionId: session.id,
          customerId: session.customer,
          subscriptionId: session.subscription,
          clientReferenceId: session.client_reference_id
        })

        if (!session.client_reference_id) {
          console.error('Missing client_reference_id in checkout session')
          return new Response(
            JSON.stringify({ error: 'Missing client_reference_id' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Immediately update user's profile to premium status
        try {
          console.log(`Updating profile ${session.client_reference_id} to premium status`);
          const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .update({ subscription_tier: 'premium' })
            .eq('id', session.client_reference_id);

          if (profileError) {
            console.error('Error updating profile to premium:', profileError);
            // Continue processing despite error
          } else {
            console.log('Successfully updated profile to premium tier');
          }
        } catch (err) {
          console.error('Unexpected error updating profile:', err);
        }

        // Insert or update subscription record
        try {
          console.log(`Recording subscription ${session.subscription} for profile ${session.client_reference_id}`);
          const { error: subError } = await supabaseAdmin
            .from('subscriptions')
            .upsert({
              id: session.subscription,
              profile_id: session.client_reference_id,
              customer_id: session.customer,
              status: 'active',
              price_id: session.metadata?.price_id,
              current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now as placeholder
              created_at: new Date(),
              updated_at: new Date()
            });

          if (subError) {
            console.error('Error storing subscription:', subError);
            // Continue processing despite error
          } else {
            console.log('Successfully recorded subscription information');
          }
        } catch (err) {
          console.error('Unexpected error storing subscription:', err);
        }

        console.log('Successfully processed checkout.session.completed event');
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object
        
        // Handle subscription renewal
        if (invoice.subscription) {
          console.log('Invoice payment succeeded for subscription:', invoice.subscription)
          
          // Get subscription details to find the customer
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription)
          
          if (subscription?.metadata?.profile_id) {
            const profileId = subscription.metadata.profile_id
            
            // Update subscription record
            const { error: subError } = await supabaseAdmin
              .from('subscriptions')
              .update({
                status: subscription.status,
                current_period_end: new Date(subscription.current_period_end * 1000),
                updated_at: new Date()
              })
              .eq('id', invoice.subscription)

            if (subError) {
              console.error('Error updating subscription:', subError)
            }

            // Ensure profile has premium status
            const { error: profileError } = await supabaseAdmin
              .from('profiles')
              .update({ subscription_tier: 'premium' })
              .eq('id', profileId)

            if (profileError) {
              console.error('Error updating profile:', profileError)
            } else {
              console.log('Successfully updated profile to premium')
            }
          } else {
            console.warn('No profile_id found in subscription metadata')
          }
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object
        console.log('Subscription updated:', {
          id: subscription.id,
          status: subscription.status
        })
        
        // Find the profile ID from subscription metadata
        const profileId = subscription.metadata?.profile_id
        
        if (!profileId) {
          console.warn('No profile_id found in subscription metadata')
          break
        }
        
        // Update subscription status
        const { error: subError } = await supabaseAdmin
          .from('subscriptions')
          .update({
            status: subscription.status,
            current_period_end: new Date(subscription.current_period_end * 1000),
            updated_at: new Date(),
            cancel_at_period_end: subscription.cancel_at_period_end
          })
          .eq('id', subscription.id)

        if (subError) {
          console.error('Error updating subscription:', subError)
        }
        
        // Update the profile subscription tier based on status
        if (subscription.status === 'active') {
          const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .update({ subscription_tier: 'premium' })
            .eq('id', profileId)

          if (profileError) {
            console.error('Error updating profile to premium:', profileError)
          } else {
            console.log('Updated profile to premium')
          }
        } else if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
          const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .update({ subscription_tier: 'free' })
            .eq('id', profileId)

          if (profileError) {
            console.error('Error updating profile to free:', profileError)
          } else {
            console.log('Updated profile to free')
          }
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object
        console.log('Subscription deleted:', { id: subscription.id })
        
        // Find the profile ID from subscription metadata
        const profileId = subscription.metadata?.profile_id
        
        if (profileId) {
          // Update the profile subscription tier to free
          const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .update({ subscription_tier: 'free' })
            .eq('id', profileId)

          if (profileError) {
            console.error('Error downgrading profile to free:', profileError)
          } else {
            console.log('Successfully downgraded profile to free tier')
          }
          
          // Update subscription record
          const { error: subError } = await supabaseAdmin
            .from('subscriptions')
            .update({
              status: 'canceled',
              updated_at: new Date()
            })
            .eq('id', subscription.id)

          if (subError) {
            console.error('Error updating subscription record:', subError)
          }
        } else {
          console.warn('No profile_id found in subscription metadata')
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Error handling webhook:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
