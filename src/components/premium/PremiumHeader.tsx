
import React from 'react';
import { Crown } from 'lucide-react';
import { CardTitle, CardDescription } from '@/components/ui/card';

export const PremiumHeader = () => {
  return (
    <>
      <CardTitle className="flex items-center gap-2">
        <Crown className="h-6 w-6 text-yellow-500" />
        Premium Feature
      </CardTitle>
      <CardDescription>
        Upgrade to Premium to access our powerful Essay Assistant
      </CardDescription>
    </>
  );
};
