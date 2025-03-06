
import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/profile';

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

  // Check if we just returned from a payment flow
  const isPostPayment = successParam === 'true' && sessionId;

  // Define the check function
  const checkPremiumAccess = useCallback(async (isForceRefresh = false) => {
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
      const queryOptions = isForceRefresh || isPostPayment 
        ? { headers: { 'Cache-Control': 'no-cache' } }
        : undefined;
        
      // Fetch the user's profile to check subscription status
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
      
      // If premium status has changed, update state
      if (hasPremiumAccess !== isPremium) {
        console.log('Updating premium access state:', isPremium);
        setHasPremiumAccess(isPremium);
        
        // If premium status changed to true after payment, mark as updated
        if (isPremium && isPostPayment) {
          statusUpdatedRef.current = true;
          setRetryCount(0);
          
          toast({
            title: "Premium access confirmed",
            description: "Your account has been successfully upgraded to premium.",
          });
        }
      }
      
      // Handle post-payment status checks
      if (isPostPayment && !isPremium && !statusUpdatedRef.current) {
        const newRetryCount = retryCount + 1;
        console.log(`Payment completed but premium not yet active. Retry attempt ${newRetryCount}/10`);
        setRetryCount(newRetryCount);
        
        if (newRetryCount <= 3) {
          // First few attempts - just wait
          toast({
            title: "Updating your account",
            description: "Your payment was successful. Please wait while we update your account...",
          });
        } else if (newRetryCount === 4) {
          // After a few retries, suggest refreshing subscription manually
          toast({
            title: "Payment successful",
            description: "Your payment was received, but your account is still updating. Try clicking the refresh button below.",
          });
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
  }, [hasPremiumAccess, navigate, retryCount, toast, isPostPayment]);

  // Initial check on page load
  useEffect(() => {
    // If we have success and session_id in the URL, this is a return from Stripe
    if (isPostPayment) {
      // Clean up URL params 
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
      
      // Initial check with a small delay to allow webhook to process
      setTimeout(() => {
        checkPremiumAccess(true);
      }, 1000);
    } else if (successParam === 'false') {
      toast({
        title: "Payment cancelled",
        description: "Your payment was not completed. You can try again later.",
        variant: "destructive",
      });
      
      // Clean up URL params
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    } else if (!initialCheckDoneRef.current) {
      // Regular check on page load - with slight delay to avoid race conditions with auth
      setTimeout(() => {
        checkPremiumAccess();
      }, 500);
    }
  }, [checkPremiumAccess, location.search, toast]);

  // Controlled post-payment check interval with increasing delays
  useEffect(() => {
    if (isPostPayment && !hasPremiumAccess && !statusUpdatedRef.current && retryCount > 0) {
      // Use increasing delays to prevent too frequent refreshes
      const delay = Math.min(3000 + (retryCount * 1000), 10000);
      
      const timeoutId = setTimeout(() => {
        if (statusUpdatedRef.current || retryCount >= 10) {
          return;
        }
        
        console.log(`Payment completed, polling for subscription status. Attempt ${retryCount + 1}/10 with delay ${delay}ms`);
        checkPremiumAccess(true);
      }, delay);
      
      return () => clearTimeout(timeoutId);
    }
  }, [isPostPayment, hasPremiumAccess, retryCount, checkPremiumAccess]);

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
    refreshSubscription: () => checkPremiumAccess(true) 
  };
};
