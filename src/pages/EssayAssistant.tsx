
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PencilIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  const [step, setStep] = useState<StepType>(1);
  const [essayTopic, setEssayTopic] = useState('');
  const [selectedPrompt, setSelectedPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [suggestions, setSuggestions] = useState<EssaySuggestion[]>([]);
  const [expandedFramework, setExpandedFramework] = useState<ExpandedFramework | null>(null);
  const [isLoading, setIsLoading] = useState(false);
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
      <div className="min-h-screen bg-gradient-to-b from-[#9b87f5] via-[#D946EF] to-[#FDE1D3] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
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
    <div className="min-h-screen bg-gradient-to-b from-[#9b87f5] via-[#D946EF] to-[#FDE1D3]">
      <div className="container px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <Link to="/">
            <img 
              src="/lovable-uploads/24f07198-1e4c-4eea-8e07-259aa77d1711.png"
              alt="SwipeScholar Logo"
              className="h-24 w-auto"
            />
          </Link>
          <AccountDropdown />
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <PencilIcon className="h-8 w-8 text-white" />
            <h1 className="text-4xl font-bold text-white">Essay Assistant</h1>
          </div>

          <Tabs defaultValue="framework" className="mb-8">
            <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto mb-6">
              <TabsTrigger value="framework" className="flex gap-2">
                <PencilIcon className="h-4 w-4" />
                Essay Framework
              </TabsTrigger>
              <TabsTrigger value="review" className="flex gap-2">
                <DocumentReviewTool />
                Essay Review
              </TabsTrigger>
            </TabsList>

            <TabsContent value="framework">
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

            <TabsContent value="review">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <DocumentReviewTool />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default EssayAssistant;
