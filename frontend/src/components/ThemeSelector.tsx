import { Palette } from 'lucide-react';
import {
  themeOptions,
  useThemeStore,
  type AppTheme,
} from '@/store/themeStore';

interface Props {
  className?: string;
}

export const ThemeSelector = ({ className = '' }: Props) => {
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);

  return (
    <label
      className={`theme-selector flex h-10 items-center gap-2 rounded-lg border border-base-300 bg-base-100/90 px-2 ${className}`}
    >
      <Palette size={15} className="text-primary" />
      <span className="sr-only">Choisir un thème</span>
      <select
        aria-label="Choisir un thème"
        className="select select-xs h-8 min-h-8 w-32 border-0 bg-transparent p-0 font-mono text-xs text-base-content focus:outline-none"
        value={theme}
        onChange={(event) => setTheme(event.target.value as AppTheme)}
      >
        {themeOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
};
