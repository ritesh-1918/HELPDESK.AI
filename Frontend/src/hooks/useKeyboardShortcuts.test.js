/**
 * Tests for useKeyboardShortcuts hook — Issue #1172 regressions
 *
 * Covers:
 * 1. SHORTCUTS_LEGEND is exported and has the correct shape
 * 2. useKeyboardShortcuts returns showHelp / setShowHelp
 * 3. Ctrl+/ toggles showHelp
 * 4. ? key toggles showHelp
 * 5. Escape closes the help modal when it is open
 * 6. G+key navigation shortcuts fire navigate()
 * 7. Shortcuts are suppressed when focus is inside an input
 * 8. isAdmin option is accepted without throwing
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';

// ── Mocks ──────────────────────────────────────────────────────────────────

const mockNavigate = vi.fn();
const mockLocation = { pathname: '/admin/dashboard' };

vi.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
    useLocation: () => mockLocation,
}));

// ── Import under test ──────────────────────────────────────────────────────

import {
    useKeyboardShortcuts,
    SHORTCUTS_LEGEND,
    formatShortcut,
    getShortcutDescription,
} from './useKeyboardShortcuts';

// ── Helpers ────────────────────────────────────────────────────────────────

/** Fire a synthetic keydown event on window */
function fireKey(key, modifiers = {}) {
    const event = new KeyboardEvent('keydown', {
        key,
        bubbles: true,
        cancelable: true,
        ctrlKey: modifiers.ctrl ?? false,
        metaKey: modifiers.meta ?? false,
        shiftKey: modifiers.shift ?? false,
        altKey: modifiers.alt ?? false,
    });
    window.dispatchEvent(event);
    return event;
}

/** Minimal React wrapper so hooks that use React context work */
const wrapper = ({ children }) => React.createElement(React.Fragment, null, children);

// ── Test suites ────────────────────────────────────────────────────────────

describe('SHORTCUTS_LEGEND export', () => {
    it('is exported as a non-empty array', () => {
        expect(Array.isArray(SHORTCUTS_LEGEND)).toBe(true);
        expect(SHORTCUTS_LEGEND.length).toBeGreaterThan(0);
    });

    it('every entry has a combo and description string', () => {
        for (const entry of SHORTCUTS_LEGEND) {
            expect(typeof entry.combo).toBe('string');
            expect(entry.combo.length).toBeGreaterThan(0);
            expect(typeof entry.description).toBe('string');
            expect(entry.description.length).toBeGreaterThan(0);
        }
    });

    it('includes the Ctrl+/ entry', () => {
        const found = SHORTCUTS_LEGEND.find(e => e.combo.includes('/'));
        expect(found).toBeDefined();
    });

    it('includes the ? entry', () => {
        const found = SHORTCUTS_LEGEND.find(e => e.combo === '?');
        expect(found).toBeDefined();
    });
});

describe('useKeyboardShortcuts — return value', () => {
    it('returns showHelp (boolean) and setShowHelp (function)', () => {
        const { result } = renderHook(() => useKeyboardShortcuts(), { wrapper });
        expect(typeof result.current.showHelp).toBe('boolean');
        expect(typeof result.current.setShowHelp).toBe('function');
    });

    it('showHelp starts as false', () => {
        const { result } = renderHook(() => useKeyboardShortcuts(), { wrapper });
        expect(result.current.showHelp).toBe(false);
    });

    it('returns shortcuts object', () => {
        const { result } = renderHook(() => useKeyboardShortcuts(), { wrapper });
        expect(typeof result.current.shortcuts).toBe('object');
    });

    it('accepts isAdmin option without throwing', () => {
        expect(() => {
            renderHook(() => useKeyboardShortcuts({}, { isAdmin: true }), { wrapper });
        }).not.toThrow();
    });

    it('returns shortcutsLegend array', () => {
        const { result } = renderHook(() => useKeyboardShortcuts({}, { isAdmin: true }), { wrapper });
        expect(Array.isArray(result.current.shortcutsLegend)).toBe(true);
    });

    it('admin legend includes admin-only shortcuts', () => {
        const { result } = renderHook(() => useKeyboardShortcuts({}, { isAdmin: true }), { wrapper });
        const combos = result.current.shortcutsLegend.map(s => s.combo);
        expect(combos).toContain('G → A');
    });

    it('non-admin legend excludes admin-only shortcuts', () => {
        const { result } = renderHook(() => useKeyboardShortcuts({}, { isAdmin: false }), { wrapper });
        const combos = result.current.shortcutsLegend.map(s => s.combo);
        expect(combos).not.toContain('G → A');
    });
});

