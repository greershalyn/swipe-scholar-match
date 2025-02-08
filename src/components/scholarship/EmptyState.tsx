
import React from 'react';

interface EmptyStateProps {
  title: string;
  description: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ title, description }) => {
  return (
    <div className="flex flex-col items-center justify-center h-[600px] text-center">
      <h2 className="text-2xl font-semibold text-accent mb-4">{title}</h2>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
};

export default EmptyState;
