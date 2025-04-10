
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { generateRandomPath } from "@/lib/utils";

interface FormData {
  name: string;
  title: string;
  bio: string;
  email: string;
  twitter: string;
  linkedin: string;
  github: string;
  avatar: string;
}

const UserDetailForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    title: "",
    bio: "",
    email: "",
    twitter: "",
    linkedin: "",
    github: "",
    avatar: "https://github.com/shadcn.png", // Default avatar
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Generate random path
    const randomPath = generateRandomPath(10);
    
    // Store data in localStorage (in a real app, this would go to a database)
    localStorage.setItem(`page-${randomPath}`, JSON.stringify(formData));
    
    toast({
      title: "Success!",
      description: "Your page has been created.",
    });
    
    // Redirect to success page with the path
    navigate(`/success/${randomPath}`);
  };

  return (
    <Card className="w-full max-w-md animate-fade-in">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Create Your Page</CardTitle>
        <CardDescription>
          Fill in your details to generate a personalized webpage with a unique URL.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              name="name"
              placeholder="John Doe"
              value={formData.name}
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
              value={formData.title}
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
              value={formData.bio}
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
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="twitter">Twitter</Label>
            <Input
              id="twitter"
              name="twitter"
              placeholder="@johndoe"
              value={formData.twitter}
              onChange={handleChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn</Label>
            <Input
              id="linkedin"
              name="linkedin"
              placeholder="https://linkedin.com/in/johndoe"
              value={formData.linkedin}
              onChange={handleChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="github">GitHub</Label>
            <Input
              id="github"
              name="github"
              placeholder="https://github.com/johndoe"
              value={formData.github}
              onChange={handleChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="avatar">Avatar URL</Label>
            <Input
              id="avatar"
              name="avatar"
              placeholder="https://github.com/shadcn.png"
              value={formData.avatar}
              onChange={handleChange}
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create My Page"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default UserDetailForm;
