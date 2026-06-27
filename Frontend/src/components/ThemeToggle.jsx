import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-gray-100 dark:hover:bg-slate-700/50 transition-all duration-300 active:scale-95 shrink-0 flex items-center justify-center cursor-pointer"
            aria-label="Toggle application theme color"
        >
            {theme === 'dark' ? (
                <Sun size={18} className="animate-in fade-in spin-in-45 duration-300" />
            ) : (
                <Moon size={18} className="animate-in fade-in spin-in-45 duration-300" />
            )}
        </button>
    );
}