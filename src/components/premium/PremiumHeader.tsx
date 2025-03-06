
import React from 'react';
import { Crown } from 'lucide-react';
import { CardTitle, CardDescription } from '@/components/ui/card';
import { useSubscriptionCheck } from '@/hooks/useSubscriptionCheck';

export const PremiumHeader = () => {
  const { hasPremiumAccess, isCheckingAccess } = useSubscriptionCheck();

  return (
    <>
      <CardTitle className="flex items-center gap-2">
        <Crown className="h-6 w-6 text-yellow-500" />
        {hasPremiumAccess ? 'Premium Feature (Unlocked)' : 'Premium Feature'}
      </CardTitle>
      <CardDescription>
        {isCheckingAccess ? (
          'Checking subscription status...'
        ) : hasPremiumAccess ? (
          'Thank you for being a premium member!'
        ) : (
          'Upgrade to Premium to access our powerful Essay Assistant and Test Prep tools'
        )}
      </CardDescription>
    </>
  );
};
