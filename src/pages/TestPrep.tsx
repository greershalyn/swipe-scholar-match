
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileSpreadsheet, BookOpen, GraduationCap } from 'lucide-react';
import { useSubscriptionCheck } from '@/hooks/useSubscriptionCheck';
import { PremiumAccessPrompt } from '@/components/essay/PremiumAccessPrompt';
import { useToast } from '@/hooks/use-toast';

// Import refactored components
import TestPrepHeader from '@/components/testprep/TestPrepHeader';
import LoadingState from '@/components/testprep/LoadingState';
import ACTContent from '@/components/testprep/ACTContent';
import SATContent from '@/components/testprep/SATContent';

const TestPrep = () => {
  const { hasPremiumAccess, isCheckingAccess } = useSubscriptionCheck();
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);
  const [activeQuizzes, setActiveQuizzes] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  if (isCheckingAccess) {
    return <LoadingState />;
  }

  // If user doesn't have premium access, show the premium prompt
  if (!hasPremiumAccess) {
    return (
      <PremiumAccessPrompt
        showSubscriptionDialog={showSubscriptionDialog}
        setShowSubscriptionDialog={setShowSubscriptionDialog}
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
    <div className="min-h-screen bg-gradient-to-b from-[#9b87f5] via-[#D946EF] to-[#FDE1D3]">
      <div className="container px-4 py-8">
        <TestPrepHeader />

        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <GraduationCap className="h-8 w-8 text-white" />
            <h1 className="text-4xl font-bold text-white">Test Prep</h1>
          </div>

          <Tabs defaultValue="act" className="mb-8">
            <TabsList className="grid grid-cols-2 w-[400px] mb-6">
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
