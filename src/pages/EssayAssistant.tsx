
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PencilIcon, FileText } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { AccountDropdown } from '@/components/AccountDropdown';
import { useSubscriptionCheck } from '@/hooks/useSubscriptionCheck';
import { PremiumAccessPrompt } from '@/components/essay/PremiumAccessPrompt';
import { EssayEditor } from '@/components/essay/EssayEditor';
import { DocumentReviewTool } from '@/components/essay/DocumentReviewTool';
import { analyzeEssayTopic, generateEssaySuggestions } from '@/utils/essayUtils';
import { EssaySuggestion, ExpandedFramework } from '@/types/essay';
import { useToast } from '@/hooks/use-toast';

type StepType = 1 | 2 | 3 | 4;

const EssayAssistant = () => {
  const { hasPremiumAccess, isCheckingAccess, refreshSubscription } = useSubscriptionCheck();
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);
  const isMobile = useIsMobile();
  const [step, setStep] = useState<StepType>(1);
  const [essayTopic, setEssayTopic] = useState('');
  const [selectedPrompt, setSelectedPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [suggestions, setSuggestions] = useState<EssaySuggestion[]>([]);
  const [expandedFramework, setExpandedFramework] = useState<ExpandedFramework | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('framework');
  const { toast } = useToast();

  useEffect(() => {
    if (step === 2 && !selectedPrompt && essayTopic) {
      try {
        const prompt = analyzeEssayTopic(essayTopic);
        setSelectedPrompt(prompt);
      } catch (error) {
        console.error('Error analyzing essay topic:', error);
        toast({
          title: "Error",
          description: "Failed to analyze your essay topic. Please try again.",
          variant: "destructive",
        });
      }
    }

    if (step === 3 && suggestions.length === 0 && !isLoading && essayTopic && response) {
      const fetchSuggestions = async () => {
        setIsLoading(true);
        try {
          const fetchedSuggestions = await generateEssaySuggestions(essayTopic, response);
          setSuggestions(fetchedSuggestions);
        } catch (error) {
          console.error('Error generating suggestions:', error);
          toast({
            title: "Error",
            description: "Failed to generate essay suggestions. Please try again.",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchSuggestions();
    }
  }, [step, essayTopic, response, suggestions.length, isLoading, toast, selectedPrompt]);

  if (isCheckingAccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  // If user doesn't have premium access, show the premium prompt with direct payment link
  if (!hasPremiumAccess) {
    return (
      <PremiumAccessPrompt
        showSubscriptionDialog={showSubscriptionDialog}
        setShowSubscriptionDialog={setShowSubscriptionDialog}
        onRefreshSubscription={refreshSubscription}
      />
    );
  }

  const handleNextStep = () => {
    if (step === 4) return;
    
    setStep((prevStep: StepType) => {
      const nextStep = prevStep + 1;
      return nextStep as StepType;
    });
  };

  const handlePreviousStep = () => {
    if (step === 1) return;
    
    setStep((prevStep: StepType) => {
      const nextStep = prevStep - 1;
      return nextStep as StepType;
    });
  };

  const handleFrameworkGenerated = (framework: ExpandedFramework) => {
    setExpandedFramework(framework);
    // Automatically move to the next step when a framework is selected
    handleNextStep();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className={`container px-4 ${isMobile ? 'py-4' : 'py-8'}`}>
        <div className={`flex justify-between items-center ${isMobile ? 'mb-4' : 'mb-8'}`}>
          <Link to="/">
            <img 
              src="/lovable-uploads/24f07198-1e4c-4eea-8e07-259aa77d1711.png"
              alt="SwipeScholar Logo"
              className={`${isMobile ? 'h-20' : 'h-32'} w-auto invert`}
            />
          </Link>
          <AccountDropdown />
        </div>

        <div className="max-w-3xl mx-auto">
          <div className={`flex items-center gap-3 ${isMobile ? 'mb-4' : 'mb-8'}`}>
            <PencilIcon className={`${isMobile ? 'h-6 w-6' : 'h-8 w-8'} text-primary`} />
            <h1 className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-bold text-foreground`}>Essay Assistant</h1>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className={`${isMobile ? 'mb-4' : 'mb-8'}`}>
            <TabsList className={`grid grid-cols-2 w-full ${isMobile ? 'max-w-full' : 'max-w-md'} mx-auto ${isMobile ? 'mb-4' : 'mb-6'}`}>
              <TabsTrigger value="framework" className="flex gap-2 items-center justify-center">
                <PencilIcon className="h-4 w-4" />
                Essay Framework
              </TabsTrigger>
              <TabsTrigger value="review" className="flex gap-2 items-center justify-center">
                <FileText className="h-4 w-4" />
                Essay Review
              </TabsTrigger>
            </TabsList>

            <TabsContent value="framework" className="mt-4">
              <EssayEditor
                step={step}
                essayTopic={essayTopic}
                setEssayTopic={setEssayTopic}
                selectedPrompt={selectedPrompt}
                response={response}
                setResponse={setResponse}
                suggestions={suggestions}
                expandedFramework={expandedFramework}
                isLoading={isLoading}
                onFrameworkGenerated={handleFrameworkGenerated}
                onNextStep={handleNextStep}
                onPreviousStep={handlePreviousStep}
              />
            </TabsContent>

            <TabsContent value="review" className="mt-4">
              <Card className="bg-slate-50 p-6 rounded-lg shadow">
                <DocumentReviewTool />
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default EssayAssistant;
