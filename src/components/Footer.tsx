
import React, { useState } from 'react';
import LegalDocumentDialog from './footer/LegalDocumentDialog';
import ContactInfo from './footer/ContactInfo';
import LegalLinks from './footer/LegalLinks';
import PoweredBySection from './footer/PoweredBySection';
import { legalDocuments, DocumentType } from './footer/legalDocuments';

const Footer = () => {
  const [openDialog, setOpenDialog] = useState<DocumentType>(null);

  const handleOpenDialog = (dialogType: 'eula' | 'terms' | 'privacy') => {
    setOpenDialog(dialogType);
  };

  const handleCloseDialog = () => {
    setOpenDialog(null);
  };

  return (
    <footer className="relative w-full py-6 mt-auto bg-gray-800 shadow-lg z-20">
      <div className="container flex flex-col items-center justify-center gap-3">
        <PoweredBySection />
        <ContactInfo />
        <LegalLinks onOpenDialog={handleOpenDialog} />
      </div>

      <LegalDocumentDialog 
        openDialog={openDialog} 
        documents={legalDocuments} 
        onClose={handleCloseDialog}
      />
    </footer>
  );
};

export default Footer;
