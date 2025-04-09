
import React, { useState, useEffect } from 'react';
import ScholarshipCard from './ScholarshipCard';
import EmptyState from './scholarship/EmptyState';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from "@/components/ui/use-toast";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useScholarships } from '@/hooks/useScholarships';
import { saveScholarship, recordLeftSwipe, getDailySwipeCount, updateDailySwipeCount } from '@/utils/scholarshipUtils';
import { Button } from "@/components/ui/button";
import { RefreshCw } from 'lucide-react';
import { Scholarship } from '@/types/scholarship';
import { Progress } from "@/components/ui/progress";
import { checkPremiumAccess } from '@/utils/subscriptionUtils';
import { SubscriptionDialog } from '@/components/subscription/SubscriptionDialog';
import SwipeLimit from './scholarship/SwipeLimit';

const FREE_DAILY_SWIPE_LIMIT = 8;

const ScholarshipSwiper = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  const [refreshTimestamp, setRefreshTimestamp] = useState(Date.now());
  const [progress, setProgress] = useState(0);
  const [dailySwipeCount, setDailySwipeCount] = useState(0);
  const [hasPremium, setHasPremium] = useState(false);
  const [dailyLimitReached, setDailyLimitReached] = useState(false);
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);
  const queryClient = useQueryClient();

  const { 
    data, 
    isLoading, 
    error, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage, 
    refetch 
  } = useScholarships(refreshTimestamp);

  // Check user's premium status and daily swipe count on load
  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        // Check premium status
        const isPremium = await checkPremiumAccess();
        setHasPremium(isPremium);
        
        // If not premium, check daily swipe count
        if (!isPremium) {
          const swipeCount = await getDailySwipeCount();
          setDailySwipeCount(swipeCount);
          
          // Check if limit is reached
          if (swipeCount >= FREE_DAILY_SWIPE_LIMIT) {
            setDailyLimitReached(true);
          }
        }
      } catch (error) {
        console.error('Error checking user status:', error);
      }
    };
    
    checkUserStatus();
  }, []);

  // Simulate loading progress
  useEffect(() => {
    if (isLoading) {
      const timer = setInterval(() => {
        setProgress((oldProgress) => {
          const newProgress = Math.min(oldProgress + 2, 90);
          return newProgress;
        });
      }, 100);

      return () => {
        clearInterval(timer);
        setProgress(0);
      };
    }
  }, [isLoading]);

  // Type-safe way to flatten all pages of scholarships into a single array
  const allScholarships = data?.pages.flatMap(page => page.scholarships) ?? [];

  useEffect(() => {
    // Pre-fetch next page when user is 4 cards away from the end
    if (allScholarships.length - currentIndex <= 4 && !isFetchingNextPage && hasNextPage) {
      console.log('Fetching next page of scholarships...');
      fetchNextPage();
    }
  }, [currentIndex, allScholarships.length, fetchNextPage, hasNextPage, isFetchingNextPage]);

  // Log state changes for debugging
  useEffect(() => {
    console.log('ScholarshipSwiper state:', {
      scholarshipsLength: allScholarships.length,
      currentIndex,
      isLoading,
      error,
      hasNextPage,
      isFetchingNextPage,
      refreshTimestamp,
      scholarshipIds: allScholarships.map(s => s.id),
      dailySwipeCount,
      hasPremium,
      dailyLimitReached
    });
  }, [allScholarships, currentIndex, isLoading, error, hasNextPage, isFetchingNextPage, refreshTimestamp, dailySwipeCount, hasPremium, dailyLimitReached]);

  const saveMutation = useMutation({
    mutationFn: saveScholarship,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scholarships'] });
      queryClient.invalidateQueries({ queryKey: ['saved-scholarships'] });
      toast({
        title: "Scholarship Saved!",
        description: "Check your wallet to apply for this scholarship.",
        duration: 3000,
      });
    },
    onError: (error: Error) => {
      if (error.message === 'You have already saved this scholarship') {
        toast({
          title: "Already Saved",
          description: "You have already saved this scholarship. Check your wallet!",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    },
  });

  const leftSwipeMutation = useMutation({
    mutationFn: recordLeftSwipe,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scholarships'] });
    },
  });

  const handleSwipe = async (direction: 'left' | 'right') => {
    // For free tier users, check if they've reached their daily limit
    if (!hasPremium) {
      // Only increment the count if we haven't reached the limit yet
      if (dailySwipeCount >= FREE_DAILY_SWIPE_LIMIT) {
        setDailyLimitReached(true);
        setShowSubscriptionDialog(true);
        return;
      }
      
      // Increment daily swipe count for free users
      const newCount = dailySwipeCount + 1;
      setDailySwipeCount(newCount);
      
      // Update the stored count
      await updateDailySwipeCount(newCount);
      
      // Check if this swipe hits the limit
      if (newCount >= FREE_DAILY_SWIPE_LIMIT) {
        // We'll let this swipe go through, then show the limit message
        setTimeout(() => {
          setDailyLimitReached(true);
        }, 500);
      }
    }

    setDirection(direction);
    
    const currentScholarship = allScholarships[currentIndex];
    
    if (currentScholarship?.id) {
      console.log('Handling swipe for scholarship:', currentScholarship.id);
      if (direction === 'right') {
        saveMutation.mutate(currentScholarship.id);
      } else {
        leftSwipeMutation.mutate(currentScholarship.id);
      }
    } else {
      console.error('No valid scholarship ID found for current index:', currentIndex);
      toast({
        title: "Error",
        description: "Could not process this scholarship. Please try again.",
        variant: "destructive",
      });
    }
    
    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
      setDirection(null);
    }, 300);
  };

  const handleRefresh = async () => {
    setCurrentIndex(0);
    const newTimestamp = Date.now();
    setRefreshTimestamp(newTimestamp);
    
    // Clear all scholarship-related queries
    await queryClient.resetQueries({ queryKey: ['scholarships'] });
    
    // Force a fresh fetch
    await refetch();
    
    toast({
      title: "Finding New Scholarships",
      description: "Searching for scholarship opportunities...",
    });
  };
  
  // Function to prompt upgrade when limit is reached
  const handleUpgradePrompt = () => {
    setShowSubscriptionDialog(true);
  };
  
  // Callback when subscription dialog is closed
  const handleSubscriptionDialogClose = () => {
    setShowSubscriptionDialog(false);
  };

  if (isLoading && !allScholarships.length) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] space-y-4">
        <div className="w-full max-w-xs space-y-4">
          <Progress value={progress} className="h-2" />
          <p className="text-center text-muted-foreground">Finding scholarships...</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('Scholarship loading error:', error);
    return (
      <EmptyState 
        title="Error Loading Scholarships"
        description="There was a problem loading scholarships. Please try again later."
      />
    );
  }

  if (!allScholarships.length) {
    return (
      <EmptyState 
        title="No Scholarships Available"
        description="Check back later for new scholarship opportunities."
      />
    );
  }

  // Show daily limit reached message for free users
  if (dailyLimitReached && !hasPremium) {
    return (
      <SwipeLimit onUpgrade={handleUpgradePrompt} />
    );
  }

  if (currentIndex >= allScholarships.length) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <Button 
          onClick={handleRefresh}
          className="gap-2"
          size="lg"
          disabled={isLoading}
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Finding Scholarships...' : 'Find More Scholarships'}
        </Button>
      </div>
    );
  }

  return (
    <div className="relative h-[600px] w-full max-w-md mx-auto">
      <AnimatePresence mode="wait">
        {allScholarships[currentIndex] && (
          <ScholarshipCard
            key={`${currentIndex}-${refreshTimestamp}`}
            scholarship={allScholarships[currentIndex]}
            onSwipe={handleSwipe}
          />
        )}
      </AnimatePresence>
      {isFetchingNextPage && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      )}
      
      {/* Subscription dialog */}
      <SubscriptionDialog 
        isOpen={showSubscriptionDialog}
        onClose={handleSubscriptionDialogClose}
      />
      
      {/* Daily swipe counter for free users */}
      {!hasPremium && !dailyLimitReached && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/80 px-3 py-1 rounded-full text-xs font-medium">
          {dailySwipeCount}/{FREE_DAILY_SWIPE_LIMIT} swipes today
        </div>
      )}
    </div>
  );
};

export default ScholarshipSwiper;
