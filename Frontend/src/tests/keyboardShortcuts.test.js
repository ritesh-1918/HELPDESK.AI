import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import useKeyboardShortcuts, { SHORTCUTS } from '../hooks/useKeyboardShortcuts';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

describe('useKeyboardShortcuts', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const wrapper = ({ children }) => (
        <MemoryRouter>{children}</MemoryRouter>
    );

    it('exports SHORTCUTS array', () => {
        expect(Array.isArray(SHORTCUTS)).toBe(true);
        expect(SHORTCUTS.length).toBeGreaterThan(0);
    });

    it('each shortcut has keys, description, and action or path', () => {
        SHORTCUTS.forEach(s => {
            expect(s.keys).toBeDefined();
            expect(s.description).toBeDefined();
            expect(s.path || s.action).toBeTruthy();
        });
    });

    it('returns SHORTCUTS from hook', () => {
        const { result } = renderHook(() => useKeyboardShortcuts(), { wrapper });
        expect(result.current.SHORTCUTS).toEqual(SHORTCUTS);
    });

    it('navigation shortcuts use /admin paths', () => {
        const navShortcuts = SHORTCUTS.filter(s => s.path);
        navShortcuts.forEach(s => {
            expect(s.path).toMatch(/^\/admin/);
        });
    });

    it('g+d navigates to dashboard', () => {
        const shortcut = SHORTCUTS.find(s => s.keys[0] === 'g' && s.keys[1] === 'd');
        expect(shortcut?.path).toBe('/admin');
    });

    it('g+t navigates to tickets', () => {
        const shortcut = SHORTCUTS.find(s => s.keys[0] === 'g' && s.keys[1] === 't');
        expect(shortcut?.path).toBe('/admin/tickets');
    });

    it('ctrl+k is search action', () => {
        const shortcut = SHORTCUTS.find(s => s.keys[0] === 'ctrl' && s.keys[1] === 'k');
        expect(shortcut?.action).toBe('search');
    });

    it('Escape is close action', () => {
        const shortcut = SHORTCUTS.find(s => s.keys[0] === 'Escape');
        expect(shortcut?.action).toBe('close');
    });
});

describe('ShortcutsHelp', () => {
    it('SHORTCUTS has navigation and action categories', () => {
        const navShortcuts = SHORTCUTS.filter(s => s.keys.length === 2 && s.keys[0] === 'g');
        const actionShortcuts = SHORTCUTS.filter(s => s.keys.length !== 2 || s.keys[0] !== 'g');

        expect(navShortcuts.length).toBeGreaterThan(0);
        expect(actionShortcuts.length).toBeGreaterThan(0);
    });
});
