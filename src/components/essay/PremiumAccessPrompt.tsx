
import React, { useState } from 'react';
import { usePremiumCheckout } from '@/hooks/usePremiumCheckout';
import { usePaymentSuccess } from '@/hooks/usePaymentSuccess';
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
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();
  
  const { 
    initiateCheckout, 
    loading, 
    errorMessage, 
    setErrorMessage 
  } = usePremiumCheckout();
  
  // Use the payment success hook
  usePaymentSuccess({
    onPaymentSuccess: onRefreshSubscription ? handleRefreshSubscription : undefined
  });

  async function handleRefreshSubscription() {
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
        toast({
          title: "Error",
          description: "Failed to refresh subscription status. Please try again.",
          variant: "destructive",
        });
      } finally {
        setRefreshing(false);
      }
    }
  }

  const cardContent = (
    <>
      <PremiumFeaturesList />
      <ErrorDisplay errorMessage={errorMessage} />
      <UpgradeButton 
        onClick={initiateCheckout}
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
