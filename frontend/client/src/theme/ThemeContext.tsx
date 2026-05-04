'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

// --- Abstract Products ---
export interface IThemeClasses {
  background: string;
  surface: string;
  surfaceHover: string;
  textPrimary: string;
  textSecondary: string;
  border: string;
  accentBackground: string;
}

// --- Abstract Factory ---
interface AbstractThemeFactory {
  createTheme(): IThemeClasses;
}

// --- Concrete Factories ---
class LightThemeFactory implements AbstractThemeFactory {
  createTheme(): IThemeClasses {
    return {
      background: 'bg-[#F9F8F6]', // Match dashboard bg
      surface: 'bg-white',
      surfaceHover: 'hover:bg-[#F5F3EF]',
      textPrimary: 'text-gray-900',
      textSecondary: 'text-gray-500',
      border: 'border-[#EAE7E0]',
      accentBackground: 'bg-[#2C3E2D]' 
    };
  }
}

class DarkThemeFactory implements AbstractThemeFactory {
  createTheme(): IThemeClasses {
    return {
      background: 'bg-gray-900',
      surface: 'bg-gray-800',
      surfaceHover: 'hover:bg-gray-700',
      textPrimary: 'text-white',
      textSecondary: 'text-gray-400',
      border: 'border-gray-700',
      accentBackground: 'bg-green-700' 
    };
  }
}

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  theme: IThemeClasses;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Load from localStorage on initial render
  useEffect(() => {
    const savedTheme = localStorage.getItem('app-theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
    }
  }, []);

  // Save to localStorage when it changes
  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const newLine = !prev;
      localStorage.setItem('app-theme', newLine ? 'dark' : 'light');
      return newLine;
    });
  };

  const themeFactory: AbstractThemeFactory = isDarkMode 
    ? new DarkThemeFactory() 
    : new LightThemeFactory();

  const theme = themeFactory.createTheme();

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}