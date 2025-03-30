
import React from 'react';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AccountDropdown } from '@/components/AccountDropdown';
import ApplicationChecklist from '@/components/first-gen/ApplicationChecklist';
import ResourcesTab from '@/components/first-gen/ResourcesTab';
import SurvivalGuideTab from '@/components/first-gen/SurvivalGuideTab';
import FamilyConversationsTab from '@/components/first-gen/FamilyConversationsTab';

const FirstGenResources = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#9b87f5] via-[#D946EF] to-[#FDE1D3]">
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
              <TabsTrigger value="survival-guide" className="data-[state=active]:bg-white data-[state=active]:text-purple-800">
                Survival Guide
              </TabsTrigger>
              <TabsTrigger value="family-conversations" className="data-[state=active]:bg-white data-[state=active]:text-purple-800">
                Family Conversations
              </TabsTrigger>
              <TabsTrigger value="resources" className="data-[state=active]:bg-white data-[state=active]:text-purple-800">
                Helpful Resources
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="checklist" className="mt-0">
              <ApplicationChecklist />
            </TabsContent>
            
            <TabsContent value="survival-guide" className="mt-0">
              <SurvivalGuideTab />
            </TabsContent>
            
            <TabsContent value="family-conversations" className="mt-0">
              <FamilyConversationsTab />
            </TabsContent>
            
            <TabsContent value="resources" className="mt-0">
              <ResourcesTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default FirstGenResources;
