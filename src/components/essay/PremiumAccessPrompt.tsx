
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

// Import the components
import { PremiumPageLayout } from '@/components/premium/PremiumPageLayout';
import { PremiumCard } from '@/components/premium/PremiumCard';
import { PremiumFeaturesList } from '@/components/premium/PremiumFeaturesList';
import { ErrorDisplay } from '@/components/premium/ErrorDisplay';
import { UpgradeButton } from '@/components/premium/UpgradeButton';
import { RefreshSubscriptionButton } from '@/components/premium/RefreshSubscriptionButton';

interface PremiumAccessPromptProps {
  showSubscriptionDialog: boolean;
  setShowSubscriptionDialog: (show: boolean) => void;
  onRefreshSubscription?: () => void;
}

export const PremiumAccessPrompt = ({
  showSubscriptionDialog,
  setShowSubscriptionDialog,
  onRefreshSubscription
}: PremiumAccessPromptProps) => {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();
  const location = useLocation();
  const domain = window.location.origin;
  
  // Check for success parameter in URL
  const queryParams = new URLSearchParams(location.search);
  const successParam = queryParams.get('success');
  const sessionId = queryParams.get('session_id');
  
  useEffect(() => {
    // If returning from successful payment, show message and try to refresh
    if (successParam === 'true' && sessionId) {
      toast({
        title: "Payment received!",
        description: "Please wait while we update your account status...",
      });
      
      // Clean URL
      const newUrl = location.pathname;
      window.history.replaceState({}, document.title, newUrl);
      
      // Try to refresh subscription status
      handleRefreshSubscription();
    }
  }, [location.search]);

  const handleUpgradeClick = async () => {
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
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          profile_id: user.id,
          return_url: returnUrl,
        },
      });

      console.log('Checkout response:', { data, error });

      if (error) {
        console.error('Checkout error from invoke:', error);
        throw new Error(`Error from checkout service: ${error.message || 'Unknown error'}`);
      }

      if (!data?.url) {
        throw new Error('No checkout URL received from Stripe');
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
    } finally {
      setLoading(false);
    }
  };
  
  const handleRefreshSubscription = async () => {
    if (onRefreshSubscription) {
      setRefreshing(true);
      try {
        await onRefreshSubscription();
        toast({
          title: "Status refreshed",
          description: "Your subscription status has been refreshed.",
        });
      } catch (error) {
        console.error('Error refreshing subscription:', error);
      } finally {
        setRefreshing(false);
      }
    }
  };

  const cardContent = (
    <>
      <PremiumFeaturesList />
      <ErrorDisplay errorMessage={errorMessage} />
      <UpgradeButton 
        onClick={handleUpgradeClick}
        loading={loading}
      />
    </>
  );

  const cardFooter = onRefreshSubscription ? (
    <RefreshSubscriptionButton
      onClick={handleRefreshSubscription}
      refreshing={refreshing}
    />
  ) : undefined;

  return (
    <PremiumPageLayout>
      <PremiumCard 
        content={cardContent}
        footer={cardFooter}
      />
    </PremiumPageLayout>
  );
};
