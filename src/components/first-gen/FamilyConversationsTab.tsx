
import React from 'react';
import { MessageCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const FamilyConversationsTab = () => (
  <div className="space-y-4">
    <Card>
      <CardHeader className="pb-3 bg-slate-50 rounded-t-lg">
        <CardTitle className="text-2xl">How to Talk to Your Family About College</CardTitle>
        <CardDescription>
          Many first-gen students face family challenges when deciding to go to college. Here's how to navigate those conversations.
        </CardDescription>
      </CardHeader>
      <CardContent className="bg-slate-50 rounded-b-lg">
        <div className="space-y-6">
          <div className="border-l-4 border-purple-500 pl-4 py-1">
            <h3 className="text-lg font-medium flex items-center gap-2 mb-2">
              <MessageCircle className="h-5 w-5 text-purple-600" />
              <span>Explain Your Goals</span>
            </h3>
            <ul className="space-y-1 ml-7">
              <li className="text-sm text-gray-600">Share how college can create better opportunities for you and your family.</li>
            </ul>
          </div>
          
          <div className="border-l-4 border-purple-500 pl-4 py-1">
            <h3 className="text-lg font-medium flex items-center gap-2 mb-2">
              <MessageCircle className="h-5 w-5 text-purple-600" />
              <span>Address Their Concerns</span>
            </h3>
            <ul className="space-y-1 ml-7">
              <li className="text-sm text-gray-600">If cost is a concern, explain financial aid options and scholarship opportunities.</li>
            </ul>
          </div>
          
          <div className="border-l-4 border-purple-500 pl-4 py-1">
            <h3 className="text-lg font-medium flex items-center gap-2 mb-2">
              <MessageCircle className="h-5 w-5 text-purple-600" />
              <span>Involve Them in the Process</span>
            </h3>
            <ul className="space-y-1 ml-7">
              <li className="text-sm text-gray-600">Take them on college tours (even virtual ones), and show them resources available to support you.</li>
            </ul>
          </div>
          
          <div className="border-l-4 border-purple-500 pl-4 py-1">
            <h3 className="text-lg font-medium flex items-center gap-2 mb-2">
              <MessageCircle className="h-5 w-5 text-purple-600" />
              <span>Celebrate the Milestones</span>
            </h3>
            <ul className="space-y-1 ml-7">
              <li className="text-sm text-gray-600">Keep them engaged by sharing your achievements and experiences.</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

export default FamilyConversationsTab;
