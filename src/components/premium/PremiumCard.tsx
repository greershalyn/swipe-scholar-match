
import React from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { PremiumHeader } from './PremiumHeader';

interface PremiumCardProps {
  content: React.ReactNode;
  footer?: React.ReactNode;
}

export const PremiumCard = ({ content, footer }: PremiumCardProps) => {
  return (
    <Card className="max-w-2xl mx-auto bg-slate-50">
      <CardHeader>
        <PremiumHeader />
      </CardHeader>
      <CardContent className="space-y-4">
        {content}
      </CardContent>
      {footer && (
        <CardFooter className="flex justify-center border-t pt-4">
          {footer}
        </CardFooter>
      )}
    </Card>
  );
};
