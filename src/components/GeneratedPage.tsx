
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Mail, Twitter, Linkedin, Github, ArrowLeft, User, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getPageByPath, getProfile } from "@/lib/localStorageDB";
import { useIsMobile } from "@/hooks/use-mobile";

interface UserData {
  name: string;
  title: string;
  bio: string;
  email: string;
  twitter: string;
  linkedin: string;
  github: string;
  avatar: string;
}

interface PageData {
  user_id: string;
}

const GeneratedPage = () => {
  const { path } = useParams<{ path: string }>();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const isMobile = useIsMobile();
  
  useEffect(() => {
    const fetchPageData = async () => {
      if (!path) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      
      try {
        // Try to get data from Supabase first
        let pageData: PageData | null = null;
        let profileData: UserData | null = null;
        
        try {
          // Get user_id from pages table using path
          const { data: supaPageData, error: pageError } = await supabase
            .from('pages')
            .select('user_id')
            .eq('path', path)
            .single();
          
          if (!pageError && supaPageData) {
            pageData = supaPageData as PageData;
            
            // Get profile data using user_id
            const { data: supaProfileData, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', pageData.user_id)
              .single();
            
            if (!profileError && supaProfileData) {
              profileData = supaProfileData as UserData;
            }
          }
        } catch (supaError) {
          console.log("Supabase error, falling back to localStorage");
        }
        
        // If Supabase data retrieval failed, try localStorage
        if (!profileData) {
          const localPageData = getPageByPath(path);
          
          if (localPageData) {
            pageData = localPageData as PageData;
            const localProfileData = getProfile(localPageData.user_id);
            
            if (localProfileData) {
              profileData = localProfileData as UserData;
            }
          }
        }
        
        if (!profileData) {
          setNotFound(true);
          setLoading(false);
          return;
        }
        
        setUserData(profileData);
      } catch (error) {
        console.error('Error fetching page data:', error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPageData();
  }, [path]);
  
  if (loading) {
    return (
      <div className="fixed inset-0 flex justify-center items-center bg-background">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4"></div>
          <p className="text-xl font-medium animate-pulse">Loading profile...</p>
        </div>
      </div>
    );
  }
  
  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-black">
        <Card className="w-full max-w-md mx-auto animate-fade-in text-center">
          <CardHeader className="pb-2">
            <h1 className="text-2xl font-bold">Page Not Found</h1>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              The profile you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild>
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Home
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-black to-gray-900">
      <Card className="w-full max-w-4xl mx-auto animate-fade-in shadow-xl border-border/50 backdrop-blur-sm bg-black/80">
        <CardHeader className="flex flex-col items-center text-center space-y-4 pb-6 relative">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-t-lg opacity-50 z-0"></div>
          <div className="relative z-10 flex flex-col items-center">
            <Avatar className="h-28 w-28 border-4 border-primary/30 shadow-lg">
              <AvatarImage src={userData?.avatar} alt={userData?.name} className="object-cover" />
              <AvatarFallback className="bg-gradient-to-br from-primary/80 to-secondary/80 text-white text-2xl">
                {userData?.name?.charAt(0) || <User className="h-12 w-12" />}
              </AvatarFallback>
            </Avatar>
            <div className="mt-4">
              <h1 className="text-3xl sm:text-4xl font-bold gradient-heading">{userData?.name || "User"}</h1>
              <p className="text-xl text-muted-foreground mt-1">{userData?.title || "Profile"}</p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-8 px-6 sm:px-8">
          <div className="backdrop-blur-sm bg-card/30 p-6 rounded-xl border border-border/30">
            <h2 className="text-xl font-semibold mb-3 flex items-center">
              <span className="bg-gradient-to-r from-blue-500 to-primary bg-clip-text text-transparent">About Me</span>
            </h2>
            <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
              {userData?.bio || "No bio available."}
            </p>
          </div>
          
          {(userData?.email || userData?.twitter || userData?.linkedin || userData?.github) && (
            <div className="backdrop-blur-sm bg-card/30 p-6 rounded-xl border border-border/30">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <span className="bg-gradient-to-r from-blue-500 to-primary bg-clip-text text-transparent">Connect With Me</span>
              </h2>
              <div className={`grid ${isMobile ? 'grid-cols-1 gap-3' : 'grid-cols-2 gap-4'}`}>
                {userData?.email && (
                  <a 
                    href={`mailto:${userData.email}`}
                    className="flex items-center space-x-3 p-3 rounded-md hover:bg-secondary/30 transition-colors blue-glow"
                  >
                    <Mail className="h-5 w-5 text-blue-400" />
                    <span className="text-sm truncate">{userData.email}</span>
                    <ExternalLink className="h-4 w-4 ml-auto text-muted-foreground" />
                  </a>
                )}
                
                {userData?.twitter && (
                  <a 
                    href={userData.twitter.startsWith('http') ? userData.twitter : `https://twitter.com/${userData.twitter.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-3 p-3 rounded-md hover:bg-secondary/30 transition-colors blue-glow"
                  >
                    <Twitter className="h-5 w-5 text-blue-400" />
                    <span className="text-sm truncate">{userData.twitter}</span>
                    <ExternalLink className="h-4 w-4 ml-auto text-muted-foreground" />
                  </a>
                )}
                
                {userData?.linkedin && (
                  <a 
                    href={userData.linkedin.startsWith('http') ? userData.linkedin : `https://linkedin.com/in/${userData.linkedin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-3 p-3 rounded-md hover:bg-secondary/30 transition-colors blue-glow"
                  >
                    <Linkedin className="h-5 w-5 text-blue-400" />
                    <span className="text-sm truncate">LinkedIn</span>
                    <ExternalLink className="h-4 w-4 ml-auto text-muted-foreground" />
                  </a>
                )}
                
                {userData?.github && (
                  <a 
                    href={userData.github.startsWith('http') ? userData.github : `https://github.com/${userData.github}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-3 p-3 rounded-md hover:bg-secondary/30 transition-colors blue-glow"
                  >
                    <Github className="h-5 w-5 text-blue-400" />
                    <span className="text-sm truncate">GitHub</span>
                    <ExternalLink className="h-4 w-4 ml-auto text-muted-foreground" />
                  </a>
                )}
              </div>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-center pb-6 pt-2">
          <Button variant="outline" size="lg" asChild className="blue-glow">
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Create Your Own Page
            </Link>
          </Button>
        </CardFooter>
      </Card>
      
      <div className="text-white/60 text-sm mt-8">
        &copy; 2025 PageGenerator • Share your profile with the world
      </div>
    </div>
  );
};

export default GeneratedPage;
