import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import ScholarshipSwiper from '@/components/ScholarshipSwiper';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { GraduationCap, Rocket, DollarSign, Clock, Sparkles, BookOpen, Users, Trophy, Wallet as WalletIcon } from 'lucide-react';
import { AccountDropdown } from '@/components/AccountDropdown';
import Wallet from '@/components/Wallet';
import { CrawlForm } from '@/components/CrawlForm';
import { useIsMobile } from '@/hooks/use-mobile';

const Index = () => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    // Initialize auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        setIsAdmin(session.user.email === 'admin@example.com');
      } else {
        setUser(null);
        setIsAdmin(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser(session.user);
        setIsAdmin(session.user.email === 'admin@example.com');
      } else {
        setUser(null);
        setIsAdmin(false);
      }
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
    <div className="min-h-screen min-w-screen bg-gradient-to-b from-[#9b87f5] via-[#D946EF] to-[#FDE1D3] overflow-x-hidden">
      <div className={`container px-4 ${isMobile ? 'py-4' : 'py-8'}`}>
        <div className="flex justify-end mb-6 pt-safe">
          {user ? (
            <AccountDropdown />
          ) : (
            <Button onClick={() => navigate('/auth')} variant="outline" className="bg-white hover:bg-gray-100 shadow-lg">
              Log In
            </Button>
          )}
        </div>

        <div className={`text-center mb-16 animate-fade-in ${isMobile ? 'px-2' : ''}`}>
          <div className="flex justify-center mb-6">
            <GraduationCap className="w-16 h-16 md:w-20 md:h-20 text-white animate-bounce" />
          </div>
          <h1 className={`${isMobile ? 'text-5xl' : 'text-7xl'} font-bold text-white mb-6 drop-shadow-lg`}>
            SwipeScholar
          </h1>
          <p className="text-lg md:text-2xl text-white mb-8 max-w-2xl mx-auto leading-relaxed">
            Find Your Perfect Scholarship Match with a Simple Swipe! Join students across the country who are securing their funding through SwipeScholar.
          </p>
          {!user && (
            <Button 
              onClick={() => navigate('/auth')} 
              className={`bg-white text-accent hover:bg-white/90 ${isMobile ? 'px-6 py-4 text-lg' : 'px-8 py-6 text-xl'} rounded-full shadow-lg hover:scale-105 transition-transform animate-pulse`}
            >
              <Sparkles className="mr-2 h-5 w-5 md:h-6 md:w-6" />
              Start Your Journey Today
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 mb-16">
          <div className="bg-white/95 p-6 md:p-8 rounded-2xl shadow-xl hover:scale-105 transition-transform group">
            <div className="flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-primary rounded-2xl mb-4 md:mb-6 mx-auto group-hover:rotate-12 transition-transform">
              <Rocket className="text-white w-6 h-6 md:w-8 md:h-8" />
            </div>
            <h3 className="text-lg md:text-xl font-bold text-primary mb-3 md:mb-4 text-center">Quick & Easy</h3>
            <p className="text-sm md:text-base text-muted-foreground text-center leading-relaxed">Swipe right on scholarships that match your profile - as simple as using your favorite social app!</p>
          </div>

          <div className="bg-white/95 p-6 md:p-8 rounded-2xl shadow-xl hover:scale-105 transition-transform group">
            <div className="flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-accent rounded-2xl mb-4 md:mb-6 mx-auto group-hover:rotate-12 transition-transform">
              <BookOpen className="text-white w-6 h-6 md:w-8 md:h-8" />
            </div>
            <h3 className="text-lg md:text-xl font-bold text-accent mb-3 md:mb-4 text-center">Personalized Matches</h3>
            <p className="text-sm md:text-base text-muted-foreground text-center leading-relaxed">Get scholarships tailored to your unique academic profile and interests</p>
          </div>

          <div className="bg-white/95 p-6 md:p-8 rounded-2xl shadow-xl hover:scale-105 transition-transform group">
            <div className="flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-primary rounded-2xl mb-4 md:mb-6 mx-auto group-hover:rotate-12 transition-transform">
              <DollarSign className="text-white w-6 h-6 md:w-8 md:h-8" />
            </div>
            <h3 className="text-lg md:text-xl font-bold text-primary mb-3 md:mb-4 text-center">Save Money</h3>
            <p className="text-sm md:text-base text-muted-foreground text-center leading-relaxed">Access thousands of dollars in scholarship opportunities just waiting for you</p>
          </div>

          <div className="bg-white/95 p-6 md:p-8 rounded-2xl shadow-xl hover:scale-105 transition-transform group">
            <div className="flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-accent rounded-2xl mb-4 md:mb-6 mx-auto group-hover:rotate-12 transition-transform">
              <Clock className="text-white w-6 h-6 md:w-8 md:h-8" />
            </div>
            <h3 className="text-lg md:text-xl font-bold text-accent mb-3 md:mb-4 text-center">Save Time</h3>
            <p className="text-sm md:text-base text-muted-foreground text-center leading-relaxed">Apply to multiple scholarships efficiently with your single profile</p>
          </div>
        </div>

        {user && (
          <>
            <div className={`max-w-md mx-auto mb-24 ${isMobile ? 'px-2' : ''}`}>
              <ScholarshipSwiper />
              <div className="-mt-12 text-center mb-8">
                <p className="text-lg text-white font-medium">
                  Swipe right to save to wallet, left to skip
                </p>
              </div>
            </div>
            
            {isAdmin && (
              <div className="max-w-2xl mx-auto mb-12">
                <h2 className="text-2xl font-semibold text-white mb-6">Add New Scholarship</h2>
                <CrawlForm />
              </div>
            )}

            <div className="max-w-7xl mx-auto bg-white/95 rounded-xl p-6 md:p-8 shadow-lg">
              <h2 className="text-2xl font-semibold text-accent mb-6 flex items-center gap-2">
                <WalletIcon className="h-6 w-6" />
                Your Scholarship Wallet
              </h2>
              <Wallet className="mt-4" />
            </div>
          </>
        )}

        {!user && (
          <div className="text-center mt-16 bg-white/95 p-8 md:p-12 rounded-3xl shadow-xl animate-fade-in">
            <div className="flex justify-center gap-4 md:gap-6 mb-6 md:mb-8">
              <Users className="w-10 h-10 md:w-12 md:h-12 text-primary animate-bounce" />
              <Trophy className="w-10 h-10 md:w-12 md:h-12 text-accent animate-bounce delay-100" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4 md:mb-6">Join Our Community of Successful Scholars</h2>
            <p className="text-lg md:text-xl text-muted-foreground mb-6 md:mb-8 max-w-2xl mx-auto">
              Thousands of students have already found their perfect scholarship match with SwipeScholar. Don't miss out on opportunities waiting for you!
            </p>
            <Button 
              onClick={() => navigate('/auth')} 
              className={`bg-accent hover:bg-accent/90 text-white ${isMobile ? 'px-6 py-4 text-lg' : 'px-8 py-6 text-xl'} rounded-full shadow-lg hover:scale-105 transition-transform`}
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
