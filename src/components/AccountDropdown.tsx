
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Wallet, BookOpen, Pencil, GraduationCap, Users } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { DeactivateAccountDialog } from "@/components/account/DeactivateAccountDialog";
import { useAccountActions } from "@/hooks/useAccountActions";

export const AccountDropdown = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
  const { handleLogout } = useAccountActions();

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
          <DropdownMenuItem onClick={() => navigate("/first-gen-resources")} className="flex items-center">
            <Users className="mr-2 h-4 w-4" />
            <span>First-Gen Resources</span>
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

      <DeactivateAccountDialog 
        open={showDeactivateDialog} 
        onOpenChange={setShowDeactivateDialog} 
      />
    </>
  );
};
