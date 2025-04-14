
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Link as LinkIcon, Save, User, Copy, CheckCircle, Mail, Twitter, Linkedin, Github } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { generateRandomPath } from "@/lib/utils";
import ImageUpload from "@/components/ImageUpload";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ProfileData {
  id: string;
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
  id: string;
  user_id: string;
  path: string;
  created_at: string;
}

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      
      try {
        // Fetch profile data
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (profileError) throw profileError;
        
        // Fetch page data
        const { data: page, error: pageError } = await supabase
          .from('pages')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (pageError) throw pageError;
        
        setProfileData(profile as ProfileData);
        setPageData(page as PageData);
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Failed to load your profile data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData((prev) => prev ? ({ ...prev, [name]: value }) : null);
  };

  const handleImageUploaded = (url: string) => {
    setProfileData(prev => prev ? ({ ...prev, avatar: url }) : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profileData) return;
    
    setIsSubmitting(true);
    
    try {
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileData as ProfileData)
        .eq('id', user.id);
      
      if (profileError) throw profileError;
      
      // Create page if doesn't exist
      if (!pageData) {
        const randomPath = generateRandomPath(10);
        const { error: pageError } = await supabase
          .from('pages')
          .insert({
            user_id: user.id,
            path: randomPath
          });
        
        if (pageError) throw pageError;
        
        // Fetch the newly created page
        const { data: newPage, error: fetchError } = await supabase
          .from('pages')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (fetchError) throw fetchError;
        setPageData(newPage as PageData);
      }
      
      toast.success('Your profile has been updated successfully!');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update your profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = () => {
    if (pageData) {
      navigator.clipboard.writeText(`${window.location.origin}/${pageData.path}`);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      
      setTimeout(() => {
        setCopied(false);
      }, 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-full border-4 border-[#007BFF] border-t-transparent animate-spin mb-4"></div>
          <div className="text-xl text-white">Loading your profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-start p-4 md:p-8">
      <div className="w-full max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h1 className="text-3xl font-bold gradient-heading">My Dashboard</h1>
          <div className="flex gap-4">
            {pageData && (
              <Button variant="outline" asChild className="blue-glow hover:bg-[#007BFF]/10 border-[#007BFF]/30">
                <Link to={`/${pageData.path}`}>
                  <LinkIcon className="mr-2 h-4 w-4" />
                  View My Page
                </Link>
              </Button>
            )}
            <Button variant="outline" onClick={() => signOut()} className="hover:bg-destructive/10 hover:text-destructive">
              Log Out
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="edit" className="w-full">
          <TabsList className="grid grid-cols-2 mb-8">
            <TabsTrigger value="edit" className="data-[state=active]:bg-[#007BFF] data-[state=active]:text-white">Edit Profile</TabsTrigger>
            <TabsTrigger value="preview" className="data-[state=active]:bg-[#007BFF] data-[state=active]:text-white">Preview</TabsTrigger>
          </TabsList>
          
          <TabsContent value="edit" className="animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="col-span-2">
                <Card className="border-[#007BFF]/20 bg-black/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-2xl font-bold gradient-heading">Edit Your Profile</CardTitle>
                    <CardDescription>
                      Update your information to be displayed on your page
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <form id="profile-form" onSubmit={handleSubmit} className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="avatar">Profile Image</Label>
                        <ImageUpload 
                          onImageUploaded={handleImageUploaded}
                          currentImage={profileData?.avatar}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          name="name"
                          placeholder="John Doe"
                          value={profileData?.name || ""}
                          onChange={handleChange}
                          required
                          className="bg-black/50 border-[#007BFF]/30 focus:border-[#007BFF] focus:ring-[#007BFF]/50"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="title">Professional Title *</Label>
                        <Input
                          id="title"
                          name="title"
                          placeholder="Software Engineer"
                          value={profileData?.title || ""}
                          onChange={handleChange}
                          required
                          className="bg-black/50 border-[#007BFF]/30 focus:border-[#007BFF] focus:ring-[#007BFF]/50"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio *</Label>
                        <Textarea
                          id="bio"
                          name="bio"
                          placeholder="Tell us about yourself..."
                          value={profileData?.bio || ""}
                          onChange={handleChange}
                          required
                          className="min-h-[150px] bg-black/50 border-[#007BFF]/30 focus:border-[#007BFF] focus:ring-[#007BFF]/50"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="john@example.com"
                          value={profileData?.email || ""}
                          onChange={handleChange}
                          className="bg-black/50 border-[#007BFF]/30 focus:border-[#007BFF] focus:ring-[#007BFF]/50"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="twitter">Twitter</Label>
                        <Input
                          id="twitter"
                          name="twitter"
                          placeholder="@johndoe"
                          value={profileData?.twitter || ""}
                          onChange={handleChange}
                          className="bg-black/50 border-[#007BFF]/30 focus:border-[#007BFF] focus:ring-[#007BFF]/50"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="linkedin">LinkedIn</Label>
                        <Input
                          id="linkedin"
                          name="linkedin"
                          placeholder="https://linkedin.com/in/johndoe"
                          value={profileData?.linkedin || ""}
                          onChange={handleChange}
                          className="bg-black/50 border-[#007BFF]/30 focus:border-[#007BFF] focus:ring-[#007BFF]/50"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="github">GitHub</Label>
                        <Input
                          id="github"
                          name="github"
                          placeholder="https://github.com/johndoe"
                          value={profileData?.github || ""}
                          onChange={handleChange}
                          className="bg-black/50 border-[#007BFF]/30 focus:border-[#007BFF] focus:ring-[#007BFF]/50"
                        />
                      </div>
                    </form>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      type="submit" 
                      form="profile-form"
                      disabled={isSubmitting}
                      className="w-full bg-[#007BFF] hover:bg-[#0066cc]"
                    >
                      {isSubmitting ? "Saving..." : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </div>
              
              <div>
                <Card className="border-[#007BFF]/20 bg-black/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold gradient-heading">Your Page</CardTitle>
                    <CardDescription>
                      View and share your personalized page
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <Avatar className="h-24 w-24 border-4 border-[#007BFF]">
                        <AvatarImage src={profileData?.avatar || ""} alt={profileData?.name || "User"} />
                        <AvatarFallback className="bg-gradient-to-br from-[#007BFF] to-[#0050a8]">
                          <User className="h-12 w-12 text-white" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-xl font-bold text-white">{profileData?.name || "Your Name"}</h3>
                        <p className="text-muted-foreground">{profileData?.title || "Your Title"}</p>
                      </div>
                    </div>

                    <Separator className="bg-[#007BFF]/20" />
                    
                    {pageData ? (
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm text-muted-foreground">Your unique URL</Label>
                          <div className="flex items-center mt-1 p-3 bg-[#007BFF]/5 rounded-md border border-[#007BFF]/20">
                            <code className="text-sm font-mono break-all text-white/80 flex-1">
                              {window.location.origin}/{pageData.path}
                            </code>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={copyToClipboard} 
                              className="ml-2 h-8 w-8 p-0 text-[#007BFF]"
                            >
                              {copied ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                        
                        <Button asChild variant="outline" className="w-full blue-glow hover:bg-[#007BFF]/10 border-[#007BFF]/30">
                          <Link to={`/${pageData.path}`}>
                            <LinkIcon className="mr-2 h-4 w-4" />
                            View Your Page
                          </Link>
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center space-y-4">
                        <p className="text-muted-foreground">Save your profile to generate your page</p>
                        <Button form="profile-form" type="submit" className="w-full bg-[#007BFF] hover:bg-[#0066cc]">
                          Create My Page
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="preview" className="animate-fade-in">
            <Card className="border-[#007BFF]/20 bg-black/50 backdrop-blur-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="p-6 bg-gradient-to-r from-[#007BFF]/10 to-transparent border-b border-[#007BFF]/20">
                  <h2 className="text-xl font-bold gradient-heading">Live Preview</h2>
                  <p className="text-sm text-muted-foreground">This is how your profile will appear to visitors</p>
                </div>
                
                <div className="p-6 max-h-[70vh] overflow-y-auto">
                  <div className="flex flex-col md:flex-row items-center gap-8 mb-8">
                    <Avatar className="w-24 h-24 md:w-36 md:h-36 border-4 border-[#007BFF]">
                      <AvatarImage src={profileData?.avatar || ""} alt={profileData?.name || "User"} />
                      <AvatarFallback className="bg-gradient-to-br from-[#007BFF] to-[#0050a8]">
                        <User className="w-12 h-12 text-white" />
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="text-center md:text-left space-y-3 flex-1">
                      <h1 className="text-3xl md:text-4xl font-bold gradient-heading">
                        {profileData?.name || "Your Name"}
                      </h1>
                      <p className="text-xl md:text-2xl text-white/80">
                        {profileData?.title || "Your Professional Title"}
                      </p>
                      
                      <div className="flex flex-wrap gap-3 justify-center md:justify-start pt-2">
                        {profileData?.email && (
                          <Button variant="outline" size="sm" className="rounded-full blue-glow hover:bg-[#007BFF]/10 border-[#007BFF]/30">
                            <Mail className="mr-1 h-4 w-4" />
                            Email
                          </Button>
                        )}
                        
                        {profileData?.twitter && (
                          <Button variant="outline" size="sm" className="rounded-full blue-glow hover:bg-[#007BFF]/10 border-[#007BFF]/30">
                            <Twitter className="mr-1 h-4 w-4" />
                            Twitter
                          </Button>
                        )}
                        
                        {profileData?.linkedin && (
                          <Button variant="outline" size="sm" className="rounded-full blue-glow hover:bg-[#007BFF]/10 border-[#007BFF]/30">
                            <Linkedin className="mr-1 h-4 w-4" />
                            LinkedIn
                          </Button>
                        )}
                        
                        {profileData?.github && (
                          <Button variant="outline" size="sm" className="rounded-full blue-glow hover:bg-[#007BFF]/10 border-[#007BFF]/30">
                            <Github className="mr-1 h-4 w-4" />
                            GitHub
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-black/30 border border-[#007BFF]/20 rounded-xl p-6 mb-8">
                    <h2 className="text-2xl font-bold gradient-heading mb-4">About Me</h2>
                    <div className="prose prose-invert prose-blue max-w-none">
                      {profileData?.bio ? (
                        profileData.bio.split('\n').map((paragraph, i) => (
                          <p key={i} className="text-white/80 leading-relaxed mb-4">{paragraph}</p>
                        ))
                      ) : (
                        <p className="text-white/50 italic">Your bio will appear here...</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
