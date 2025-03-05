
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
    } else if (successParam === 'false') {
      toast({
        title: "Payment cancelled",
        description: "Your payment was not completed. You can try again later.",
        variant: "destructive",
      });
      
      // Clean up URL params after showing the message
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
    
    checkPremiumAccess();
  }, [location.search]);

  const checkPremiumAccess = async () => {
    try {
      setIsCheckingAccess(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/auth');
        return;
      }

      // Force refetch the profile after a successful payment
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
      setHasPremiumAccess(isPremium);
      
      // If user just completed payment but still doesn't have premium, try once more after a delay
      if (successParam === 'true' && sessionId && !isPremium) {
        setTimeout(async () => {
          const { data: refreshedProfile, error: refreshError } = await supabase
            .from('profiles')
            .select('subscription_tier')
            .eq('id', session.user.id)
            .single();
            
          if (!refreshError && refreshedProfile) {
            const isNowPremium = (refreshedProfile as Profile)?.subscription_tier === 'premium';
            setHasPremiumAccess(isNowPremium);
            
            if (isNowPremium) {
              toast({
                title: "Premium access confirmed",
                description: "Your account has been successfully upgraded to premium.",
              });
            } else {
              toast({
                title: "Premium update pending",
                description: "Your payment was successful but your account is still being updated. Please refresh the page in a moment.",
              });
            }
          }
        }, 3000);
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
