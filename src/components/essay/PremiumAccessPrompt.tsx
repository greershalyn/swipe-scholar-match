import React from 'react';
import { Link } from 'react-router-dom';
import { Crown, Star, Lightbulb, FileCheck } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AccountDropdown } from '@/components/AccountDropdown';
import { SubscriptionDialog } from '@/components/subscription/SubscriptionDialog';
interface PremiumAccessPromptProps {
  showSubscriptionDialog: boolean;
  setShowSubscriptionDialog: (show: boolean) => void;
}
export const PremiumAccessPrompt = ({
  showSubscriptionDialog,
  setShowSubscriptionDialog
}: PremiumAccessPromptProps) => {
  return <div className="min-h-screen bg-gradient-to-b from-[#9b87f5] via-[#D946EF] to-[#FDE1D3]">
      <div className="container px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <Link to="/">
            <img src="/lovable-uploads/24f07198-1e4c-4eea-8e07-259aa77d1711.png" alt="SwipeScholar Logo" className="h-24 w-auto" />
          </Link>
          <AccountDropdown />
        </div>

        <Card className="max-w-2xl mx-auto bg-slate-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-6 w-6 text-yellow-500" />
              Premium Feature
            </CardTitle>
            <CardDescription>
              Upgrade to Premium to access our powerful Essay Assistant
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-lg">
              The Essay Assistant is a premium feature that helps you craft compelling scholarship essays with:
            </p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                AI-powered writing suggestions
              </li>
              <li className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-yellow-500" />
                Personalized essay frameworks
              </li>
              <li className="flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-yellow-500" />
                Professional writing feedback
              </li>
            </ul>
            <Button onClick={() => setShowSubscriptionDialog(true)} className="w-full mt-4">
              Upgrade to Premium
            </Button>
          </CardContent>
        </Card>

        <SubscriptionDialog isOpen={showSubscriptionDialog} onClose={() => setShowSubscriptionDialog(false)} />
      </div>
    </div>;
};