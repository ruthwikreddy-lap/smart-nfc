
import React from "react";
import { Quote } from "lucide-react";

interface ProfileBioProps {
  bio: string;
  themeClasses: {
    accent: string;
    [key: string]: string;
  };
  theme: string;
}

const ProfileBio = ({ bio, themeClasses, theme }: ProfileBioProps) => {
  const paragraphs = bio?.split('\n') || [];
  
  return (
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
  );
};

export default ProfileBio;
