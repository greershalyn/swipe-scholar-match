
import React from 'react';
import { Button } from '@/components/ui/button';

interface UpgradeButtonProps {
  onClick: () => void;
  loading: boolean;
}

export const UpgradeButton = ({ onClick, loading }: UpgradeButtonProps) => {
  return (
    <Button 
      className="w-full mt-4 bg-gradient-primary hover:opacity-90 text-primary-foreground"
      onClick={onClick}
      disabled={loading}
    >
      {loading ? "Processing..." : "Upgrade to Premium"}
    </Button>
  );
};
