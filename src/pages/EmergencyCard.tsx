import { useParams, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import EmergencyCardDisplay from "@/components/EmergencyCardDisplay";
import { Loader2, Wifi, WifiOff } from "lucide-react";
import { useState, useEffect } from "react";

// Local storage fallback for cross-device access
const getEmergencyCardLocally = (path: string) => {
  try {
    // Try localStorage first
    let data = localStorage.getItem(`emergency-card-${path}`);
    if (data) return JSON.parse(data);
    
    // Try sessionStorage as fallback
    data = sessionStorage.getItem(`emergency-card-${path}`);
    if (data) {
      const parsed = JSON.parse(data);
      // Restore to localStorage
      localStorage.setItem(`emergency-card-${path}`, data);
      return parsed;
    }
    
    return null;
  } catch (error) {
    console.error('Error reading emergency card from local storage:', error);
    return null;
  }
};

export default function EmergencyCard() {
  const { path } = useParams<{ path: string }>();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Monitor online status for better UX
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const { data: emergencyCard, isLoading, error } = useQuery({
    queryKey: ['emergency-card', path],
    queryFn: async () => {
      if (!path) throw new Error('No path provided');
      
      // Try cloud storage first if online
      if (isOnline) {
        const { data, error } = await supabase
          .from('emergency_cards')
          .select('*')
          .eq('path', path)
          .maybeSingle();

        if (!error && data) return data;
      }
      
      // Fallback to local storage
      const localData = getEmergencyCardLocally(path);
      if (localData) return localData;
      
      throw new Error('Emergency card not found');
    },
    enabled: !!path,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-red-50 dark:from-red-950/20 dark:via-black dark:to-red-950/20">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="w-16 h-16 border-4 border-red-200 dark:border-red-800 border-t-red-600 dark:border-t-red-400 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              {isOnline ? (
                <Wifi className="h-6 w-6 text-green-500" />
              ) : (
                <WifiOff className="h-6 w-6 text-gray-400" />
              )}
            </div>
          </div>
          <p className="text-gray-700 dark:text-gray-300 font-medium">Loading emergency card...</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            {isOnline ? "Syncing from cloud..." : "Loading from local storage..."}
          </p>
        </div>
      </div>
    );
  }

  if (error || !emergencyCard) {
    return <Navigate to="/not-found" replace />;
  }

  return <EmergencyCardDisplay data={emergencyCard} isOnline={isOnline} />;
}