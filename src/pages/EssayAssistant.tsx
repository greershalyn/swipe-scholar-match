import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PencilIcon, BookOpen, Lightbulb, Star, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { AccountDropdown } from '@/components/AccountDropdown';
import { useToast } from '@/components/ui/use-toast';

interface EssaySuggestion {
  title: string;
  hook: string;
  framework: string;
}

const EssayAssistant = () => {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [essayTopic, setEssayTopic] = useState('');
  const [selectedPrompt, setSelectedPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [suggestions, setSuggestions] = useState<EssaySuggestion[]>([]);

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

  const generateEssaySuggestions = () => {
    const topicLower = essayTopic.toLowerCase();
    const responseLower = response.toLowerCase();
    
    let suggestions: EssaySuggestion[] = [];

    if (topicLower.includes('challenge') || topicLower.includes('obstacle') || topicLower.includes('difficult')) {
      suggestions = [
        {
          title: "Turning Obstacles into Opportunities",
          hook: `"${response.slice(0, 50)}..." This moment wasn't just a challenge - it was a turning point.`,
          framework: "Show how this specific challenge revealed your strength, resilience, and ability to adapt. Connect these qualities to your future goals."
        },
        {
          title: "The Power of Perspective",
          hook: "Sometimes the biggest obstacles reveal our greatest potential.",
          framework: "Demonstrate how your experience changed your perspective and equipped you with unique problem-solving abilities."
        },
        {
          title: "From Setback to Comeback",
          hook: "What seemed like a roadblock became my launching pad.",
          framework: "Illustrate how overcoming this challenge taught you valuable lessons that will benefit your academic and professional journey."
        }
      ];
    } else if (topicLower.includes('lead') || topicLower.includes('influence')) {
      suggestions = [
        {
          title: "Leadership Through Action",
          hook: `When ${response.slice(0, 40)}... I discovered that leadership isn't about titles - it's about impact.`,
          framework: "Explore how your experience demonstrates authentic leadership through initiative and positive influence."
        },
        {
          title: "Building Bridges, Creating Change",
          hook: "True leadership begins with understanding others' needs.",
          framework: "Show how your leadership style focuses on bringing people together and creating meaningful change."
        },
        {
          title: "The Ripple Effect of Leadership",
          hook: "One small action can create waves of change.",
          framework: "Describe how your leadership experience created a lasting impact that extended beyond the initial situation."
        }
      ];
    } else if (topicLower.includes('passion') || topicLower.includes('interest')) {
      suggestions = [
        {
          title: "Where Passion Meets Purpose",
          hook: `My journey with ${response.slice(0, 30)} isn't just about personal interest - it's about creating impact.`,
          framework: "Connect your passion to broader goals and show how it drives your academic and professional aspirations."
        },
        {
          title: "The Journey of Discovery",
          hook: "Some passions are born; others are discovered through experience.",
          framework: "Illustrate how your passion evolved and shaped your perspective on your future career and goals."
        },
        {
          title: "From Interest to Innovation",
          hook: "What started as curiosity transformed into a calling.",
          framework: "Demonstrate how your passion has equipped you with unique skills and insights for your chosen field."
        }
      ];
    } else {
      suggestions = [
        {
          title: "A Personal Journey of Growth",
          hook: `"${response.slice(0, 50)}..." This experience shaped not just what I do, but who I am.`,
          framework: "Connect your personal story to larger themes of growth, learning, and future impact."
        },
        {
          title: "Breaking New Ground",
          hook: "Every experience, whether big or small, has the potential to create lasting change.",
          framework: "Show how your unique perspective and experiences position you to make meaningful contributions."
        },
        {
          title: "The Power of Personal Experience",
          hook: "Sometimes life's most important lessons come from unexpected places.",
          framework: "Illustrate how your personal journey has prepared you for future challenges and opportunities."
        }
      ];
    }

    return suggestions;
  };

  useEffect(() => {
    if (step === 2 && essayTopic) {
      const relevantPrompt = analyzeEssayTopic(essayTopic);
      setSelectedPrompt(relevantPrompt);
    } else if (step === 3 && response) {
      setSuggestions(generateEssaySuggestions());
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
                {step === 3 && "Essay Suggestions"}
              </CardTitle>
              <CardDescription>
                {step === 1 && "Start by sharing your scholarship essay topic or prompt"}
                {step === 2 && "Let's explore your unique perspective"}
                {step === 3 && "Choose from these personalized essay approaches"}
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
                    <h3 className="font-semibold mb-4">Essay Approaches</h3>
                    <div className="space-y-6">
                      {suggestions.map((suggestion, index) => (
                        <Card key={index} className="hover:shadow-md transition-shadow">
                          <CardContent className="pt-6">
                            <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                              <ArrowRight className="h-4 w-4" />
                              {suggestion.title}
                            </h4>
                            <div className="space-y-3">
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Opening Hook:</p>
                                <p className="text-sm">{suggestion.hook}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Essay Framework:</p>
                                <p className="text-sm">{suggestion.framework}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

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
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EssayAssistant;
