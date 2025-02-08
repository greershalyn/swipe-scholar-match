
import React, { useState } from 'react';
import ScholarshipCard from './ScholarshipCard';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from "@/components/ui/use-toast";

// Mock data for initial development
const mockScholarships = [
  {
    id: '1',
    title: 'STEM Excellence Scholarship',
    amount: 10000,
    deadline: 'March 15, 2024',
    category: 'STEM',
    description: 'For outstanding students pursuing degrees in Science, Technology, Engineering, or Mathematics.',
    requirements: ['3.5+ GPA', 'STEM Major', 'US Citizen'],
    match_score: 95,
  },
  {
    id: '2',
    title: 'Arts & Humanities Grant',
    amount: 5000,
    deadline: 'April 1, 2024',
    category: 'Arts',
    description: 'Supporting creative minds in pursuing their passion in arts and humanities.',
    requirements: ['Portfolio Submission', 'Arts Major', 'Essay Required'],
    match_score: 88,
  },
  // Add more mock scholarships as needed
];

const ScholarshipSwiper = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);

  const handleSwipe = (direction: 'left' | 'right') => {
    setDirection(direction);
    if (direction === 'right') {
      toast({
        title: "Application Submitted!",
        description: "We've automatically applied for this scholarship for you.",
        duration: 3000,
      });
    }
    
    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
      setDirection(null);
    }, 300);
  };

  if (currentIndex >= mockScholarships.length) {
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
          scholarship={mockScholarships[currentIndex]}
          onSwipe={handleSwipe}
        />
      </AnimatePresence>
    </div>
  );
};

export default ScholarshipSwiper;
