
import React from 'react';
import { Star, Lightbulb, FileCheck, BookOpen, GraduationCap, Search, Zap } from 'lucide-react';

export const PremiumFeaturesList = () => {
  return (
    <div className="space-y-4">
      <p className="text-lg">
        Premium features help you succeed in your scholarship journey with:
      </p>
      <div className="space-y-4">
        <div>
          <h3 className="font-medium mb-2">Essay Assistant:</h3>
          <ul className="space-y-2">
            <li className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              AI-powered writing suggestions
            </li>
            <li className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-yellow-500" />
              Personalized essay frameworks
            </li>
            <li className="flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-yellow-500" />
              Professional writing feedback
            </li>
          </ul>
        </div>
        
        <div>
          <h3 className="font-medium mb-2">Scholarship Search:</h3>
          <ul className="space-y-2">
            <li className="flex items-center gap-2">
              <Search className="h-4 w-4 text-yellow-500" />
              Unlimited scholarship swiping
            </li>
            <li className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              No daily swipe limits
            </li>
          </ul>
        </div>
        
        <div>
          <h3 className="font-medium mb-2">Test Prep:</h3>
          <ul className="space-y-2">
            <li className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-yellow-500" />
              Comprehensive SAT & ACT practice quizzes
            </li>
            <li className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-yellow-500" />
              Personalized study strategies
            </li>
            <li className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              AI-generated practice questions
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
