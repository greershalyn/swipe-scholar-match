
import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { X, Mail } from "lucide-react";

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
      content: `Effective Date: 2/11/25

1. Introduction
Welcome to SwipeScholar! These Terms and Conditions ("Terms") govern your use of the SwipeScholar platform. By accessing or using SwipeScholar, you agree to be bound by these Terms.

2. Eligibility
To use SwipeScholar, you must be at least 13 years old. If you are under 18, you must have permission from a parent or guardian.

3. User Accounts
You agree to:
- Provide accurate and complete information when creating an account.
- Maintain the security of your account credentials.
- Notify us immediately of any unauthorized use of your account.

4. Use of the Platform
You may use SwipeScholar solely for personal, non-commercial purposes to find scholarship opportunities. You agree not to:
- Use the platform for any unlawful or fraudulent activities.
- Interfere with the proper functioning of SwipeScholar.
- Attempt to gain unauthorized access to our systems.

5. Scholarship Information
SwipeScholar does not guarantee the accuracy, availability, or eligibility of scholarship opportunities listed on the platform. It is your responsibility to verify the details and requirements of any scholarship before applying.

6. Privacy
Your use of SwipeScholar is also governed by our Privacy Policy, which explains how we collect, use, and protect your information.

7. Intellectual Property
All content, trademarks, and intellectual property related to SwipeScholar belong to the Company. You may not use any of our content without permission.

8. Limitation of Liability
SwipeScholar is provided "as is" without warranties of any kind. We are not liable for:
- Errors or omissions in scholarship listings.
- Loss or damages resulting from the use of SwipeScholar.
- Any third-party content or external links available on the platform.

9. Termination
We may suspend or terminate your account if you violate these Terms. You may also close your account at any time.

10. Changes to Terms
We may update these Terms from time to time. If significant changes occur, we will notify users via email or platform notice.

11. Governing Law
These Terms shall be governed by and construed under the laws of West Virginia.

12. Contact Us
For any questions about these Terms, please contact us at contact@lewte.com.`,
    },
    privacy: {
      title: "Privacy Policy",
      content: `Effective Date: 2/11/25

1. Introduction
Welcome to SwipeScholar! Your privacy is important to us. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform to find scholarship opportunities.

2. Information We Collect
When you create a profile and complete the questionnaire on SwipeScholar, we may collect the following information:
- Personal information (such as name, email address, date of birth, and school information)
- Academic details (such as GPA, test scores, and major)
- Demographic information (such as residency status and extracurricular activities)
- Any other information you voluntarily provide to enhance scholarship matching
- Usage and device information through cookies and similar technologies

3. How We Use Your Information
We use your information to:
- Match you with scholarship opportunities best suited to your profile
- Improve our scholarship recommendation algorithm
- Communicate with you regarding scholarships and platform updates
- Provide customer support
- Deliver relevant advertising content
- Analyze and improve our services

4. Advertising
Our platform includes third-party advertising to support our services. We work with third-party advertising partners who may use cookies and similar technologies to:
- Serve you with personalized ads
- Measure ad effectiveness
- Prevent repeated ads
- Better target advertisements to your interests

Google AdSense and other advertising partners may use cookies to serve ads based on your prior visits to our website or other websites. You can opt out of personalized advertising by visiting:
- Google's Ads Settings (https://www.google.com/settings/ads)
- Network Advertising Initiative opt-out page (http://optout.networkadvertising.org/)

5. Cookies and Tracking Technologies
We and our advertising partners use cookies and similar tracking technologies to:
- Remember your preferences
- Understand how you use our platform
- Deliver relevant advertisements
- Measure the effectiveness of our services and advertising

You can control cookies through your browser settings. However, disabling cookies may limit some features of our platform.

6. Voluntary Submission of Academic Information
SwipeScholar allows users to input academic details such as GPA and test scores at their own free will. This information is used solely to provide the most relevant scholarship matches. You are not required to submit academic information to use our platform, though doing so may enhance the accuracy of your matches.

7. How We Protect Your Information
We implement industry-standard security measures to protect your personal data from unauthorized access, disclosure, or alteration. However, no method of electronic storage or transmission over the internet is 100% secure, and we cannot guarantee absolute security.

8. Sharing Your Information
SwipeScholar does not sell your personal information. We may share your data with:
- Scholarship providers and partners, but only with your consent
- Service providers who assist us in operating our platform (under confidentiality agreements)
- Advertising partners for targeted advertising purposes
- Legal authorities if required by law

9. Your Choices and Rights
You have the right to:
- Update or delete your profile information
- Opt out of marketing communications
- Opt out of personalized advertising
- Request access to your personal data
- Delete your account

To exercise these rights, contact us at contact@lewte.com.

10. Children's Privacy
Our service is not directed to children under 13. We do not knowingly collect information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately.

11. Changes to This Privacy Policy
We may update this Privacy Policy from time to time. If we make significant changes, we will notify you via email or a notice on our platform.

12. Contact Us
If you have any questions about this Privacy Policy, please contact us at contact@lewte.com.`,
    },
  };

  return (
    <footer className="w-full py-4 mt-auto bg-gray-800 shadow-lg">
      <div className="container flex flex-col items-center justify-center gap-2">
        <div className="flex items-center gap-2">
          <span className="text-white">Powered by</span>
          <a 
            href="https://www.lewte.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block"
          >
            <img 
              src="/lovable-uploads/446d5bd8-d6f2-445b-b802-4625ff226e21.png" 
              alt="Lewte Logo" 
              className="h-6"
            />
          </a>
        </div>
        <div className="flex items-center gap-2 text-gray-400 my-2">
          <Mail className="h-4 w-4" />
          <span>Contact Us: </span>
          <a 
            href="mailto:contact@lewte.com" 
            className="hover:text-white transition-colors"
          >
            contact@lewte.com
          </a>
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
        <AlertDialogContent className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-h-[80vh] overflow-y-auto w-full max-w-lg bg-background p-6 shadow-lg rounded-lg">
          <button 
            onClick={() => setOpenDialog(null)}
            className="absolute right-4 top-4 p-1 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {openDialog && documents[openDialog].title}
            </AlertDialogTitle>
            <AlertDialogDescription className="whitespace-pre-wrap">
              {openDialog && documents[openDialog].content}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setOpenDialog(null)}>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </footer>
  );
};

export default Footer;
