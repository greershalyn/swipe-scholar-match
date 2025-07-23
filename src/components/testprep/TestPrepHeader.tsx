
import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import { AccountDropdown } from '@/components/AccountDropdown';

const TestPrepHeader = () => {
  return (
    <div className="flex justify-between items-center mb-8">
      <Link to="/">
        <img 
          src="/lovable-uploads/24f07198-1e4c-4eea-8e07-259aa77d1711.png"
          alt="SwipeScholar Logo"
          className="h-24 w-auto invert"
        />
      </Link>
      <AccountDropdown />
    </div>
  );
};

export default TestPrepHeader;
