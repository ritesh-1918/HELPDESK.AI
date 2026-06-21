import React from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle({ theme, onToggle, size = 18 }) {
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={onToggle}
      className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white/70 hover:bg-white dark:bg-white/5 dark:border-white/10 dark:hover:bg-white/10 transition-colors"
      style={{ width: 36, height: 36 }}
    >
      {isDark ? <Moon size={size} className="text-slate-700 dark:text-slate-200" /> : <Sun size={size} className="text-emerald-700 dark:text-emerald-300" />}
    </button>
  );
}

