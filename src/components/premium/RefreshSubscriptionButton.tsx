
import React, { useState, useEffect } from 'react';
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
  const [progress, setProgress] = useState(0);
  const [localRefreshing, setLocalRefreshing] = useState(false);
  const [isClickable, setIsClickable] = useState(true);
  
  // Ensure local state syncs with prop
  useEffect(() => {
    if (refreshing && !localRefreshing) {
      setLocalRefreshing(true);
      setIsClickable(false);
    } else if (!refreshing && localRefreshing) {
      // Add a small delay before resetting local state to ensure animations complete
      const timeout = setTimeout(() => {
        setLocalRefreshing(false);
        setProgress(0);
        // Add cooldown period to prevent spam clicking
        setTimeout(() => {
          setIsClickable(true);
        }, 1000);
      }, 300);
      
      return () => clearTimeout(timeout);
    }
  }, [refreshing, localRefreshing]);
  
  // Handle progress animation
  useEffect(() => {
    if (!localRefreshing) {
      return;
    }
    
    // Reset progress when refresh starts
    setProgress(0);
    
    // Animate progress over 3 seconds
    const animationDuration = 3000; // 3 seconds
    const intervalTime = 30; // Update every 30ms for smooth animation
    const steps = animationDuration / intervalTime;
    const increment = 100 / steps;
    
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += increment;
      
      if (currentProgress >= 100) {
        clearInterval(interval);
        currentProgress = 100;
      }
      
      setProgress(currentProgress);
    }, intervalTime);
    
    return () => clearInterval(interval);
  }, [localRefreshing]);
  
  const handleClick = () => {
    if (isClickable && !localRefreshing) {
      onClick();
    }
  };
  
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      disabled={!isClickable || localRefreshing}
      className={`flex items-center gap-1 relative overflow-hidden transition-all ${!isClickable && !localRefreshing ? 'opacity-70' : ''}`}
    >
      <RefreshCw className={`h-4 w-4 ${localRefreshing ? 'animate-spin' : ''}`} />
      <span>{localRefreshing ? "Refreshing..." : "Refresh Subscription Status"}</span>
      {localRefreshing && (
        <span 
          className="absolute bottom-0 left-0 h-1 bg-green-500" 
          style={{ width: `${progress}%`, transition: 'width 0.1s ease-in-out' }}
        />
      )}
    </Button>
  );
};
