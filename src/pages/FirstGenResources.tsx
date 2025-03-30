
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, CheckSquare, BookOpen } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AccountDropdown } from '@/components/AccountDropdown';
import { Button } from '@/components/ui/button';

const FirstGenChecklist = () => {
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
  
  return <Card className="mb-8">
      <CardHeader className="pb-3 bg-slate-50 rounded-t-lg">
        <CardTitle className="text-2xl">First-Gen College Application Checklist</CardTitle>
        <CardDescription>
          A step-by-step guide to navigating the college application process
        </CardDescription>
      </CardHeader>
      <CardContent className="bg-slate-50 rounded-b-lg">
        <div className="space-y-6">
          {checklistItems.map(section => <div key={section.id} className="border-l-4 border-primary pl-4 py-1">
              <h3 className="text-lg font-medium flex items-center gap-2 mb-2">
                <CheckSquare className={`h-5 w-5 ${checkedItems[section.id] ? 'text-green-500' : 'text-gray-400'}`} />
                <span className={`cursor-pointer ${checkedItems[section.id] ? 'line-through text-gray-500' : ''}`} onClick={() => toggleChecked(section.id)}>
                  {section.title}
                </span>
              </h3>
              <ul className="space-y-1 ml-7">
                {section.items.map((item, idx) => <li key={idx} className="text-sm text-gray-600">{item}</li>)}
              </ul>
            </div>)}
        </div>
        
        <div className="mt-8 text-center">
          <Link to="/essay-assistant">
            <Button className="bg-purple-600 hover:bg-purple-700">
              Try Our Essay Assistant
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>;
};

const ResourcesTab = () => <div className="space-y-4">
    <Card>
      <CardHeader className="bg-slate-50 rounded-t-lg">
        <CardTitle>Online Resources for First-Generation Students</CardTitle>
      </CardHeader>
      <CardContent className="bg-slate-50 rounded-b-lg">
        <ul className="space-y-2">
          <li className="flex items-start gap-2">
            <BookOpen className="h-5 w-5 text-purple-600 mt-0.5" />
            <div>
              <a href="https://firstgen.naspa.org/" target="_blank" rel="noopener noreferrer" className="font-medium text-purple-600 hover:underline">
                Center for First-generation Student Success
              </a>
              <p className="text-sm text-gray-600">
                Comprehensive resources and research for first-generation college students
              </p>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <BookOpen className="h-5 w-5 text-purple-600 mt-0.5" />
            <div>
              <a href="https://www.imfirst.org/" target="_blank" rel="noopener noreferrer" className="font-medium text-purple-600 hover:underline">
                I'm First
              </a>
              <p className="text-sm text-gray-600">
                Virtual community for first-generation college students
              </p>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <BookOpen className="h-5 w-5 text-purple-600 mt-0.5" />
            <div>
              <a href="https://www.collegepoint.info/" target="_blank" rel="noopener noreferrer" className="font-medium text-purple-600 hover:underline">
                CollegePoint
              </a>
              <p className="text-sm text-gray-600">
                Free virtual advising for high-achieving, low and moderate-income students
              </p>
            </div>
          </li>
        </ul>
      </CardContent>
    </Card>
  </div>;

const FirstGenResources = () => {
  return <div className="min-h-screen bg-gradient-to-b from-[#9b87f5] via-[#D946EF] to-[#FDE1D3]">
      <div className="container px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <Link to="/">
            <img src="/lovable-uploads/24f07198-1e4c-4eea-8e07-259aa77d1711.png" alt="SwipeScholar Logo" className="h-24 w-auto" />
          </Link>
          <AccountDropdown />
        </div>

        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-2">First-Generation Student Resources</h1>
          <p className="text-white text-lg mb-8">Tools and resources to help you navigate your college journey</p>

          <Tabs defaultValue="checklist" className="mb-8">
            <TabsList className="bg-white/20 text-white w-full justify-start mb-6 rounded-lg overflow-hidden">
              <TabsTrigger value="checklist" className="data-[state=active]:bg-white data-[state=active]:text-purple-800">
                Application Checklist
              </TabsTrigger>
              <TabsTrigger value="resources" className="data-[state=active]:bg-white data-[state=active]:text-purple-800">
                Helpful Resources
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="checklist" className="mt-0">
              <FirstGenChecklist />
            </TabsContent>
            
            <TabsContent value="resources" className="mt-0">
              <ResourcesTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>;
};

export default FirstGenResources;
