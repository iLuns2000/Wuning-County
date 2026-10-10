import { useEffect, useState } from 'react';
import { create } from 'zustand';

type Theme = 'dark' | 'light' | 'system';

function readTheme(): Theme {
  try {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' || saved === 'light' ? saved : 'system';
  } catch {
    return 'system';
  }
}

const useThemeStore = create<{ theme: Theme; setTheme: (theme: Theme) => void }>((set) => ({
  theme: readTheme(),
  setTheme: (theme) => {
    try {
      localStorage.setItem('theme', theme);
    } catch {
      // Theme switching still works when storage is unavailable.
    }
    set({ theme });
  },
}));

export function useTheme() {
  const { theme, setTheme } = useThemeStore();
  const [, setSystemDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches);
  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const applyTheme = () => {
      setSystemDark(media.matches);
      const dark = theme === 'dark' || (theme === 'system' && media.matches);
      root.classList.toggle('dark', dark);
      root.classList.toggle('light', !dark);
    };
    applyTheme();
    media.addEventListener('change', applyTheme);
    return () => media.removeEventListener('change', applyTheme);
  }, [theme]);
  return { theme, setTheme };
}
