
import { supabase } from '@/integrations/supabase/client';

/**
 * Directly updates the user's subscription status to premium in the database
 * This provides an immediate fallback in case the webhook hasn't processed yet
 * @returns {Promise<boolean>} Whether the update was successful
 */
export const updateProfileDirectlyToPremium = async (): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.error('No active session found when trying to update profile');
      return false;
    }
    
    console.log('Directly updating profile to premium for user:', session.user.id);
    
    // Update profile to premium immediately
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ subscription_tier: 'premium' })
      .eq('id', session.user.id);
      
    if (profileError) {
      console.error('Error updating profile directly:', profileError);
      return false;
    }
    
    console.log('Profile directly updated to premium');
    
    // Check if a subscription record already exists
    const { data: existingSubscription, error: checkError } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('profile_id', session.user.id)
      .maybeSingle();

    if (checkError) {
      console.error('Subscription check error:', checkError);
      // Continue despite error - the profile update is the most important part
    }

    // Prepare subscription data
    const subscriptionData = {
      profile_id: session.user.id,
      status: 'active',
      subscription_type: 'premium',
      amount_cents: 1999,
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
    };

    // Update or insert subscription record
    if (existingSubscription) {
      const { error } = await supabase
        .from('subscriptions')
        .update(subscriptionData)
        .eq('id', existingSubscription.id);
      
      if (error) {
        console.error('Error updating subscription record:', error);
        // Continue despite error - the profile update is the most important part
      }
    } else {
      const { error } = await supabase
        .from('subscriptions')
        .insert([subscriptionData]);
      
      if (error) {
        console.error('Error creating subscription record:', error);
        // Continue despite error - the profile update is the most important part
      }
    }
    
    return true;
  } catch (err) {
    console.error('Error in direct profile update:', err);
    return false;
  }
};

/**
 * Checks if the current user has premium access
 * @returns {Promise<boolean>} Whether the user has premium access
 */
export const checkPremiumAccess = async (): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return false;
    }
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', session.user.id)
      .single();
      
    if (error) {
      console.error('Error checking premium access:', error);
      return false;
    }
    
    return profile?.subscription_tier === 'premium';
  } catch (err) {
    console.error('Error checking premium access:', err);
    return false;
  }
};
