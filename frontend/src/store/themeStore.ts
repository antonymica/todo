import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const themeOptions = [
  { value: 'light', label: 'Clair' },
  { value: 'emerald', label: 'Emeraude' },
  { value: 'corporate', label: 'Bureau' },
  { value: 'cupcake', label: 'Doux' },
  { value: 'cyber', label: 'Cyber' },
  { value: 'dark', label: 'Sombre' },
  { value: 'luxury', label: 'Luxury' },
] as const;

export type AppTheme = (typeof themeOptions)[number]['value'];

export const defaultTheme: AppTheme = 'light';

interface ThemeState {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: defaultTheme,
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'todo-theme',
    },
  ),
);
