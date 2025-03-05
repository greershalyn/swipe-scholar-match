
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ErrorDisplayProps {
  errorMessage: string | null;
}

export const ErrorDisplay = ({ errorMessage }: ErrorDisplayProps) => {
  if (!errorMessage) return null;
  
  return (
    <Alert variant="destructive" className="mt-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="ml-2">
        {errorMessage}
      </AlertDescription>
    </Alert>
  );
};
