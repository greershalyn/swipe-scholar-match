
import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Book, DollarSign, GraduationCap, ShieldCheck, PiggyBank, AlertTriangle } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AccountDropdown } from '@/components/AccountDropdown';

const FinancialEducation = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen bg-background">
      <div className={`container px-4 ${isMobile ? 'py-4' : 'py-8'}`}>
        <div className={`flex justify-between items-center ${isMobile ? 'mb-4' : 'mb-8'}`}>
          <Link to="/">
            <img 
              src="/lovable-uploads/24f07198-1e4c-4eea-8e07-259aa77d1711.png"
              alt="SwipeScholar Logo"
              className={`${isMobile ? 'h-16' : 'h-24'} w-auto invert`}
            />
          </Link>
          <AccountDropdown />
        </div>

        <div className="max-w-4xl mx-auto">
          <h1 className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-bold text-foreground ${isMobile ? 'mb-4' : 'mb-8'} flex items-center gap-3`}>
            <Book className={`${isMobile ? 'h-6 w-6' : 'h-8 w-8'}`} />
            {isMobile ? 'Financial Education' : 'Financial Education Resources'}
          </h1>

          <div className="grid gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  Official Education Resources
                </CardTitle>
                <CardDescription>Access trusted government resources for financial aid and college planning</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className={`w-full ${isMobile ? 'justify-start' : 'justify-between'} ${isMobile ? 'text-sm' : ''}`} asChild>
                  <a href="https://www.consumerfinance.gov/paying-for-college/" target="_blank" rel="noopener noreferrer">
                    <span className={isMobile ? 'truncate' : ''}>Consumer Financial Protection Bureau - Paying for College</span>
                    <ExternalLink className="h-4 w-4 ml-auto flex-shrink-0" />
                  </a>
                </Button>
                <Button variant="outline" className={`w-full ${isMobile ? 'justify-start' : 'justify-between'} ${isMobile ? 'text-sm' : ''}`} asChild>
                  <a href="https://studentaid.gov/understand-aid/types/grants" target="_blank" rel="noopener noreferrer">
                    <span className={isMobile ? 'truncate' : ''}>Federal Student Aid - Grants Guide</span>
                    <ExternalLink className="h-4 w-4 ml-auto flex-shrink-0" />
                  </a>
                </Button>
                <Button variant="outline" className={`w-full ${isMobile ? 'justify-start' : 'justify-between'} ${isMobile ? 'text-sm' : ''}`} asChild>
                  <a href="https://consumer.ftc.gov/articles/how-avoid-scholarship-and-financial-aid-scams" target="_blank" rel="noopener noreferrer">
                    <div className="flex items-center gap-2 truncate">
                      <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />
                      <span className={isMobile ? 'truncate' : ''}>Federal Trade Commission - How to Avoid Scholarship Scams</span>
                    </div>
                    <ExternalLink className="h-4 w-4 ml-auto flex-shrink-0" />
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PiggyBank className="h-5 w-5 text-primary" />
                  Personal Finance Tips
                </CardTitle>
                <CardDescription>Essential financial management tips from the American Bankers Association</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-primary" />
                      Take Control
                    </h3>
                    <p>You are responsible for your finances. Create a realistic budget and stick to it.</p>
                  </div>
                  
                  <div className="bg-muted p-4 rounded-lg">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-primary" />
                      Watch Your Spending
                    </h3>
                    <p>Control your money by pacing spending and cutting unnecessary expenses to make it last throughout the semester.</p>
                  </div>
                  
                  <div className="bg-muted p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Credit Wisdom</h3>
                    <p>Use credit responsibly - your college credit management can affect your post-graduation life.</p>
                  </div>
                  
                  <div className="bg-muted p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Smart Banking</h3>
                    <p>Take advantage of student banking services like online banking, balance alerts, and identity theft protection.</p>
                  </div>
                  
                  <div className="bg-muted p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Save Money</h3>
                    <ul className="list-disc list-inside space-y-2">
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialEducation;
