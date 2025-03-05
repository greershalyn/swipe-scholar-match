
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Crown, Star, Lightbulb, FileCheck, RefreshCw } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AccountDropdown } from '@/components/AccountDropdown';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface PremiumAccessPromptProps {
  showSubscriptionDialog: boolean;
  setShowSubscriptionDialog: (show: boolean) => void;
  onRefreshSubscription?: () => void;
}

export const PremiumAccessPrompt = ({
  showSubscriptionDialog,
  setShowSubscriptionDialog,
  onRefreshSubscription
}: PremiumAccessPromptProps) => {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();
  const location = useLocation();
  const domain = window.location.origin;
  
  // Check for success parameter in URL
  const queryParams = new URLSearchParams(location.search);
  const successParam = queryParams.get('success');
  const sessionId = queryParams.get('session_id');
  
  useEffect(() => {
    // If returning from successful payment, show message and try to refresh
    if (successParam === 'true' && sessionId) {
      toast({
        title: "Payment received!",
        description: "Please wait while we update your account status...",
      });
      
      // Clean URL
      const newUrl = location.pathname;
      window.history.replaceState({}, document.title, newUrl);
      
      // Try to refresh subscription status
      handleRefreshSubscription();
    }
  }, [location.search]);

  const handleUpgradeClick = async () => {
    setLoading(true);
    setErrorMessage(null);
    
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('Auth error:', userError);
        throw new Error(`Authentication error: ${userError.message}`);
      }
      
      if (!user) {
        toast({
          title: "Error",
          description: "Please sign in to upgrade to premium",
          variant: "destructive",
        });
        return;
      }

      console.log('Initiating checkout for user:', user.id);
      
      // Make sure we have the return URL properly formatted
      const returnUrl = `${domain}${location.pathname}`;
      console.log('Return URL:', returnUrl);
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          profile_id: user.id,
          return_url: returnUrl,
        },
      });

      console.log('Checkout response:', { data, error });

      if (error) {
        console.error('Checkout error from invoke:', error);
        throw new Error(`Error from checkout service: ${error.message || 'Unknown error'}`);
      }

      if (!data?.url) {
        throw new Error('No checkout URL received from Stripe');
      }

      // Redirect to Stripe Checkout
      console.log('Redirecting to checkout URL:', data.url);
      window.location.href = data.url;
      
    } catch (error: any) {
      console.error('Detailed checkout error:', error);
      const errorMsg = error.message || 'Failed to start checkout process. Please try again.';
      setErrorMessage(errorMsg);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleRefreshSubscription = async () => {
    if (onRefreshSubscription) {
      setRefreshing(true);
      try {
        await onRefreshSubscription();
        toast({
          title: "Status refreshed",
          description: "Your subscription status has been refreshed.",
        });
      } catch (error) {
        console.error('Error refreshing subscription:', error);
      } finally {
        setRefreshing(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#9b87f5] via-[#D946EF] to-[#FDE1D3]">
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
            
            {errorMessage && (
              <div className="p-3 mt-2 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                <p className="font-medium">Error: {errorMessage}</p>
                <p className="mt-1">Please try again or contact support if the issue persists.</p>
              </div>
            )}
            
            <Button 
              className="w-full mt-4"
              onClick={handleUpgradeClick}
              disabled={loading}
            >
              {loading ? "Processing..." : "Upgrade to Premium"}
            </Button>
          </CardContent>
          {onRefreshSubscription && (
            <CardFooter className="flex justify-center border-t pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshSubscription}
                disabled={refreshing}
                className="flex items-center gap-1"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? "Refreshing..." : "Refresh Subscription Status"}
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
};
