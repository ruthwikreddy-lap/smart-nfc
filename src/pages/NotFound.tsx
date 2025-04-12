
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home, LogIn, RefreshCw } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const state = location.state as { 
    attemptedPath?: string;
    message?: string;
  } | null;

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      state?.attemptedPath || location.pathname
    );
  }, [location.pathname, state]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black to-gray-900 p-4">
      <div className="text-center bg-black/80 border border-primary/30 p-8 rounded-lg max-w-md w-full backdrop-blur-sm shadow-lg animate-fade-in">
        <div className="text-6xl font-bold text-primary mb-4">404</div>
        <h1 className="text-2xl font-bold text-white mb-4">Page Not Found</h1>
        <p className="text-gray-400 mb-6">
          {state?.message || 
            "The page you're looking for doesn't exist or may have been moved. " +
            "For shared profile pages, make sure you're accessing from the device where it was created, " +
            "or sign in with the same account that created it."}
        </p>
        
        <div className="space-y-4">
          <p className="text-primary/80 text-sm mb-4">
            <strong>Important:</strong> Profile pages are stored in our database for cross-device access. 
            If you've recently created this page, it may take a moment to propagate to all servers.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild variant="default" className="w-full sm:w-auto blue-glow">
              <Link to="/">
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="w-full sm:w-auto border-primary/40 text-primary">
              <Link to="/auth">
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
              </Link>
            </Button>
            
            <Button 
              variant="ghost" 
              className="w-full sm:w-auto text-gray-400"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
