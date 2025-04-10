
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { toast } from "sonner";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      toast.error("You need to be logged in to access this page");
    }
  }, [loading, user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-black">
        <div className="animate-pulse text-xl text-white">Loading...</div>
      </div>
    );
  }

  if (!user) {
    // Redirect to auth page but save the location they were trying to access
    return <Navigate to="/auth" state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
