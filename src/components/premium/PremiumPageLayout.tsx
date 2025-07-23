
import React from 'react';
import { Link } from 'react-router-dom';
import { AccountDropdown } from '@/components/AccountDropdown';

interface PremiumPageLayoutProps {
  children: React.ReactNode;
}

export const PremiumPageLayout = ({ children }: PremiumPageLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <Link to="/">
            <img src="/lovable-uploads/24f07198-1e4c-4eea-8e07-259aa77d1711.png" alt="SwipeScholar Logo" className="h-24 w-auto" />
          </Link>
          <AccountDropdown />
        </div>
        {children}
      </div>
    </div>
  );
};
