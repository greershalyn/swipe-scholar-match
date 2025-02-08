
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ExternalLink, Wallet as WalletIcon } from 'lucide-react';
import { Badge } from './ui/badge';

interface SavedScholarship {
  id: string;
  scholarship: {
    id: string;
    title: string;
    amount: number;
    deadline: string;
    url: string;
    provider: string;
  };
  applied: boolean;
}

interface WalletProps {
  className?: string;
}

const Wallet: React.FC<WalletProps> = ({ className }) => {
  const { data: savedScholarships, isLoading } = useQuery({
    queryKey: ['saved-scholarships'],
    queryFn: async () => {
      const { data: savedScholarships, error } = await supabase
        .from('saved_scholarships')
        .select(`
          id,
          applied,
          scholarship:scholarships (
            id,
            title,
            amount,
            deadline,
            url,
            provider
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return savedScholarships as SavedScholarship[];
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!savedScholarships?.length) {
    return (
      <div className="text-center text-muted-foreground p-4">
        No saved scholarships yet. Swipe right on scholarships to save them here!
      </div>
    );
  }

  const formatDeadline = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className={className}>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {savedScholarships.map((saved) => (
          <Card key={saved.id} className="p-6 hover:shadow-lg transition-shadow duration-200 bg-white/95">
            <div className="flex flex-col h-full">
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-accent mb-2 line-clamp-2">
                  {saved.scholarship.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Provider: {saved.scholarship.provider}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="outline" className="bg-primary/10 text-primary font-medium">
                    ${saved.scholarship.amount.toLocaleString()}
                  </Badge>
                  <Badge variant="outline" className="bg-accent/10 text-accent font-medium">
                    Due {formatDeadline(saved.scholarship.deadline)}
                  </Badge>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2 mt-2 hover:bg-accent hover:text-white transition-colors"
                onClick={() => window.open(saved.scholarship.url, '_blank')}
              >
                Apply Now <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Wallet;
