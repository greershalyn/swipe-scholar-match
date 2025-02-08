
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion, PanInfo } from 'framer-motion';
import { ExternalLink, ThumbsUp, ThumbsDown } from 'lucide-react';

interface ScholarshipCardProps {
  scholarship: {
    id: string;
    title: string;
    amount: number;
    deadline: string;
    category: string;
    description: string;
    requirements: string[];
    match_score?: number;
    provider: string;
    url: string;
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

  const formatDeadline = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
            <p className="text-sm text-muted-foreground">Deadline: {formatDeadline(scholarship.deadline)}</p>
            <p className="text-sm text-muted-foreground mt-1">Provider: {scholarship.provider}</p>
          </div>
          <div className="flex items-center gap-2">
            {scholarship.match_score && (
              <Badge variant="secondary" className="bg-secondary text-accent">
                {scholarship.match_score}% Match
              </Badge>
            )}
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

          <a
            href={scholarship.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm text-primary hover:text-primary/80 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            View Details <ExternalLink className="ml-1 h-4 w-4" />
          </a>
        </div>

        <div className="mt-6 flex justify-center gap-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <ThumbsDown className="w-6 h-6 text-red-500" />
            <span>Skip</span>
          </div>
          <div className="flex items-center gap-2">
            <span>Apply</span>
            <ThumbsUp className="w-6 h-6 text-green-500" />
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default ScholarshipCard;
