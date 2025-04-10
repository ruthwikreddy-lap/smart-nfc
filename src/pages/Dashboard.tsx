
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Link as LinkIcon, Save, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { Link, useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { generateRandomPath } from "@/lib/utils";

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
        
        setProfileData(profile);
        setPageData(page);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profileData) return;
    
    setIsSubmitting(true);
    
    try {
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileData)
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
        setPageData(newPage);
      }
      
      toast.success('Your profile has been updated successfully!');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update your profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black">
        <div className="animate-pulse text-xl text-white">Loading your profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-start p-4 md:p-8">
      <div className="w-full max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">My Dashboard</h1>
          <div className="flex gap-4">
            {pageData && (
              <Button variant="outline" asChild>
                <Link to={`/${pageData.path}`}>
                  <LinkIcon className="mr-2 h-4 w-4" />
                  View My Page
                </Link>
              </Button>
            )}
            <Button variant="outline" onClick={() => signOut()}>
              Log Out
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="col-span-2">
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">Edit Your Profile</CardTitle>
                <CardDescription>
                  Update your information to be displayed on your page
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <form id="profile-form" onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="John Doe"
                      value={profileData?.name || ""}
                      onChange={handleChange}
                      required
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
                      className="min-h-[100px]"
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
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="avatar">Avatar URL</Label>
                    <Input
                      id="avatar"
                      name="avatar"
                      placeholder="https://github.com/shadcn.png"
                      value={profileData?.avatar || ""}
                      onChange={handleChange}
                    />
                  </div>
                </form>
              </CardContent>
              <CardFooter>
                <Button 
                  type="submit" 
                  form="profile-form"
                  disabled={isSubmitting}
                  className="w-full"
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
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle className="text-xl font-bold">Your Page</CardTitle>
                <CardDescription>
                  View and share your personalized page
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profileData?.avatar || ""} alt={profileData?.name || "User"} />
                    <AvatarFallback><User className="h-12 w-12" /></AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-bold">{profileData?.name || "Your Name"}</h3>
                    <p className="text-muted-foreground">{profileData?.title || "Your Title"}</p>
                  </div>
                </div>

                <Separator />
                
                {pageData ? (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm text-muted-foreground">Your unique URL</Label>
                      <div className="flex items-center mt-1 p-3 bg-secondary/10 rounded-md border border-border">
                        <code className="text-sm font-mono break-all">
                          {window.location.origin}/{pageData.path}
                        </code>
                      </div>
                    </div>
                    
                    <Button asChild variant="outline" className="w-full">
                      <Link to={`/${pageData.path}`}>
                        <LinkIcon className="mr-2 h-4 w-4" />
                        View Your Page
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <p className="text-muted-foreground">Save your profile to generate your page</p>
                    <Button form="profile-form" type="submit" variant="outline" className="w-full">
                      Create My Page
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
