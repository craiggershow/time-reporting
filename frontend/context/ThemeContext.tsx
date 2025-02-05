import { createContext, useContext } from 'react';
import { Colors } from '@/constants/Colors';

interface ThemeContextType {
  colors: typeof Colors;
}

const ThemeContext = createContext<ThemeContextType>({
  colors: Colors,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeContext.Provider value={{ colors: Colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
} 