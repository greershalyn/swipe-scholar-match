
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
      
      const returnUrl = `${domain}${location.pathname}`;
      console.log('Return URL:', returnUrl);
      
      try {
        console.log('Calling create-checkout function...');
        const { data, error } = await supabase.functions.invoke('create-checkout', {
          body: {
            profile_id: user.id,
            return_url: returnUrl,
          },
        });
        
        console.log('Full checkout response:', JSON.stringify(data, null, 2));
        
        if (error) {
          console.error('Checkout invoke error:', error);
          throw new Error(`Error from checkout service: ${error.message || JSON.stringify(error)}`);
        }
        
        if (!data?.url) {
          console.error('No URL in checkout response:', data);
          throw new Error('No checkout URL received');
        }
        
        console.log('Redirecting to checkout URL:', data.url);
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
