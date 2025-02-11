
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

  const documents = {
    eula: {
      title: "End User License Agreement (EULA)",
      content: `Effective Date: 2/11/25

1. Introduction
This End User License Agreement ("Agreement") is a legal agreement between you ("User") and Lewte ("Company") governing the use of the SwipeScholar platform and related services.

2. Acceptance of Terms
By creating an account, accessing, or using SwipeScholar, you agree to be bound by this Agreement. If you do not agree to these terms, do not use SwipeScholar.

3. License Grant
SwipeScholar grants you a limited, non-exclusive, non-transferable, and revocable license to access and use the platform for personal, non-commercial purposes in accordance with this Agreement.

4. User Obligations
You agree to:
- Provide accurate and complete information when creating an account.
- Use the platform only for lawful purposes.
- Not distribute, modify, or reverse-engineer any part of the platform.
- Not share your account credentials or allow unauthorized access.

5. Privacy and Data Use
Your use of SwipeScholar is also governed by our Privacy Policy, which details how we collect, use, and protect your information.

6. Intellectual Property
All intellectual property rights related to SwipeScholar, including trademarks, copyrights, and proprietary information, are owned by the Company. Unauthorized use of any intellectual property is prohibited.

7. Disclaimers and Limitation of Liability
SwipeScholar is provided "as is" without warranties of any kind. The Company is not responsible for:
- The accuracy or availability of scholarship opportunities.
- Any loss or damage resulting from the use of SwipeScholar.
- Third-party content or external links provided on the platform.

8. Termination
SwipeScholar may suspend or terminate your account at any time if you violate this Agreement. You may also terminate your use of the platform by deleting your account.

9. Governing Law
This Agreement shall be governed by and construed in accordance with the laws of West Virginia.

10. Changes to This Agreement
We may update this Agreement from time to time. If significant changes are made, we will notify users via email or through a notice on the platform.

11. Contact Information
If you have any questions about this Agreement, please contact us at contact@lewte.com.`,
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
