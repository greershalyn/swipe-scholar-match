
import React, { useState, useEffect, useRef } from 'react';
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
  const progressTimerRef = useRef<number | undefined>(undefined);
  const cooldownTimerRef = useRef<number | undefined>(undefined);
  
  // Clean up function to clear any active timers
  const clearTimers = () => {
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = undefined;
    }
    
    if (cooldownTimerRef.current) {
      clearTimeout(cooldownTimerRef.current);
      cooldownTimerRef.current = undefined;
    }
  };
  
  // Sync local state with props in a controlled way
  useEffect(() => {
    if (refreshing && !localRefreshing) {
      setLocalRefreshing(true);
      setIsClickable(false);
      
      // Start progress animation
      clearTimers();
      setProgress(0);
      
      const animationDuration = 3000;
      const intervalTime = 30;
      const steps = animationDuration / intervalTime;
      const increment = 100 / steps;
      
      progressTimerRef.current = window.setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + increment;
          return newProgress >= 100 ? 100 : newProgress;
        });
      }, intervalTime);
      
    } else if (!refreshing && localRefreshing) {
      // Add a small delay before resetting local state
      clearTimers();
      
      setTimeout(() => {
        setLocalRefreshing(false);
        setProgress(0);
        
        // Add cooldown period to prevent spam clicking
        cooldownTimerRef.current = window.setTimeout(() => {
          setIsClickable(true);
        }, 1000);
      }, 300);
    }
    
    // Clean up on unmount
    return clearTimers;
  }, [refreshing, localRefreshing]);
  
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
