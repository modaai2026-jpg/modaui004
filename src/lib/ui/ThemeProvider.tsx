import React, { createContext, useContext, useState, useEffect } from 'react';

interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  borderRadius: string;
  fontFamily: string;
  isDark: boolean;
}

const defaultTheme: ThemeConfig = {
  primaryColor: '#1D9BF0',
  secondaryColor: '#00BA7C',
  borderRadius: '1rem',
  fontFamily: 'Inter, system-ui, sans-serif',
  isDark: true,
};

const ThemeContext = createContext<{
  theme: ThemeConfig;
  setTheme: (t: Partial<ThemeConfig>) => void;
}>({ theme: defaultTheme, setTheme: () => {} });

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setInternalTheme] = useState<ThemeConfig>(defaultTheme);

  const setTheme = (newTheme: Partial<ThemeConfig>) => {
    setInternalTheme(prev => ({ ...prev, ...newTheme }));
  };

  useEffect(() => {
    // Apply theme variables to root
    const root = document.documentElement;
    root.style.setProperty('--primary-color', theme.primaryColor);
    root.style.setProperty('--secondary-color', theme.secondaryColor);
    root.style.setProperty('--border-radius', theme.borderRadius);
    root.style.setProperty('--font-family', theme.fontFamily);
    
    if (theme.isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
