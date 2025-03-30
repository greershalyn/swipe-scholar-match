
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckSquare } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const ApplicationChecklist = () => {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  
  const toggleChecked = (id: string) => {
    setCheckedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  
  const checklistItems = [{
    id: "research",
    title: "Research Colleges & Programs",
    items: ["Identify schools that match your interests, location, and affordability.", "Use resources like College Board, Common App, and university websites."]
  }, {
    id: "financial",
    title: "Understand Financial Aid & Scholarships",
    items: ["Complete the FAFSA and look into state-based aid programs.", "Search for first-gen scholarships on SwipeScholar."]
  }, {
    id: "essay",
    title: "Write a Strong Application Essay",
    items: ["Share your personal journey and unique perspective.", "Use our AI-powered essay tool to get tailored suggestions."]
  }, {
    id: "letters",
    title: "Ask for Recommendation Letters",
    items: ["Reach out to teachers, mentors, or employers early."]
  }, {
    id: "deadlines",
    title: "Meet All Deadlines",
    items: ["Create a timeline for application and scholarship deadlines."]
  }];
  
  return (
    <Card className="mb-8">
      <CardHeader className="pb-3 bg-slate-50 rounded-t-lg">
        <CardTitle className="text-2xl">First-Gen College Application Checklist</CardTitle>
        <CardDescription>
          A step-by-step guide to navigating the college application process
        </CardDescription>
      </CardHeader>
      <CardContent className="bg-slate-50 rounded-b-lg">
        <div className="space-y-6">
          {checklistItems.map(section => (
            <div key={section.id} className="border-l-4 border-primary pl-4 py-1">
              <h3 className="text-lg font-medium flex items-center gap-2 mb-2">
                <CheckSquare className={`h-5 w-5 ${checkedItems[section.id] ? 'text-green-500' : 'text-gray-400'}`} />
                <span 
                  className={`cursor-pointer ${checkedItems[section.id] ? 'line-through text-gray-500' : ''}`} 
                  onClick={() => toggleChecked(section.id)}
                >
                  {section.title}
                </span>
              </h3>
              <ul className="space-y-1 ml-7">
                {section.items.map((item, idx) => (
                  <li key={idx} className="text-sm text-gray-600">{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="mt-8 text-center">
          <Link to="/essay-assistant">
            <Button className="bg-purple-600 hover:bg-purple-700">
              Try Our Essay Assistant
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApplicationChecklist;
