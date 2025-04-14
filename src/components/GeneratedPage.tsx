
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getPageByPath, normalizePath } from "@/lib/localStorageDB";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Github, Mail, Twitter, Linkedin, User, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ProfileData {
  name: string;
  title: string;
  bio: string;
  email: string;
  twitter: string;
  linkedin: string;
  github: string;
  avatar: string;
}

const GeneratedPage = () => {
  const { path } = useParams<{ path: string }>();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!path) {
        setError("No profile path provided");
        setLoading(false);
        return;
      }

      try {
        const normalizedPath = normalizePath(path);
        
        // First try to fetch from Supabase
        const { data: pageData, error: pageError } = await supabase
          .from('pages')
          .select('user_id')
          .eq('path', normalizedPath)
          .maybeSingle();
          
        if (pageError) {
          console.error("Error fetching page data:", pageError);
        }
        
        // If we found a page in Supabase, fetch the associated profile
        if (pageData?.user_id) {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', pageData.user_id)
            .single();
            
          if (profileError) {
            console.error("Error fetching profile data:", profileError);
          } else if (profileData) {
            setProfile(profileData as ProfileData);
            setLoading(false);
            return;
          }
        }
        
        // Fallback to localStorage if no data found in Supabase
        const localData = getPageByPath(normalizedPath);
        if (localData) {
          setProfile(localData as unknown as ProfileData);
        } else {
          setError("Profile not found");
        }
      } catch (err) {
        console.error("Error:", err);
        setError("Error loading profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [path]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 md:p-8">
        <div className="w-12 h-12 rounded-full border-4 border-[#007BFF] border-t-transparent animate-spin mb-4"></div>
        <p className="text-white/70">Loading profile...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 md:p-8">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-white">Profile Not Found</h1>
          <p className="text-white/70">
            {error || "The profile you're looking for couldn't be found."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 md:py-20 min-h-screen flex flex-col items-center">
      <div className="w-full max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="relative w-full mb-12">
          <div className="absolute inset-0 bg-gradient-to-r from-[#007BFF]/20 to-transparent rounded-xl opacity-30"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 p-6 md:p-10 rounded-xl border border-[#007BFF]/20 bg-black/50 backdrop-blur-sm">
            <Avatar className="w-24 h-24 md:w-36 md:h-36 border-4 border-[#007BFF] animate-fade-in">
              <AvatarImage src={profile.avatar} alt={profile.name} />
              <AvatarFallback className="bg-gradient-to-br from-[#007BFF] to-[#0050a8]">
                <User className="w-12 h-12 text-white" />
              </AvatarFallback>
            </Avatar>
            
            <div className="text-center md:text-left space-y-3 flex-1 animate-fade-in">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold gradient-heading">{profile.name}</h1>
              <p className="text-xl md:text-2xl text-white/80">{profile.title}</p>
              
              {/* Social Links */}
              <div className="flex flex-wrap gap-3 justify-center md:justify-start pt-2">
                {profile.email && (
                  <Button variant="outline" size="sm" className="rounded-full blue-glow hover:bg-[#007BFF]/10 border-[#007BFF]/30" asChild>
                    <a href={`mailto:${profile.email}`} target="_blank" rel="noopener noreferrer">
                      <Mail className="mr-1 h-4 w-4" />
                      Email
                    </a>
                  </Button>
                )}
                
                {profile.twitter && (
                  <Button variant="outline" size="sm" className="rounded-full blue-glow hover:bg-[#007BFF]/10 border-[#007BFF]/30" asChild>
                    <a href={profile.twitter.startsWith('http') ? profile.twitter : `https://twitter.com/${profile.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer">
                      <Twitter className="mr-1 h-4 w-4" />
                      Twitter
                    </a>
                  </Button>
                )}
                
                {profile.linkedin && (
                  <Button variant="outline" size="sm" className="rounded-full blue-glow hover:bg-[#007BFF]/10 border-[#007BFF]/30" asChild>
                    <a href={profile.linkedin.startsWith('http') ? profile.linkedin : `https://linkedin.com/in/${profile.linkedin}`} target="_blank" rel="noopener noreferrer">
                      <Linkedin className="mr-1 h-4 w-4" />
                      LinkedIn
                    </a>
                  </Button>
                )}
                
                {profile.github && (
                  <Button variant="outline" size="sm" className="rounded-full blue-glow hover:bg-[#007BFF]/10 border-[#007BFF]/30" asChild>
                    <a href={profile.github.startsWith('http') ? profile.github : `https://github.com/${profile.github}`} target="_blank" rel="noopener noreferrer">
                      <Github className="mr-1 h-4 w-4" />
                      GitHub
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Bio Section */}
        <Card className="w-full rounded-xl overflow-hidden border border-[#007BFF]/20 bg-black/50 backdrop-blur-sm animate-fade-in mb-12">
          <CardContent className="p-6 md:p-8">
            <h2 className="text-2xl font-bold gradient-heading mb-4">About Me</h2>
            <div className="prose prose-invert prose-blue max-w-none">
              {profile.bio.split('\n').map((paragraph, i) => (
                <p key={i} className="text-white/80 leading-relaxed mb-4">{paragraph}</p>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Contact Card */}
        <Card className="w-full rounded-xl overflow-hidden border border-[#007BFF]/20 bg-black/50 backdrop-blur-sm animate-fade-in">
          <CardContent className="p-6 md:p-8">
            <h2 className="text-2xl font-bold gradient-heading mb-4">Get In Touch</h2>
            <p className="text-white/80 mb-6">Feel free to reach out for opportunities or just to say hello!</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.email && (
                <Button variant="outline" className="w-full justify-start blue-glow hover:bg-[#007BFF]/10 border-[#007BFF]/30" asChild>
                  <a href={`mailto:${profile.email}`}>
                    <Mail className="mr-2 h-5 w-5" />
                    {profile.email}
                  </a>
                </Button>
              )}
              
              {profile.twitter && (
                <Button variant="outline" className="w-full justify-start blue-glow hover:bg-[#007BFF]/10 border-[#007BFF]/30" asChild>
                  <a href={profile.twitter.startsWith('http') ? profile.twitter : `https://twitter.com/${profile.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer">
                    <Twitter className="mr-2 h-5 w-5" />
                    {profile.twitter.startsWith('@') ? profile.twitter : '@' + profile.twitter}
                    <ExternalLink className="ml-auto h-3 w-3 opacity-50" />
                  </a>
                </Button>
              )}
              
              {profile.linkedin && (
                <Button variant="outline" className="w-full justify-start blue-glow hover:bg-[#007BFF]/10 border-[#007BFF]/30" asChild>
                  <a href={profile.linkedin.startsWith('http') ? profile.linkedin : `https://linkedin.com/in/${profile.linkedin}`} target="_blank" rel="noopener noreferrer">
                    <Linkedin className="mr-2 h-5 w-5" />
                    LinkedIn
                    <ExternalLink className="ml-auto h-3 w-3 opacity-50" />
                  </a>
                </Button>
              )}
              
              {profile.github && (
                <Button variant="outline" className="w-full justify-start blue-glow hover:bg-[#007BFF]/10 border-[#007BFF]/30" asChild>
                  <a href={profile.github.startsWith('http') ? profile.github : `https://github.com/${profile.github}`} target="_blank" rel="noopener noreferrer">
                    <Github className="mr-2 h-5 w-5" />
                    GitHub
                    <ExternalLink className="ml-auto h-3 w-3 opacity-50" />
                  </a>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-white/40 text-sm">
            This profile was created with Lovable.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GeneratedPage;
