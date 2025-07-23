
import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ExternalLink, Wallet as WalletIcon, X } from 'lucide-react';
import { Badge } from './ui/badge';
import { ScrollArea, ScrollBar } from './ui/scroll-area';
import { useToast } from './ui/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();

  const { data: savedScholarships, isLoading } = useQuery({
    queryKey: ['saved-scholarships'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

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
        .eq('profile_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching saved scholarships:', error);
        throw error;
      }

      // Filter out scholarships that are past their deadline
      const now = new Date();
      return (savedScholarships as SavedScholarship[]).filter(
        saved => new Date(saved.scholarship.deadline) > now
      );
    },
  });

  const handleRemoveScholarship = async (scholarshipId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('saved_scholarships')
        .delete()
        .eq('scholarship_id', scholarshipId)
        .eq('profile_id', user.id);

      if (error) throw error;

      // Invalidate and refetch saved scholarships
      queryClient.invalidateQueries({ queryKey: ['saved-scholarships'] });

      toast({
        title: "Scholarship removed",
        description: "The scholarship has been removed from your wallet.",
      });
    } catch (error) {
      console.error('Error removing scholarship:', error);
      toast({
        title: "Error",
        description: "Failed to remove scholarship. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!savedScholarships?.length) {
    return (
      <div className={`text-center text-muted-foreground ${isMobile ? 'p-2 text-sm' : 'p-4'}`}>
        No saved scholarships yet. Swipe right on scholarships to save them here!
      </div>
    );
  }

  const formatDeadline = (dateString: string) => {
    const deadline = new Date(dateString);
    const now = new Date();
    const daysUntilDeadline = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    return {
      formatted: deadline.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      daysLeft: daysUntilDeadline
    };
  };

  return (
    <div className={className}>
      <ScrollArea className="w-full">
        <div className={`flex ${isMobile ? 'gap-3 pb-3' : 'gap-4 pb-4'}`} style={{ minWidth: 'min-content' }}>
          {savedScholarships.map((saved) => {
            const deadline = formatDeadline(saved.scholarship.deadline);
            return (
              <Card key={saved.id} className={`${isMobile ? 'p-4' : 'p-6'} hover:shadow-lg transition-shadow duration-200 bg-white/95 relative`} style={{ width: isMobile ? '280px' : '320px', flexShrink: 0 }}>
                <Button
                  variant="ghost"
                  size={isMobile ? "sm" : "icon"}
                  className={`absolute ${isMobile ? 'top-1 right-1' : 'top-2 right-2'} hover:bg-destructive hover:text-white rounded-full`}
                  onClick={() => handleRemoveScholarship(saved.scholarship.id)}
                >
                  <X className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
                </Button>
                <div className="flex flex-col h-full">
                  <div className="flex-1">
                    <h3 className={`font-semibold ${isMobile ? 'text-base' : 'text-lg'} text-accent ${isMobile ? 'mb-1' : 'mb-2'} line-clamp-2`}>
                      {saved.scholarship.title}
                    </h3>
                    <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground ${isMobile ? 'mb-2' : 'mb-3'}`}>
                      Provider: {saved.scholarship.provider}
                    </p>
                    <div className={`flex flex-wrap ${isMobile ? 'gap-1 mb-3' : 'gap-2 mb-4'}`}>
                      <Badge variant="outline" className={`bg-primary/10 text-primary font-medium ${isMobile ? 'text-xs' : ''}`}>
                        ${saved.scholarship.amount.toLocaleString()}
                      </Badge>
                      <Badge variant="outline" className={`font-medium ${isMobile ? 'text-xs' : ''} ${
                        deadline.daysLeft <= 7 
                          ? 'bg-destructive/10 text-destructive' 
                          : deadline.daysLeft <= 30 
                            ? 'bg-warning/10 text-warning' 
                            : 'bg-accent/10 text-accent'
                      }`}>
                        {deadline.daysLeft} days left
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size={isMobile ? "sm" : "default"}
                    className={`w-full flex items-center justify-center gap-2 ${isMobile ? 'mt-1 text-xs' : 'mt-2'} hover:bg-accent hover:text-white transition-colors`}
                    onClick={() => window.open(saved.scholarship.url, '_blank')}
                  >
                    Apply Now <ExternalLink className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};

export default Wallet;

