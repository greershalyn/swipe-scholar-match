
import React from 'react';
import { PencilIcon, BookOpen, Lightbulb, Star, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { EssaySuggestions } from './EssaySuggestions';
import { ExpandedFrameworkView } from './ExpandedFrameworkView';
import { EssaySuggestion, ExpandedFramework } from '@/types/essay';
import { useToast } from '@/components/ui/use-toast';

interface EssayEditorProps {
  step: number;
  essayTopic: string;
  setEssayTopic: (topic: string) => void;
  selectedPrompt: string;
  response: string;
  setResponse: (response: string) => void;
  suggestions: EssaySuggestion[];
  expandedFramework: ExpandedFramework | null;
  isLoading: boolean;
  onFrameworkGenerated: (framework: ExpandedFramework) => void;
  onNextStep: () => void;
  onPreviousStep: () => void;
}

export const EssayEditor = ({
  step,
  essayTopic,
  setEssayTopic,
  selectedPrompt,
  response,
  setResponse,
  suggestions,
  expandedFramework,
  isLoading,
  onFrameworkGenerated,
  onNextStep,
  onPreviousStep
}: EssayEditorProps) => {
  const { toast } = useToast();
  const isFirstStep = step === 1;
  const isLastStep = step === 4;

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
    onNextStep();
  };

  return (
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
                onFrameworkGenerated={onFrameworkGenerated}
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
            onClick={onPreviousStep}
            disabled={isFirstStep}
            className="min-w-[100px]"
          >
            Previous
          </Button>
          <Button
            onClick={handleNextStep}
            disabled={isLastStep || (step === 3 && !expandedFramework)}
            className="min-w-[100px]"
          >
            {isLastStep ? 'Done' : 'Next Step'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
