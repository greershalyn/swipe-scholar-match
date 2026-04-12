import { useNavigate } from "react-router-dom";
import { GraduationCap, User, LogOut, Trash2, Settings } from "lucide-react";
import { useState } from "react";
import { GradientIcon } from "@/components/ui/gradient-icon";
import { Button } from "@/components/ui/button";
import { DeactivateAccountDialog } from "@/components/account/DeactivateAccountDialog";
import { useAccountActions } from "@/hooks/useAccountActions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function DashboardNavbar() {
  const navigate = useNavigate();
  const { handleLogout } = useAccountActions();
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <GradientIcon icon={GraduationCap} className="h-7 w-7" />
            <h1 className="font-bold text-lg bg-gradient-primary bg-clip-text text-transparent">
              SwipeScholar
            </h1>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => navigate("/questionnaire")}>
                <User className="h-4 w-4 mr-2" /> Update Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/admin")}>
                <Settings className="h-4 w-4 mr-2" /> Admin
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" /> Log Out
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => setShowDeactivateDialog(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" /> Deactivate Account
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <DeactivateAccountDialog
        open={showDeactivateDialog}
        onOpenChange={setShowDeactivateDialog}
      />
    </>
  );
}
