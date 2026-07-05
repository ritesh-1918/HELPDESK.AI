import { useEffect, useMemo, useState } from 'react';

const THEME_STORAGE_KEY = 'theme';

function getPreferredTheme() {
  const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (saved === 'light' || saved === 'dark') return saved;

  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)')?.matches;
  return prefersDark ? 'dark' : 'light';
}

function applyThemeClass(theme) {
  const root = document.documentElement;
  if (!root) return;
  if (theme === 'dark') root.classList.add('dark');
  else root.classList.remove('dark');
}

export default function useThemePreference() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const initial = getPreferredTheme();
    setTheme(initial);
    applyThemeClass(initial);
  }, []);

  const setAndPersistTheme = (nextTheme) => {
    const normalized = nextTheme === 'dark' ? 'dark' : 'light';
    setTheme(normalized);
    window.localStorage.setItem(THEME_STORAGE_KEY, normalized);
    applyThemeClass(normalized);
  };

  const api = useMemo(() => ({
    theme,
    setTheme: setAndPersistTheme,
    isDark: theme === 'dark',
    toggle: () => setAndPersistTheme(theme === 'dark' ? 'light' : 'dark'),
  }), [theme]);

  return api;
}

