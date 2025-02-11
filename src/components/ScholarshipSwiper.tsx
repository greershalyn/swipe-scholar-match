
import React, { useState, useEffect } from 'react';
import ScholarshipCard from './ScholarshipCard';
import EmptyState from './scholarship/EmptyState';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from "@/components/ui/use-toast";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useScholarships } from '@/hooks/useScholarships';
import { saveScholarship, recordLeftSwipe } from '@/utils/scholarshipUtils';
import { Button } from "@/components/ui/button";
import { RefreshCw } from 'lucide-react';

const ScholarshipSwiper = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } = useScholarships();

  // Flatten all pages of scholarships into a single array
  const allScholarships = data?.pages.flatMap(page => page.scholarships) || [];

  useEffect(() => {
    // Pre-fetch next page when user is 2 cards away from the end
    if (allScholarships.length - currentIndex <= 2 && !isFetchingNextPage && hasNextPage) {
      console.log('Fetching next page of scholarships...');
      fetchNextPage();
    }
  }, [currentIndex, allScholarships.length, fetchNextPage, hasNextPage, isFetchingNextPage]);

  console.log('ScholarshipSwiper state:', {
    scholarshipsLength: allScholarships.length,
    currentIndex,
    isLoading,
    error,
    hasNextPage,
    isFetchingNextPage
  });

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
    setDirection(direction);
    
    if (allScholarships[currentIndex]) {
      if (direction === 'right') {
        saveMutation.mutate(allScholarships[currentIndex].id);
      } else {
        leftSwipeMutation.mutate(allScholarships[currentIndex].id);
      }
    }
    
    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
      setDirection(null);
    }, 300);
  };

  const handleRefresh = async () => {
    setCurrentIndex(0);
    await refetch();
    toast({
      title: "Refreshing Scholarships",
      description: "Looking for new scholarship opportunities...",
    });
  };

  if (isLoading && !allScholarships.length) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
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

  if (currentIndex >= allScholarships.length && !hasNextPage) {
    return (
      <div className="flex flex-col items-center justify-center gap-6">
        <EmptyState 
          title="You're All Caught Up!"
          description="Check back later for more scholarship opportunities."
        />
        <Button 
          onClick={handleRefresh}
          className="gap-2"
          size="lg"
        >
          <RefreshCw className="w-4 h-4" />
          Find More Scholarships
        </Button>
      </div>
    );
  }

  return (
    <div className="relative h-[600px] w-full max-w-md mx-auto">
      <AnimatePresence mode="wait">
        {allScholarships[currentIndex] && (
          <ScholarshipCard
            key={currentIndex}
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
    </div>
  );
};

export default ScholarshipSwiper;
