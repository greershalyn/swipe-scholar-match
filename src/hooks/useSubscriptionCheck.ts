
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/profile';

export const useSubscriptionCheck = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [hasPremiumAccess, setHasPremiumAccess] = useState(false);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);

  useEffect(() => {
    checkPremiumAccess();
  }, []);

  const checkPremiumAccess = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/auth');
        return;
      }

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

      setHasPremiumAccess((profile as Profile)?.subscription_tier === 'premium');
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

  return { hasPremiumAccess, isCheckingAccess };
};
