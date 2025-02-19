
import React, { useState, useEffect } from 'react';
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
  const [selectedPrompt, setSelectedPrompt] = useState('');
  const [response, setResponse] = useState('');

  const promptCategories = {
    adversity: [
      "What is a challenge you've faced that changed your perspective on life?",
      "Describe a time when you had to overcome a significant obstacle. What did you learn?",
      "Tell me about a moment when you felt like giving up but persisted anyway.",
    ],
    leadership: [
      "Share an experience where you had to take initiative or lead others.",
      "Describe a situation where you influenced positive change in your community.",
      "Tell me about a time when you had to make a difficult decision that affected others.",
    ],
    passion: [
      "If your favorite hobby could teach a life lesson, what would it be?",
      "What drives you to pursue your chosen field of study?",
      "Describe a project or activity that makes you lose track of time.",
    ],
    impact: [
      "What's a tradition or routine in your life that holds special meaning to you?",
      "How do you hope to make a difference in your community or field?",
      "Describe a moment when you realized your potential to create change.",
    ],
    growth: [
      "Imagine you're writing a letter to your younger self—what advice would you give?",
      "How has your background shaped your goals and aspirations?",
      "Describe a moment that transformed your understanding of success.",
    ]
  };

  const analyzeEssayTopic = (topic: string) => {
    const topicLower = topic.toLowerCase();
    
    if (topicLower.includes('challenge') || topicLower.includes('obstacle') || topicLower.includes('difficult')) {
      return promptCategories.adversity[0];
    }
    if (topicLower.includes('lead') || topicLower.includes('guide') || topicLower.includes('influence')) {
      return promptCategories.leadership[0];
    }
    if (topicLower.includes('passion') || topicLower.includes('interest') || topicLower.includes('career')) {
      return promptCategories.passion[0];
    }
    if (topicLower.includes('community') || topicLower.includes('impact') || topicLower.includes('change')) {
      return promptCategories.impact[0];
    }
    // Default to growth if no specific category is detected
    return promptCategories.growth[0];
  };

  useEffect(() => {
    if (step === 2 && essayTopic) {
      const relevantPrompt = analyzeEssayTopic(essayTopic);
      setSelectedPrompt(relevantPrompt);
    }
  }, [step, essayTopic]);

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
    if (step < 3) setStep(step + 1);
  };

  const handlePreviousStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const generateEssayStructure = () => {
    const topicWords = essayTopic.toLowerCase().split(' ');
    let structureIntro = "Begin with your personal anecdote: ";
    let structureBody = "Connect your experience to the essay topic by ";
    let structureConclusion = "Conclude by demonstrating how ";

    if (topicWords.some(word => ['challenge', 'obstacle', 'overcome'].includes(word))) {
      structureBody += "showing how your personal challenge relates to broader obstacles and solutions";
      structureConclusion += "this experience has prepared you to face future challenges";
    } else if (topicWords.some(word => ['lead', 'leadership', 'initiative'].includes(word))) {
      structureBody += "highlighting the leadership qualities demonstrated in your story";
      structureConclusion += "these leadership experiences will contribute to your future goals";
    } else {
      structureBody += "exploring how your personal insight demonstrates your unique perspective";
      structureConclusion += "your experiences and values align with the scholarship's mission";
    }

    return { structureIntro, structureBody, structureConclusion };
  };

  const { structureIntro, structureBody, structureConclusion } = generateEssayStructure();

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

          <Card className="mb-8 bg-slate-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {step === 1 && <BookOpen className="h-5 w-5" />}
                {step === 2 && <Lightbulb className="h-5 w-5" />}
                {step === 3 && <Star className="h-5 w-5" />}
                {step === 1 && "Essay Topic"}
                {step === 2 && "Personal Insight"}
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
                  <div>
                    <h3 className="font-semibold mb-2">Your Essay Framework</h3>
                    <div className="space-y-4">
                      <Card>
                        <CardContent className="pt-6">
                          <h4 className="font-medium mb-2">Introduction</h4>
                          <p className="text-sm text-muted-foreground">
                            {structureIntro} {response.slice(0, 100)}...
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <h4 className="font-medium mb-2">Body Development</h4>
                          <p className="text-sm text-muted-foreground">{structureBody}</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <h4 className="font-medium mb-2">Conclusion</h4>
                          <p className="text-sm text-muted-foreground">{structureConclusion}</p>
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
                  onClick={handleNextStep}
                  disabled={step === 3}
                >
                  Next Step
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
