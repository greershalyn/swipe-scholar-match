
import React, { useState } from 'react';
import ScholarshipCard from './ScholarshipCard';
import EmptyState from './scholarship/EmptyState';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from "@/components/ui/use-toast";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useScholarships } from '@/hooks/useScholarships';
import { saveScholarship, recordLeftSwipe } from '@/utils/scholarshipUtils';

const ScholarshipSwiper = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  const queryClient = useQueryClient();

  const { data: scholarships, isLoading, error } = useScholarships();

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
    
    if (scholarships?.[currentIndex]) {
      if (direction === 'right') {
        saveMutation.mutate(scholarships[currentIndex].id);
      } else {
        leftSwipeMutation.mutate(scholarships[currentIndex].id);
      }
    }
    
    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
      setDirection(null);
    }, 300);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState 
        title="Error Loading Scholarships"
        description="There was a problem loading scholarships. Please try again later."
      />
    );
  }

  if (!scholarships?.length) {
    return (
      <EmptyState 
        title="No Scholarships Available"
        description="Check back later for new scholarship opportunities."
      />
    );
  }

  if (currentIndex >= scholarships.length) {
    return (
      <EmptyState 
        title="You're All Caught Up!"
        description="Check back later for more scholarship opportunities."
      />
    );
  }

  return (
    <div className="relative h-[600px] w-full max-w-md mx-auto">
      <AnimatePresence mode="wait">
        <ScholarshipCard
          key={currentIndex}
          scholarship={scholarships[currentIndex]}
          onSwipe={handleSwipe}
        />
      </AnimatePresence>
    </div>
  );
};

export default ScholarshipSwiper;
