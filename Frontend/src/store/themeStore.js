import { create } from 'zustand';

const getSystemTheme = () => {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const applyTheme = (theme) => {
    if (typeof window === 'undefined') return;
    const root = window.document.documentElement;
    const resolvedTheme = theme === 'system' ? getSystemTheme() : theme;
    
    if (resolvedTheme === 'dark') {
        root.classList.add('dark');
    } else {
        root.classList.remove('dark');
    }
};

const useThemeStore = create((set) => {
    const savedTheme = typeof window !== 'undefined' ? (localStorage.getItem('theme') || 'system') : 'system';
    
    // Initial run
    applyTheme(savedTheme);

    if (typeof window !== 'undefined') {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleSystemThemeChange = () => {
            const currentTheme = localStorage.getItem('theme') || 'system';
            if (currentTheme === 'system') {
                applyTheme('system');
            }
        };

        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', handleSystemThemeChange);
        } else {
            mediaQuery.addListener(handleSystemThemeChange);
        }
    }

    return {
        theme: savedTheme,
        setTheme: (newTheme) => {
            if (typeof window !== 'undefined') {
                localStorage.setItem('theme', newTheme);
            }
            applyTheme(newTheme);
            set({ theme: newTheme });
        }
    };
});

export default useThemeStore;
