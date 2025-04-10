
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Mail, Twitter, Linkedin, Github, ArrowLeft, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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
  
  useEffect(() => {
    const fetchPageData = async () => {
      if (!path) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      
      try {
        // Get user_id from pages table using path
        const { data: pageData, error: pageError } = await supabase
          .from('pages')
          .select('user_id')
          .eq('path', path)
          .single();
        
        if (pageError || !pageData) {
          setNotFound(true);
          setLoading(false);
          return;
        }
        
        // Get profile data using user_id
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', (pageData as PageData).user_id)
          .single();
        
        if (profileError || !profileData) {
          setNotFound(true);
          setLoading(false);
          return;
        }
        
        setUserData(profileData as UserData);
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
      <div className="flex justify-center items-center h-screen">
        <div className="animate-pulse text-xl">Loading...</div>
      </div>
    );
  }
  
  if (notFound) {
    return (
      <Card className="w-full max-w-md mx-auto animate-fade-in text-center">
        <CardHeader className="pb-2">
          <h1 className="text-2xl font-bold">Page Not Found</h1>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">
            The page you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild>
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Home
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full max-w-3xl mx-auto animate-fade-in">
      <CardHeader className="flex flex-col items-center text-center space-y-4 pb-6">
        <Avatar className="h-24 w-24">
          <AvatarImage src={userData?.avatar} alt={userData?.name} />
          <AvatarFallback>{userData?.name?.charAt(0) || <User className="h-12 w-12" />}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold">{userData?.name}</h1>
          <p className="text-xl text-muted-foreground">{userData?.title}</p>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">About Me</h2>
          <p className="text-muted-foreground whitespace-pre-wrap">{userData?.bio}</p>
        </div>
        
        {(userData?.email || userData?.twitter || userData?.linkedin || userData?.github) && (
          <>
            <Separator />
            <div>
              <h2 className="text-xl font-semibold mb-4">Connect With Me</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {userData?.email && (
                  <a 
                    href={`mailto:${userData.email}`}
                    className="flex items-center space-x-3 p-3 rounded-md hover:bg-secondary transition-colors"
                  >
                    <Mail className="h-5 w-5" />
                    <span className="text-sm truncate">{userData.email}</span>
                  </a>
                )}
                
                {userData?.twitter && (
                  <a 
                    href={userData.twitter.startsWith('http') ? userData.twitter : `https://twitter.com/${userData.twitter.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-3 p-3 rounded-md hover:bg-secondary transition-colors"
                  >
                    <Twitter className="h-5 w-5" />
                    <span className="text-sm truncate">{userData.twitter}</span>
                  </a>
                )}
                
                {userData?.linkedin && (
                  <a 
                    href={userData.linkedin.startsWith('http') ? userData.linkedin : `https://linkedin.com/in/${userData.linkedin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-3 p-3 rounded-md hover:bg-secondary transition-colors"
                  >
                    <Linkedin className="h-5 w-5" />
                    <span className="text-sm truncate">LinkedIn</span>
                  </a>
                )}
                
                {userData?.github && (
                  <a 
                    href={userData.github.startsWith('http') ? userData.github : `https://github.com/${userData.github}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-3 p-3 rounded-md hover:bg-secondary transition-colors"
                  >
                    <Github className="h-5 w-5" />
                    <span className="text-sm truncate">GitHub</span>
                  </a>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button variant="outline" asChild>
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Create Your Own Page
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default GeneratedPage;
