
import React from "react";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui/button";
import { Palette, Moon, Sun, Sparkles } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ThemeSwitcherProps {
  variant?: "default" | "minimal";
}

const ThemeSwitcher = ({ variant = "default" }: ThemeSwitcherProps) => {
  const { theme, setTheme } = useTheme();

  const themes = [
    { id: "dark", name: "Dark", icon: Moon },
    { id: "light", name: "Light", icon: Sun },
    { id: "teal", name: "Teal", icon: Palette },
  ] as const;

  if (variant === "minimal") {
    return (
      <div className="flex items-center space-x-1">
        <TooltipProvider>
          {themes.map((t) => {
            const Icon = t.icon;
            const isActive = theme === t.id;
            return (
              <Tooltip key={t.id}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-8 w-8 rounded-full ${
                      isActive
                        ? "bg-primary/20 text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    onClick={() => setTheme(t.id)}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="sr-only">Switch to {t.name} theme</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>{t.name}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center space-x-2">
        <Sparkles className="h-5 w-5 text-[#007BFF]" />
        <h3 className="text-lg font-medium">Theme Options</h3>
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        {themes.map((t) => {
          const Icon = t.icon;
          const isActive = theme === t.id;
          return (
            <Button
              key={t.id}
              variant={isActive ? "default" : "outline"}
              className={`flex items-center justify-center py-6 ${
                isActive
                  ? "bg-[#007BFF] text-white"
                  : "border-white/10 bg-white/5 hover:bg-white/10 text-white"
              }`}
              onClick={() => setTheme(t.id)}
            >
              <Icon className="mr-2 h-4 w-4" />
              {t.name}
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default ThemeSwitcher;
