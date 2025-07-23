
import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import { AccountDropdown } from '@/components/AccountDropdown';
import { useIsMobile } from '@/hooks/use-mobile';

const TestPrepHeader = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className={`flex justify-between items-center ${isMobile ? 'mb-4' : 'mb-8'}`}>
      <Link to="/">
        <img 
          src="/lovable-uploads/24f07198-1e4c-4eea-8e07-259aa77d1711.png"
          alt="SwipeScholar Logo"
          className={`${isMobile ? 'h-20' : 'h-32'} w-auto invert`}
        />
      </Link>
      <AccountDropdown />
    </div>
  );
};

export default TestPrepHeader;
