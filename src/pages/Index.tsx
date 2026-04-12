import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import ScholarshipSwiper from '@/components/ScholarshipSwiper';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { GraduationCap, Rocket, DollarSign, Clock, Sparkles, BookOpen, Users, Trophy, Wallet as WalletIcon, PencilIcon, FileText, Lightbulb, X, Search, Zap, School } from 'lucide-react';

import Wallet from '@/components/Wallet';
import { CrawlForm } from '@/components/CrawlForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { ExpandedFramework } from '@/types/essay';
import { ExpandedFrameworkView } from '@/components/essay/ExpandedFrameworkView';
import { GradientIcon } from '@/components/ui/gradient-icon';


const Index = () => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
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
            <div className="flex gap-2 items-center mb-4">
              <GradientIcon icon={BookOpen} className="h-5 w-5" />
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
            <div className="flex gap-2 items-center mb-4">
              <GradientIcon icon={Lightbulb} className="h-5 w-5" />
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
            <div className="flex gap-2 items-center mb-4">
              <GradientIcon icon={FileText} className="h-5 w-5" />
              <h3 className="font-semibold">Step 3: Select your essay approach</h3>
            </div>
            <div className="bg-secondary p-4 rounded-md mb-4">
              <h4 className="font-medium bg-gradient-primary bg-clip-text text-transparent mb-2">Growth Mindset Approach</h4>
              <p className="text-sm mb-3">Focus on how this challenge helped you develop resilience and adaptability.</p>
              <div className="mt-2">
                <Button 
                  size="sm" 
                  className="bg-gradient-primary hover:opacity-90 text-primary-foreground w-full"
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

  if (user) {
    return (
      <div className="p-4 lg:p-6 max-w-5xl mx-auto relative compass-bg-container">
        <div 
          className="absolute inset-0 pointer-events-none z-0 compass-background"
          style={{
            backgroundImage: `url(/lovable-uploads/f5f92d18-9536-46ff-8d97-1a799437f06a.png)`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center top',
            backgroundSize: '600px',
            opacity: 0.3
          }}
        />
        <div className="mb-6 relative z-10">
          <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">Welcome back!</h1>
          <p className="text-muted-foreground">Find your perfect scholarship match</p>
        </div>
        
        <div className="flex justify-center mb-8 relative z-10">
          <div className="w-full max-w-sm">
            <ScholarshipSwiper />
            <div className="text-center mt-4">
              <p className="text-base text-foreground font-medium">
                Swipe right to save, left to skip
              </p>
            </div>
          </div>
        </div>
          
        {isAdmin && (
          <div className="mb-8 relative z-10">
            <div className="bg-card/95 rounded-xl p-6 shadow-card-modern">
              <h2 className="text-xl font-semibold text-foreground mb-4">Admin: Add New Scholarship</h2>
              <CrawlForm />
            </div>
          </div>
        )}

        <div className="bg-card/95 rounded-xl p-6 shadow-card-modern relative z-10">
          <h2 className="text-xl font-semibold bg-gradient-primary bg-clip-text text-transparent mb-4 flex items-center gap-2">
            <GradientIcon icon={WalletIcon} className="h-5 w-5" />
            Your Scholarship Wallet
          </h2>
          <Wallet className="mt-4" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full max-w-sm sm:max-w-2xl md:max-w-4xl lg:max-w-7xl mx-auto px-2 sm:px-4 py-2 sm:py-4 md:py-8">
        {!user && (
          <div className="flex justify-end mb-3 sm:mb-6">
            <Button onClick={() => navigate('/auth')} variant="outline" className="bg-card hover:bg-muted shadow-card-modern text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2">
              Log In
            </Button>
          </div>
        )}

        <div className="text-center mb-6 md:mb-16">
          <div className="flex justify-center mb-3">
            <GradientIcon icon={GraduationCap} className="w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 lg:w-20 lg:h-20" />
          </div>
          <h1 className="text-xl sm:text-2xl md:text-4xl lg:text-7xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-3 md:mb-6 drop-shadow-lg px-1">
            SwipeScholar
          </h1>
          <p className="text-xs sm:text-sm md:text-base lg:text-2xl text-foreground mb-4 md:mb-8 leading-relaxed max-w-xs sm:max-w-md md:max-w-4xl mx-auto px-2">
            Built to make education more accessible, this is your all-in-one hub for scholarships, student savings, and rewards. Everything you need to afford and navigate college, in one place.
          </p>
          {!user && (
            <Button 
              onClick={() => navigate('/auth')} 
              className="bg-gradient-primary text-primary-foreground hover:opacity-90 px-3 py-1.5 sm:px-4 sm:py-2 md:px-6 md:py-4 lg:px-8 lg:py-6 text-xs sm:text-sm md:text-lg lg:text-xl rounded-full shadow-glow"
            >
              <Sparkles className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 lg:h-6 lg:w-6" />
              Start Your Journey Today
            </Button>
          )}
        </div>

        {!user && (
          <div className="flex flex-col md:flex-row gap-4 md:gap-8 mb-8 sm:mb-16 w-full items-center">
            {/* Stacked feature points */}
            <div className="flex flex-col gap-2 sm:gap-3 w-full md:w-1/2">
              <div className="flex items-center gap-3 bg-card p-3 sm:p-4 rounded-xl shadow-card-modern">
                <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-gradient-primary rounded-lg shrink-0">
                  <Rocket className="text-primary-foreground w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold bg-gradient-primary bg-clip-text text-transparent">Quick & Easy</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">Swipe right on scholarships that match your profile</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-card p-3 sm:p-4 rounded-xl shadow-card-modern">
                <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-gradient-primary rounded-lg shrink-0">
                  <BookOpen className="text-primary-foreground w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold bg-gradient-primary bg-clip-text text-transparent">Personalized Matches</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">Scholarships tailored to your academic profile and interests</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-card p-3 sm:p-4 rounded-xl shadow-card-modern">
                <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-gradient-primary rounded-lg shrink-0">
                  <DollarSign className="text-primary-foreground w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold bg-gradient-primary bg-clip-text text-transparent">Save Money</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">Access thousands of dollars in scholarship opportunities</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-card p-3 sm:p-4 rounded-xl shadow-card-modern">
                <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-gradient-primary rounded-lg shrink-0">
                  <Clock className="text-primary-foreground w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold bg-gradient-primary bg-clip-text text-transparent">Save Time</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">Apply to multiple scholarships with your single profile</p>
                </div>
              </div>

              <div 
                className="flex items-center gap-3 bg-card p-3 sm:p-4 rounded-xl shadow-card-modern cursor-pointer"
                onClick={() => navigate('/school-matchmaker')}
              >
                <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-gradient-primary rounded-lg shrink-0">
                  <School className="text-primary-foreground w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold bg-gradient-primary bg-clip-text text-transparent">School Matchmaker</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">Find schools that match your interests, budget, and location</p>
                </div>
              </div>
            </div>

            {/* Photo placeholder - right side */}
            <div className="w-full md:w-1/2 flex items-center justify-center">
              <div className="w-full aspect-[4/3] rounded-2xl bg-muted/30 border-2 border-dashed border-muted-foreground/20 flex items-center justify-center">
                <p className="text-muted-foreground text-sm">Photo goes here</p>
              </div>
            </div>
          </div>
        )}


        {!user && (
          <div className="text-center mb-8 sm:mb-16 bg-card/90 p-4 sm:p-6 md:p-8 lg:p-12 rounded-2xl sm:rounded-3xl shadow-card-modern">
            <div className="mb-4 sm:mb-6 md:mb-8">
              <h2 className="text-lg sm:text-xl md:text-3xl lg:text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2 sm:mb-3 md:mb-4">
                Unlock Premium Essay Tools
              </h2>
              <p className="text-xs sm:text-sm md:text-lg lg:text-xl text-muted-foreground max-w-xs sm:max-w-md md:max-w-3xl mx-auto mb-4 sm:mb-6 md:mb-8">
                Your scholarship essays deserve the best. Our AI-powered Essay Assistant helps you craft winning applications.
                <span className="block bg-gradient-primary bg-clip-text text-transparent font-bold mt-1 sm:mt-2 text-sm sm:text-base md:text-xl">
                  Just $10/month - Cancel Anytime!
                </span>
              </p>
            </div>
            
            <div className="max-w-4xl mx-auto bg-gradient-secondary rounded-xl shadow-card-modern p-2 border border-border">
              <div className="bg-card rounded-xl p-6 relative">
                {showFrameworkPreview && (
                  <div className="absolute inset-0 bg-card rounded-xl p-6 z-10">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold bg-gradient-primary bg-clip-text text-transparent">Your Essay Framework</h3>
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
                          className="bg-gradient-primary text-primary-foreground hover:opacity-90 px-6 py-2 rounded-full"
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
                            className="bg-gradient-primary hover:opacity-90 text-primary-foreground"
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
                        <div className="flex gap-2 items-center mb-4">
                          <GradientIcon icon={FileText} className="h-5 w-5" />
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
                    className="bg-gradient-primary text-primary-foreground hover:opacity-90 px-6 py-2 rounded-full"
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
                  <GradientIcon icon={PencilIcon} className="h-8 w-8" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Essay Frameworks</h3>
                <p className="text-sm text-muted-foreground">Build your essay with personalized, AI-generated frameworks tailored to your experiences</p>
              </div>
              
              <div className="bg-card/80 p-5 rounded-xl shadow-card-modern">
                <div className="flex justify-center mb-3">
                  <GradientIcon icon={Search} className="h-8 w-8" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Unlimited Scholarships</h3>
                <p className="text-sm text-muted-foreground">Browse and apply to as many scholarships as you want with no daily limits</p>
              </div>
              
              <div className="bg-card/80 p-5 rounded-xl shadow-card-modern">
                <div className="flex justify-center mb-3">
                  <GradientIcon icon={BookOpen} className="h-8 w-8" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Test Prep</h3>
                <p className="text-sm text-muted-foreground">Access comprehensive SAT & ACT practice materials and personalized study strategies</p>
              </div>
            </div>
          </div>
        )}

        {!user && (
          <div className="text-center mt-16 bg-card/95 p-8 md:p-12 rounded-3xl shadow-card-modern">
            <div className="flex justify-center gap-4 md:gap-6 mb-6 md:mb-8">
              <GradientIcon icon={Users} className="w-10 h-10 md:w-12 md:h-12" />
              <GradientIcon icon={Trophy} className="w-10 h-10 md:w-12 md:h-12" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4 md:mb-6">Join Our Community of Successful Scholars</h2>
            <p className="text-lg md:text-xl text-muted-foreground mb-6 md:mb-8 max-w-2xl mx-auto">
              Tons of students have already found their perfect scholarship match with SwipeScholar. Don't miss out on opportunities waiting for you!
            </p>
            <Button 
              onClick={() => navigate('/auth')} 
              className="bg-gradient-primary hover:opacity-90 text-primary-foreground px-6 py-4 md:px-8 md:py-6 text-lg md:text-xl rounded-full shadow-glow"
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
