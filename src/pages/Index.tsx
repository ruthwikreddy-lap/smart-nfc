
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { ArrowRight, User, Sparkles, Palette } from "lucide-react";

const Index = () => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-black text-white">
      <div className="w-full max-w-4xl mx-auto">
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-block p-3 mb-6 rounded-full bg-gradient-to-br from-[#007BFF]/20 to-transparent backdrop-blur-sm">
            <Sparkles className="h-12 w-12 text-[#007BFF]" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4 gradient-heading tracking-tight">
            Create Your Digital Identity
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto mb-8">
            Build a minimalist personal webpage with a custom URL that represents your professional brand
          </p>
          
          {user ? (
            <div className="flex flex-col items-center">
              <Button asChild size="lg" className="group px-8 py-6 bg-[#007BFF] hover:bg-[#0066CC] text-white blue-glow">
                <Link to="/dashboard" className="flex items-center">
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <p className="mt-4 text-white/50 text-sm">Manage your profile and view analytics</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="group px-8 py-6 bg-[#007BFF] hover:bg-[#0066CC] text-white blue-glow">
                  <Link to="/auth" className="flex items-center">
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="px-8 py-6 border-[#007BFF] text-[#007BFF] hover:bg-[#007BFF]/10">
                  <Link to="/auth" className="flex items-center">
                    <User className="mr-2 h-5 w-5" />
                    Sign In
                  </Link>
                </Button>
              </div>
              <p className="text-white/50 text-sm">No credit card required. Create your page in minutes.</p>
            </div>
          )}
        </div>
        
        {/* Feature highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="p-6 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
            <div className="h-12 w-12 rounded-full bg-[#007BFF]/20 flex items-center justify-center mb-4">
              <User className="h-6 w-6 text-[#007BFF]" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Minimalist Profile</h3>
            <p className="text-white/70">Create a sleek, professional online presence with our minimalist templates</p>
          </div>
          
          <div className="p-6 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
            <div className="h-12 w-12 rounded-full bg-[#007BFF]/20 flex items-center justify-center mb-4">
              <Sparkles className="h-6 w-6 text-[#007BFF]" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Modern Design</h3>
            <p className="text-white/70">Stand out with a clean, black & white aesthetic that highlights your content</p>
          </div>
          
          <div className="p-6 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
            <div className="h-12 w-12 rounded-full bg-[#007BFF]/20 flex items-center justify-center mb-4">
              <Palette className="h-6 w-6 text-[#007BFF]" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Multiple Themes</h3>
            <p className="text-white/70">Choose from dark, light, or teal themes to personalize your professional page</p>
          </div>
        </div>
      </div>
      
      <div className="text-white/40 text-sm mt-auto pt-8">
        &copy; 2025 PageGenerator • Built with Lovable
      </div>
    </div>
  );
};

export default Index;
