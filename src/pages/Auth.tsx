import { SignIn, SignUp, useAuth } from "@clerk/clerk-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Target } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Auth = () => {
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();

  // Redirect to dashboard if already signed in
  useEffect(() => {
    if (isSignedIn) {
      navigate("/dashboard");
    }
  }, [isSignedIn, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 bg-primary flex items-center justify-center">
              <Target className="w-7 h-7 text-primary-foreground" />
            </div>
            <span className="text-3xl font-black text-foreground uppercase tracking-tight">SpearfishIn AI</span>
          </div>
          <h1 className="text-4xl font-black text-foreground mb-2">
            Welcome
          </h1>
          <p className="text-muted-foreground text-lg">
            Sign in or create an account to get started
          </p>
        </div>

        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="signin" className="mt-6">
            <SignIn 
              routing="hash"
              afterSignInUrl="/dashboard"
              appearance={{
                elements: {
                  rootBox: "mx-auto",
                  card: "shadow-none border-2 border-border",
                }
              }}
            />
          </TabsContent>
          <TabsContent value="signup" className="mt-6">
            <SignUp 
              routing="hash"
              afterSignUpUrl="/onboarding"
              appearance={{
                elements: {
                  rootBox: "mx-auto",
                  card: "shadow-none border-2 border-border",
                }
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Auth;
