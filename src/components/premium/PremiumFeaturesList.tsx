
import React from 'react';
import { Star, Lightbulb, FileCheck } from 'lucide-react';

export const PremiumFeaturesList = () => {
  return (
    <div className="space-y-4">
      <p className="text-lg">
        The Essay Assistant is a premium feature that helps you craft compelling scholarship essays with:
      </p>
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
  );
};
