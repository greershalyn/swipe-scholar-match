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
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Must be logged in to view scholarships');

  // Get all swiped scholarship IDs for the current user
  const { data: swipedScholarships } = await supabase
    .from('swiped_scholarships')
    .select('scholarship_id, swiped_right')
    .eq('profile_id', user.id);

  // Get saved scholarship IDs
  const { data: savedScholarships } = await supabase
    .from('saved_scholarships')
    .select('scholarship_id')
    .eq('profile_id', user.id);

  // Get IDs of right-swiped or saved scholarships to filter out
  const excludeIds = new Set([
    ...(swipedScholarships?.filter(s => s.swiped_right).map(s => s.scholarship_id) || []),
    ...(savedScholarships?.map(s => s.scholarship_id) || [])
  ]);

  // First, try to get scholarships that haven't been swiped on
  let { data: scholarships } = await supabase
    .from('scholarships')
    .select('*')
    .order('created_at', { ascending: false });

  if (!scholarships) throw new Error('Failed to fetch scholarships');

  // Filter out already saved or right-swiped scholarships
  scholarships = scholarships.filter(s => !excludeIds.has(s.id));

  // If no new scholarships, get left-swiped ones
  if (scholarships.length === 0 && swipedScholarships?.some(s => !s.swiped_right)) {
    const leftSwipedIds = swipedScholarships
      .filter(s => !s.swiped_right)
      .map(s => s.scholarship_id);

    const { data: leftSwipedScholarships } = await supabase
      .from('scholarships')
      .select('*')
      .in('id', leftSwipedIds)
      .order('created_at', { ascending: false });

    scholarships = leftSwipedScholarships || [];

    if (scholarships.length > 0) {
      toast({
        title: "Reviewing Previous Scholarships",
        description: "Here are some scholarships you previously skipped.",
        duration: 5000,
      });
    }
  }

  return scholarships;
};

const saveScholarship = async (scholarshipId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Must be logged in to save scholarships');

  // First check if scholarship is already swiped
  const { data: existingSwipe } = await supabase
    .from('swiped_scholarships')
    .select('id')
    .eq('scholarship_id', scholarshipId)
    .eq('profile_id', user.id)
    .maybeSingle();

  if (existingSwipe) {
    // Update existing swipe record instead of creating a new one
    const { error: swipeError } = await supabase
      .from('swiped_scholarships')
      .update({ swiped_right: true })
      .eq('scholarship_id', scholarshipId)
      .eq('profile_id', user.id);

    if (swipeError) throw swipeError;
  } else {
    // Create new swipe record
    const { error: swipeError } = await supabase
      .from('swiped_scholarships')
      .insert([
        { 
          scholarship_id: scholarshipId, 
          profile_id: user.id,
          swiped_right: true
        }
      ]);

    if (swipeError) throw swipeError;
  }

  // Check if scholarship is already saved
  const { data: existingSave } = await supabase
    .from('saved_scholarships')
    .select('id')
    .eq('scholarship_id', scholarshipId)
    .eq('profile_id', user.id)
    .maybeSingle();

  if (existingSave) {
    throw new Error('You have already saved this scholarship');
  }

  // Save the scholarship
  const { error } = await supabase
    .from('saved_scholarships')
    .insert([
      { scholarship_id: scholarshipId, profile_id: user.id }
    ]);

  if (error) throw error;
};

const recordLeftSwipe = async (scholarshipId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Must be logged in');

  // First check if scholarship is already swiped
  const { data: existingSwipe } = await supabase
    .from('swiped_scholarships')
    .select('id')
    .eq('scholarship_id', scholarshipId)
    .eq('profile_id', user.id)
    .maybeSingle();

  if (existingSwipe) {
    // Update existing swipe record instead of creating a new one
    const { error } = await supabase
      .from('swiped_scholarships')
      .update({ swiped_right: false })
      .eq('scholarship_id', scholarshipId)
      .eq('profile_id', user.id);

    if (error) throw error;
  } else {
    // Create new swipe record
    const { error } = await supabase
      .from('swiped_scholarships')
      .insert([
        { 
          scholarship_id: scholarshipId, 
          profile_id: user.id,
          swiped_right: false
        }
      ]);

    if (error) throw error;
  }
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
