
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { updateProfileDirectlyToPremium } from "@/utils/subscriptionUtils";

export const useAuth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [selectedTier, setSelectedTier] = useState<"free" | "premium" | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const domain = window.location.origin;
  const returnUrl = `${domain}/questionnaire?signup=true`;
  
  const checkProfileCompletion = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error checking profile:", error);
      return false;
    }

    return !!data?.full_name;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) {
        if (!selectedTier) {
          toast({
            title: "Please Select a Plan",
            description: "Choose either the Free or Premium plan to continue.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              subscription_tier: selectedTier,
            },
          },
        });
        
        if (error?.message.includes("User already registered")) {
          toast({
            title: "Account Exists",
            description: "An account with this email already exists. Please sign in instead.",
            variant: "destructive",
          });
          setIsSignUp(false);
        } else if (error) {
          throw error;
        } else {
          toast({
            title: "Success!",
            description: "Please check your email to verify your account.",
          });
          
          if (selectedTier === 'premium') {
            // Generate a timestamp to track this checkout attempt
            const timestamp = new Date().toISOString();
            localStorage.setItem('pending_checkout', timestamp);
            
            try {
              // If user just signed up with premium selected, initiate checkout directly
              if (data.user) {
                console.log('Calling create-checkout for new premium user:', data.user.id);
                const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke('create-checkout', {
                  body: {
                    profile_id: data.user.id,
                    return_url: returnUrl,
                    timestamp: timestamp,
                  },
                });
                
                if (checkoutError) {
                  console.error('Checkout invoke error:', checkoutError);
                  throw checkoutError;
                }
                
                if (checkoutData?.url) {
                  console.log('Redirecting to checkout URL:', checkoutData.url);
                  window.location.href = checkoutData.url;
                  return; // Exit early as we're redirecting
                } else {
                  throw new Error('No checkout URL received');
                }
              }
            } catch (checkoutError: any) {
              console.error('Error initiating checkout:', checkoutError);
              // If checkout fails, still navigate to questionnaire
              navigate('/questionnaire');
            }
          } else {
            navigate('/questionnaire');
          }
        }
      } else {
        const { data: { user }, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        
        if (user) {
          const hasCompletedProfile = await checkProfileCompletion(user.id);
          navigate(hasCompletedProfile ? "/" : "/questionnaire");
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    loading,
    isSignUp,
    setIsSignUp,
    selectedTier,
    setSelectedTier,
    handleAuth,
  };
};
