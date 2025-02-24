
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Crown, Lock, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface SubscriptionDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SubscriptionDialog = ({ isOpen, onClose }: SubscriptionDialogProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleUpgradeClick = async () => {
    try {
      setIsLoading(true);
      console.log('Starting checkout process...');

      const { data: { session }, error: authError } = await supabase.auth.getSession();
      if (authError) {
        throw new Error(authError.message);
      }
      
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to upgrade your subscription.",
          variant: "destructive",
        });
        return;
      }

      // Replace with your actual Stripe payment link
      const paymentLink = 'https://buy.stripe.com/28o7sUcWUaeP3xSeUU';
      
      console.log('Redirecting to payment link:', paymentLink);
      window.location.href = paymentLink;
      
    } catch (error: any) {
      console.error('Error in checkout process:', error);
      setIsLoading(false);
      toast({
        title: "Error",
        description: error.message || "Could not initiate checkout. Please try again later.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        if (!isLoading && !open) {
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex gap-2 items-center text-2xl">
            <Crown className="h-6 w-6 text-yellow-500" />
            Unlock Premium Features
          </DialogTitle>
          <DialogDescription>
            Get access to our powerful Essay Assistant and more premium features
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Lock className="h-4 w-4" /> Premium Features Include:
            </h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                ✓ AI-powered Essay Assistant to craft compelling scholarship essays
              </li>
              <li className="flex items-start gap-2">
                ✓ Advanced essay frameworks and suggestions
              </li>
              <li className="flex items-start gap-2">
                ✓ Personalized writing feedback
              </li>
              <li className="flex items-start gap-2">
                ✓ Priority support
              </li>
            </ul>
          </div>
          <div className="bg-muted p-4 rounded-lg text-center">
            <p className="text-2xl font-bold">$10/month</p>
            <p className="text-sm text-muted-foreground">Cancel anytime</p>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <Button 
            onClick={handleUpgradeClick} 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Upgrade to Premium"
            )}
          </Button>
          <Button 
            variant="outline" 
            onClick={onClose} 
            className="w-full"
            disabled={isLoading}
          >
            Maybe Later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
