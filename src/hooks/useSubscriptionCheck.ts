
import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
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
  
  // Extract query parameters
  const queryParams = new URLSearchParams(location.search);
  const successParam = queryParams.get('success');
  const sessionId = queryParams.get('session_id');

  // Check if we just returned from a payment flow
  const isPostPayment = successParam === 'true' && sessionId;

  // Define the check function using useCallback to prevent re-creation on each render
  const checkPremiumAccess = useCallback(async (isPostPayment = false) => {
    // Prevent concurrent checks - this avoids the flickering
    if (checkInProgressRef.current) {
      console.log('Check already in progress, skipping');
      return;
    }
    
    try {
      checkInProgressRef.current = true;
      setIsCheckingAccess(true);
      console.log('Checking premium access, post payment:', isPostPayment);
      
      // Don't check too frequently - prevent excessive checks
      const now = Date.now();
      if (!isPostPayment && now - lastCheckTimeRef.current < 2000) {
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
        checkInProgressRef.current = false;
        return;
      }

      console.log('Fetching profile for user:', session.user.id);

      // Add cache-busting parameter to force a fresh fetch from the database
      const cacheBypass = isPostPayment ? `?t=${Date.now()}` : '';
      
      // Force refetch the profile with no caching
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
        return;
      }

      const isPremium = (profile as Profile)?.subscription_tier === 'premium';
      console.log('Profile subscription tier:', (profile as Profile)?.subscription_tier);
      console.log('Has premium access:', isPremium);
      
      // Only update state if the value has changed to prevent unnecessary re-renders
      if (hasPremiumAccess !== isPremium) {
        setHasPremiumAccess(isPremium);
      }
      
      // If user just completed payment but still doesn't have premium, retry a few times
      if (isPostPayment && !isPremium) {
        console.log(`Payment completed but premium not yet active. Retry attempt ${retryCount + 1}/10`);
        setRetryCount(prev => prev + 1);
        
        if (retryCount < 3) {
          // First few attempts - just wait
          toast({
            title: "Updating your account",
            description: "Your payment was successful. Please wait while we update your account...",
          });
        } else if (retryCount === 3) {
          // After a few retries, suggest refreshing subscription manually
          toast({
            title: "Payment successful",
            description: "Your payment was received, but your account is still updating. Try clicking the refresh button below.",
          });
        }
      } else if (isPostPayment && isPremium) {
        // Payment processed and premium is active
        toast({
          title: "Premium access confirmed",
          description: "Your account has been successfully upgraded to premium.",
        });
        setRetryCount(0);
      } else if (isPostPayment && retryCount >= 10 && !isPremium) {
        // After 10 retries, we still don't have premium
        toast({
          title: "Premium update pending",
          description: "Your payment was successful but your account is still being updated. Please use the refresh button or try again later.",
        });
        setRetryCount(0);
      }
    } catch (error) {
      console.error('Error checking premium access:', error);
      toast({
        title: "Error",
        description: "Could not verify subscription status",
        variant: "destructive",
      });
    } finally {
      setIsCheckingAccess(false);
      checkInProgressRef.current = false;
    }
  }, [hasPremiumAccess, navigate, retryCount, toast]);

  useEffect(() => {
    // If we have success and session_id in the URL, this is a return from Stripe
    if (isPostPayment) {
      // Clean up URL params after showing the message
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
      
      // Clean up URL params after showing the message
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    } else {
      // Regular check on page load - with slight delay to avoid race conditions with auth
      setTimeout(() => {
        checkPremiumAccess();
      }, 500);
    }
  }, [location.search, checkPremiumAccess]);

  // Add a more controlled check when returning from payment flow
  useEffect(() => {
    if (isPostPayment && !hasPremiumAccess) {
      // If we just came back from payment but don't have premium yet, 
      // set up an interval to check more frequently
      const checkInterval = setInterval(() => {
        if (hasPremiumAccess || retryCount >= 10) {
          clearInterval(checkInterval);
          return;
        }
        
        console.log(`Payment completed, polling for subscription status. Attempt ${retryCount + 1}/10`);
        checkPremiumAccess(true);
      }, 3000); // Check every 3 seconds
      
      return () => clearInterval(checkInterval);
    }
  }, [isPostPayment, hasPremiumAccess, retryCount, checkPremiumAccess]);

  return { 
    hasPremiumAccess, 
    isCheckingAccess, 
    refreshSubscription: () => checkPremiumAccess(true) 
  };
};
