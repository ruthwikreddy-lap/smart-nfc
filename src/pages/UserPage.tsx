
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import GeneratedPage from "@/components/GeneratedPage";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const UserPage = () => {
  const { path } = useParams<{ path: string }>();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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
          .select('path')
          .eq('path', path)
          .maybeSingle();

        if (error) {
          console.error("Supabase error:", error);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error validating path:", err);
        setLoading(false);
      }
    };

    validatePath();
  }, [path]);

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
      <GeneratedPage />
    </div>
  );
};

export default UserPage;
