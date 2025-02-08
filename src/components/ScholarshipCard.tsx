
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion, PanInfo } from 'framer-motion';

interface ScholarshipCardProps {
  scholarship: {
    id: string;
    title: string;
    amount: number;
    deadline: string;
    category: string;
    description: string;
    requirements: string[];
    match_score: number;
  };
  onSwipe: (direction: 'left' | 'right') => void;
}

const ScholarshipCard: React.FC<ScholarshipCardProps> = ({ scholarship, onSwipe }) => {
  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 100;
    if (info.offset.x > threshold) {
      onSwipe('right');
    } else if (info.offset.x < -threshold) {
      onSwipe('left');
    }
  };

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      className="absolute w-full"
      whileDrag={{ scale: 1.05 }}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="p-6 backdrop-blur-sm bg-white/90 border border-border shadow-lg hover:shadow-xl transition-shadow">
        <div className="flex justify-between items-start mb-4">
          <div>
            <Badge variant="outline" className="mb-2 bg-primary/10 text-primary">
              ${scholarship.amount.toLocaleString()}
            </Badge>
            <h2 className="text-2xl font-semibold text-accent mb-1">{scholarship.title}</h2>
            <p className="text-sm text-muted-foreground">Deadline: {scholarship.deadline}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-secondary text-accent">
              {scholarship.match_score}% Match
            </Badge>
          </div>
        </div>
        
        <div className="space-y-4">
          <p className="text-accent/80">{scholarship.description}</p>
          
          <div>
            <h3 className="font-medium mb-2 text-accent">Requirements:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-accent/70">
              {scholarship.requirements.map((req, index) => (
                <li key={index}>{req}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-6 flex justify-center gap-4 text-sm text-muted-foreground">
          <p>← Swipe left to skip</p>
          <p>Swipe right to apply →</p>
        </div>
      </Card>
    </motion.div>
  );
};

export default ScholarshipCard;
