
import React from 'react';
import ScholarshipSwiper from '@/components/ScholarshipSwiper';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-accent mb-4">SwipeScholar</h1>
          <p className="text-lg text-muted-foreground">
            Find and apply for scholarships with a simple swipe
          </p>
        </div>

        <ScholarshipSwiper />

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            Swipe right to apply, left to skip
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
