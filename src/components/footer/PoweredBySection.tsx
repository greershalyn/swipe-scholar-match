
import React from 'react';

const PoweredBySection = () => {
  return (
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
  );
};

export default PoweredBySection;
