
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

const Wallet = () => {
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
    <div className="space-y-4">
      {savedScholarships.map((saved) => (
        <Card key={saved.id} className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-lg text-accent mb-1">
                {saved.scholarship.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-2">
                Provider: {saved.scholarship.provider}
              </p>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="bg-primary/10 text-primary">
                  ${saved.scholarship.amount.toLocaleString()}
                </Badge>
                <Badge variant="outline" className="bg-accent/10 text-accent">
                  Deadline: {formatDeadline(saved.scholarship.deadline)}
                </Badge>
              </div>
            </div>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => window.open(saved.scholarship.url, '_blank')}
            >
              Apply Now <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default Wallet;
