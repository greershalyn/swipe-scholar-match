
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PencilIcon, BookOpen, Lightbulb, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { AccountDropdown } from '@/components/AccountDropdown';
import { useToast } from '@/components/ui/use-toast';

const EssayAssistant = () => {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [essayTopic, setEssayTopic] = useState('');
  const [currentPrompt, setCurrentPrompt] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});

  const personalInsightPrompts = [
    "If you had to describe yourself using only one object you own, what would it be and why?",
    "What is a challenge you've faced that changed your perspective on life?",
    "If your favorite hobby could teach a life lesson, what would it be?",
    "What's a tradition or routine in your life that holds special meaning to you?",
    "Imagine you're writing a letter to your younger self—what advice would you give?",
  ];

  const handleNextStep = () => {
    if (step === 1 && !essayTopic.trim()) {
      toast({
        title: "Topic Required",
        description: "Please enter your essay topic before continuing.",
        variant: "destructive",
      });
      return;
    }
    if (step < 3) setStep(step + 1);
  };

  const handlePreviousStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handlePromptResponse = (response: string) => {
    setResponses({
      ...responses,
      [currentPrompt]: response,
    });
  };

  const handleNextPrompt = () => {
    if (!responses[currentPrompt]?.trim()) {
      toast({
        title: "Response Required",
        description: "Please answer the current prompt before continuing.",
        variant: "destructive",
      });
      return;
    }
    if (currentPrompt < personalInsightPrompts.length - 1) {
      setCurrentPrompt(currentPrompt + 1);
    } else {
      handleNextStep();
    }
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

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {step === 1 && <BookOpen className="h-5 w-5" />}
                {step === 2 && <Lightbulb className="h-5 w-5" />}
                {step === 3 && <Star className="h-5 w-5" />}
                {step === 1 && "Essay Topic"}
                {step === 2 && "Personal Insights"}
                {step === 3 && "Essay Structure"}
              </CardTitle>
              <CardDescription>
                {step === 1 && "Start by sharing your scholarship essay topic or prompt"}
                {step === 2 && "Let's explore your unique perspective"}
                {step === 3 && "Here's your personalized essay framework"}
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
                  <p className="font-medium mb-4">{personalInsightPrompts[currentPrompt]}</p>
                  <Textarea
                    value={responses[currentPrompt] || ''}
                    onChange={(e) => handlePromptResponse(e.target.value)}
                    placeholder="Share your thoughts..."
                    className="h-32"
                  />
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2">Your Essay Framework</h3>
                    <div className="space-y-4">
                      <Card>
                        <CardContent className="pt-6">
                          <h4 className="font-medium mb-2">Introduction</h4>
                          <p className="text-sm text-muted-foreground">
                            Begin with the personal object you described: {responses[0]?.slice(0, 100)}...
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <h4 className="font-medium mb-2">Body Paragraphs</h4>
                          <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                            <li>Connect your challenge to the essay topic: {responses[1]?.slice(0, 80)}...</li>
                            <li>Elaborate on your life lesson through your hobby: {responses[2]?.slice(0, 80)}...</li>
                            <li>Describe how your tradition shapes your perspective: {responses[3]?.slice(0, 80)}...</li>
                          </ul>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <h4 className="font-medium mb-2">Conclusion</h4>
                          <p className="text-sm text-muted-foreground">
                            Reflect on your advice to your younger self: {responses[4]?.slice(0, 100)}...
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between mt-6">
                <Button
                  variant="outline"
                  onClick={handlePreviousStep}
                  disabled={step === 1}
                >
                  Previous
                </Button>
                <Button
                  onClick={step === 2 ? handleNextPrompt : handleNextStep}
                  disabled={step === 3}
                >
                  {step === 2 && currentPrompt < personalInsightPrompts.length - 1 ? "Next Prompt" : "Next Step"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EssayAssistant;
