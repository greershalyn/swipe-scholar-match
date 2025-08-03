
import React from 'react';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIsMobile } from '@/hooks/use-mobile';

import ApplicationChecklist from '@/components/first-gen/ApplicationChecklist';
import ResourcesTab from '@/components/first-gen/ResourcesTab';
import SurvivalGuideTab from '@/components/first-gen/SurvivalGuideTab';
import FamilyConversationsTab from '@/components/first-gen/FamilyConversationsTab';
import ScholarshipsTab from '@/components/first-gen/ScholarshipsTab';

const FirstGenResources = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen bg-background">
      <div className={`container px-4 ${isMobile ? 'py-4' : 'py-8'}`}>
        <div className={`flex justify-between items-center ${isMobile ? 'mb-4' : 'mb-8'}`}>
          <Link to="/">
            <img src="/lovable-uploads/24f07198-1e4c-4eea-8e07-259aa77d1711.png" alt="SwipeScholar Logo" className={`${isMobile ? 'h-24' : 'h-40'} w-auto invert`} />
          </Link>
          
        </div>

        <div className="max-w-4xl mx-auto">
          <h1 className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-bold text-foreground mb-2`}>{isMobile ? 'First-Gen Resources' : 'First-Generation Student Resources'}</h1>
          <p className={`text-muted-foreground ${isMobile ? 'text-base mb-4' : 'text-lg mb-8'}`}>Tools and resources to help you navigate your college journey</p>

          <Tabs defaultValue="checklist" className={`${isMobile ? 'mb-4' : 'mb-8'}`}>
            <TabsList className={`bg-secondary border border-border w-full ${isMobile ? 'grid grid-cols-2 gap-1' : 'justify-start'} ${isMobile ? 'mb-4' : 'mb-6'} rounded-lg overflow-hidden ${isMobile ? 'text-xs' : ''}`}>
              <TabsTrigger value="checklist" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                {isMobile ? 'Checklist' : 'Application Checklist'}
              </TabsTrigger>
              <TabsTrigger value="survival-guide" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                {isMobile ? 'Guide' : 'Survival Guide'}
              </TabsTrigger>
              {!isMobile && (
                <>
                  <TabsTrigger value="family-conversations" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    Family Conversations
                  </TabsTrigger>
                  <TabsTrigger value="scholarships" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    Scholarships
                  </TabsTrigger>
                  <TabsTrigger value="resources" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    Helpful Resources
                  </TabsTrigger>
                </>
              )}
              {isMobile && (
                <>
                  <TabsTrigger value="family-conversations" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground col-span-2">
                    Family Conversations
                  </TabsTrigger>
                  <TabsTrigger value="scholarships" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    Scholarships
                  </TabsTrigger>
                  <TabsTrigger value="resources" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    Resources
                  </TabsTrigger>
                </>
              )}
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
            
            <TabsContent value="scholarships" className="mt-0">
              <ScholarshipsTab />
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
