
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PlanCard } from "./PlanCard";

interface AuthFormProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  isSignUp: boolean;
  setIsSignUp: (isSignUp: boolean) => void;
  selectedTier: "free" | "premium" | null;
  setSelectedTier: (tier: "free" | "premium" | null) => void;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export const AuthForm = ({
  email,
  setEmail,
  password,
  setPassword,
  isSignUp,
  setIsSignUp,
  selectedTier,
  setSelectedTier,
  loading,
  onSubmit,
}: AuthFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
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
            <PlanCard
              type="free"
              isSelected={selectedTier === 'free'}
              onClick={() => setSelectedTier('free')}
            />
            <PlanCard
              type="premium"
              isSelected={selectedTier === 'premium'}
              onClick={() => setSelectedTier('premium')}
            />
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
  );
};
