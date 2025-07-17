
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { User, Heart, Briefcase } from "lucide-react";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [accountType, setAccountType] = useState<"professional" | "emergency">("professional");
  const { signIn, signUp, user, isAdmin } = useAuth();
  const navigate = useNavigate();
  
  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (isAdmin) {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    }
  }, [user, isAdmin, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password);
        // Don't redirect after signup since they need to verify email
      }
    } catch (error) {
      console.error("Authentication error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTestLogin = async (type: "professional" | "emergency") => {
    setIsSubmitting(true);
    const testEmail = type === "professional" ? "test-professional@gmail.com" : "test-emergency@gmail.com";
    const testPassword = "test123";
    
    try {
      await signIn(testEmail, testPassword);
    } catch (error) {
      console.error("Test login error:", error);
      toast.error(`Failed to log in with test ${type} account. Creating account first.`);
      
      // Try to create the test account if it doesn't exist
      try {
        await signUp(testEmail, testPassword);
        toast.success(`Test ${type} account created. Please try logging in now.`);
      } catch (signupError) {
        console.error("Test signup error:", signupError);
        toast.error(`Failed to create test ${type} account.`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (user) {
    return null; // Don't render anything while redirecting
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-black">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">
          {isLogin ? "Sign In to Your Account" : "Create Your Account"}
        </h1>
        <p className="text-xl text-white/80">
          {isLogin 
            ? "Access your dashboard to manage your page" 
            : "Sign up to create your personalized web page with a unique URL"}
        </p>
      </div>
      
      <Card className="w-full max-w-md animate-fade-in">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">{isLogin ? "Sign In" : "Sign Up"}</CardTitle>
          <CardDescription>
            {isLogin 
              ? "Enter your credentials to access your account" 
              : "Create an account to get started"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isLogin && (
            <div className="space-y-4 mb-6">
              <Label className="text-base font-semibold">Account Type</Label>
              <div className="grid grid-cols-1 gap-3">
                <button
                  type="button"
                  onClick={() => setAccountType("professional")}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    accountType === "professional"
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      accountType === "professional" ? "bg-blue-500 text-white" : "bg-gray-100 dark:bg-gray-800"
                    }`}>
                      <Briefcase className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-semibold">Professional</div>
                      <div className="text-sm text-muted-foreground">
                        Create a professional profile page with your bio, links, and portfolio
                      </div>
                    </div>
                  </div>
                </button>
                
                <button
                  type="button"
                  onClick={() => setAccountType("emergency")}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    accountType === "emergency"
                      ? "border-red-500 bg-red-50 dark:bg-red-950/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      accountType === "emergency" ? "bg-red-500 text-white" : "bg-gray-100 dark:bg-gray-800"
                    }`}>
                      <Heart className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-semibold">Emergency</div>
                      <div className="text-sm text-muted-foreground">
                        Create emergency health cards with medical information for quick access
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
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
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
            >
              {isSubmitting ? "Processing..." : isLogin ? "Sign In" : "Sign Up"}
            </Button>
            
            <div className="text-center mt-4">
              <Button 
                type="button" 
                variant="link" 
                onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin ? "Need an account? Sign Up" : "Already have an account? Sign In"}
              </Button>
            </div>
            
            <div className="border-t pt-4 mt-4">
              <div className="text-sm text-muted-foreground mb-3 text-center">Test Accounts (for development)</div>
              <div className="grid grid-cols-1 gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  className="w-full" 
                  onClick={() => handleTestLogin("professional")}
                  disabled={isSubmitting}
                >
                  <Briefcase className="h-4 w-4 mr-2" />
                  Test Professional Account
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  className="w-full" 
                  onClick={() => handleTestLogin("emergency")}
                  disabled={isSubmitting}
                >
                  <Heart className="h-4 w-4 mr-2" />
                  Test Emergency Account
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      
      <div className="text-white/60 text-sm mt-8">
        &copy; 2025 PageGenerator • Built with Lovable
      </div>
    </div>
  );
};

export default AuthPage;
