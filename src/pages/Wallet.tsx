
import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ExternalLink, X, ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

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

const WalletPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: savedScholarships, isLoading } = useQuery({
    queryKey: ['saved-scholarships'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: savedScholarships, error } = await supabase
        .from('saved_scholarships')
        .select(`id, applied, scholarship:scholarships (id, title, amount, deadline, url, provider)`)
        .eq('profile_id', user.id)
        .order('created_at', { ascending: false });

      if (error) { console.error('Error fetching saved scholarships:', error); throw error; }

      const now = new Date();
      return (savedScholarships as SavedScholarship[]).filter(saved => new Date(saved.scholarship.deadline) > now);
    },
  });

  const handleRemoveScholarship = async (scholarshipId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase.from('saved_scholarships').delete().eq('scholarship_id', scholarshipId).eq('profile_id', user.id);
      if (error) throw error;

      queryClient.setQueryData(['saved-scholarships'], (oldData: SavedScholarship[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.filter(saved => saved.scholarship.id !== scholarshipId);
      });

      toast({ title: "Scholarship removed", description: "The scholarship has been removed from your wallet." });
    } catch (error) {
      console.error('Error removing scholarship:', error);
      toast({ title: "Error", description: "Failed to remove scholarship. Please try again.", variant: "destructive" });
    }
  };

  const formatDeadline = (dateString: string) => {
    const deadline = new Date(dateString);
    const now = new Date();
    const daysUntilDeadline = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return {
      formatted: deadline.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      daysLeft: daysUntilDeadline
    };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Button variant="ghost" className="mr-4" onClick={() => navigate('/')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">My Scholarship Wallet</h1>
      </div>

      {!savedScholarships?.length ? (
        <div className="text-center text-muted-foreground p-4">No saved scholarships yet</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {savedScholarships.map((saved) => {
            const deadline = formatDeadline(saved.scholarship.deadline);
            return (
              <div key={saved.id} className="bg-card p-4 rounded-lg shadow-sm border relative hover:shadow-md transition-shadow">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 hover:bg-destructive hover:text-white rounded-full"
                  onClick={() => handleRemoveScholarship(saved.scholarship.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
                
                <h3 className="font-medium text-foreground mb-2 pr-8">{saved.scholarship.title}</h3>
                <p className="text-sm text-muted-foreground mb-2">Provider: {saved.scholarship.provider}</p>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge variant="outline" className="bg-gradient-primary text-primary-foreground border-0">
                    ${saved.scholarship.amount.toLocaleString()}
                  </Badge>
                  <Badge variant="outline" className={
                    deadline.daysLeft <= 7 
                      ? 'bg-destructive/10 text-destructive' 
                      : deadline.daysLeft <= 30 
                        ? 'bg-warning/10 text-warning' 
                        : 'bg-gradient-primary text-primary-foreground border-0'
                  }>
                    {deadline.daysLeft} days left
                  </Badge>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full flex items-center justify-center gap-2 hover:bg-gradient-primary hover:text-primary-foreground transition-colors"
                  onClick={() => window.open(saved.scholarship.url, '_blank')}
                >
                  Apply Now <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WalletPage;
