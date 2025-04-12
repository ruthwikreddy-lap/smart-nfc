
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import GeneratedPage from "@/components/GeneratedPage";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getPageByPath, normalizePath } from "@/lib/localStorageDB";
import { toast } from "sonner";

const UserPage = () => {
  const { path } = useParams<{ path: string }>();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [validPath, setValidPath] = useState(false);
  const navigate = useNavigate();
  
  // Track retrieval attempts to prevent infinite redirects
  const [retriesCount, setRetriesCount] = useState(0);

  useEffect(() => {
    const validatePath = async () => {
      if (!path) {
        setError("No profile path provided");
        setLoading(false);
        return;
      }

      try {
        console.log("Attempting to validate path:", path);
        const normalizedPath = normalizePath(path);
        console.log("Normalized path:", normalizedPath);
        
        // First try to fetch from Supabase (this should work across all devices)
        let found = false;
        
        try {
          const { data, error: supabaseError } = await supabase
            .from('pages')
            .select('path, user_id')
            .eq('path', normalizedPath)
            .maybeSingle();

          if (supabaseError) {
            console.error("Supabase error:", supabaseError);
          }

          // If found in Supabase, mark as valid
          if (data) {
            console.log("Found path in Supabase:", data);
            found = true;
            setValidPath(true);
            setLoading(false);
          } else {
            console.log("Path not found in Supabase, will check localStorage");
          }
        } catch (supaErr) {
          console.error("Error querying Supabase:", supaErr);
        }
        
        // If not found in Supabase, check localStorage (this only works on the original device)
        if (!found) {
          const localPageData = getPageByPath(normalizedPath);
          
          if (localPageData) {
            console.log("Found path in localStorage:", localPageData);
            
            // Try to upload to Supabase for cross-device access if this is the first time
            // we're checking and it doesn't already exist there
            if (retriesCount === 0) {
              try {
                const { error: uploadError } = await supabase
                  .from('pages')
                  .upsert([{
                    path: normalizedPath,
                    user_id: localPageData.user_id,
                    id: localPageData.id
                  }]);
                
                if (uploadError) {
                  console.error("Error uploading page to Supabase:", uploadError);
                } else {
                  console.log("Successfully uploaded page to Supabase for cross-device access");
                }
              } catch (uploadErr) {
                console.error("Exception while uploading to Supabase:", uploadErr);
              }
            }
            
            setValidPath(true);
            setLoading(false);
          } else {
            console.log("Path not found in localStorage either");
            
            // If we've already retried once and still can't find the page, show 404
            if (retriesCount > 0) {
              toast.error("Profile not found", {
                description: "This profile doesn't exist or may not be accessible from this device."
              });
              navigate('/not-found', { 
                state: { 
                  attemptedPath: normalizedPath, 
                  message: "This profile doesn't exist or may only be available from the device it was created on unless you're signed in with the same account." 
                } 
              });
              return;
            }
            
            // Give Supabase another chance with a slight delay (data might be propagating)
            setRetriesCount(prev => prev + 1);
            setTimeout(() => {
              setLoading(true); // Keep showing loading
              validatePath(); // Try again
            }, 2000); // Wait 2 seconds before retrying
          }
        }
      } catch (err) {
        console.error("Error validating path:", err);
        setLoading(false);
        setError("Error checking profile");
        toast.error("Error checking profile", {
          description: "There was a problem accessing this profile."
        });
      }
    };

    validatePath();
  }, [path, navigate, retriesCount]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black to-gray-900">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4"></div>
          <div className="animate-pulse text-white text-xl">Loading profile...</div>
          {retriesCount > 0 && (
            <p className="text-white/70 mt-4 text-sm text-center max-w-md">
              Searching for profile data across our servers...
              <br />This may take a moment.
            </p>
          )}
        </div>
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
