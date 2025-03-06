
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

// Helper function to update a user's profile to premium
async function updateProfileToPremium(profileId) {
  console.log(`Updating profile ${profileId} to premium status`);
  
  // First check current status
  const { data: currentProfile, error: fetchError } = await supabaseAdmin
    .from('profiles')
    .select('subscription_tier')
    .eq('id', profileId)
    .single();
    
  if (fetchError) {
    console.error('Error fetching profile:', fetchError);
  } else {
    console.log('Current profile subscription tier:', currentProfile?.subscription_tier);
  }
  
  // Now update to premium
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update({ 
      subscription_tier: 'premium',
      updated_at: new Date().toISOString()
    })
    .eq('id', profileId);
    
  if (error) {
    console.error('Error updating profile to premium:', error);
    return false;
  } 
  
  console.log('Successfully updated profile to premium tier');
  
  // Verify the update was successful
  const { data: verifyProfile, error: verifyError } = await supabaseAdmin
    .from('profiles')
    .select('subscription_tier')
    .eq('id', profileId)
    .single();
    
  if (verifyError) {
    console.error('Error verifying profile update:', verifyError);
  } else {
    console.log('Verified profile subscription tier:', verifyProfile?.subscription_tier);
  }
  
  return true;
}

// Helper function to update a user's profile to free
async function updateProfileToFree(profileId) {
  console.log(`Updating profile ${profileId} to free status`);
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ 
      subscription_tier: 'free',
      updated_at: new Date().toISOString()
    })
    .eq('id', profileId);
    
  if (error) {
    console.error('Error updating profile to free:', error);
    return false;
  }
  
  console.log('Successfully updated profile to free tier');
  return true;
}

// Helper function to record or update subscription
async function updateSubscriptionRecord(subscriptionData) {
  console.log(`Recording subscription info:`, subscriptionData);
  
  // Clean the subscription data to ensure there are no undefined values
  const cleanData = Object.fromEntries(
    Object.entries(subscriptionData).filter(([_, v]) => v !== undefined)
  );
  
  const { data, error } = await supabaseAdmin
    .from('subscriptions')
    .upsert(cleanData);
    
  if (error) {
    console.error('Error recording subscription:', error);
    return false;
  }
  
  console.log('Successfully recorded subscription information');
  return true;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('Received webhook event');
    
    // Get the signature from the headers
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      console.error('Missing Stripe signature header');
      return new Response(
        JSON.stringify({ error: 'Missing stripe-signature header' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the raw request body
    const body = await req.text();
    console.log('Webhook request body length:', body.length);
    console.log('Webhook request body preview:', body.substring(0, 100) + '...');

    // Get the webhook secret
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SIGNING_SECRET');
    if (!webhookSecret) {
      console.error('Missing STRIPE_WEBHOOK_SIGNING_SECRET');
      return new Response(
        JSON.stringify({ error: 'Webhook secret is not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify and construct the event
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret
      );
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return new Response(
        JSON.stringify({ error: `Webhook signature verification failed: ${err.message}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Webhook event type: ${event.type}`);
    console.log('Event data:', JSON.stringify(event.data.object, null, 2).substring(0, 200) + '...');

    // Handle the event based on its type
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        console.log('Checkout session completed:', {
          sessionId: session.id,
          customerId: session.customer,
          subscriptionId: session.subscription,
          clientReferenceId: session.client_reference_id,
          metadata: session.metadata
        });

        // Extract profile ID from clientReferenceId, metadata.profile_id, or subscription metadata
        const profileId = session.client_reference_id || 
                          session.metadata?.profile_id || 
                          null;
                         
        if (!profileId) {
          console.error('Missing profile ID in checkout session');
          return new Response(
            JSON.stringify({ error: 'Missing profile ID information' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Check if this is a new user
        const isNewUser = session.metadata?.is_new_user === 'true';
        console.log('Is new user from metadata:', isNewUser);

        // First update profile to premium - critically important step
        const profileUpdated = await updateProfileToPremium(profileId);
        if (!profileUpdated) {
          console.error('Failed to update profile to premium status');
        }

        // Store subscription record
        if (session.subscription) {
          const subscriptionData = {
            id: session.subscription,
            profile_id: profileId,
            customer_id: session.customer,
            status: 'active',
            price_id: session.metadata?.price_id,
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now as placeholder
            current_period_start: new Date(),
            created_at: new Date(),
            updated_at: new Date(),
            subscription_type: 'premium',
            amount_cents: 1999 // Default amount
          };
          
          await updateSubscriptionRecord(subscriptionData);
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
            const subscriptionData = {
              id: invoice.subscription,
              status: subscription.status,
              current_period_end: new Date(subscription.current_period_end * 1000),
              updated_at: new Date()
            };
            
            await updateSubscriptionRecord(subscriptionData);

            // Ensure profile has premium status
            await updateProfileToPremium(profileId);
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
        const subscriptionData = {
          id: subscription.id,
          status: subscription.status,
          current_period_end: new Date(subscription.current_period_end * 1000),
          updated_at: new Date(),
          cancel_at_period_end: subscription.cancel_at_period_end
        };
        
        await updateSubscriptionRecord(subscriptionData);
        
        // Update the profile subscription tier based on status
        if (subscription.status === 'active') {
          await updateProfileToPremium(profileId);
        } else if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
          await updateProfileToFree(profileId);
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
          await updateProfileToFree(profileId);
          
          // Update subscription record
          const subscriptionData = {
            id: subscription.id,
            status: 'canceled',
            updated_at: new Date()
          };
          
          await updateSubscriptionRecord(subscriptionData);
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
    });
  } catch (error) {
    console.error('Error handling webhook:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
