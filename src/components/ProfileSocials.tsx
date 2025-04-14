
import React from "react";
import { Button } from "@/components/ui/button";
import { Github, Mail, Twitter, Linkedin } from "lucide-react";

interface ProfileSocialsProps {
  email?: string;
  twitter?: string;
  linkedin?: string;
  github?: string;
  themeClasses: {
    buttonOutline: string;
    [key: string]: string;
  };
}

const ProfileSocials = ({ email, twitter, linkedin, github, themeClasses }: ProfileSocialsProps) => {
  return (
    <div className="flex justify-center space-x-3 mt-4">
      {email && (
        <Button variant="outline" size="icon" className={`rounded-full w-10 h-10 p-0 ${themeClasses.buttonOutline}`} asChild>
          <a href={`mailto:${email}`} aria-label="Email" title="Email">
            <Mail className="h-5 w-5" />
          </a>
        </Button>
      )}
      
      {twitter && (
        <Button variant="outline" size="icon" className={`rounded-full w-10 h-10 p-0 ${themeClasses.buttonOutline}`} asChild>
          <a href={twitter.startsWith('http') ? twitter : `https://twitter.com/${twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer" aria-label="Twitter" title="Twitter">
            <Twitter className="h-5 w-5" />
          </a>
        </Button>
      )}
      
      {linkedin && (
        <Button variant="outline" size="icon" className={`rounded-full w-10 h-10 p-0 ${themeClasses.buttonOutline}`} asChild>
          <a href={linkedin.startsWith('http') ? linkedin : `https://linkedin.com/in/${linkedin}`} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" title="LinkedIn">
            <Linkedin className="h-5 w-5" />
          </a>
        </Button>
      )}
      
      {github && (
        <Button variant="outline" size="icon" className={`rounded-full w-10 h-10 p-0 ${themeClasses.buttonOutline}`} asChild>
          <a href={github.startsWith('http') ? github : `https://github.com/${github}`} target="_blank" rel="noopener noreferrer" aria-label="GitHub" title="GitHub">
            <Github className="h-5 w-5" />
          </a>
        </Button>
      )}
    </div>
  );
};

export default ProfileSocials;
