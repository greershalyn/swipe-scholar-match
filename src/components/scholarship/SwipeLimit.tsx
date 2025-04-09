import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Clock, Lock, ArrowRight, Sparkles } from 'lucide-react';
import { differenceInSeconds } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { PremiumFeaturesList } from "@/components/premium/PremiumFeaturesList";
import { usePremiumCheckout } from '@/hooks/usePremiumCheckout';

interface SwipeLimitProps {
  onUpgrade?: () => void;
}

const SwipeLimit: React.FC<SwipeLimitProps> = ({ onUpgrade }) => {
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const [showPremiumInfo, setShowPremiumInfo] = useState(false);
  const { initiateCheckout, loading } = usePremiumCheckout();
  
  useEffect(() => {
    const limitReachedTime = localStorage.getItem('scholarship_limit_reached_time');
    
    if (!limitReachedTime) {
      return;
    }
    
    const resetTime = new Date(parseInt(limitReachedTime) + 24 * 60 * 60 * 1000);
    
    const updateCountdown = () => {
      const now = new Date();
      const diff = differenceInSeconds(resetTime, now);
      
      if (diff <= 0) {
        setTimeRemaining("now");
        clearInterval(interval);
        localStorage.removeItem('scholarship_daily_swipe_count');
        localStorage.removeItem('scholarship_limit_reached_time');
        window.location.reload();
        return;
      }
      
      const hours = Math.floor(diff / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      const seconds = Math.floor(diff % 60);
      
      setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
    };
    
    updateCountdown();
    
    const interval = setInterval(updateCountdown, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const handlePremiumInfoOpen = () => {
    console.log('Opening premium info dialog');
    setShowPremiumInfo(true);
  };

  const handlePremiumInfoClose = () => {
    console.log('Closing premium info dialog');
    setShowPremiumInfo(false);
  };

  const handleUpgradeClick = async () => {
    console.log('Upgrade button clicked');
    try {
      if (onUpgrade) {
        onUpgrade();
      }
      
      await initiateCheckout();
    } catch (error) {
      console.error('Error initiating checkout:', error);
    }
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center h-[600px] p-6 bg-white/90 rounded-xl shadow-lg border border-purple-100">
        <div className="flex justify-center mb-4">
          <div className="bg-purple-100 p-4 rounded-full">
            <Lock className="h-12 w-12 text-purple-600" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-center text-purple-800 mb-2">
          Daily Swipe Limit Reached
        </h2>
        
        <p className="text-center text-gray-600 mb-6 max-w-md">
          You've used all 8 of your daily scholarship swipes. Upgrade to premium for unlimited swiping or wait for your swipes to reset.
        </p>
        
        <div className="flex items-center justify-center mb-8 text-sm text-gray-500">
          <Clock className="h-4 w-4 mr-1" />
          <span>Swipes reset in <strong>{timeRemaining}</strong></span>
        </div>

        <div className="space-y-3 w-full max-w-xs">
          <Button 
            onClick={handleUpgradeClick}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600"
            disabled={loading}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            {loading ? 'Processing...' : 'Upgrade to Premium'}
          </Button>
          
          <div className="text-center">
            <Button 
              variant="link" 
              className="text-sm text-gray-500"
              onClick={handlePremiumInfoOpen}
            >
              Learn more about Premium benefits
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={showPremiumInfo} onOpenChange={setShowPremiumInfo}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              Premium Benefits
            </DialogTitle>
            <DialogDescription>
              Get access to premium features to maximize your scholarship opportunities
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <PremiumFeaturesList />
          </div>
          
          <DialogFooter className="gap-2 mt-4">
            <Button 
              onClick={handleUpgradeClick}
              disabled={loading}
              className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600"
            >
              {loading ? 'Processing...' : 'Upgrade to Premium'}
            </Button>
            <Button 
              variant="outline"
              onClick={handlePremiumInfoClose}
            >
              Maybe Later
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SwipeLimit;
