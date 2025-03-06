
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
  const isProcessingRef = useRef(false);
  
  useEffect(() => {
    // Extract query parameters
    const queryParams = new URLSearchParams(location.search);
    const successParam = queryParams.get('success');
    const sessionId = queryParams.get('session_id');
    
    // Prevent processing the same payment success multiple times
    if (processedRef.current || isProcessingRef.current) {
      return;
    }
    
    // If returning from successful payment, show message and try to refresh
    if (successParam === 'true' && sessionId) {
      console.log('Payment success detected with session ID:', sessionId);
      processedRef.current = true;
      
      toast({
        title: "Payment received!",
        description: "Please wait while we update your account status...",
      });
      
      // Clean URL
      const newUrl = location.pathname;
      window.history.replaceState({}, document.title, newUrl);
      
      // Try to refresh subscription status
      if (onPaymentSuccess) {
        // Set processing flag to prevent concurrent executions
        isProcessingRef.current = true;
        
        // Call with slight delay to allow webhook to process
        setTimeout(async () => {
          console.log('Calling onPaymentSuccess callback');
          try {
            await onPaymentSuccess();
          } catch (err) {
            console.error('Error in payment success callback:', err);
          }
          
          // Schedule additional checks with exponential backoff
          const scheduleNextCheck = async () => {
            checkCountRef.current += 1;
            
            if (checkCountRef.current >= 5) {
              isProcessingRef.current = false;
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
    
    // Reset the processed ref when the URL changes (for testing purposes)
    return () => {
      processedRef.current = false;
      checkCountRef.current = 0;
      isProcessingRef.current = false;
    };
  }, [location.search, onPaymentSuccess, toast]);
};
