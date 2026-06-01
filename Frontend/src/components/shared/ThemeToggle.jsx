import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';

const ThemeToggle = ({ className = '' }) => {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <button aria-hidden className={`w-10 h-10 rounded-md ${className}`} />;

  const resolvedTheme = theme === 'system' ? systemTheme : theme;
  const isDark = resolvedTheme === 'dark';

  const toggle = () => setTheme(isDark ? 'light' : 'dark');

  return (
    <button
      onClick={toggle}
      aria-label={`Toggle theme, currently ${isDark ? 'dark' : 'light'}`}
      className={`w-10 h-10 flex items-center justify-center rounded-md transition-colors duration-300 hover:bg-gray-100 dark:hover:bg-slate-700 ${className}`}
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-yellow-400 transform transition-transform duration-300" />
      ) : (
        <Moon className="w-5 h-5 text-slate-600 transform transition-transform duration-300" />
      )}
    </button>
  );
};

export default ThemeToggle;
