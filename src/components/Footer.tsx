
import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Footer = () => {
  const [openDialog, setOpenDialog] = useState<'eula' | 'terms' | 'privacy' | null>(null);

  // Placeholder content - to be replaced with actual content later
  const documents = {
    eula: {
      title: "End User License Agreement",
      content: "EULA content will go here...",
    },
    terms: {
      title: "Terms & Conditions",
      content: "Terms & Conditions content will go here...",
    },
    privacy: {
      title: "Privacy Policy",
      content: "Privacy Policy content will go here...",
    },
  };

  return (
    <footer className="w-full py-4 mt-auto bg-gray-800 shadow-lg">
      <div className="container flex flex-col items-center justify-center gap-2">
        <div className="flex items-center gap-2">
          <span className="text-white">Powered by</span>
          <img 
            src="/lovable-uploads/446d5bd8-d6f2-445b-b802-4625ff226e21.png" 
            alt="Lewte Logo" 
            className="h-6"
          />
        </div>
        <div className="flex gap-4 text-sm text-gray-400">
          <button 
            onClick={() => setOpenDialog('eula')} 
            className="hover:text-white transition-colors"
          >
            EULA
          </button>
          <button 
            onClick={() => setOpenDialog('terms')} 
            className="hover:text-white transition-colors"
          >
            Terms & Conditions
          </button>
          <button 
            onClick={() => setOpenDialog('privacy')} 
            className="hover:text-white transition-colors"
          >
            Privacy Policy
          </button>
        </div>
      </div>

      <AlertDialog open={openDialog !== null} onOpenChange={() => setOpenDialog(null)}>
        <AlertDialogContent className="max-h-[80vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {openDialog && documents[openDialog].title}
            </AlertDialogTitle>
            <AlertDialogDescription className="whitespace-pre-wrap">
              {openDialog && documents[openDialog].content}
            </AlertDialogDescription>
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>
    </footer>
  );
};

export default Footer;
