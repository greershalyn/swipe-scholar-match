import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import ScholarshipSwiper from '@/components/ScholarshipSwiper';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { GraduationCap, Rocket, DollarSign, Clock, Sparkles, BookOpen, Users, Trophy } from 'lucide-react';
import { AccountDropdown } from '@/components/AccountDropdown';

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
    <div className="min-h-screen bg-gradient-to-b from-[#9b87f5] via-[#D946EF] to-[#FDE1D3]">
      <div className="container px-4 py-8">
        <div className="flex justify-end mb-6">
          {user ? (
            <AccountDropdown />
          ) : (
            <Button onClick={() => navigate('/auth')} variant="outline" className="bg-white hover:bg-gray-100 shadow-lg">
              Log In
            </Button>
          )}
        </div>

        <div className="text-center mb-16 animate-fade-in">
          <div className="flex justify-center mb-6">
            <GraduationCap className="w-20 h-20 text-white animate-bounce" />
          </div>
          <h1 className="text-7xl font-bold text-white mb-6 drop-shadow-lg">
            SwipeScholar
          </h1>
          <p className="text-2xl text-white mb-8 max-w-2xl mx-auto leading-relaxed">
            Find Your Perfect Scholarship Match with a Simple Swipe! Join thousands of successful students who found their funding through SwipeScholar.
          </p>
          {!user && (
            <Button 
              onClick={() => navigate('/auth')} 
              className="bg-white text-accent hover:bg-white/90 px-8 py-6 text-xl rounded-full shadow-lg hover:scale-105 transition-transform animate-pulse"
            >
              <Sparkles className="mr-2 h-6 w-6" />
              Start Your Journey Today
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="bg-white/95 p-8 rounded-2xl shadow-xl hover:scale-105 transition-transform group">
            <div className="flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-6 mx-auto group-hover:rotate-12 transition-transform">
              <Rocket className="text-white w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-primary mb-4 text-center">Quick & Easy</h3>
            <p className="text-muted-foreground text-center leading-relaxed">Swipe right on scholarships that match your profile - as simple as using your favorite social app!</p>
          </div>

          <div className="bg-white/95 p-8 rounded-2xl shadow-xl hover:scale-105 transition-transform group">
            <div className="flex items-center justify-center w-16 h-16 bg-accent rounded-2xl mb-6 mx-auto group-hover:rotate-12 transition-transform">
              <BookOpen className="text-white w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-accent mb-4 text-center">Personalized Matches</h3>
            <p className="text-muted-foreground text-center leading-relaxed">Get scholarships tailored to your unique academic profile and interests</p>
          </div>

          <div className="bg-white/95 p-8 rounded-2xl shadow-xl hover:scale-105 transition-transform group">
            <div className="flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-6 mx-auto group-hover:rotate-12 transition-transform">
              <DollarSign className="text-white w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-primary mb-4 text-center">Save Money</h3>
            <p className="text-muted-foreground text-center leading-relaxed">Access thousands of dollars in scholarship opportunities just waiting for you</p>
          </div>

          <div className="bg-white/95 p-8 rounded-2xl shadow-xl hover:scale-105 transition-transform group">
            <div className="flex items-center justify-center w-16 h-16 bg-accent rounded-2xl mb-6 mx-auto group-hover:rotate-12 transition-transform">
              <Clock className="text-white w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-accent mb-4 text-center">Save Time</h3>
            <p className="text-muted-foreground text-center leading-relaxed">Apply to multiple scholarships efficiently with your single profile</p>
          </div>
        </div>

        {user && <ScholarshipSwiper />}

        {!user && (
          <div className="text-center mt-16 bg-white/95 p-12 rounded-3xl shadow-xl animate-fade-in">
            <div className="flex justify-center gap-6 mb-8">
              <Users className="w-12 h-12 text-primary animate-bounce" />
              <Trophy className="w-12 h-12 text-accent animate-bounce delay-100" />
            </div>
            <h2 className="text-3xl font-bold text-primary mb-6">Join Our Community of Successful Scholars</h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Thousands of students have already found their perfect scholarship match with SwipeScholar. Don't miss out on opportunities waiting for you!
            </p>
            <Button 
              onClick={() => navigate('/auth')} 
              className="bg-accent hover:bg-accent/90 text-white px-8 py-6 text-xl rounded-full shadow-lg hover:scale-105 transition-transform"
            >
              Sign Up Now
            </Button>
          </div>
        )}

        {user && (
          <div className="mt-8 text-center">
            <p className="text-lg text-white font-medium">
              Swipe right to apply, left to skip
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
