import { createContext, useContext, useEffect, useState, useMemo } from "react";

/**
 * ThemeContext — provides dark/light mode toggle across the entire app.
 *
 * Usage:
 *   1. Wrap <App /> with <ThemeProvider>
 *   2. Call useTheme() in any component to get { theme, toggleTheme }
 *
 * Behaviour:
 *   - Reads persisted preference from localStorage ("theme" key)
 *   - Falls back to OS prefers-color-scheme on first visit
 *   - Applies/removes "dark" class on <html> so Tailwind dark: variants work
 *   - Listens for OS theme changes at runtime (when no manual pref is set)
 */
const ThemeContext = createContext(undefined);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "dark" || stored === "light") return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  // Apply class to <html> and persist preference
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Listen for OS-level preference changes (only when user has no manual pref)
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => {
      if (!localStorage.getItem("theme")) {
        setTheme(e.matches ? "dark" : "light");
      }
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const toggleTheme = () =>
    setTheme((current) => (current === "dark" ? "light" : "dark"));

  const value = useMemo(() => ({ theme, toggleTheme }), [theme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used inside <ThemeProvider>");
  }
  return ctx;
}
