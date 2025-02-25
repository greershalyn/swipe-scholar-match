
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Crown, Star, Lightbulb, FileCheck } from "lucide-react";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [selectedTier, setSelectedTier] = useState<"free" | "premium" | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const domain = window.location.origin;
  const stripeUrl = `https://buy.stripe.com/28o7sUcWUaeP3xSeUU?return_url=${encodeURIComponent(domain + '/questionnaire')}`;

  const checkProfileCompletion = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error checking profile:", error);
      return false;
    }

    return !!data?.full_name;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) {
        if (!selectedTier) {
          toast({
            title: "Please Select a Plan",
            description: "Choose either the Free or Premium plan to continue.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              subscription_tier: selectedTier,
            },
          },
        });
        
        if (error?.message.includes("User already registered")) {
          toast({
            title: "Account Exists",
            description: "An account with this email already exists. Please sign in instead.",
            variant: "destructive",
          });
          setIsSignUp(false);
        } else if (error) {
          throw error;
        } else {
          toast({
            title: "Success!",
            description: "Please check your email to verify your account.",
          });
          
          // If premium tier selected, redirect to payment page
          if (selectedTier === 'premium') {
            window.location.href = stripeUrl;
          } else {
            // For free tier, redirect to questionnaire
            navigate('/questionnaire');
          }
        }
      } else {
        const { data: { user }, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        
        if (user) {
          const hasCompletedProfile = await checkProfileCompletion(user.id);
          navigate(hasCompletedProfile ? "/" : "/questionnaire");
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{isSignUp ? "Create Account" : "Welcome Back"}</CardTitle>
          <CardDescription>
            {isSignUp
              ? "Sign up to start applying for scholarships"
              : "Sign in to continue your scholarship journey"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {isSignUp && (
              <div className="space-y-4 pt-4">
                <Label>Select Your Plan</Label>
                <div className="grid gap-4">
                  <Card 
                    className={`cursor-pointer transition-all ${
                      selectedTier === 'free' ? 'ring-2 ring-purple-500' : ''
                    }`}
                    onClick={() => setSelectedTier('free')}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold">Free Plan</h3>
                        <span className="text-lg font-bold">$0</span>
                      </div>
                      <ul className="text-sm space-y-2">
                        <li className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-purple-500" />
                          Access to scholarship database
                        </li>
                        <li className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-purple-500" />
                          Basic profile customization
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card 
                    className={`cursor-pointer transition-all ${
                      selectedTier === 'premium' ? 'ring-2 ring-purple-500' : ''
                    }`}
                    onClick={() => setSelectedTier('premium')}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold">Premium Plan</h3>
                        <span className="text-lg font-bold">$10/month</span>
                      </div>
                      <ul className="text-sm space-y-2">
                        <li className="flex items-center gap-2">
                          <Crown className="h-4 w-4 text-yellow-500" />
                          Everything in Free plan
                        </li>
                        <li className="flex items-center gap-2">
                          <Lightbulb className="h-4 w-4 text-yellow-500" />
                          AI Essay Assistant
                        </li>
                        <li className="flex items-center gap-2">
                          <FileCheck className="h-4 w-4 text-yellow-500" />
                          Professional writing feedback
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setSelectedTier(null);
              }}
            >
              {isSignUp
                ? "Already have an account? Sign In"
                : "Don't have an account? Sign Up"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
