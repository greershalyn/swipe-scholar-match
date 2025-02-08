
import React, { useState } from 'react';
import ScholarshipCard from './ScholarshipCard';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Scholarship {
  id: string;
  title: string;
  amount: number;
  deadline: string;
  category: string;
  description: string;
  requirements: string[];
  url: string;
  provider: string;
  match_score?: number;
}

const fetchScholarships = async () => {
  const { data, error } = await supabase
    .from('scholarships')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Scholarship[];
};

const saveScholarship = async (scholarshipId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Must be logged in to save scholarships');

  const { error } = await supabase
    .from('saved_scholarships')
    .insert([
      { scholarship_id: scholarshipId, profile_id: user.id }
    ]);

  if (error && error.code === '23505') {
    throw new Error('You have already saved this scholarship');
  }
  if (error) throw error;
};

const ScholarshipSwiper = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  const queryClient = useQueryClient();

  const { data: scholarships, isLoading, error } = useQuery({
    queryKey: ['scholarships'],
    queryFn: fetchScholarships,
  });

  const saveMutation = useMutation({
    mutationFn: saveScholarship,
    onSuccess: () => {
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

  const handleSwipe = async (direction: 'left' | 'right') => {
    setDirection(direction);
    
    if (direction === 'right' && scholarships?.[currentIndex]) {
      saveMutation.mutate(scholarships[currentIndex].id);
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
      <div className="flex flex-col items-center justify-center h-[600px] text-center">
        <h2 className="text-2xl font-semibold text-accent mb-4">Error Loading Scholarships</h2>
        <p className="text-muted-foreground">
          There was a problem loading scholarships. Please try again later.
        </p>
      </div>
    );
  }

  if (!scholarships?.length) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] text-center">
        <h2 className="text-2xl font-semibold text-accent mb-4">No Scholarships Available</h2>
        <p className="text-muted-foreground">
          Check back later for new scholarship opportunities.
        </p>
      </div>
    );
  }

  if (currentIndex >= scholarships.length) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] text-center">
        <h2 className="text-2xl font-semibold text-accent mb-4">You're All Caught Up!</h2>
        <p className="text-muted-foreground">
          Check back later for more scholarship opportunities.
        </p>
      </div>
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
