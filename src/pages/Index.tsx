import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import ScholarshipSwiper from '@/components/ScholarshipSwiper';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { GraduationCap, Rocket, DollarSign, Clock, Sparkles, BookOpen, Users, Trophy, Wallet as WalletIcon, PencilIcon, FileText, Lightbulb, X, Search, Zap } from 'lucide-react';
import { AccountDropdown } from '@/components/AccountDropdown';
import Wallet from '@/components/Wallet';
import { CrawlForm } from '@/components/CrawlForm';
import { useIsMobile } from '@/hooks/use-mobile';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { ExpandedFramework } from '@/types/essay';
import { ExpandedFrameworkView } from '@/components/essay/ExpandedFrameworkView';
import { SquigglyBackground } from '@/components/SquigglyBackground';

const Index = () => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [essayStep, setEssayStep] = useState(1);
  const [essayTopic, setEssayTopic] = useState("Describe a challenge you've faced and how it has prepared you for college.");
  const [showFrameworkPreview, setShowFrameworkPreview] = useState(false);

  const sampleFramework: ExpandedFramework = {
    title: "Turning Obstacles into Growth Opportunities",
    hook: "During my sophomore year, what began as a struggle with time management transformed into one of my most valuable learning experiences, equipping me with skills I'll carry throughout my college journey.",
    talkingPoints: [
      {
        title: "Identifying the Challenge",
        points: [
          "Initially overwhelmed by AP classes and basketball commitments",
          "Missed several key assignment deadlines in the first semester",
          "Struggled with prioritizing competing responsibilities",
          "Felt constantly behind and stressed about academic performance"
        ]
      },
      {
        title: "Developing a Solution",
        points: [
          "Created a detailed planning system with color-coded priorities",
          "Implemented time-blocking techniques for focused work periods",
          "Set up accountability check-ins with a study partner",
          "Communicated challenges with coaches and teachers to find balance"
        ]
      },
      {
        title: "Lessons and Growth",
        points: [
          "Learned to break large projects into manageable daily tasks",
          "Developed self-discipline and metacognition about my work habits",
          "Embraced the importance of asking for help when needed",
          "Discovered my ability to adapt and overcome obstacles independently"
        ]
      }
    ],
    conclusion: "The organizational and resilience skills I developed through this challenge have become foundational to my academic approach. In college, I know I'll face even more complex demands on my time and attention. Rather than fearing these challenges, I'm confident in my ability to apply these tested strategies to thrive in a university environment, balancing academics, activities, and personal growth."
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        setIsAdmin(session.user.email === 'admin@example.com');
      } else {
        setUser(null);
        setIsAdmin(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser(session.user);
        setIsAdmin(session.user.email === 'admin@example.com');
      } else {
        setUser(null);
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out successfully",
        description: "You have been signed out of your account.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem signing out.",
        variant: "destructive",
      });
    }
  };

  const handleEssayNextStep = () => {
    if (essayStep < 3) {
      setEssayStep(essayStep + 1);
    }
  };

  const handleEssayPrevStep = () => {
    if (essayStep > 1) {
      setEssayStep(essayStep - 1);
    }
  };

  const handleChooseApproach = () => {
    setShowFrameworkPreview(true);
  };

  const handleCloseFrameworkPreview = () => {
    setShowFrameworkPreview(false);
    setEssayStep(3);
  };

  const renderEssayPreviewStep = () => {
    switch (essayStep) {
      case 1:
        return (
          <div className="p-4">
            <div className="flex gap-2 items-center mb-4 text-primary">
              <BookOpen className="h-5 w-5" />
              <h3 className="font-semibold">Step 1: Share your essay topic</h3>
            </div>
            <div className="bg-secondary p-4 rounded-md mb-4 text-sm">
              "{essayTopic}"
            </div>
          </div>
        );
      case 2:
        return (
          <div className="p-4">
            <div className="flex gap-2 items-center mb-4 text-primary">
              <Lightbulb className="h-5 w-5" />
              <h3 className="font-semibold">Step 2: Share your personal insight</h3>
            </div>
            <div className="bg-secondary p-4 rounded-md mb-4 text-sm">
              <p className="font-medium mb-2">Tell us about a specific challenge you faced and what you learned from it.</p>
              <p className="italic text-muted-foreground">
                "During my sophomore year, I struggled with time management while juggling AP classes and basketball. 
                After missing several deadlines, I developed a detailed planning system that helped me prioritize 
                tasks and allocate time efficiently. This experience taught me resilience and the importance of 
                organization skills that will be crucial for college."
              </p>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="p-4">
            <div className="flex gap-2 items-center mb-4 text-primary">
              <FileText className="h-5 w-5" />
              <h3 className="font-semibold">Step 3: Select your essay approach</h3>
            </div>
            <div className="bg-secondary p-4 rounded-md mb-4">
              <h4 className="font-medium text-primary mb-2">Growth Mindset Approach</h4>
              <p className="text-sm mb-3">Focus on how this challenge helped you develop resilience and adaptability.</p>
              <div className="mt-2">
                <Button 
                  size="sm" 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground w-full"
                  onClick={handleChooseApproach}
                >
                  Choose This Approach
                </Button>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen min-w-screen bg-background overflow-x-hidden relative">
      <SquigglyBackground />
      <div className={`container px-4 ${isMobile ? 'py-4' : 'py-8'} relative z-10`}>
        <div className="flex justify-end mb-6 pt-safe">
          {user ? (
            <AccountDropdown />
          ) : (
            <Button onClick={() => navigate('/auth')} variant="outline" className="bg-card hover:bg-muted shadow-card-modern">
              Log In
            </Button>
          )}
        </div>

        <div className={`text-center mb-16 animate-fade-in ${isMobile ? 'px-2' : ''}`}>
          <div className="flex justify-center mb-6">
            <GraduationCap className="w-16 h-16 md:w-20 md:h-20 text-primary animate-bounce" />
          </div>
          <h1 className={`${isMobile ? 'text-5xl' : 'text-7xl'} font-bold text-primary mb-6 drop-shadow-lg`}>
            SwipeScholar
          </h1>
          <p className="text-lg md:text-2xl text-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Find Your Perfect Scholarship Match with a Simple Swipe! Join students across the country who are securing their funding through SwipeScholar.
          </p>
          {!user && (
            <Button 
              onClick={() => navigate('/auth')} 
              className={`bg-primary text-primary-foreground hover:bg-primary/90 ${isMobile ? 'px-6 py-4 text-lg' : 'px-8 py-6 text-xl'} rounded-full shadow-glow hover:scale-105 transition-transform animate-pulse`}
            >
              <Sparkles className="mr-2 h-5 w-5 md:h-6 md:w-6" />
              Start Your Journey Today
            </Button>
          )}
        </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 mb-16">
            <div className="bg-card/95 p-6 md:p-8 rounded-2xl shadow-card-modern hover:scale-105 transition-transform group">
              <div className="flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-primary rounded-2xl mb-4 md:mb-6 mx-auto group-hover:rotate-12 transition-transform">
                <Rocket className="text-primary-foreground w-6 h-6 md:w-8 md:h-8" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-primary mb-3 md:mb-4 text-center">Quick & Easy</h3>
              <p className="text-sm md:text-base text-muted-foreground text-center leading-relaxed">Swipe right on scholarships that match your profile - as simple as using your favorite social app!</p>
            </div>

            <div className="bg-card/95 p-6 md:p-8 rounded-2xl shadow-card-modern hover:scale-105 transition-transform group">
              <div className="flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-accent rounded-2xl mb-4 md:mb-6 mx-auto group-hover:rotate-12 transition-transform">
                <BookOpen className="text-accent-foreground w-6 h-6 md:w-8 md:h-8" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-accent mb-3 md:mb-4 text-center">Personalized Matches</h3>
              <p className="text-sm md:text-base text-muted-foreground text-center leading-relaxed">Get scholarships tailored to your unique academic profile and interests</p>
            </div>

            <div className="bg-card/95 p-6 md:p-8 rounded-2xl shadow-card-modern hover:scale-105 transition-transform group">
              <div className="flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-primary rounded-2xl mb-4 md:mb-6 mx-auto group-hover:rotate-12 transition-transform">
                <DollarSign className="text-primary-foreground w-6 h-6 md:w-8 md:h-8" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-primary mb-3 md:mb-4 text-center">Save Money</h3>
              <p className="text-sm md:text-base text-muted-foreground text-center leading-relaxed">Access thousands of dollars in scholarship opportunities just waiting for you</p>
            </div>

            <div className="bg-card/95 p-6 md:p-8 rounded-2xl shadow-card-modern hover:scale-105 transition-transform group">
              <div className="flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-accent rounded-2xl mb-4 md:mb-6 mx-auto group-hover:rotate-12 transition-transform">
                <Clock className="text-accent-foreground w-6 h-6 md:w-8 md:h-8" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-accent mb-3 md:mb-4 text-center">Save Time</h3>
              <p className="text-sm md:text-base text-muted-foreground text-center leading-relaxed">Apply to multiple scholarships efficiently with your single profile</p>
            </div>
          </div>

        {user && (
          <>
            <div className={`max-w-md mx-auto mb-24 ${isMobile ? 'px-2' : ''}`}>
              <ScholarshipSwiper />
              <div className="-mt-12 text-center mb-8">
                <p className="text-lg text-foreground font-medium">
                  Swipe right to save to wallet, left to skip
                </p>
              </div>
            </div>
            
            {isAdmin && (
              <div className="max-w-2xl mx-auto mb-12">
                <h2 className="text-2xl font-semibold text-foreground mb-6">Add New Scholarship</h2>
                <CrawlForm />
              </div>
            )}

            <div className="max-w-7xl mx-auto bg-card/95 rounded-xl p-6 md:p-8 shadow-card-modern">
              <h2 className="text-2xl font-semibold text-accent mb-6 flex items-center gap-2">
                <WalletIcon className="h-6 w-6" />
                Your Scholarship Wallet
              </h2>
              <Wallet className="mt-4" />
            </div>
          </>
        )}

        {!user && (
          <div className="text-center mb-16 bg-card/90 p-8 md:p-12 rounded-3xl shadow-card-modern animate-fade-in">
            <div className="mb-8">
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
                Unlock Premium Essay Tools
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
                Your scholarship essays deserve the best. Our AI-powered Essay Assistant helps you craft winning applications.
                <span className="block text-primary font-bold mt-2 text-xl">
                  Just $10/month - Cancel Anytime!
                </span>
              </p>
            </div>
            
            <div className="max-w-4xl mx-auto bg-gradient-secondary rounded-xl shadow-card-modern p-2 border border-border">
              <div className="bg-card rounded-xl p-6 relative">
                {showFrameworkPreview && (
                  <div className="absolute inset-0 bg-card rounded-xl p-6 z-10">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold text-primary">Your Essay Framework</h3>
                      <Button variant="ghost" size="sm" onClick={handleCloseFrameworkPreview} className="h-8 w-8 p-0">
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                    <ExpandedFrameworkView framework={sampleFramework} />
                    <div className="mt-6">
                      <div className="flex justify-between items-center">
                        <Button 
                          variant="outline"
                          onClick={handleCloseFrameworkPreview}
                        >
                          Previous
                        </Button>
                        <Button 
                          onClick={() => navigate('/auth')} 
                          className="bg-gradient-primary text-primary-foreground hover:shadow-glow px-6 py-2 rounded-full"
                        >
                          <Sparkles className="h-4 w-4 mr-2" />
                          Upgrade to Create Full Essays
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                <Tabs defaultValue="framework" className="w-full max-w-2xl mx-auto">
                  <TabsList className="grid grid-cols-2 mb-6">
                    <TabsTrigger value="framework" className="flex gap-2 items-center justify-center">
                      <PencilIcon className="h-4 w-4" />
                      Essay Framework
                    </TabsTrigger>
                    <TabsTrigger value="review" className="flex gap-2 items-center justify-center">
                      <FileText className="h-4 w-4" />
                      Essay Review
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="framework">
                    <Card className="border-0 shadow-sm">
                      <CardContent className="p-4">
                        {renderEssayPreviewStep()}
                        <div className="flex justify-between mt-4">
                          <Button 
                            variant="outline" 
                            onClick={handleEssayPrevStep} 
                            disabled={essayStep === 1}
                          >
                            Previous
                          </Button>
                          <Button 
                            className="bg-primary hover:bg-primary/90 text-primary-foreground"
                            onClick={handleEssayNextStep}
                            disabled={essayStep === 3}
                          >
                            Next Step
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="review">
                    <Card className="border-0 shadow-sm">
                      <CardContent className="p-4">
                        <div className="flex gap-2 items-center mb-4 text-primary">
                          <FileText className="h-5 w-5" />
                          <h3 className="font-semibold">Teacher's Feedback</h3>
                        </div>
                        <div className="border-l-4 border-primary pl-3 py-2 mb-3">
                          <p className="font-medium">Impact: Strengthen your opening</p>
                          <p className="text-sm text-muted-foreground">Consider starting with a vivid example that immediately draws the reader in.</p>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
                
                <div className="text-center mt-6">
                  <Button 
                    onClick={() => navigate('/auth')} 
                    className="bg-gradient-primary text-primary-foreground hover:shadow-glow px-6 py-2 rounded-full"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Upgrade to Premium
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
              <div className="bg-card/80 p-5 rounded-xl shadow-card-modern">
                <div className="flex justify-center mb-3">
                  <PencilIcon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Essay Frameworks</h3>
                <p className="text-sm text-muted-foreground">Build your essay with personalized, AI-generated frameworks tailored to your experiences</p>
              </div>
              
              <div className="bg-card/80 p-5 rounded-xl shadow-card-modern">
                <div className="flex justify-center mb-3">
                  <Search className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Unlimited Scholarships</h3>
                <p className="text-sm text-muted-foreground">Browse and apply to as many scholarships as you want with no daily limits</p>
              </div>
              
              <div className="bg-card/80 p-5 rounded-xl shadow-card-modern">
                <div className="flex justify-center mb-3">
                  <BookOpen className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Test Prep</h3>
                <p className="text-sm text-muted-foreground">Access comprehensive SAT & ACT practice materials and personalized study strategies</p>
              </div>
            </div>
          </div>
        )}

        {!user && (
          <div className="text-center mt-16 bg-card/95 p-8 md:p-12 rounded-3xl shadow-card-modern animate-fade-in">
            <div className="flex justify-center gap-4 md:gap-6 mb-6 md:mb-8">
              <Users className="w-10 h-10 md:w-12 md:h-12 text-primary animate-bounce" />
              <Trophy className="w-10 h-10 md:w-12 md:h-12 text-accent animate-bounce delay-100" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4 md:mb-6">Join Our Community of Successful Scholars</h2>
            <p className="text-lg md:text-xl text-muted-foreground mb-6 md:mb-8 max-w-2xl mx-auto">
              Tons of students have already found their perfect scholarship match with SwipeScholar. Don't miss out on opportunities waiting for you!
            </p>
            <Button 
              onClick={() => navigate('/auth')} 
              className={`bg-accent hover:bg-accent/90 text-accent-foreground ${isMobile ? 'px-6 py-4 text-lg' : 'px-8 py-6 text-xl'} rounded-full shadow-glow hover:scale-105 transition-transform`}
            >
              Sign Up Now
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
