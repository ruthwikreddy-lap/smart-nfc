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
import { useTheme } from "@/context/ThemeContext";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import ProfileHeader from "@/components/ProfileHeader";
import ProfileBio from "@/components/ProfileBio";
import ProfileSocials from "@/components/ProfileSocials";
import { saveContact, addToNetwork, hasNativeContactsSupport } from "@/lib/contactUtils";
import { toast } from "sonner";

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

const GeneratedPage = () => {
  const { path } = useParams<{ path: string }>();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { theme } = useTheme();
  const [isSaving, setIsSaving] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!path) {
        setError("No profile path provided");
        setLoading(false);
        return;
      }

      try {
        const normalizedPath = normalizePath(path);
        
        const { data: pageData, error: pageError } = await supabase
          .from('pages')
          .select('user_id')
          .eq('path', normalizedPath)
          .maybeSingle();
          
        if (pageError) {
          console.error("Error fetching page data:", pageError);
        }
        
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

  const handleSaveContact = () => {
    if (!profile) return;
    
    try {
      setIsSaving(true);
      saveContact(profile);
      
      toast.success("Contact saved", {
        description: "The contact information has been downloaded as a vCard file."
      });
    } catch (error) {
      console.error("Error saving contact:", error);
      toast.error("Error saving contact", {
        description: "There was a problem downloading the contact information."
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddToNetwork = async () => {
    if (!profile) return;
    
    try {
      setIsAdding(true);
      const usedNative = await addToNetwork(profile);
      
      if (usedNative) {
        toast.success("Contact added to your network", {
          description: "The contact has been added to your device contacts."
        });
      } else {
        toast.success("Contact information downloaded", {
          description: "Import the downloaded file to add this contact to your address book."
        });
      }
    } catch (error) {
      console.error("Error adding to network:", error);
      toast.error("Error adding contact", {
        description: "There was a problem adding this contact to your network."
      });
    } finally {
      setIsAdding(false);
    }
  };

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

  const currentYear = new Date().getFullYear();
  const paragraphs = profile?.bio?.split('\n') || [];
  
  return (
    <div className={`min-h-screen ${themeClasses.container} transition-colors duration-300 relative overflow-hidden`}>
      {/* Enhanced Theme Switcher with better positioning */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className={`rounded-2xl p-2 shadow-2xl ${theme === 'light' ? 'bg-white/95 backdrop-blur-md border border-gray-200' : theme === 'teal' ? 'bg-teal-800/90 backdrop-blur-md border border-teal-600/50' : 'bg-black/80 backdrop-blur-md border border-white/10'}`}>
          <ThemeSwitcher variant="minimal" />
        </div>
      </div>
      
      {/* Animated Share Button */}
      <div className="fixed bottom-6 left-6 z-50">
        <Button 
          onClick={() => {
            const shareUrl = `${window.location.origin}${window.location.pathname}`;
            navigator.clipboard.writeText(shareUrl);
            toast.success("Link copied to clipboard", {
              description: "Share this link to let others view this profile"
            });
          }}
          className={`rounded-2xl px-6 py-3 shadow-2xl transition-all duration-300 hover:scale-105 ${themeClasses.button}`}
          variant="default"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Share Profile
        </Button>
      </div>

      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {theme === 'dark' && (
          <>
            <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl opacity-40 animate-pulse"></div>
            <div className="absolute top-1/3 -right-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute bottom-10 left-1/3 w-64 h-64 bg-pink-500/5 rounded-full blur-3xl opacity-25 animate-pulse" style={{ animationDelay: '2s' }}></div>
          </>
        )}
        {theme === 'teal' && (
          <>
            <div className="absolute -top-40 -left-40 w-96 h-96 bg-teal-300/25 rounded-full blur-3xl opacity-40 animate-pulse"></div>
            <div className="absolute top-1/3 -right-20 w-80 h-80 bg-teal-200/20 rounded-full blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute bottom-10 left-1/3 w-64 h-64 bg-teal-100/15 rounded-full blur-3xl opacity-25 animate-pulse" style={{ animationDelay: '2s' }}></div>
          </>
        )}
        {theme === 'light' && (
          <>
            <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl opacity-50 animate-pulse"></div>
            <div className="absolute top-1/3 -right-20 w-80 h-80 bg-indigo-100/25 rounded-full blur-3xl opacity-40 animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute bottom-10 left-1/3 w-64 h-64 bg-purple-100/20 rounded-full blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>
          </>
        )}
      </div>
      
      {/* Enhanced Header Line */}
      <div className={`fixed top-0 left-0 right-0 h-[2px] z-50 ${theme === 'light' ? 'bg-gradient-to-r from-transparent via-blue-200/50 to-transparent' : theme === 'teal' ? 'bg-gradient-to-r from-transparent via-teal-400/30 to-transparent' : 'bg-gradient-to-r from-transparent via-blue-400/30 to-transparent'}`}></div>
      
      <div className="container mx-auto px-4 py-8 md:py-16 relative z-10 max-w-5xl">
        {/* Enhanced Profile Header */}
        <div className="rounded-3xl overflow-hidden mx-auto max-w-md md:max-w-none relative mb-8 animate-fade-in">
          <div className={`w-full h-40 md:h-56 relative ${theme === 'light' ? 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50' : theme === 'teal' ? 'bg-gradient-to-br from-teal-800 via-teal-700 to-teal-900' : 'bg-gradient-to-br from-gray-900 via-black to-gray-800'}`}>
            {/* Decorative Elements */}
            <div className="absolute inset-0 overflow-hidden">
              <div className={`absolute top-4 right-4 w-20 h-20 rounded-full opacity-20 ${theme === 'light' ? 'bg-blue-200' : theme === 'teal' ? 'bg-teal-300' : 'bg-blue-400'}`}></div>
              <div className={`absolute bottom-6 left-6 w-12 h-12 rounded-full opacity-15 ${theme === 'light' ? 'bg-purple-200' : theme === 'teal' ? 'bg-teal-200' : 'bg-purple-400'}`}></div>
              <div className={`absolute top-1/2 left-1/4 w-8 h-8 rounded-full opacity-10 ${theme === 'light' ? 'bg-indigo-200' : theme === 'teal' ? 'bg-teal-400' : 'bg-indigo-400'}`}></div>
            </div>
            
            <div className="w-full h-full flex items-end justify-center relative z-10">
              <div className="relative -mb-16 md:-mb-20">
                <Avatar className="w-36 h-36 md:w-44 md:h-44 border-4 rounded-full animate-fade-in relative bg-black/10 backdrop-blur-sm transition-all duration-500 hover:scale-105 hover:shadow-2xl shadow-xl ring-4 ring-white/20" style={{ borderColor: theme === 'light' ? 'white' : theme === 'teal' ? '#0f766e' : '#111' }}>
                  <AvatarImage src={profile.avatar} alt={profile.name} className="object-cover" />
                  <AvatarFallback className={`${theme === 'light' ? 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600' : theme === 'teal' ? 'bg-gradient-to-br from-teal-800 to-teal-900 text-white' : 'bg-gradient-to-br from-[#121212] to-black text-white'}`}>
                    <User className="w-14 h-14 md:w-18 md:h-18" />
                  </AvatarFallback>
                </Avatar>
                
                <div className="absolute -bottom-2 -right-2">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${themeClasses.accent} shadow-lg ring-2 ring-white/30`}>
                    <span className="animate-pulse"><Sparkles className="h-5 w-5" /></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Enhanced Profile Card */}
          <Card className={`mt-16 ${themeClasses.card} shadow-2xl border-0 backdrop-blur-xl`}>
            <CardContent className="pt-8 pb-8 px-6 md:px-10 text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-current to-current/70 bg-clip-text text-transparent animate-fade-in">{profile.name}</h1>
              <p className={`text-xl md:text-2xl font-medium mb-6 ${theme === 'light' ? 'text-gray-600' : theme === 'teal' ? 'text-teal-200' : 'text-white/70'}`}>
                {profile.title}
              </p>
              
              <div className={`h-[2px] w-24 mx-auto my-6 rounded-full ${theme === 'light' ? 'bg-gradient-to-r from-blue-400 to-purple-400' : theme === 'teal' ? 'bg-gradient-to-r from-teal-400 to-teal-600' : 'bg-gradient-to-r from-[#007BFF] to-purple-500'}`}></div>
              
              {/* Enhanced Social Links */}
              <div className="flex justify-center flex-wrap gap-3 mt-6">
                {profile.email && (
                  <Button variant="outline" size="icon" className={`rounded-full w-12 h-12 p-0 transition-all duration-300 hover:scale-110 hover:shadow-lg ${themeClasses.buttonOutline}`} asChild>
                    <a href={`mailto:${profile.email}`} aria-label="Email" title="Email">
                      <Mail className="h-6 w-6" />
                    </a>
                  </Button>
                )}
                
                {profile.twitter && (
                  <Button variant="outline" size="icon" className={`rounded-full w-12 h-12 p-0 transition-all duration-300 hover:scale-110 hover:shadow-lg ${themeClasses.buttonOutline}`} asChild>
                    <a href={profile.twitter.startsWith('http') ? profile.twitter : `https://twitter.com/${profile.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer" aria-label="Twitter" title="Twitter">
                      <Twitter className="h-6 w-6" />
                    </a>
                  </Button>
                )}
                
                {profile.linkedin && (
                  <Button variant="outline" size="icon" className={`rounded-full w-12 h-12 p-0 transition-all duration-300 hover:scale-110 hover:shadow-lg ${themeClasses.buttonOutline}`} asChild>
                    <a href={profile.linkedin.startsWith('http') ? profile.linkedin : `https://linkedin.com/in/${profile.linkedin}`} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" title="LinkedIn">
                      <Linkedin className="h-6 w-6" />
                    </a>
                  </Button>
                )}
                
                {profile.github && (
                  <Button variant="outline" size="icon" className={`rounded-full w-12 h-12 p-0 transition-all duration-300 hover:scale-110 hover:shadow-lg ${themeClasses.buttonOutline}`} asChild>
                    <a href={profile.github.startsWith('http') ? profile.github : `https://github.com/${profile.github}`} target="_blank" rel="noopener noreferrer" aria-label="GitHub" title="GitHub">
                      <Github className="h-6 w-6" />
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Enhanced About Section */}
        <Card className={`w-full rounded-2xl overflow-hidden mb-8 ${themeClasses.card} shadow-xl border-0 backdrop-blur-xl`}>
          <CardContent className="p-8 md:p-10">
            <div className="flex items-start space-x-6">
              <div className={`flex-shrink-0 h-12 w-12 rounded-2xl flex items-center justify-center ${themeClasses.accent} shadow-lg`}>
                <Quote className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center">
                  About Me
                  <div className={`h-[2px] w-16 ml-4 rounded-full ${theme === 'light' ? 'bg-gradient-to-r from-blue-400/50 to-transparent' : theme === 'teal' ? 'bg-gradient-to-r from-teal-400/50 to-transparent' : 'bg-gradient-to-r from-[#007BFF]/50 to-transparent'}`}></div>
                </h2>
                <div className={`space-y-6 leading-relaxed text-lg ${theme === 'light' ? 'text-gray-700' : theme === 'teal' ? 'text-white/90' : 'text-white/80'}`}>
                  {paragraphs.map((paragraph, i) => (
                    <p key={i} className="animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>{paragraph}</p>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Enhanced Connect Section */}
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 inline-flex items-center animate-fade-in">
            <span>Connect With Me</span>
            <div className={`h-[2px] w-20 ml-4 rounded-full ${theme === 'light' ? 'bg-gradient-to-r from-blue-400/60 to-transparent' : theme === 'teal' ? 'bg-gradient-to-r from-teal-500/60 to-transparent' : 'bg-gradient-to-r from-[#007BFF]/60 to-transparent'}`}></div>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {profile.email && (
              <Button variant="outline" className={`justify-start h-auto py-6 px-6 group rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl ${themeClasses.buttonOutline}`} asChild>
                <a href={`mailto:${profile.email}`} className="flex items-center">
                  <div className={`h-12 w-12 rounded-2xl flex items-center justify-center mr-5 transition-all duration-300 group-hover:scale-110 ${themeClasses.accent}`}>
                    <Mail className="h-6 w-6" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className={`text-sm font-medium ${theme === 'light' ? 'text-gray-500' : theme === 'teal' ? 'text-teal-300/70' : 'text-white/50'} mb-1`}>Email</p>
                    <p className={`font-semibold ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>{profile.email}</p>
                  </div>
                  <ArrowRight className={`h-5 w-5 ${theme === 'light' ? 'text-gray-400 group-hover:text-blue-500' : theme === 'teal' ? 'text-teal-500/50 group-hover:text-teal-300' : 'text-white/30 group-hover:text-[#007BFF]'} group-hover:translate-x-1 transition-all duration-300`} />
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
        
        <div className="flex flex-col sm:flex-row justify-center gap-3 mb-12 mt-8">
          <Button 
            className={`${themeClasses.button} flex items-center justify-center py-6 px-8`}
            onClick={handleSaveContact}
            disabled={isSaving}
          >
            <Save className="mr-2 h-5 w-5" />
            {isSaving ? 'Saving...' : 'Save Contact'}
          </Button>
          
          <Button 
            variant="outline" 
            className={`${themeClasses.buttonOutline} flex items-center justify-center py-6 px-8`}
            onClick={handleAddToNetwork}
            disabled={isAdding}
          >
            <Plus className="mr-2 h-5 w-5" />
            {isAdding ? 'Adding...' : 'Add to Network'}
          </Button>
        </div>
        
        <div className={`text-center border-t pt-8 ${theme === 'light' ? 'border-gray-200' : theme === 'teal' ? 'border-teal-800' : 'border-white/5'}`}>
          <p className={`text-sm font-mono tracking-wide ${theme === 'light' ? 'text-gray-500' : theme === 'teal' ? 'text-teal-300/50' : 'text-white/30'}`}>
            © {currentYear} · Created with PageGenerator
          </p>
        </div>
      </div>
    </div>
  );
};

export default GeneratedPage;
