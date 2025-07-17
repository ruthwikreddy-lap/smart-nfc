import { useParams, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import EmergencyCardDisplay from "@/components/EmergencyCardDisplay";
import { Loader2 } from "lucide-react";

export default function EmergencyCard() {
  const { path } = useParams<{ path: string }>();

  const { data: emergencyCard, isLoading, error } = useQuery({
    queryKey: ['emergency-card', path],
    queryFn: async () => {
      if (!path) throw new Error('No path provided');
      
      const { data, error } = await supabase
        .from('emergency_cards')
        .select('*')
        .eq('path', path)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!path,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading emergency card...</p>
        </div>
      </div>
    );
  }

  if (error || !emergencyCard) {
    return <Navigate to="/not-found" replace />;
  }

  return <EmergencyCardDisplay data={emergencyCard} />;
}