
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Crown, Lock } from 'lucide-react';

interface SubscriptionDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SubscriptionDialog = ({ isOpen, onClose }: SubscriptionDialogProps) => {
  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        if (!open) onClose();
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
          <a 
            href="https://buy.stripe.com/28o7sUcWUaeP3xSeUU" 
            className="w-full"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button className="w-full">
              Upgrade to Premium
            </Button>
          </a>
          <Button 
            variant="outline" 
            onClick={onClose} 
            className="w-full"
          >
            Maybe Later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
