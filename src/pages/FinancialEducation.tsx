
import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Book, DollarSign, GraduationCap, ShieldCheck, PiggyBank, AlertTriangle } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GradientIcon } from '@/components/ui/gradient-icon';

const FinancialEducation = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen bg-background">
      <div className={`container px-4 ${isMobile ? 'py-4' : 'py-8'}`}>
        <div className={`flex justify-between items-center ${isMobile ? 'mb-6' : 'mb-8'}`}>
          <Link to="/">
            <img 
              src="/lovable-uploads/24f07198-1e4c-4eea-8e07-259aa77d1711.png"
              alt="SwipeScholar Logo"
              className={`${isMobile ? 'h-24' : 'h-40'} w-auto invert`}
            />
          </Link>
        </div>

        <div className={`max-w-4xl mx-auto ${isMobile ? 'px-2' : ''}`}>
          <h1 className={`${isMobile ? 'text-xl' : 'text-4xl'} font-bold text-foreground ${isMobile ? 'mb-6' : 'mb-8'} flex items-center gap-2`}>
            <GradientIcon icon={Book} className={`${isMobile ? 'h-5 w-5' : 'h-8 w-8'} flex-shrink-0`} />
            <span className={isMobile ? 'leading-tight' : ''}>
              {isMobile ? 'Financial Education' : 'Financial Education Resources'}
            </span>
          </h1>

          <div className="grid gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GradientIcon icon={GraduationCap} className="h-5 w-5" />
                  Official Education Resources
                </CardTitle>
                <CardDescription>Access trusted government resources for financial aid and college planning</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start text-left h-auto py-3 px-4 border-primary/20 hover:border-primary/40 hover:bg-gradient-primary hover:text-primary-foreground group" asChild>
                  <a href="https://www.consumerfinance.gov/paying-for-college/" target="_blank" rel="noopener noreferrer" className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className={`font-medium ${isMobile ? 'text-sm' : ''}`}>Consumer Financial Protection Bureau</div>
                      {isMobile && <div className="text-xs text-muted-foreground group-hover:text-primary-foreground/80 mt-1">Paying for College Resources</div>}
                      {!isMobile && <div className="text-sm text-muted-foreground group-hover:text-primary-foreground/80">Paying for College</div>}
                    </div>
                    <ExternalLink className="h-4 w-4 flex-shrink-0 mt-1" />
                  </a>
                </Button>
                <Button variant="outline" className="w-full justify-start text-left h-auto py-3 px-4 border-primary/20 hover:border-primary/40 hover:bg-gradient-primary hover:text-primary-foreground group" asChild>
                  <a href="https://studentaid.gov/understand-aid/types/grants" target="_blank" rel="noopener noreferrer" className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className={`font-medium ${isMobile ? 'text-sm' : ''}`}>Federal Student Aid</div>
                      {isMobile && <div className="text-xs text-muted-foreground group-hover:text-primary-foreground/80 mt-1">Grants Guide</div>}
                      {!isMobile && <div className="text-sm text-muted-foreground group-hover:text-primary-foreground/80">Grants Guide</div>}
                    </div>
                    <ExternalLink className="h-4 w-4 flex-shrink-0 mt-1" />
                  </a>
                </Button>
                <Button variant="outline" className="w-full justify-start text-left h-auto py-3 px-4 border-destructive/20 hover:border-destructive/40 hover:bg-gradient-primary hover:text-primary-foreground group" asChild>
                  <a href="https://consumer.ftc.gov/articles/how-avoid-scholarship-and-financial-aid-scams" target="_blank" rel="noopener noreferrer" className="flex items-start gap-3">
                    <AlertTriangle className="h-4 w-4 text-destructive group-hover:text-primary-foreground flex-shrink-0 mt-1" />
                    <div className="flex-1 min-w-0">
                      <div className={`font-medium ${isMobile ? 'text-sm' : ''}`}>Federal Trade Commission</div>
                      {isMobile && <div className="text-xs text-muted-foreground group-hover:text-primary-foreground/80 mt-1">Avoid Scholarship Scams</div>}
                      {!isMobile && <div className="text-sm text-muted-foreground group-hover:text-primary-foreground/80">How to Avoid Scholarship Scams</div>}
                    </div>
                    <ExternalLink className="h-4 w-4 flex-shrink-0 mt-1" />
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GradientIcon icon={PiggyBank} className="h-5 w-5" />
                  Personal Finance Tips
                </CardTitle>
                <CardDescription>Essential financial management tips from the American Bankers Association</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className={`bg-muted ${isMobile ? 'p-3' : 'p-4'} rounded-lg`}>
                    <h3 className={`font-semibold ${isMobile ? 'mb-1' : 'mb-2'} flex items-center gap-2`}>
                      <GradientIcon icon={DollarSign} className="h-4 w-4 flex-shrink-0" />
                      <span className={isMobile ? 'text-sm' : ''}>Take Control</span>
                    </h3>
                    <p className={`${isMobile ? 'text-sm' : ''} leading-relaxed`}>You are responsible for your finances. Create a realistic budget and stick to it.</p>
                  </div>
                  
                  <div className={`bg-muted ${isMobile ? 'p-3' : 'p-4'} rounded-lg`}>
                    <h3 className={`font-semibold ${isMobile ? 'mb-1' : 'mb-2'} flex items-center gap-2`}>
                      <GradientIcon icon={ShieldCheck} className="h-4 w-4 flex-shrink-0" />
                      <span className={isMobile ? 'text-sm' : ''}>Watch Your Spending</span>
                    </h3>
                    <p className={`${isMobile ? 'text-sm' : ''} leading-relaxed`}>Control your money by pacing spending and cutting unnecessary expenses to make it last throughout the semester.</p>
                  </div>
                  
                  <div className={`bg-muted ${isMobile ? 'p-3' : 'p-4'} rounded-lg`}>
                    <h3 className={`font-semibold ${isMobile ? 'mb-1 text-sm' : 'mb-2'}`}>Credit Wisdom</h3>
                    <p className={`${isMobile ? 'text-sm' : ''} leading-relaxed`}>Use credit responsibly - your college credit management can affect your post-graduation life.</p>
                  </div>
                  
                  <div className={`bg-muted ${isMobile ? 'p-3' : 'p-4'} rounded-lg`}>
                    <h3 className={`font-semibold ${isMobile ? 'mb-1 text-sm' : 'mb-2'}`}>Smart Banking</h3>
                    <p className={`${isMobile ? 'text-sm' : ''} leading-relaxed`}>Take advantage of student banking services like online banking, balance alerts, and identity theft protection.</p>
                  </div>
                  
                  <div className={`bg-muted ${isMobile ? 'p-3' : 'p-4'} rounded-lg`}>
                    <h3 className={`font-semibold ${isMobile ? 'mb-1 text-sm' : 'mb-2'}`}>Save Money</h3>
                    <ul className={`list-disc list-inside space-y-1 ${isMobile ? 'text-sm pl-2' : ''}`}>
                      <li>Look for scholarships and student discounts</li>
                      <li>Buy used textbooks or find them online</li>
                      <li>Use your meal plan instead of eating out</li>
                      <li>Take advantage of free campus activities</li>
                      <li>Start saving for emergencies immediately</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GradientIcon icon={PiggyBank} className="h-5 w-5" />
                  Save Even More with Lewte
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className={`${isMobile ? 'text-sm' : ''} leading-relaxed space-y-3`}>
                  <p>Already in college? Don't stop at scholarships—stretch your budget further with Lewte. Lewte connects you with exclusive student discounts, rewards, and free perks from your favorite brands on and off campus. Every dollar saved is another step toward making your college journey more affordable.</p>
                  <p>Join Lewte today and start saving while you study.</p>
                </div>
                <Button asChild className="w-full bg-gradient-primary hover:opacity-90 text-primary-foreground border-0">
                  <a href="https://lewte.com" target="_blank" rel="noopener noreferrer">
                    Join Now
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialEducation;
