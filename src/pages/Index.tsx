
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import ScholarshipSwiper from '@/components/ScholarshipSwiper';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Rocket, GraduationCap, DollarSign, Clock } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-b from-[#86A789] to-[#E9E5D6]">
      <div className="container px-4 py-8">
        <div className="flex justify-end mb-6">
          {user ? (
            <Button onClick={handleLogout} variant="outline" className="bg-white hover:bg-gray-100">
              Log Out
            </Button>
          ) : (
            <Button onClick={() => navigate('/auth')} variant="outline" className="bg-white hover:bg-gray-100">
              Log In
            </Button>
          )}
        </div>

        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-6xl font-bold text-white mb-4 drop-shadow-lg">
            SwipeScholar
          </h1>
          <p className="text-xl text-white mb-8">
            Find Your Perfect Scholarship Match with a Simple Swipe
          </p>
          {!user && (
            <Button 
              onClick={() => navigate('/auth')} 
              className="bg-accent hover:bg-accent/90 text-white px-8 py-6 text-lg rounded-full shadow-lg hover:scale-105 transition-transform"
            >
              Start Your Journey Today
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white/90 p-6 rounded-lg shadow-lg hover:scale-105 transition-transform">
            <div className="flex items-center justify-center w-12 h-12 bg-primary rounded-full mb-4 mx-auto">
              <Rocket className="text-white" />
            </div>
            <h3 className="text-lg font-semibold text-accent mb-2 text-center">Quick & Easy</h3>
            <p className="text-muted-foreground text-center">Swipe right on scholarships that match your profile</p>
          </div>

          <div className="bg-white/90 p-6 rounded-lg shadow-lg hover:scale-105 transition-transform">
            <div className="flex items-center justify-center w-12 h-12 bg-primary rounded-full mb-4 mx-auto">
              <GraduationCap className="text-white" />
            </div>
            <h3 className="text-lg font-semibold text-accent mb-2 text-center">Personalized Matches</h3>
            <p className="text-muted-foreground text-center">Get scholarships tailored to your academic profile</p>
          </div>

          <div className="bg-white/90 p-6 rounded-lg shadow-lg hover:scale-105 transition-transform">
            <div className="flex items-center justify-center w-12 h-12 bg-primary rounded-full mb-4 mx-auto">
              <DollarSign className="text-white" />
            </div>
            <h3 className="text-lg font-semibold text-accent mb-2 text-center">Save Money</h3>
            <p className="text-muted-foreground text-center">Access thousands of dollars in scholarship opportunities</p>
          </div>

          <div className="bg-white/90 p-6 rounded-lg shadow-lg hover:scale-105 transition-transform">
            <div className="flex items-center justify-center w-12 h-12 bg-primary rounded-full mb-4 mx-auto">
              <Clock className="text-white" />
            </div>
            <h3 className="text-lg font-semibold text-accent mb-2 text-center">Save Time</h3>
            <p className="text-muted-foreground text-center">Apply to multiple scholarships with one profile</p>
          </div>
        </div>

        {user && <ScholarshipSwiper />}

        {user && (
          <div className="mt-12 text-center">
            <p className="text-sm text-white">
              Swipe right to apply, left to skip
            </p>
          </div>
        )}

        {!user && (
          <div className="text-center mt-12 bg-white/90 p-8 rounded-lg shadow-lg animate-fade-in">
            <h2 className="text-2xl font-bold text-accent mb-4">Ready to Start?</h2>
            <p className="text-lg text-muted-foreground mb-6">
              Join thousands of students who have found their perfect scholarship match with SwipeScholar.
            </p>
            <Button 
              onClick={() => navigate('/auth')} 
              className="bg-accent hover:bg-accent/90 text-white"
            >
              Sign Up Now
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
