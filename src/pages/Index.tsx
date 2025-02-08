
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import ScholarshipSwiper from '@/components/ScholarshipSwiper';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const Index = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check current auth status
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out successfully",
        description: "You have been signed out of your account.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem signing out.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container px-4 py-8">
        <div className="flex justify-end mb-6">
          {user ? (
            <Button onClick={handleLogout} variant="outline">
              Log Out
            </Button>
          ) : (
            <Button onClick={() => navigate('/auth')} variant="outline">
              Log In
            </Button>
          )}
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-accent mb-4">SwipeScholar</h1>
          <p className="text-lg text-muted-foreground">
            Find and apply for scholarships with a simple swipe
          </p>
        </div>

        <ScholarshipSwiper />

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            Swipe right to apply, left to skip
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
