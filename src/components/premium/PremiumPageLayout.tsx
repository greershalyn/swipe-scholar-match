
import React from 'react';
import { Link } from 'react-router-dom';

import { useIsMobile } from '@/hooks/use-mobile';

interface PremiumPageLayoutProps {
  children: React.ReactNode;
}

export const PremiumPageLayout = ({ children }: PremiumPageLayoutProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen bg-background">
      <div className={`container px-4 ${isMobile ? 'py-4' : 'py-8'}`}>
        <div className={`flex justify-between items-center ${isMobile ? 'mb-4' : 'mb-8'}`}>
          <Link to="/">
            <img src="/lovable-uploads/24f07198-1e4c-4eea-8e07-259aa77d1711.png" alt="SwipeScholar Logo" className={`${isMobile ? 'h-24' : 'h-40'} w-auto invert`} />
          </Link>
          
        </div>
        {children}
      </div>
    </div>
  );
};
