
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

type QuizToggleButtonProps = {
  isActive: boolean;
  onClick: () => void;
};

const QuizToggleButton = ({ isActive, onClick }: QuizToggleButtonProps) => {
  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={onClick}
      className="flex items-center gap-1"
    >
      {isActive ? 'Hide Quiz' : 'Take Quiz'}
      {isActive ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
    </Button>
  );
};

export default QuizToggleButton;
