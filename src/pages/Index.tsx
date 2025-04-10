
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

const Index = () => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">
          Create Your Personalized Web Page
        </h1>
        <p className="text-xl text-white/80 mb-6">
          Build a custom web page with a unique URL that you can share with the world
        </p>
        
        {user ? (
          <Button asChild size="lg" className="bg-[#007BFF] hover:bg-[#0066CC] text-white blue-glow">
            <Link to="/dashboard">
              Go to Dashboard
            </Link>
          </Button>
        ) : (
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-[#007BFF] hover:bg-[#0066CC] text-white blue-glow">
              <Link to="/auth">
                Sign In
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-[#007BFF] text-[#007BFF] hover:bg-[#007BFF]/10">
              <Link to="/auth">
                Create Account
              </Link>
            </Button>
          </div>
        )}
      </div>
      
      <div className="text-white/60 text-sm mt-8">
        &copy; 2025 PageGenerator • Built with Lovable
      </div>
    </div>
  );
};

export default Index;
