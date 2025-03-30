
import React from 'react';
import { Lightbulb } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const SurvivalGuideTab = () => (
  <div className="space-y-4">
    <Card>
      <CardHeader className="pb-3 bg-slate-50 rounded-t-lg">
        <CardTitle className="text-2xl">College Survival Guide for First-Gen Students</CardTitle>
        <CardDescription>
          Tips for navigating your first year in college
        </CardDescription>
      </CardHeader>
      <CardContent className="bg-slate-50 rounded-b-lg">
        <div className="space-y-6">
          <div className="border-l-4 border-purple-500 pl-4 py-1">
            <h3 className="text-lg font-medium flex items-center gap-2 mb-2">
              <Lightbulb className="h-5 w-5 text-purple-600" />
              <span>Find Your Support System</span>
            </h3>
            <ul className="space-y-1 ml-7">
              <li className="text-sm text-gray-600">Join first-gen student organizations on campus.</li>
              <li className="text-sm text-gray-600">Connect with faculty mentors and academic advisors.</li>
            </ul>
          </div>
          
          <div className="border-l-4 border-purple-500 pl-4 py-1">
            <h3 className="text-lg font-medium flex items-center gap-2 mb-2">
              <Lightbulb className="h-5 w-5 text-purple-600" />
              <span>Learn About Campus Resources</span>
            </h3>
            <ul className="space-y-1 ml-7">
              <li className="text-sm text-gray-600">Visit the writing center, tutoring services, and career center.</li>
              <li className="text-sm text-gray-600">Use student discounts for books, software, and transportation.</li>
            </ul>
          </div>
          
          <div className="border-l-4 border-purple-500 pl-4 py-1">
            <h3 className="text-lg font-medium flex items-center gap-2 mb-2">
              <Lightbulb className="h-5 w-5 text-purple-600" />
              <span>Budget Wisely</span>
            </h3>
            <ul className="space-y-1 ml-7">
              <li className="text-sm text-gray-600">Track expenses and explore on-campus job opportunities.</li>
              <li className="text-sm text-gray-600">Apply for emergency grants if needed.</li>
            </ul>
          </div>
          
          <div className="border-l-4 border-purple-500 pl-4 py-1">
            <h3 className="text-lg font-medium flex items-center gap-2 mb-2">
              <Lightbulb className="h-5 w-5 text-purple-600" />
              <span>Don't Be Afraid to Ask for Help</span>
            </h3>
            <ul className="space-y-1 ml-7">
              <li className="text-sm text-gray-600">Professors and advisors are there to support you—use their office hours!</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

export default SurvivalGuideTab;
