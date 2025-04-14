
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getPageByPath, normalizePath } from "@/lib/localStorageDB";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Github, Mail, Twitter, Linkedin, User, ExternalLink, 
  Sparkles, ArrowRight, Briefcase, Quote, Phone, 
  Save, Plus, MapPin 
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import ProfileHeader from "@/components/ProfileHeader";
import ProfileBio from "@/components/ProfileBio";
import ProfileSocials from "@/components/ProfileSocials";

interface ProfileData {
  name: string;
  title: string;
  bio: string;
  email: string;
  twitter: string;
  linkedin: string;
  github: string;
  avatar: string;
  phone?: string;
  location?: string;
}

const ThemedProfile = () => {
  const { path } = useParams<{ path: string }>();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { theme } = useTheme();

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
      <div className="flex flex-col items-center justify-center min-h-screen p-4 md:p-8">
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

  // Dynamic theme classes
  const themeClasses = {
    container: theme === 'light' 
      ? 'bg-gray-50 text-gray-900' 
      : theme === 'teal' 
        ? 'bg-teal-900 text-white' 
        : 'bg-black text-white',
    card: theme === 'light'
      ? 'bg-white border border-gray-200 shadow-sm'
      : theme === 'teal'
        ? 'bg-teal-800/70 backdrop-blur-md border border-teal-700'
        : 'bg-white/5 backdrop-blur-sm border border-white/10',
    highlight: theme === 'light'
      ? 'text-blue-600'
      : theme === 'teal'
        ? 'text-teal-300'
        : 'text-[#007BFF]',
    button: theme === 'light'
      ? 'bg-blue-600 hover:bg-blue-700 text-white'
      : theme === 'teal'
        ? 'bg-teal-500 hover:bg-teal-600 text-white'
        : 'bg-[#007BFF] hover:bg-[#0066CC] text-white',
    buttonOutline: theme === 'light'
      ? 'border-gray-300 bg-white hover:bg-gray-50 text-gray-800'
      : theme === 'teal'
        ? 'border-teal-600 bg-transparent hover:bg-teal-800/50 text-white'
        : 'border-white/10 bg-white/5 hover:bg-white/10 text-white',
    accent: theme === 'light'
      ? 'bg-blue-100 text-blue-600'
      : theme === 'teal'
        ? 'bg-teal-700/50 text-teal-300'
        : 'bg-[#007BFF]/20 text-[#007BFF]'
  };

  // Use current year for copyright
  const currentYear = new Date().getFullYear();
  const paragraphs = profile.bio?.split('\n') || [];
  
  return (
    <div className={`min-h-screen ${themeClasses.container} transition-colors duration-300`}>
      {/* Theme switcher floating button */}
      <div className="fixed bottom-4 right-4 z-50">
        <div className={`rounded-full p-1 ${theme === 'light' ? 'bg-white shadow-md' : 'bg-black/40 backdrop-blur-sm'}`}>
          <ThemeSwitcher variant="minimal" />
        </div>
      </div>

      {/* Background gradient effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {theme === 'dark' && (
          <>
            <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl opacity-30"></div>
            <div className="absolute top-1/3 -right-20 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl opacity-20"></div>
          </>
        )}
        {theme === 'teal' && (
          <>
            <div className="absolute -top-40 -left-40 w-80 h-80 bg-teal-300/20 rounded-full blur-3xl opacity-30"></div>
            <div className="absolute top-1/3 -right-20 w-60 h-60 bg-teal-200/20 rounded-full blur-3xl opacity-20"></div>
          </>
        )}
      </div>
      
      {/* Header line */}
      <div className={`fixed top-0 left-0 right-0 h-[1px] ${theme === 'light' ? 'bg-gradient-to-r from-transparent via-gray-300 to-transparent' : theme === 'teal' ? 'bg-gradient-to-r from-transparent via-teal-500/30 to-transparent' : 'bg-gradient-to-r from-transparent via-white/20 to-transparent'} z-50`}></div>
      
      <div className="container mx-auto px-4 py-8 md:py-16 relative z-10 max-w-5xl">
        {/* Profile Card - Mobile-first design */}
        <div className="rounded-2xl overflow-hidden mx-auto max-w-md md:max-w-none relative mb-8">
          {/* Optional Cover Image - can be added later, placeholder for now */}
          <div className={`w-full h-32 md:h-48 ${theme === 'light' ? 'bg-gradient-to-r from-blue-50 to-indigo-100' : theme === 'teal' ? 'bg-gradient-to-r from-teal-800 to-teal-900' : 'bg-gradient-to-r from-gray-900 to-black'}`}>
            <div className="w-full h-full flex items-end justify-center">
              {/* Avatar positioned to overlap the cover and content */}
              <div className="relative -mb-16 md:-mb-20">
                <Avatar className="w-32 h-32 md:w-40 md:h-40 border-4 rounded-full animate-fade-in relative bg-black/10 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-xl shadow-lg" style={{ borderColor: theme === 'light' ? 'white' : theme === 'teal' ? '#134e4a' : '#111' }}>
                  <AvatarImage src={profile.avatar} alt={profile.name} className="object-cover" />
                  <AvatarFallback className={`${theme === 'light' ? 'bg-gradient-to-br from-gray-100 to-gray-200' : theme === 'teal' ? 'bg-gradient-to-br from-teal-800 to-teal-900' : 'bg-gradient-to-br from-[#121212] to-black'} text-white`}>
                    <User className="w-12 h-12 md:w-16 md:h-16 text-white/80" />
                  </AvatarFallback>
                </Avatar>
                
                <div className="absolute bottom-0 right-0">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${themeClasses.accent}`}>
                    <span className="animate-pulse"><Sparkles className="h-4 w-4" /></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Profile Content */}
          <Card className={`mt-16 ${themeClasses.card}`}>
            <CardContent className="pt-8 pb-6 px-4 md:px-8 text-center">
              {/* Name and Title */}
              <h1 className="text-3xl md:text-4xl font-bold mb-1">{profile.name}</h1>
              <p className={`text-lg ${theme === 'light' ? 'text-gray-600' : theme === 'teal' ? 'text-teal-200' : 'text-white/70'}`}>
                {profile.title}
              </p>
              
              {/* Divider */}
              <div className={`h-[1px] w-16 mx-auto my-4 ${theme === 'light' ? 'bg-gray-200' : theme === 'teal' ? 'bg-teal-600' : 'bg-white/20'}`}></div>
              
              {/* Social Icons */}
              <div className="flex justify-center space-x-3 mt-4">
                {profile.email && (
                  <Button variant="outline" size="icon" className={`rounded-full w-10 h-10 p-0 ${themeClasses.buttonOutline}`} asChild>
                    <a href={`mailto:${profile.email}`} aria-label="Email" title="Email">
                      <Mail className="h-5 w-5" />
                    </a>
                  </Button>
                )}
                
                {profile.twitter && (
                  <Button variant="outline" size="icon" className={`rounded-full w-10 h-10 p-0 ${themeClasses.buttonOutline}`} asChild>
                    <a href={profile.twitter.startsWith('http') ? profile.twitter : `https://twitter.com/${profile.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer" aria-label="Twitter" title="Twitter">
                      <Twitter className="h-5 w-5" />
                    </a>
                  </Button>
                )}
                
                {profile.linkedin && (
                  <Button variant="outline" size="icon" className={`rounded-full w-10 h-10 p-0 ${themeClasses.buttonOutline}`} asChild>
                    <a href={profile.linkedin.startsWith('http') ? profile.linkedin : `https://linkedin.com/in/${profile.linkedin}`} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" title="LinkedIn">
                      <Linkedin className="h-5 w-5" />
                    </a>
                  </Button>
                )}
                
                {profile.github && (
                  <Button variant="outline" size="icon" className={`rounded-full w-10 h-10 p-0 ${themeClasses.buttonOutline}`} asChild>
                    <a href={profile.github.startsWith('http') ? profile.github : `https://github.com/${profile.github}`} target="_blank" rel="noopener noreferrer" aria-label="GitHub" title="GitHub">
                      <Github className="h-5 w-5" />
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Bio Section */}
        <Card className={`w-full rounded-xl overflow-hidden mb-8 ${themeClasses.card}`}>
          <CardContent className="p-6 md:p-8">
            <div className="flex items-start space-x-4">
              <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${themeClasses.accent}`}>
                <Quote className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-4">About Me</h2>
                <div className={`space-y-4 leading-relaxed ${theme === 'light' ? 'text-gray-700' : theme === 'teal' ? 'text-white/90' : 'text-white/80'}`}>
                  {paragraphs.map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Contact Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 inline-flex items-center">
            <span>Connect With Me</span>
            <div className={`h-[1px] w-16 ml-4 ${theme === 'light' ? 'bg-gradient-to-r from-blue-400/50 to-transparent' : theme === 'teal' ? 'bg-gradient-to-r from-teal-500/50 to-transparent' : 'bg-gradient-to-r from-[#007BFF]/50 to-transparent'}`}></div>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profile.email && (
              <Button variant="outline" className={`justify-start h-auto py-4 px-5 group ${themeClasses.buttonOutline}`} asChild>
                <a href={`mailto:${profile.email}`} className="flex items-center">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center mr-4 transition-colors ${themeClasses.accent}`}>
                    <Mail className="h-5 w-5" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className={`text-sm ${theme === 'light' ? 'text-gray-500' : theme === 'teal' ? 'text-teal-300/70' : 'text-white/50'} mb-1`}>Email</p>
                    <p className={theme === 'light' ? 'text-gray-900' : 'text-white'}>{profile.email}</p>
                  </div>
                  <ArrowRight className={`h-4 w-4 ${theme === 'light' ? 'text-gray-400 group-hover:text-blue-500' : theme === 'teal' ? 'text-teal-500/50 group-hover:text-teal-300' : 'text-white/30 group-hover:text-[#007BFF]'} group-hover:translate-x-1 transition-all duration-200`} />
                </a>
              </Button>
            )}
            
            {profile.phone && (
              <Button variant="outline" className={`justify-start h-auto py-4 px-5 group ${themeClasses.buttonOutline}`} asChild>
                <a href={`tel:${profile.phone}`} className="flex items-center">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center mr-4 transition-colors ${themeClasses.accent}`}>
                    <Phone className="h-5 w-5" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className={`text-sm ${theme === 'light' ? 'text-gray-500' : theme === 'teal' ? 'text-teal-300/70' : 'text-white/50'} mb-1`}>Phone</p>
                    <p className={theme === 'light' ? 'text-gray-900' : 'text-white'}>{profile.phone}</p>
                  </div>
                  <ArrowRight className={`h-4 w-4 ${theme === 'light' ? 'text-gray-400 group-hover:text-blue-500' : theme === 'teal' ? 'text-teal-500/50 group-hover:text-teal-300' : 'text-white/30 group-hover:text-[#007BFF]'} group-hover:translate-x-1 transition-all duration-200`} />
                </a>
              </Button>
            )}
            
            {profile.twitter && (
              <Button variant="outline" className={`justify-start h-auto py-4 px-5 group ${themeClasses.buttonOutline}`} asChild>
                <a href={profile.twitter.startsWith('http') ? profile.twitter : `https://twitter.com/${profile.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center mr-4 transition-colors ${themeClasses.accent}`}>
                    <Twitter className="h-5 w-5" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className={`text-sm ${theme === 'light' ? 'text-gray-500' : theme === 'teal' ? 'text-teal-300/70' : 'text-white/50'} mb-1`}>Twitter</p>
                    <p className={theme === 'light' ? 'text-gray-900' : 'text-white'}>
                      {profile.twitter.includes('twitter.com') 
                        ? profile.twitter.split('/').pop() 
                        : profile.twitter.startsWith('@') 
                          ? profile.twitter 
                          : '@' + profile.twitter}
                    </p>
                  </div>
                  <ExternalLink className={`h-4 w-4 ${theme === 'light' ? 'text-gray-400 group-hover:text-blue-500' : theme === 'teal' ? 'text-teal-500/50 group-hover:text-teal-300' : 'text-white/30 group-hover:text-[#007BFF]'}`} />
                </a>
              </Button>
            )}
            
            {profile.linkedin && (
              <Button variant="outline" className={`justify-start h-auto py-4 px-5 group ${themeClasses.buttonOutline}`} asChild>
                <a href={profile.linkedin.startsWith('http') ? profile.linkedin : `https://linkedin.com/in/${profile.linkedin}`} target="_blank" rel="noopener noreferrer" className="flex items-center">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center mr-4 transition-colors ${themeClasses.accent}`}>
                    <Linkedin className="h-5 w-5" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className={`text-sm ${theme === 'light' ? 'text-gray-500' : theme === 'teal' ? 'text-teal-300/70' : 'text-white/50'} mb-1`}>LinkedIn</p>
                    <p className={theme === 'light' ? 'text-gray-900' : 'text-white'}>
                      {profile.linkedin.includes('linkedin.com') 
                        ? profile.linkedin.split('/').pop() 
                        : profile.linkedin}
                    </p>
                  </div>
                  <ExternalLink className={`h-4 w-4 ${theme === 'light' ? 'text-gray-400 group-hover:text-blue-500' : theme === 'teal' ? 'text-teal-500/50 group-hover:text-teal-300' : 'text-white/30 group-hover:text-[#007BFF]'}`} />
                </a>
              </Button>
            )}
            
            {profile.github && (
              <Button variant="outline" className={`justify-start h-auto py-4 px-5 group ${themeClasses.buttonOutline}`} asChild>
                <a href={profile.github.startsWith('http') ? profile.github : `https://github.com/${profile.github}`} target="_blank" rel="noopener noreferrer" className="flex items-center">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center mr-4 transition-colors ${themeClasses.accent}`}>
                    <Github className="h-5 w-5" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className={`text-sm ${theme === 'light' ? 'text-gray-500' : theme === 'teal' ? 'text-teal-300/70' : 'text-white/50'} mb-1`}>GitHub</p>
                    <p className={theme === 'light' ? 'text-gray-900' : 'text-white'}>
                      {profile.github.includes('github.com') 
                        ? profile.github.split('/').pop() 
                        : profile.github}
                    </p>
                  </div>
                  <ExternalLink className={`h-4 w-4 ${theme === 'light' ? 'text-gray-400 group-hover:text-blue-500' : theme === 'teal' ? 'text-teal-500/50 group-hover:text-teal-300' : 'text-white/30 group-hover:text-[#007BFF]'}`} />
                </a>
              </Button>
            )}
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-3 mb-12 mt-8">
          <Button className={`${themeClasses.button} flex items-center justify-center py-6 px-8`}>
            <Save className="mr-2 h-5 w-5" />
            Save Contact
          </Button>
          
          <Button variant="outline" className={`${themeClasses.buttonOutline} flex items-center justify-center py-6 px-8`}>
            <Plus className="mr-2 h-5 w-5" />
            Add to Network
          </Button>
        </div>
        
        {/* Footer */}
        <div className={`text-center border-t pt-8 ${theme === 'light' ? 'border-gray-200' : theme === 'teal' ? 'border-teal-800' : 'border-white/5'}`}>
          <p className={`text-sm font-mono tracking-wide ${theme === 'light' ? 'text-gray-500' : theme === 'teal' ? 'text-teal-300/50' : 'text-white/30'}`}>
            © {currentYear} · Created with PageGenerator
          </p>
        </div>
      </div>
    </div>
  );
};

const GeneratedPage = () => {
  return (
    <ThemeProvider>
      <ThemedProfile />
    </ThemeProvider>
  );
};

export default GeneratedPage;
