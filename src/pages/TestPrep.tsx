
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileSpreadsheet, BookOpen, GraduationCap } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSubscriptionCheck } from '@/hooks/useSubscriptionCheck';
import { PremiumAccessPrompt } from '@/components/essay/PremiumAccessPrompt';
import { useToast } from '@/hooks/use-toast';

// Import refactored components
import TestPrepHeader from '@/components/testprep/TestPrepHeader';
import LoadingState from '@/components/testprep/LoadingState';
import ACTContent from '@/components/testprep/ACTContent';
import SATContent from '@/components/testprep/SATContent';

const TestPrep = () => {
  const { hasPremiumAccess, isCheckingAccess, refreshSubscription } = useSubscriptionCheck();
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);
  const [activeQuizzes, setActiveQuizzes] = useState<Record<string, boolean>>({});
  const { toast } = useToast();
  const isMobile = useIsMobile();

  if (isCheckingAccess) {
    return <LoadingState />;
  }

  // If user doesn't have premium access, show the premium prompt
  if (!hasPremiumAccess) {
    return (
      <PremiumAccessPrompt
        showSubscriptionDialog={showSubscriptionDialog}
        setShowSubscriptionDialog={setShowSubscriptionDialog}
        onRefreshSubscription={refreshSubscription}
      />
    );
  }

  const toggleQuiz = (quizId: string) => {
    setActiveQuizzes(prev => ({
      ...prev,
      [quizId]: !prev[quizId]
    }));
  };

  const handleQuizComplete = (sectionTitle: string, score: number, total: number) => {
    const percentage = Math.round((score / total) * 100);
    
    toast({
      title: `${sectionTitle} Quiz Completed!`,
      description: `You scored ${score} out of ${total} (${percentage}%)`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className={`container px-2 md:px-4 ${isMobile ? 'py-2' : 'py-4 md:py-8'}`}>
        <div className="max-w-3xl mx-auto">
          <div className={`flex items-center gap-2 md:gap-3 ${isMobile ? 'mb-3' : 'mb-4 md:mb-8'}`}>
            <GraduationCap className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6 md:h-8 md:w-8'} text-primary`} />
            <h1 className={`${isMobile ? 'text-lg' : 'text-2xl md:text-4xl'} font-bold text-foreground`}>Test Prep</h1>
          </div>

          <Tabs defaultValue="act" className={`${isMobile ? 'mb-4' : 'mb-8'}`}>
            <TabsList className={`grid grid-cols-2 ${isMobile ? 'w-full' : 'w-[400px]'} ${isMobile ? 'mb-4' : 'mb-6'}`}>
              <TabsTrigger value="act" className="flex gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                ACT Prep
              </TabsTrigger>
              <TabsTrigger value="sat" className="flex gap-2">
                <BookOpen className="h-4 w-4" />
                SAT Prep
              </TabsTrigger>
            </TabsList>

            <TabsContent value="act">
              <ACTContent 
                activeQuizzes={activeQuizzes} 
                toggleQuiz={toggleQuiz}
                handleQuizComplete={handleQuizComplete}
              />
            </TabsContent>

            <TabsContent value="sat">
              <SATContent 
                activeQuizzes={activeQuizzes} 
                toggleQuiz={toggleQuiz}
                handleQuizComplete={handleQuizComplete}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default TestPrep;
