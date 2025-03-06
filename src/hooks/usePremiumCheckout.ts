
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
        setLoading(false);
        return;
      }

      console.log('Initiating checkout for user:', user.id);
      
      // Create a timestamp to help identify this checkout attempt
      const timestamp = new Date().toISOString();
      
      const returnUrl = `${domain}${location.pathname}`;
      console.log('Return URL:', returnUrl);
      
      try {
        console.log('Calling create-checkout function...');
        const response = await supabase.functions.invoke('create-checkout', {
          body: {
            profile_id: user.id,
            return_url: returnUrl,
            timestamp: timestamp,
          },
        });
        
        const { data, error } = response;
        console.log('Checkout response status:', response.status);
        console.log('Checkout response data:', data);
        
        if (error) {
          console.error('Checkout invoke error:', error);
          throw new Error(`Error from checkout service: ${error.message || JSON.stringify(error)}`);
        }
        
        if (response.status !== 200) {
          console.error('Non-200 response from checkout function:', response);
          throw new Error(`Checkout service returned ${response.status}: ${JSON.stringify(data)}`);
        }
        
        if (!data?.url) {
          console.error('No URL in checkout response:', data);
          throw new Error('No checkout URL received');
        }
        
        // Before redirecting, mark local storage to indicate pending checkout
        localStorage.setItem('pending_checkout', timestamp);
        
        console.log('Redirecting to checkout URL:', data.url);
        // Force a complete page reload to the Stripe checkout URL
        window.location.href = data.url;
      } catch (invokeError: any) {
        console.error('Function invoke error:', invokeError);
        throw invokeError;
      }
      
    } catch (error: any) {
      console.error('Detailed checkout error:', error);
      const errorMsg = error.message || 'Failed to start checkout process';
      setErrorMessage(errorMsg);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
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
