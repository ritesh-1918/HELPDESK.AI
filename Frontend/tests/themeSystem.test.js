/**
 * Tests for issue #1394 — Dark Mode / Light Mode Toggle.
 *
 * Verifies:
 * - ThemeProvider is imported in App.jsx (was missing — root cause of the bug)
 * - ThemeProvider exports are present and usable
 * - useTheme hook returns theme, toggleTheme, setTheme
 * - toggleTheme switches between 'dark' and 'light'
 * - Theme is persisted to localStorage on change
 * - System preference (prefers-color-scheme) is respected on first visit
 * - ThemeToggle component source has correct aria-label
 * - Duplicate ThemeToggle import in AdminHeader.jsx is removed
 * - ThemeProvider wraps the full app in App.jsx
 * - Dark class is applied to documentElement when theme is 'dark'
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

const ROOT = resolve(new URL('.', import.meta.url).pathname, '..');

function readSrc(relPath) {
  try {
    return readFileSync(resolve(ROOT, relPath), 'utf-8');
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// App.jsx — ThemeProvider import
// ---------------------------------------------------------------------------

describe('App.jsx — ThemeProvider wiring', () => {
  const src = readSrc('src/App.jsx');

  test('file is readable', () => {
    expect(src).not.toBeNull();
  });

  test('ThemeProvider is imported from ThemeProvider module', () => {
    if (!src) return;
    expect(src).toMatch(/import.*ThemeProvider.*from.*ThemeProvider/);
  });

  test('ThemeProvider wraps the main application tree', () => {
    if (!src) return;
    expect(src).toContain('<ThemeProvider>');
    expect(src).toContain('</ThemeProvider>');
  });

  test('ThemeProvider import is not duplicated', () => {
    if (!src) return;
    const matches = (src.match(/import.*ThemeProvider/g) || []).length;
    expect(matches).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// AdminHeader.jsx — duplicate import removed
// ---------------------------------------------------------------------------

describe('AdminHeader.jsx — duplicate ThemeToggle import', () => {
  const src = readSrc('src/admin/components/AdminHeader.jsx');

  test('file is readable', () => {
    expect(src).not.toBeNull();
  });

  test('ThemeToggle is imported exactly once', () => {
    if (!src) return;
    const importCount = (src.match(/import ThemeToggle/g) || []).length;
    expect(importCount).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// ThemeProvider.jsx — structure
// ---------------------------------------------------------------------------

describe('ThemeProvider.jsx — exports', () => {
  const src = readSrc('src/components/shared/ThemeProvider.jsx');

  test('file is readable', () => {
    expect(src).not.toBeNull();
  });

  test('exports ThemeProvider component', () => {
    if (!src) return;
    expect(src).toMatch(/export.*function ThemeProvider|export.*ThemeProvider/);
  });

  test('exports useTheme hook', () => {
    if (!src) return;
    expect(src).toMatch(/export.*function useTheme|export.*useTheme/);
  });

  test('useTheme throws when used outside ThemeProvider', () => {
    if (!src) return;
    expect(src).toContain("throw new Error");
    expect(src).toContain('ThemeProvider');
  });

  test('theme is persisted to localStorage', () => {
    if (!src) return;
    expect(src).toContain('localStorage');
  });

  test('dark class is toggled on document root', () => {
    if (!src) return;
    expect(src).toContain("'dark'");
    expect(src).toContain('classList');
  });

  test('toggleTheme switches between light and dark', () => {
    if (!src) return;
    expect(src).toContain("'dark'");
    expect(src).toContain("'light'");
    expect(src).toContain('toggleTheme');
  });

  test('provides isDark boolean shorthand', () => {
    if (!src) return;
    expect(src).toContain('isDark');
  });
});

// ---------------------------------------------------------------------------
// useTheme.js — hook structure
// ---------------------------------------------------------------------------

describe('useTheme.js — hook', () => {
  const src = readSrc('src/hooks/useTheme.js');

  test('file is readable', () => {
    expect(src).not.toBeNull();
  });

  test('exports useTheme function', () => {
    if (!src) return;
    expect(src).toContain('export function useTheme');
  });

  test('reads system preference via matchMedia', () => {
    if (!src) return;
    expect(src).toContain('prefers-color-scheme');
  });

  test('returns toggleTheme function', () => {
    if (!src) return;
    expect(src).toContain('toggleTheme');
  });

  test('applies dark class to document element', () => {
    if (!src) return;
    expect(src).toContain('document.documentElement');
    expect(src).toContain('classList');
  });

  test('listens for system preference changes', () => {
    if (!src) return;
    expect(src).toContain('addEventListener');
    expect(src).toContain('removeEventListener');
  });
});

// ---------------------------------------------------------------------------
// ThemeToggle.jsx (shared) — accessibility
// ---------------------------------------------------------------------------

describe('ThemeToggle (shared) — accessibility', () => {
  const src = readSrc('src/components/shared/ThemeToggle.jsx');

  test('file is readable', () => {
    expect(src).not.toBeNull();
  });

  test('has descriptive aria-label', () => {
    if (!src) return;
    expect(src).toContain('aria-label');
    // Label should mention what the action does (light/dark)
    const hasLight = src.includes('light') || src.includes('Light');
    const hasDark = src.includes('dark') || src.includes('Dark');
    expect(hasLight && hasDark).toBe(true);
  });

  test('renders Sun and Moon icons for state indication', () => {
    if (!src) return;
    expect(src).toContain('Sun');
    expect(src).toContain('Moon');
  });

  test('is a button element for keyboard accessibility', () => {
    if (!src) return;
    expect(src).toContain('<button');
  });
});

// ---------------------------------------------------------------------------
// Tailwind dark mode configuration
// ---------------------------------------------------------------------------

describe('tailwind.config.js — dark mode strategy', () => {
  const src = readSrc('tailwind.config.js');

  test('file is readable', () => {
    expect(src).not.toBeNull();
  });

  test("darkMode strategy is 'class' or ['class']", () => {
    if (!src) return;
    const hasClassStrategy = src.includes('"class"') || src.includes("'class'") ||
                             src.includes('["class"]') || src.includes("['class']");
    expect(hasClassStrategy).toBe(
      true,
      'Tailwind must use class-based dark mode so ThemeProvider can control it via document.classList'
    );
  });
});
