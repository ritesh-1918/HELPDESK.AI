import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const THEME_STORAGE_KEY = 'helpdesk-ai-theme';
const ThemeContext = createContext(null);

function getSavedTheme() {
    if (typeof window === 'undefined') return 'light';

    try {
        const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
        return savedTheme === 'dark' ? 'dark' : 'light';
    } catch {
        return 'light';
    }
}

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(getSavedTheme);

    useEffect(() => {
        const root = document.documentElement;
        root.classList.toggle('dark', theme === 'dark');
        root.style.colorScheme = theme;

        try {
            window.localStorage.setItem(THEME_STORAGE_KEY, theme);
        } catch {
            // Ignore storage failures in restricted browsing contexts.
        }
    }, [theme]);

    const value = useMemo(() => ({
        theme,
        isDark: theme === 'dark',
        toggleTheme: () => setTheme((currentTheme) => currentTheme === 'dark' ? 'light' : 'dark'),
    }), [theme]);

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used inside ThemeProvider');
    }
    return context;
}
