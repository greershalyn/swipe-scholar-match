
import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Book, DollarSign, GraduationCap, ShieldCheck, PiggyBank } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AccountDropdown } from '@/components/AccountDropdown';

const FinancialEducation = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#9b87f5] via-[#D946EF] to-[#FDE1D3]">
      <div className="container px-4 py-8">
        <div className="flex flex-col items-center">
          <div className="w-full flex justify-end mb-4">
            <AccountDropdown />
          </div>
          <Link to="/" className="mb-8">
            <img 
              src="/lovable-uploads/24f07198-1e4c-4eea-8e07-259aa77d1711.png"
              alt="SwipeScholar Logo"
              className="h-20 w-auto"
            />
          </Link>
        </div>

        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8 flex items-center gap-3">
            <Book className="h-8 w-8" />
            Financial Education Resources
          </h1>

          <div className="grid gap-6 mb-8">
            <Card className="bg-white/95">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  Official Education Resources
                </CardTitle>
                <CardDescription>Access trusted government resources for financial aid and college planning</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-between" asChild>
                  <a href="https://www.consumerfinance.gov/paying-for-college/" target="_blank" rel="noopener noreferrer">
                    Consumer Financial Protection Bureau - Paying for College
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
                <Button variant="outline" className="w-full justify-between" asChild>
                  <a href="https://studentaid.gov/understand-aid/types/grants" target="_blank" rel="noopener noreferrer">
                    Federal Student Aid - Grants Guide
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white/95">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PiggyBank className="h-5 w-5 text-primary" />
                  Personal Finance Tips
                </CardTitle>
                <CardDescription>Essential financial management tips from the American Bankers Association</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-primary" />
                      Take Control
                    </h3>
                    <p>You are responsible for your finances. Create a realistic budget and stick to it.</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-primary" />
                      Watch Your Spending
                    </h3>
                    <p>Control your money by pacing spending and cutting unnecessary expenses to make it last throughout the semester.</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Credit Wisdom</h3>
                    <p>Use credit responsibly - your college credit management can affect your post-graduation life.</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Smart Banking</h3>
                    <p>Take advantage of student banking services like online banking, balance alerts, and identity theft protection.</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
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
