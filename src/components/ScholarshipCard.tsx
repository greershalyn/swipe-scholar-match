
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion, PanInfo } from 'framer-motion';
import { ExternalLink, ThumbsUp, ThumbsDown, AlertTriangle } from 'lucide-react';
import { Scholarship } from '@/types/scholarship';
import { useToast } from '@/components/ui/use-toast';

interface ScholarshipCardProps {
  scholarship: Scholarship;
  onSwipe: (direction: 'left' | 'right') => void;
}

const ScholarshipCard: React.FC<ScholarshipCardProps> = ({ scholarship, onSwipe }) => {
  const { toast } = useToast();

  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 100;
    if (info.offset.x > threshold) {
      onSwipe('right');
    } else if (info.offset.x < -threshold) {
      onSwipe('left');
    }
  };

  const formatDeadline = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.error('Invalid date string:', dateString);
        return 'Deadline not specified';
      }
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Deadline not specified';
    }
  };

  const getScholarshipUrl = () => {
    // Check if we have a valid source_url first
    if (scholarship.source_url && isValidUrl(scholarship.source_url)) {
      return scholarship.source_url;
    }
    
    // Then check the main url
    if (scholarship.url && isValidUrl(scholarship.url)) {
      return scholarship.url;
    }

    // Generate a search URL as last resort
    return generateSearchUrl(scholarship);
  };

  const isValidUrl = (urlString: string): boolean => {
    try {
      const url = new URL(urlString);
      
      // First, check if it's using HTTPS (basic security check)
      if (url.protocol !== 'https:') {
        return false;
      }
      
      // Comprehensive list of trusted scholarship domains
      const trustedDomains = [
        '.edu',
        '.gov',
        '.org',
        'fastweb.com',
        'scholarships.com',
        'unigo.com',
        'cappex.com',
        'chegg.com',
        'collegeboard.org',
        'petersons.com',
        'niche.com',
        'salliemae.com',
        'studentaid.gov',
        'nsf.gov',
        'nacme.org',
        'bigfuture.collegeboard.org',
        'scholarshipamerica.org',
        'uncf.org',
        'thurgoodmarshallfund.net',
        'hispanicfund.org',
        'apiasf.org',
        'hsf.net',
        'gmsp.org',
        'jkcf.org'
      ];

      // Check for suspicious patterns that indicate placeholder URLs
      const suspiciousPatterns = [
        'example.com',
        'placeholder',
        'test',
        'lorem',
        'undefined',
        'null',
        'unknown'
      ];
      
      const hasSuspiciousPattern = suspiciousPatterns.some(pattern => 
        url.hostname.includes(pattern) || 
        url.pathname.includes(pattern)
      );
      
      if (hasSuspiciousPattern) {
        return false;
      }

      return (
        // Either a trusted domain OR not a placeholder domain
        (trustedDomains.some(domain => url.hostname.includes(domain)) ||
          !url.hostname.includes('example.com'))
      );
    } catch {
      return false;
    }
  };

  const generateSearchUrl = (scholarship: Scholarship): string => {
    // Create a more targeted search query to help users find the application
    const searchTerms = [
      scholarship.title,
      scholarship.provider,
      'scholarship',
      'application',
      'apply',
      'how to apply',
      'deadline',
      scholarship.deadline ? new Date(scholarship.deadline).getFullYear().toString() : ''
    ].filter(Boolean);
    
    const searchQuery = encodeURIComponent(searchTerms.join(' '));
    
    // Return a Google search with parameters that prioritize official sites
    return `https://www.google.com/search?q=${searchQuery}&tbm=lcl`;
  };

  const handleUrlClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.stopPropagation();
    const url = getScholarshipUrl();
    
    // If we're using the fallback search URL, show a toast to inform the user
    if (url.includes('google.com/search')) {
      toast({
        title: "Direct link unavailable",
        description: "Redirecting you to search results for this scholarship",
        duration: 3000
      });
    } else if (!isValidUrl(url)) {
      toast({
        title: "Warning: Unverified link",
        description: "This link hasn't been verified. Proceed with caution.",
        variant: "destructive",
        duration: 5000
      });
    }
  };

  if (!scholarship) {
    console.error('No scholarship data provided to ScholarshipCard');
    return null;
  }

  // Determine if URL is a direct application link or a search fallback
  const directLinkAvailable = scholarship.url && isValidUrl(scholarship.url) && 
    !scholarship.url.includes('google.com/search');

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
              ${scholarship.amount?.toLocaleString() ?? 'Amount not specified'}
            </Badge>
            <h2 className="text-2xl font-semibold text-accent mb-1">{scholarship.title || 'Untitled Scholarship'}</h2>
            <p className="text-sm text-muted-foreground">
              Deadline: {formatDeadline(scholarship.deadline)}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Provider: {scholarship.provider || 'Provider not specified'}
            </p>
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
          <p className="text-accent/80">{scholarship.description || 'No description available'}</p>
          
          <div>
            <h3 className="font-medium mb-2 text-accent">Requirements:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-accent/70">
              {Array.isArray(scholarship.requirements) && scholarship.requirements.length > 0 ? (
                scholarship.requirements.map((req, index) => (
                  <li key={index}>{req}</li>
                ))
              ) : (
                <li>No specific requirements listed</li>
              )}
            </ul>
          </div>

          <div className="flex items-center">
            <a
              href={getScholarshipUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center text-sm ${
                directLinkAvailable 
                  ? "text-primary hover:text-primary/80" 
                  : "text-amber-600 hover:text-amber-700"
              } transition-colors`}
              onClick={handleUrlClick}
            >
              {directLinkAvailable ? (
                <>View Application <ExternalLink className="ml-1 h-4 w-4" /></>
              ) : (
                <>
                  <AlertTriangle className="mr-1 h-4 w-4" />
                  Search for Application
                  <ExternalLink className="ml-1 h-4 w-4" />
                </>
              )}
            </a>
          </div>
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
