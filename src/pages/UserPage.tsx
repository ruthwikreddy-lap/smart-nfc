
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import GeneratedPage from "@/components/GeneratedPage";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getPageByPath } from "@/lib/localStorageDB";

const UserPage = () => {
  const { path } = useParams<{ path: string }>();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [validPath, setValidPath] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const validatePath = async () => {
      if (!path) {
        setError("No profile path provided");
        setLoading(false);
        return;
      }

      try {
        // Try to fetch from Supabase first
        const { data, error } = await supabase
          .from('pages')
          .select('path, user_id')
          .eq('path', path)
          .maybeSingle();

        if (error) {
          console.error("Supabase error:", error);
        }

        // If found in Supabase, mark as valid
        if (data) {
          setValidPath(true);
          setLoading(false);
          return;
        }

        // If not found in Supabase, check localStorage
        const localPageData = getPageByPath(path);
        
        if (localPageData) {
          setValidPath(true);
        } else {
          // If path doesn't exist anywhere, show the 404 page
          navigate('/not-found', { 
            state: { 
              attemptedPath: path, 
              message: "This profile may only be available from the device it was created on or may not exist." 
            } 
          });
          return;
        }

        setLoading(false);
      } catch (err) {
        console.error("Error validating path:", err);
        setLoading(false);
      }
    };

    validatePath();
  }, [path, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black to-gray-900">
        <div className="animate-pulse text-white text-xl">Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black to-gray-900 p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 w-full">
      {validPath && <GeneratedPage />}
    </div>
  );
};

export default UserPage;
