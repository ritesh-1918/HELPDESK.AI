import { useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

/**
 * useTheme — dark/light mode hook with system preference detection.
 *
 * - Reads persisted preference from localStorage (key: 'theme')
 * - Falls back to system prefers-color-scheme on first visit
 * - Toggles the `dark` class on <html> for Tailwind darkMode: ["class"]
 * - Returns { theme, toggleTheme, setTheme }
 */
export function useTheme() {
  const getSystemPreference = () =>
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

  const [theme, setTheme] = useLocalStorage('theme', getSystemPreference());

  // Apply the `dark` class to <html> whenever theme changes
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Listen for system preference changes (only if user hasn't set a manual preference)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => {
      // Only auto-switch if no persisted preference exists
      const stored = window.localStorage.getItem('theme');
      if (!stored) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [setTheme]);

  const toggleTheme = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));

  return { theme, toggleTheme, setTheme };
}
