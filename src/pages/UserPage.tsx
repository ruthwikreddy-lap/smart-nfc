
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
        // Try to fetch from Supabase first (this should work across all devices)
        const { data, error: supabaseError } = await supabase
          .from('pages')
          .select('path, user_id')
          .eq('path', path)
          .maybeSingle();

        if (supabaseError) {
          console.error("Supabase error:", supabaseError);
        }

        // If found in Supabase, mark as valid
        if (data) {
          console.log("Found path in Supabase:", data);
          setValidPath(true);
          setLoading(false);
          return;
        } else {
          console.log("Path not found in Supabase, checking localStorage");
        }

        // If not found in Supabase, check localStorage (this only works on the original device)
        const localPageData = getPageByPath(path);
        
        if (localPageData) {
          console.log("Found path in localStorage:", localPageData);
          setValidPath(true);
        } else {
          console.log("Path not found in localStorage either");
          // If path doesn't exist anywhere, show the 404 page with helpful context
          navigate('/not-found', { 
            state: { 
              attemptedPath: path, 
              message: "This profile is only available from the device it was created on or if you're logged in with the same account." 
            } 
          });
          return;
        }

        setLoading(false);
      } catch (err) {
        console.error("Error validating path:", err);
        setLoading(false);
        setError("Error checking profile");
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
