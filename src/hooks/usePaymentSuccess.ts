
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface UsePaymentSuccessProps {
  onPaymentSuccess?: () => Promise<void>;
}

export const usePaymentSuccess = ({ onPaymentSuccess }: UsePaymentSuccessProps) => {
  const location = useLocation();
  const { toast } = useToast();
  const processedRef = useRef(false);
  
  useEffect(() => {
    // Extract query parameters
    const queryParams = new URLSearchParams(location.search);
    const successParam = queryParams.get('success');
    const sessionId = queryParams.get('session_id');
    
    // Prevent processing the same payment success multiple times
    if (processedRef.current) {
      return;
    }
    
    // If returning from successful payment, show message and try to refresh
    if (successParam === 'true' && sessionId) {
      processedRef.current = true;
      console.log('Payment success detected with session ID:', sessionId);
      
      toast({
        title: "Payment received!",
        description: "Please wait while we update your account status...",
      });
      
      // Clean URL
      const newUrl = location.pathname;
      window.history.replaceState({}, document.title, newUrl);
      
      // Try to refresh subscription status
      if (onPaymentSuccess) {
        // Call with slight delay to allow webhook to process
        setTimeout(() => {
          console.log('Calling onPaymentSuccess callback');
          onPaymentSuccess().catch(err => {
            console.error('Error in payment success callback:', err);
          });
          
          // Set up periodic checks (3 additional times)
          let checkCount = 0;
          const checkInterval = setInterval(() => {
            if (checkCount >= 3) {
              clearInterval(checkInterval);
              return;
            }
            
            checkCount++;
            console.log(`Additional subscription check #${checkCount}`);
            onPaymentSuccess().catch(err => {
              console.error('Error in additional payment success check:', err);
            });
          }, 3000);
        }, 1000);
      }
    } else if (successParam === 'false') {
      processedRef.current = true;
      toast({
        title: "Payment cancelled",
        description: "Your payment was cancelled. You can try again when you're ready.",
        variant: "destructive",
      });
      
      // Clean URL
      const newUrl = location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, [location.search, onPaymentSuccess, toast]);
  
  // Reset the processed ref when the URL changes (for testing purposes)
  useEffect(() => {
    return () => {
      processedRef.current = false;
    };
  }, []);
};
