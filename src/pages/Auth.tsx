
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthForm } from "@/components/auth/AuthForm";
import { useAuth } from "@/hooks/useAuth";

const Auth = () => {
  const {
    email,
    setEmail,
    password,
    setPassword,
    loading,
    isSignUp,
    setIsSignUp,
    selectedTier,
    setSelectedTier,
    handleAuth,
  } = useAuth();

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
          <AuthForm
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            isSignUp={isSignUp}
            setIsSignUp={setIsSignUp}
            selectedTier={selectedTier}
            setSelectedTier={setSelectedTier}
            loading={loading}
            onSubmit={handleAuth}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
