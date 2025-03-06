
import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/profile';
import { updateProfileDirectlyToPremium, checkPremiumAccess } from '@/utils/subscriptionUtils';

export const useSubscriptionCheck = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [hasPremiumAccess, setHasPremiumAccess] = useState(false);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const lastCheckTimeRef = useRef(0);
  const checkInProgressRef = useRef(false);
  const initialCheckDoneRef = useRef(false);
  const statusUpdatedRef = useRef(false);
  
  // Extract query parameters
  const queryParams = new URLSearchParams(location.search);
  const successParam = queryParams.get('success');
  const sessionId = queryParams.get('session_id');
  const timestamp = queryParams.get('timestamp');
  const isNewUser = localStorage.getItem('new_premium_user') === 'true';

  // Check if we just returned from a payment flow
  const isPostPayment = successParam === 'true' && sessionId;

  // Define the check function
  const checkPremiumAccessFn = useCallback(async (isForceRefresh = false) => {
    // Prevent concurrent checks
    if (checkInProgressRef.current) {
      console.log('Check already in progress, skipping');
      return;
    }
    
    try {
      checkInProgressRef.current = true;
      
      // Only show loading state if this is the initial check or a manual refresh
      if (!initialCheckDoneRef.current || isForceRefresh) {
        setIsCheckingAccess(true);
      }
      
      console.log('Checking premium access, force refresh:', isForceRefresh);
      console.log('Is new user:', isNewUser);
      
      // Don't check too frequently unless it's a manual refresh
      const now = Date.now();
      if (!isForceRefresh && !isPostPayment && now - lastCheckTimeRef.current < 3000) {
        console.log('Skipping check - too soon since last check');
        setIsCheckingAccess(false);
        checkInProgressRef.current = false;
        return;
      }
      
      lastCheckTimeRef.current = now;
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log('No active session found');
        navigate('/auth');
        initialCheckDoneRef.current = true;
        checkInProgressRef.current = false;
        return;
      }

      console.log('Fetching profile for user:', session.user.id);
      
      // Add cache bypass for forced refreshes and post-payment checks
      const cacheOptions = isForceRefresh || isPostPayment 
        ? { headers: { 'Cache-Control': 'no-cache' } }
        : undefined;
      
      // First try using the checkPremiumAccess utility
      const isPremiumFromUtil = await checkPremiumAccess();
      console.log('Premium access check result from util:', isPremiumFromUtil);
      
      // Also fetch the profile directly to be sure
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('subscription_tier')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        toast({
          title: "Error",
          description: "Could not verify subscription status",
          variant: "destructive",
        });
        checkInProgressRef.current = false;
        initialCheckDoneRef.current = true;
        return;
      }

      const isPremium = (profile as Profile)?.subscription_tier === 'premium';
      console.log('Profile subscription tier:', (profile as Profile)?.subscription_tier);
      console.log('Has premium access:', isPremium);
      
      // Use either result - if either says premium, consider it premium
      const finalPremiumStatus = isPremium || isPremiumFromUtil;
      
      // If premium status has changed, update state
      if (hasPremiumAccess !== finalPremiumStatus) {
        console.log('Updating premium access state:', finalPremiumStatus);
        setHasPremiumAccess(finalPremiumStatus);
        
        // If premium status changed to true after payment, mark as updated
        if (finalPremiumStatus && (isPostPayment || isNewUser)) {
          statusUpdatedRef.current = true;
          setRetryCount(0);
          
          // Clear the new user flag if premium is activated
          if (isNewUser) {
            localStorage.removeItem('new_premium_user');
          }
          
          toast({
            title: "Premium access confirmed",
            description: "Your account has been successfully upgraded to premium.",
          });
        }
      }
      
      // If we're coming from a payment success but don't have premium yet
      if ((isPostPayment || isNewUser) && !finalPremiumStatus && !statusUpdatedRef.current) {
        const newRetryCount = retryCount + 1;
        console.log(`Payment completed but premium not yet active. Retry attempt ${newRetryCount}/10`);
        setRetryCount(newRetryCount);
        
        if (newRetryCount <= 2) {
          // First attempts - just wait
          toast({
            title: "Updating your account",
            description: "Your payment was successful. Please wait while we update your account...",
          });
          
          // Try direct update after first check
          if (newRetryCount === 1) {
            console.log('Attempting direct profile update to premium');
            const updated = await updateProfileDirectlyToPremium();
            if (updated) {
              console.log('Direct update successful, refreshing status');
              // If successful, immediately check again
              setTimeout(() => checkPremiumAccessFn(true), 500);
            }
          }
        } else if (newRetryCount === 3) {
          // After a few retries, suggest refreshing subscription manually
          toast({
            title: "Payment successful",
            description: "Your payment was received, but your account is still updating. Try clicking the refresh button below.",
          });
          
          // Try direct update one more time
          console.log('Attempting final direct profile update to premium');
          await updateProfileDirectlyToPremium();
        } else if (newRetryCount >= 10) {
          // After 10 retries, we still don't have premium
          toast({
            title: "Premium update pending",
            description: "Your payment was successful but your account is still being updated. Please try again later.",
          });
          setRetryCount(0);
        }
      }
      
      initialCheckDoneRef.current = true;
    } catch (error) {
      console.error('Error checking premium access:', error);
      toast({
        title: "Error",
        description: "Could not verify subscription status",
        variant: "destructive",
      });
    } finally {
      // Always make sure we end the check
      setIsCheckingAccess(false);
      checkInProgressRef.current = false;
    }
  }, [hasPremiumAccess, navigate, retryCount, toast, isPostPayment, isNewUser]);

  // Initial check on page load
  useEffect(() => {
    // If we have success and session_id in the URL, this is a return from Stripe
    if (isPostPayment) {
      console.log('Detected return from payment with success=true and session_id');
      console.log('Is new user:', isNewUser);
      
      // Check if there's a matching pending checkout in localStorage
      const pendingCheckout = localStorage.getItem('pending_checkout');
      if (pendingCheckout && timestamp) {
        if (pendingCheckout === timestamp) {
          console.log('Payment matches pending checkout:', timestamp);
        } else {
          console.log('Payment timestamp does not match pending checkout. Expected:', pendingCheckout, 'Got:', timestamp);
        }
      }
      
      // Try direct update immediately
      updateProfileDirectlyToPremium().then(updated => {
        console.log('Direct profile update result:', updated);
        
        // Clean up URL params 
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
        
        // Clear pending checkout
        localStorage.removeItem('pending_checkout');
        
        // Initial check with a small delay to allow webhook to process
        setTimeout(() => {
          checkPremiumAccessFn(true);
        }, 500);
      });
    } else if (successParam === 'false') {
      toast({
        title: "Payment cancelled",
        description: "Your payment was not completed. You can try again later.",
        variant: "destructive",
      });
      
      // Clean up URL params and local storage
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
      localStorage.removeItem('pending_checkout');
      localStorage.removeItem('new_premium_user');
    } else if (!initialCheckDoneRef.current) {
      // Regular check on page load - with slight delay to avoid race conditions with auth
      setTimeout(() => {
        checkPremiumAccessFn();
      }, 500);
    }
  }, [checkPremiumAccessFn, location.search, toast]);

  // Controlled post-payment check interval with increasing delays
  useEffect(() => {
    if ((isPostPayment || isNewUser) && !hasPremiumAccess && !statusUpdatedRef.current && retryCount > 0) {
      // Use increasing delays to prevent too frequent refreshes
      const delay = Math.min(3000 + (retryCount * 1000), 10000);
      
      const timeoutId = setTimeout(() => {
        if (statusUpdatedRef.current || retryCount >= 10) {
          return;
        }
        
        console.log(`Payment completed, polling for subscription status. Attempt ${retryCount + 1}/10 with delay ${delay}ms`);
        checkPremiumAccessFn(true);
      }, delay);
      
      return () => clearTimeout(timeoutId);
    }
  }, [isPostPayment, isNewUser, hasPremiumAccess, retryCount, checkPremiumAccessFn]);

  // Reset status when navigating away from the component
  useEffect(() => {
    return () => {
      statusUpdatedRef.current = false;
      initialCheckDoneRef.current = false;
      setRetryCount(0);
    };
  }, []);

  return { 
    hasPremiumAccess, 
    isCheckingAccess, 
    refreshSubscription: () => checkPremiumAccessFn(true) 
  };
};
