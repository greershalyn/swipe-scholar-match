
import React from 'react';
import { Button } from '@/components/ui/button';

interface UpgradeButtonProps {
  onClick: () => void;
  loading: boolean;
}

export const UpgradeButton = ({ onClick, loading }: UpgradeButtonProps) => {
  return (
    <Button 
      className="w-full mt-4"
      onClick={onClick}
      disabled={loading}
    >
      {loading ? "Processing..." : "Upgrade to Premium"}
    </Button>
  );
};
