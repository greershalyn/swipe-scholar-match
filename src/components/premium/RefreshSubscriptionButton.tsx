
import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RefreshSubscriptionButtonProps {
  onClick: () => void;
  refreshing: boolean;
}

export const RefreshSubscriptionButton = ({ 
  onClick, 
  refreshing 
}: RefreshSubscriptionButtonProps) => {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={refreshing}
      className="flex items-center gap-1 relative"
    >
      <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
      <span>{refreshing ? "Refreshing..." : "Refresh Subscription Status"}</span>
      {refreshing && (
        <span className="absolute bottom-0 left-0 h-0.5 bg-green-500 animate-progress"></span>
      )}
    </Button>
  );
};
