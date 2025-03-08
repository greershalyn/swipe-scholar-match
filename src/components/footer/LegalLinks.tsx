
import React from 'react';

interface LegalLinksProps {
  onOpenDialog: (dialogType: 'eula' | 'terms' | 'privacy') => void;
}

const LegalLinks = ({ onOpenDialog }: LegalLinksProps) => {
  return (
    <div className="flex gap-4 text-sm text-gray-400">
      <button 
        onClick={() => onOpenDialog('eula')} 
        className="hover:text-white transition-colors"
      >
        EULA
      </button>
      <button 
        onClick={() => onOpenDialog('terms')} 
        className="hover:text-white transition-colors"
      >
        Terms & Conditions
      </button>
      <button 
        onClick={() => onOpenDialog('privacy')} 
        className="hover:text-white transition-colors"
      >
        Privacy Policy
      </button>
    </div>
  );
};

export default LegalLinks;
