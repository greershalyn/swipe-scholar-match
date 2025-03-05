
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const usePremiumCheckout = () => {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();
  const location = useLocation();
  const domain = window.location.origin;

  const initiateCheckout = async () => {
    setLoading(true);
    setErrorMessage(null);
    
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('Auth error:', userError);
        throw new Error(`Authentication error: ${userError.message}`);
      }
      
      if (!user) {
        toast({
          title: "Error",
          description: "Please sign in to upgrade to premium",
          variant: "destructive",
        });
        return;
      }

      console.log('Initiating checkout for user:', user.id);
      
      // Make sure we have the return URL properly formatted
      const returnUrl = `${domain}${location.pathname}`;
      console.log('Return URL:', returnUrl);
      
      const response = await supabase.functions.invoke('create-checkout', {
        body: {
          profile_id: user.id,
          return_url: returnUrl,
        },
      });

      console.log('Checkout response:', response);
      
      const { data, error } = response;

      if (error) {
        console.error('Checkout error from invoke:', error);
        throw new Error(`Error from checkout service: ${error.message || JSON.stringify(error)}`);
      }

      if (!data?.url) {
        console.error('No URL received in response:', data);
        throw new Error('No checkout URL received from payment service');
      }

      // Redirect to Stripe Checkout
      console.log('Redirecting to checkout URL:', data.url);
      window.location.href = data.url;
      
    } catch (error: any) {
      console.error('Detailed checkout error:', error);
      const errorMsg = error.message || 'Failed to start checkout process. Please try again.';
      setErrorMessage(errorMsg);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    initiateCheckout,
    loading,
    errorMessage,
    setErrorMessage
  };
};
