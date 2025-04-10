
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  
  // Redirect if already logged in
  if (user) {
    navigate("/dashboard");
    return null;
  }

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

  const handleTestLogin = async () => {
    setIsSubmitting(true);
    try {
      await signIn("test@gmail.com", "test123");
    } catch (error) {
      console.error("Test login error:", error);
      toast.error("Failed to log in with test account. Creating a test account first.");
      
      // Try to create the test account if it doesn't exist
      try {
        await signUp("test@gmail.com", "test123");
        toast.success("Test account created. Please try logging in now.");
      } catch (signupError) {
        console.error("Test signup error:", signupError);
        toast.error("Failed to create test account.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

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
              <Button 
                type="button" 
                variant="outline" 
                className="w-full" 
                onClick={handleTestLogin}
                disabled={isSubmitting}
              >
                Use Test Account (test@gmail.com)
              </Button>
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