describe('useKeyboardShortcuts — Ctrl+/ toggles showHelp', () => {
    it('opens the help modal on Ctrl+/', () => {
        const { result } = renderHook(() => useKeyboardShortcuts(), { wrapper });
        expect(result.current.showHelp).toBe(false);

        act(() => { fireKey('/', { ctrl: true }); });

        expect(result.current.showHelp).toBe(true);
    });

    it('closes the help modal on second Ctrl+/', () => {
        const { result } = renderHook(() => useKeyboardShortcuts(), { wrapper });

        act(() => { fireKey('/', { ctrl: true }); });
        expect(result.current.showHelp).toBe(true);

        act(() => { fireKey('/', { ctrl: true }); });
        expect(result.current.showHelp).toBe(false);
    });
});

describe('useKeyboardShortcuts — ? key toggles showHelp', () => {
    it('opens the help modal on ?', () => {
        const { result } = renderHook(() => useKeyboardShortcuts(), { wrapper });

        act(() => { fireKey('?'); });

        expect(result.current.showHelp).toBe(true);
    });

    it('closes the help modal on second ?', () => {
        const { result } = renderHook(() => useKeyboardShortcuts(), { wrapper });

        act(() => { fireKey('?'); });
        act(() => { fireKey('?'); });

        expect(result.current.showHelp).toBe(false);
    });
});

describe('useKeyboardShortcuts — Escape closes help modal', () => {
    it('closes the help modal when Escape is pressed while modal is open', () => {
        const { result } = renderHook(() => useKeyboardShortcuts(), { wrapper });

        act(() => { fireKey('?'); });
        expect(result.current.showHelp).toBe(true);

        act(() => { fireKey('Escape'); });
        expect(result.current.showHelp).toBe(false);
    });

    it('does not throw when Escape is pressed while modal is already closed', () => {
        const { result } = renderHook(() => useKeyboardShortcuts(), { wrapper });
        expect(result.current.showHelp).toBe(false);

        expect(() => {
            act(() => { fireKey('Escape'); });
        }).not.toThrow();
    });
});

describe('useKeyboardShortcuts — G+key navigation', () => {
    beforeEach(() => { mockNavigate.mockClear(); });

    it('navigates to /dashboard on G → D', () => {
        renderHook(() => useKeyboardShortcuts(), { wrapper });

        act(() => {
            fireKey('g');
            fireKey('d');
        });

        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });

    it('navigates to /admin/dashboard on G → A', () => {
        renderHook(() => useKeyboardShortcuts(), { wrapper });

        act(() => {
            fireKey('g');
            fireKey('a');
        });

        expect(mockNavigate).toHaveBeenCalledWith('/admin/dashboard');
    });

    it('does not navigate for unknown G+key combo', () => {
        renderHook(() => useKeyboardShortcuts(), { wrapper });

        act(() => {
            fireKey('g');
            fireKey('z');
        });

        expect(mockNavigate).not.toHaveBeenCalled();
    });
});

describe('useKeyboardShortcuts — input suppression', () => {
    it('does not toggle showHelp when ? is pressed inside an INPUT', () => {
        const { result } = renderHook(() => useKeyboardShortcuts(), { wrapper });

        // Simulate focus inside an input
        const input = document.createElement('input');
        document.body.appendChild(input);
        input.focus();

        act(() => {
            const event = new KeyboardEvent('keydown', {
                key: '?',
                bubbles: true,
                cancelable: true,
            });
            // Dispatch from the input element so event.target.tagName === 'INPUT'
            input.dispatchEvent(event);
        });

        expect(result.current.showHelp).toBe(false);
        document.body.removeChild(input);
    });
});

describe('formatShortcut', () => {
    it('returns a non-empty string for ctrl+k', () => {
        const result = formatShortcut('ctrl+k');
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(0);
    });
});

describe('getShortcutDescription', () => {
    it('returns description for known shortcuts', () => {
        expect(getShortcutDescription('g,d')).toBe('Go to Dashboard');
        expect(getShortcutDescription('ctrl+/')).toBe('Show Shortcuts');
        expect(getShortcutDescription('?')).toBe('Toggle Shortcuts Help');
    });

    it('returns the raw shortcut for unknown keys', () => {
        expect(getShortcutDescription('unknown')).toBe('unknown');
    });
});
