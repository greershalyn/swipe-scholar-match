import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PencilIcon, BookOpen, Lightbulb, Star, FileCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AccountDropdown } from '@/components/AccountDropdown';
import { useToast } from '@/components/ui/use-toast';
import { EssaySuggestions } from '@/components/essay/EssaySuggestions';
import { ExpandedFrameworkView } from '@/components/essay/ExpandedFrameworkView';
import { DocumentReviewTool } from '@/components/essay/DocumentReviewTool';
import { analyzeEssayTopic, generateEssaySuggestions } from '@/utils/essayUtils';
import { EssaySuggestion, ExpandedFramework } from '@/types/essay';

type StepType = 1 | 2 | 3 | 4;

const EssayAssistant = () => {
  const { toast } = useToast();
  const [step, setStep] = useState<StepType>(1);
  const [essayTopic, setEssayTopic] = useState('');
  const [selectedPrompt, setSelectedPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [suggestions, setSuggestions] = useState<EssaySuggestion[]>([]);
  const [expandedFramework, setExpandedFramework] = useState<ExpandedFramework | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (step === 2 && essayTopic) {
      const relevantPrompt = analyzeEssayTopic(essayTopic);
      setSelectedPrompt(relevantPrompt);
    } else if (step === 3 && response) {
      setIsLoading(true);
      generateEssaySuggestions(essayTopic, response)
        .then(aiSuggestions => {
          setSuggestions(aiSuggestions);
        })
        .catch(error => {
          toast({
            title: "Error Generating Suggestions",
            description: "We'll provide some general suggestions instead.",
            variant: "destructive",
          });
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [step, essayTopic, response]);

  const handleNextStep = () => {
    if (step === 1 && !essayTopic.trim()) {
      toast({
        title: "Topic Required",
        description: "Please enter your essay topic before continuing.",
        variant: "destructive",
      });
      return;
    }
    if (step === 2 && !response.trim()) {
      toast({
        title: "Response Required",
        description: "Please share your personal insight before continuing.",
        variant: "destructive",
      });
      return;
    }
    if (step === 3 && !expandedFramework) {
      toast({
        title: "Selection Required",
        description: "Please select an essay approach before continuing.",
        variant: "destructive",
      });
      return;
    }
    setStep((prevStep: StepType) => {
      const nextStep = prevStep + 1;
      return nextStep as StepType;
    });
  };

  const handlePreviousStep = () => {
    setStep((prevStep: StepType) => {
      const nextStep = prevStep - 1;
      return nextStep as StepType;
    });
  };

  const handleFrameworkGenerated = (framework: ExpandedFramework) => {
    setExpandedFramework(framework);
  };

  const isFirstStep = step === 1;
  const isLastStep = step === 4;

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
            <TabsList className="grid grid-cols-2 w-[400px] mb-6">
              <TabsTrigger value="framework" className="flex gap-2">
                <PencilIcon className="h-4 w-4" />
                Essay Framework
              </TabsTrigger>
              <TabsTrigger value="review" className="flex gap-2">
                <FileCheck className="h-4 w-4" />
                Essay Review
              </TabsTrigger>
            </TabsList>

            <TabsContent value="framework">
              <Card className="bg-slate-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {step === 1 && <BookOpen className="h-5 w-5" />}
                    {step === 2 && <Lightbulb className="h-5 w-5" />}
                    {step === 3 && <Star className="h-5 w-5" />}
                    {step === 4 && <PencilIcon className="h-5 w-5" />}
                    {step === 1 && "Essay Topic"}
                    {step === 2 && "Personal Insight"}
                    {step === 3 && "Essay Suggestions"}
                    {step === 4 && "Your Framework"}
                  </CardTitle>
                  <CardDescription>
                    {step === 1 && "Start by sharing your scholarship essay topic or prompt"}
                    {step === 2 && "Let's explore your unique perspective"}
                    {step === 3 && "Choose from these personalized essay approaches"}
                    {step === 4 && "Here's your detailed essay framework"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {step === 1 && (
                    <div className="space-y-4">
                      <Label htmlFor="essay-topic">Scholarship Essay Topic</Label>
                      <Textarea
                        id="essay-topic"
                        placeholder="Enter the scholarship essay topic or prompt here..."
                        value={essayTopic}
                        onChange={(e) => setEssayTopic(e.target.value)}
                        className="h-32"
                      />
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-4">
                      <p className="font-medium mb-4">{selectedPrompt}</p>
                      <Textarea
                        value={response}
                        onChange={(e) => setResponse(e.target.value)}
                        placeholder="Share your thoughts and personal experiences..."
                        className="h-32"
                      />
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-6">
                      {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
                        </div>
                      ) : (
                        <EssaySuggestions 
                          suggestions={suggestions} 
                          essayTopic={essayTopic}
                          personalResponse={response}
                          onFrameworkGenerated={handleFrameworkGenerated}
                        />
                      )}
                    </div>
                  )}

                  {step === 4 && expandedFramework && (
                    <ExpandedFrameworkView framework={expandedFramework} />
                  )}

                  <div className="flex justify-between mt-6">
                    <Button
                      variant="outline"
                      onClick={handlePreviousStep}
                      disabled={isFirstStep}
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={handleNextStep}
                      disabled={isLastStep || (step === 3 && !expandedFramework)}
                    >
                      {isLastStep ? 'Done' : 'Next Step'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="review">
              <Card className="bg-slate-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileCheck className="h-5 w-5" />
                    Essay Review
                  </CardTitle>
                  <CardDescription>
                    Upload your essay for AI-powered grammar and clarity review
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DocumentReviewTool />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default EssayAssistant;
