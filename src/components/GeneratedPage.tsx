
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getPageByPath, normalizePath } from "@/lib/localStorageDB";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Github, Mail, Twitter, Linkedin, User, ExternalLink, Sparkles, ArrowRight, Briefcase, Quote } from "lucide-react";
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
      <div className="flex flex-col items-center justify-center min-h-screen p-4 md:p-8 bg-black">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-white/10 border-t-[#007BFF] animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-black"></div>
          </div>
        </div>
        <p className="text-white/70 mt-6 font-mono text-sm tracking-wide">Loading profile...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 md:p-8 bg-black">
        <div className="text-center space-y-4 max-w-md">
          <h1 className="text-3xl font-bold text-white">Profile Not Found</h1>
          <p className="text-white/70">
            {error || "The profile you're looking for couldn't be found."}
          </p>
          <div className="mt-8">
            <Button asChild variant="outline" className="border-white/20 text-white hover:bg-white/5">
              <a href="/">Return Home</a>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const paragraphs = profile.bio?.split('\n') || [];
  const hasAvatar = profile.avatar && profile.avatar.trim() !== '';

  return (
    <div className="bg-black text-white min-h-screen">
      {/* Subtle gradient background effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] to-black pointer-events-none"></div>
      
      <div className="relative z-10">
        {/* Fixed header gradient line */}
        <div className="fixed top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent z-50"></div>
        
        <div className="container mx-auto px-4 py-16 md:py-24 max-w-5xl">
          {/* Hero Section */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-20">
            {/* Avatar */}
            <div className="w-32 h-32 md:w-48 md:h-48 relative flex-shrink-0">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#007BFF]/30 to-transparent blur-xl opacity-30"></div>
              <Avatar className="w-32 h-32 md:w-48 md:h-48 border-2 border-white/10 rounded-full animate-fade-in relative">
                <AvatarImage src={profile.avatar} alt={profile.name} className="object-cover" />
                <AvatarFallback className="bg-gradient-to-br from-[#121212] to-black text-white">
                  <User className="w-12 h-12 md:w-16 md:h-16 text-white/80" />
                </AvatarFallback>
              </Avatar>
            </div>
            
            {/* Name and Title */}
            <div className="md:flex-1 text-center md:text-left space-y-3 animate-fade-in">
              <div className="inline-flex items-center space-x-2 mb-2">
                <span className="text-xs font-mono text-white/40 tracking-widest uppercase">Profile</span>
                <span className="h-[1px] w-12 bg-white/20"></span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                {profile.name}
              </h1>
              
              <div className="h-[1px] w-24 mx-auto md:mx-0 bg-gradient-to-r from-[#007BFF] to-transparent my-4"></div>
              
              <div className="flex items-center justify-center md:justify-start">
                <Briefcase className="h-5 w-5 text-[#007BFF] mr-2" />
                <p className="text-xl md:text-2xl text-white/90">{profile.title}</p>
              </div>
              
              {/* Social Links - Small Buttons */}
              <div className="flex flex-wrap gap-3 justify-center md:justify-start pt-4">
                {profile.email && (
                  <Button variant="outline" size="icon" className="rounded-full w-9 h-9 p-0 border-white/10 bg-white/5 hover:bg-white/10 text-white" asChild>
                    <a href={`mailto:${profile.email}`} aria-label="Email" title="Email">
                      <Mail className="h-4 w-4" />
                    </a>
                  </Button>
                )}
                
                {profile.twitter && (
                  <Button variant="outline" size="icon" className="rounded-full w-9 h-9 p-0 border-white/10 bg-white/5 hover:bg-white/10 text-white" asChild>
                    <a href={profile.twitter.startsWith('http') ? profile.twitter : `https://twitter.com/${profile.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer" aria-label="Twitter" title="Twitter">
                      <Twitter className="h-4 w-4" />
                    </a>
                  </Button>
                )}
                
                {profile.linkedin && (
                  <Button variant="outline" size="icon" className="rounded-full w-9 h-9 p-0 border-white/10 bg-white/5 hover:bg-white/10 text-white" asChild>
                    <a href={profile.linkedin.startsWith('http') ? profile.linkedin : `https://linkedin.com/in/${profile.linkedin}`} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" title="LinkedIn">
                      <Linkedin className="h-4 w-4" />
                    </a>
                  </Button>
                )}
                
                {profile.github && (
                  <Button variant="outline" size="icon" className="rounded-full w-9 h-9 p-0 border-white/10 bg-white/5 hover:bg-white/10 text-white" asChild>
                    <a href={profile.github.startsWith('http') ? profile.github : `https://github.com/${profile.github}`} target="_blank" rel="noopener noreferrer" aria-label="GitHub" title="GitHub">
                      <Github className="h-4 w-4" />
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          {/* Bio Section with Quote Style */}
          <Card className="w-full rounded-xl overflow-hidden border-0 bg-white/5 backdrop-blur-sm animate-fade-in mb-16">
            <CardContent className="p-8 md:p-10">
              <div className="flex items-start mb-6">
                <Quote className="h-8 w-8 text-[#007BFF] mr-4 flex-shrink-0 opacity-80" />
                <div>
                  <h2 className="text-2xl font-bold mb-6 tracking-tight">About Me</h2>
                  <div className="space-y-4 text-white/80 leading-relaxed text-lg">
                    {paragraphs.map((paragraph, i) => (
                      <p key={i}>{paragraph}</p>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Contact Section */}
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold mb-8 tracking-tight inline-flex items-center">
              <span>Connect With Me</span>
              <div className="h-[1px] w-24 bg-gradient-to-r from-[#007BFF]/50 to-transparent ml-4"></div>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.email && (
                <Button variant="outline" className="justify-start h-auto py-4 px-5 bg-white/5 border-white/10 hover:bg-white/10 text-white group" asChild>
                  <a href={`mailto:${profile.email}`} className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center mr-4 group-hover:bg-[#007BFF]/20 transition-colors">
                      <Mail className="h-5 w-5 text-[#007BFF]" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm text-white/50 mb-1">Email</p>
                      <p className="text-white truncate">{profile.email}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-white/30 group-hover:text-[#007BFF] group-hover:translate-x-1 transition-all duration-200" />
                  </a>
                </Button>
              )}
              
              {profile.twitter && (
                <Button variant="outline" className="justify-start h-auto py-4 px-5 bg-white/5 border-white/10 hover:bg-white/10 text-white group" asChild>
                  <a href={profile.twitter.startsWith('http') ? profile.twitter : `https://twitter.com/${profile.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center mr-4 group-hover:bg-[#007BFF]/20 transition-colors">
                      <Twitter className="h-5 w-5 text-[#007BFF]" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm text-white/50 mb-1">Twitter</p>
                      <p className="text-white truncate">
                        {profile.twitter.includes('twitter.com') 
                          ? profile.twitter.split('/').pop() 
                          : profile.twitter.startsWith('@') 
                            ? profile.twitter 
                            : '@' + profile.twitter}
                      </p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-white/30 group-hover:text-[#007BFF]" />
                  </a>
                </Button>
              )}
              
              {profile.linkedin && (
                <Button variant="outline" className="justify-start h-auto py-4 px-5 bg-white/5 border-white/10 hover:bg-white/10 text-white group" asChild>
                  <a href={profile.linkedin.startsWith('http') ? profile.linkedin : `https://linkedin.com/in/${profile.linkedin}`} target="_blank" rel="noopener noreferrer" className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center mr-4 group-hover:bg-[#007BFF]/20 transition-colors">
                      <Linkedin className="h-5 w-5 text-[#007BFF]" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm text-white/50 mb-1">LinkedIn</p>
                      <p className="text-white truncate">
                        {profile.linkedin.includes('linkedin.com') 
                          ? profile.linkedin.split('/').pop() 
                          : profile.linkedin}
                      </p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-white/30 group-hover:text-[#007BFF]" />
                  </a>
                </Button>
              )}
              
              {profile.github && (
                <Button variant="outline" className="justify-start h-auto py-4 px-5 bg-white/5 border-white/10 hover:bg-white/10 text-white group" asChild>
                  <a href={profile.github.startsWith('http') ? profile.github : `https://github.com/${profile.github}`} target="_blank" rel="noopener noreferrer" className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center mr-4 group-hover:bg-[#007BFF]/20 transition-colors">
                      <Github className="h-5 w-5 text-[#007BFF]" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm text-white/50 mb-1">GitHub</p>
                      <p className="text-white truncate">
                        {profile.github.includes('github.com') 
                          ? profile.github.split('/').pop() 
                          : profile.github}
                      </p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-white/30 group-hover:text-[#007BFF]" />
                  </a>
                </Button>
              )}
            </div>
          </div>
          
          {/* Footer */}
          <div className="mt-24 text-center border-t border-white/5 pt-8">
            <p className="text-white/30 text-sm font-mono tracking-wide">
              © {new Date().getFullYear()} · Created with PageGenerator
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneratedPage;
