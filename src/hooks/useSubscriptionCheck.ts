
import { useState, useEffect } from 'react';
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
  
  // Extract query parameters
  const queryParams = new URLSearchParams(location.search);
  const successParam = queryParams.get('success');
  const sessionId = queryParams.get('session_id');

  useEffect(() => {
    // If we have success and session_id in the URL, this is a return from Stripe
    if (successParam === 'true' && sessionId) {
      toast({
        title: "Payment successful!",
        description: "Your account has been upgraded to premium.",
      });
      
      // Clean up URL params after showing the message
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
      
      // Immediately check premium access with a small delay to allow webhook to process
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
      // Regular check on page load
      checkPremiumAccess();
    }
  }, [location.search]);

  const checkPremiumAccess = async (isPostPayment = false) => {
    try {
      setIsCheckingAccess(true);
      console.log('Checking premium access, post payment:', isPostPayment);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log('No active session found');
        navigate('/auth');
        return;
      }

      console.log('Fetching profile for user:', session.user.id);

      // Force refetch the profile
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
        return;
      }

      const isPremium = (profile as Profile)?.subscription_tier === 'premium';
      console.log('Profile subscription tier:', (profile as Profile)?.subscription_tier);
      console.log('Has premium access:', isPremium);
      
      setHasPremiumAccess(isPremium);
      
      // If user just completed payment but still doesn't have premium, retry a few times
      if (isPostPayment && !isPremium && retryCount < 5) {
        console.log(`Payment completed but premium not yet active. Retry attempt ${retryCount + 1}/5`);
        setRetryCount(prev => prev + 1);
        
        toast({
          title: "Updating your account",
          description: "Your payment was successful. Please wait while we update your account...",
        });
        
        setTimeout(async () => {
          await checkPremiumAccess(true);
        }, 3000); // Retry after 3 seconds
      } else if (isPostPayment && isPremium) {
        // Payment processed and premium is active
        toast({
          title: "Premium access confirmed",
          description: "Your account has been successfully upgraded to premium.",
        });
        setRetryCount(0);
      } else if (isPostPayment && retryCount >= 5 && !isPremium) {
        // After 5 retries, we still don't have premium
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
    }
  };

  return { hasPremiumAccess, isCheckingAccess, refreshSubscription: checkPremiumAccess };
};
