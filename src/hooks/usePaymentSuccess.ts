
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
  const checkCountRef = useRef(0);
  const refreshIntervalRef = useRef<number | undefined>(undefined);
  
  // Clean up function to clear any active intervals
  const clearRefreshInterval = () => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = undefined;
    }
  };
  
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
        setTimeout(async () => {
          console.log('Calling onPaymentSuccess callback');
          try {
            await onPaymentSuccess();
          } catch (err) {
            console.error('Error in payment success callback:', err);
          }
          
          // Set up additional checks, but use setTimeout rather than setInterval
          // to avoid potential overlapping requests
          checkCountRef.current = 0;
          
          // Clear any existing interval
          clearRefreshInterval();
          
          // Schedule first additional check
          const scheduleNextCheck = () => {
            checkCountRef.current += 1;
            
            if (checkCountRef.current >= 5) {
              return;
            }
            
            // Calculate exponential backoff delay
            const delay = Math.pow(2, checkCountRef.current) * 1000;
            console.log(`Additional subscription check #${checkCountRef.current} scheduled in ${delay}ms`);
            
            setTimeout(async () => {
              console.log(`Executing additional subscription check #${checkCountRef.current}`);
              try {
                await onPaymentSuccess();
                // Schedule next check
                scheduleNextCheck();
              } catch (err) {
                console.error('Error in additional payment success check:', err);
                // Even if there's an error, try the next check
                scheduleNextCheck();
              }
            }, delay);
          };
          
          // Start the check sequence
          scheduleNextCheck();
        }, 1500);
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
    
    // Clean up interval on unmount
    return () => {
      clearRefreshInterval();
    };
  }, [location.search, onPaymentSuccess, toast]);
  
  // Reset the processed ref when the URL changes (for testing purposes)
  useEffect(() => {
    return () => {
      processedRef.current = false;
      checkCountRef.current = 0;
      clearRefreshInterval();
    };
  }, []);
};
