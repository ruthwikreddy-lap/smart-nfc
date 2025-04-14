
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Sparkles } from "lucide-react";

interface ProfileHeaderProps {
  name: string;
  title: string;
  avatar: string;
  themeClasses: {
    accent: string;
    [key: string]: string;
  };
  theme: string;
}

const ProfileHeader = ({ name, title, avatar, themeClasses, theme }: ProfileHeaderProps) => {
  return (
    <div className="flex flex-col items-center">
      <div className="relative mb-4">
        <Avatar className="w-32 h-32 md:w-40 md:h-40 border-4 rounded-full animate-fade-in relative bg-black/10 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-xl shadow-lg" style={{ borderColor: theme === 'light' ? 'white' : theme === 'teal' ? '#134e4a' : '#111' }}>
          <AvatarImage src={avatar} alt={name} className="object-cover" />
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
      
      <h1 className="text-3xl md:text-4xl font-bold mb-1">{name}</h1>
      <p className={`text-lg ${theme === 'light' ? 'text-gray-600' : theme === 'teal' ? 'text-teal-200' : 'text-white/70'}`}>
        {title}
      </p>
    </div>
  );
};

export default ProfileHeader;
