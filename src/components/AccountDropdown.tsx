import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Wallet, BookOpen, Pencil, GraduationCap, Star } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const AccountDropdown = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out successfully",
        description: "You have been signed out of your account.",
      });
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Error",
        description: "There was a problem signing out.",
        variant: "destructive",
      });
    }
  };

  const handleDeactivateAccount = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase
        .from('profiles')
        .update({ account_active: false })
        .eq('id', session.user.id);

      if (error) throw error;

      await supabase.auth.signOut();
      toast({
        title: "Account Deactivated",
        description: "Your account has been deactivated successfully.",
      });
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to deactivate account.",
        variant: "destructive",
      });
    }
  };

  // New function to manually upgrade account for testing
  const handleUpgradeAccountForTesting = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Error",
          description: "You need to be logged in to upgrade your account.",
          variant: "destructive",
        });
        return;
      }

      // Update the user's subscription tier to premium directly
      const { error } = await supabase
        .from('profiles')
        .update({ subscription_tier: 'premium' })
        .eq('id', session.user.id);

      if (error) throw error;

      // Also create a subscription record
      const { error: subscriptionError } = await supabase
        .from('subscriptions')
        .upsert({
          profile_id: session.user.id,
          status: 'active',
          subscription_type: 'premium',
          amount_cents: 1999,
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
        });

      if (subscriptionError) throw subscriptionError;

      toast({
        title: "Account Upgraded",
        description: "Your account has been upgraded to premium for testing.",
      });
      
      // Refresh the page to make sure the UI updates
      window.location.reload();
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to upgrade account: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="bg-white hover:bg-gray-100">
            <User className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 bg-white" align="end">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate("/questionnaire")}>
            Update Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/wallet")} className="flex items-center">
            <Wallet className="mr-2 h-4 w-4" />
            <span>View Wallet</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/financial-education")} className="flex items-center">
            <BookOpen className="mr-2 h-4 w-4" />
            <span>Financial Education</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/essay-assistant")} className="flex items-center">
            <Pencil className="mr-2 h-4 w-4" />
            <span>Essay Assistant</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/test-prep")} className="flex items-center">
            <GraduationCap className="mr-2 h-4 w-4" />
            <span>Test Prep</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={handleUpgradeAccountForTesting}
            className="flex items-center text-purple-600 focus:text-purple-600 focus:bg-purple-50"
          >
            <Star className="mr-2 h-4 w-4" />
            <span>Upgrade to Premium (Test)</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            Log Out
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => setShowDeactivateDialog(true)}
            className="text-red-600 focus:text-red-600 focus:bg-red-50"
          >
            Deactivate Account
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will deactivate your account and you will need to contact support to reactivate it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeactivateAccount}
              className="bg-red-600 hover:bg-red-700"
            >
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
