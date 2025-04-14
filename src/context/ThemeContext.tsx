
import React, { createContext, useContext, useState, useEffect } from "react";

type ThemeType = "dark" | "light" | "teal";

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  preferredTheme: ThemeType;
  setPreferredTheme: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  initialTheme?: ThemeType;
}

export const ThemeProvider = ({ children, initialTheme }: ThemeProviderProps) => {
  const [theme, setTheme] = useState<ThemeType>(() => {
    // Try to get theme from localStorage, then use initialTheme, or fallback to "dark"
    const savedTheme = localStorage.getItem("profile-theme") as ThemeType;
    return savedTheme || initialTheme || "dark";
  });

  const [preferredTheme, setPreferredTheme] = useState<ThemeType>(() => {
    // Try to get preferred theme from localStorage, or use initialTheme
    const savedPreferredTheme = localStorage.getItem("profile-preferred-theme") as ThemeType;
    return savedPreferredTheme || initialTheme || "dark";
  });

  useEffect(() => {
    // Save theme to localStorage whenever it changes
    localStorage.setItem("profile-theme", theme);
  }, [theme]);

  useEffect(() => {
    // Save preferred theme to localStorage whenever it changes
    localStorage.setItem("profile-preferred-theme", preferredTheme);
  }, [preferredTheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, preferredTheme, setPreferredTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
