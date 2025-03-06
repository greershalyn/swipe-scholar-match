
import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { updateProfileDirectlyToPremium } from '@/utils/subscriptionUtils';

interface UsePaymentSuccessProps {
  onPaymentSuccess?: () => Promise<void>;
}

export const usePaymentSuccess = ({ onPaymentSuccess }: UsePaymentSuccessProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const processedRef = useRef(false);
  const checkCountRef = useRef(0);
  const isProcessingRef = useRef(false);
  
  useEffect(() => {
    // Extract query parameters
    const queryParams = new URLSearchParams(location.search);
    const successParam = queryParams.get('success');
    const sessionId = queryParams.get('session_id');
    const isSignup = queryParams.get('signup') === 'true';
    const isNewUser = localStorage.getItem('new_premium_user') === 'true';
    
    // Prevent processing the same payment success multiple times
    if (processedRef.current || isProcessingRef.current) {
      return;
    }
    
    // If returning from successful payment, show message and try to refresh
    if (successParam === 'true' && sessionId) {
      console.log('Payment success detected with session ID:', sessionId);
      console.log('Is new user:', isNewUser);
      console.log('Is signup:', isSignup);
      
      processedRef.current = true;
      
      // Set processing flag to prevent concurrent executions
      isProcessingRef.current = true;
      
      // First show toast about received payment
      toast({
        title: "Payment received!",
        description: "Please wait while we update your account status...",
      });
      
      // Immediately force update the user's profile to premium status directly
      updateProfileDirectlyToPremium().then(success => {
        if (success) {
          console.log('Profile directly updated to premium after payment success');
          
          // For new signups or new premium users, redirect to questionnaire
          if (isSignup || isNewUser) {
            // Clear the new user flag
            localStorage.removeItem('new_premium_user');
            
            // Show success message specifically for new users
            toast({
              title: "Premium Access Activated",
              description: "Your premium subscription is now active. Enjoy all premium features!",
            });
            
            navigate('/questionnaire', { replace: true });
          } else {
            // For existing users upgrading, just show a confirmation
            toast({
              title: "Premium Upgrade Complete",
              description: "Your account has been upgraded to premium.",
            });
          }
        } else {
          console.error('Failed to update profile directly');
        }
      });
      
      // Clean URL
      if (!isSignup && !isNewUser) {
        const newUrl = location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      }
      
      // Now call the callback with a delay to allow webhook processing
      if (onPaymentSuccess) {
        // Call with slight delay
        setTimeout(async () => {
          console.log('Calling onPaymentSuccess callback');
          try {
            await onPaymentSuccess();
          } catch (err) {
            console.error('Error in payment success callback:', err);
          }
          
          // Set up sequential additional checks to ensure subscription is active
          const runAdditionalChecks = async () => {
            const maxChecks = 5;
            let currentCheck = 0;
            
            const runCheck = async () => {
              currentCheck++;
              console.log(`Running subscription check #${currentCheck}/${maxChecks}`);
              
              try {
                await onPaymentSuccess();
                
                // If we haven't reached max checks, schedule next check
                if (currentCheck < maxChecks) {
                  // Calculate delay with exponential backoff
                  const delay = Math.pow(2, currentCheck) * 1000;
                  console.log(`Next check scheduled in ${delay}ms`);
                  setTimeout(runCheck, delay);
                } else {
                  console.log('Completed all subscription checks');
                  isProcessingRef.current = false;
                }
              } catch (err) {
                console.error(`Error in check #${currentCheck}:`, err);
                
                // Continue with next check despite errors
                if (currentCheck < maxChecks) {
                  const delay = Math.pow(2, currentCheck) * 1000;
                  setTimeout(runCheck, delay);
                } else {
                  isProcessingRef.current = false;
                }
              }
            };
            
            // Start the first check
            runCheck();
          };
          
          // Begin the sequential check process
          runAdditionalChecks();
        }, 1500);
      }
    } else if (successParam === 'false') {
      processedRef.current = true;
      toast({
        title: "Payment cancelled",
        description: "Your payment was cancelled. You can try again when you're ready.",
        variant: "destructive",
      });
      
      // Clear the new user flag if payment was cancelled
      localStorage.removeItem('new_premium_user');
      
      // If this was a signup process and the payment was cancelled, redirect to questionnaire
      if (isSignup || isNewUser) {
        navigate('/questionnaire', { replace: true });
      } else {
        // Clean URL for existing users
        const newUrl = location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      }
    }
    
    // Reset the processed ref when the URL changes
    return () => {
      processedRef.current = false;
      checkCountRef.current = 0;
      isProcessingRef.current = false;
    };
  }, [location.search, onPaymentSuccess, toast, navigate]);
};
