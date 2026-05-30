/**
 * useKeyboardShortcuts — Custom hook for rapid admin dashboard navigation.
 *
 * Supported shortcuts:
 *   G + D  →  Dashboard
 *   G + T  →  Tickets
 *   G + A  →  Analytics
 *   G + U  →  Users / Team
 *   G + P  →  Profile / Settings
 *   G + S  →  SLA Dashboard
 *   Ctrl + /  →  Toggle shortcuts help modal
 *   Escape  →  Close help modal / go back
 */

import { useEffect, useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const NAV_SHORTCUTS = [
    { keys: ['g', 'd'], path: '/admin', label: 'Dashboard' },
    { keys: ['g', 't'], path: '/admin/tickets', label: 'Tickets' },
    { keys: ['g', 'a'], path: '/admin/analytics', label: 'Analytics' },
    { keys: ['g', 'u'], path: '/admin/users', label: 'Users' },
    { keys: ['g', 'p'], path: '/admin/profile', label: 'Profile' },
    { keys: ['g', 's'], path: '/admin/sla', label: 'SLA Dashboard' },
];

export function useKeyboardShortcuts({
    enabled = true,
    onToggleHelp,
} = {}) {
    const navigate = useNavigate();
    const buffer = useRef([]);
    const bufferTimeout = useRef(null);

    const handleKeyDown = useCallback((e) => {
        if (!enabled) return;

        // Don't trigger shortcuts when typing in input fields
        const tag = e.target.tagName;
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag) || e.target.isContentEditable) {
            return;
        }

        // Ctrl+/ to toggle help modal
        if (e.key === '/' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            onToggleHelp?.();
            return;
        }

        // Escape to close help
        if (e.key === 'Escape') {
            onToggleHelp?.(false);
            return;
        }

        // Two-key sequence navigation
        if (e.key.length === 1) {
            const key = e.key.toLowerCase();
            buffer.current.push(key);

            // Check for matching sequences
            for (const shortcut of NAV_SHORTCUTS) {
                const seq = shortcut.keys;
                if (buffer.current.length >= seq.length) {
                    const last = buffer.current.slice(-seq.length).join('');
                    if (last === seq.join('')) {
                        e.preventDefault();
                        navigate(shortcut.path);
                        buffer.current = [];
                        clearTimeout(bufferTimeout.current);
                        return;
                    }
                }
            }

            // Clear buffer after 2 seconds of inactivity
            clearTimeout(bufferTimeout.current);
            bufferTimeout.current = setTimeout(() => {
                buffer.current = [];
            }, 2000);
        }
    }, [enabled, navigate, onToggleHelp]);

    useEffect(() => {
        if (!enabled) return;
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            clearTimeout(bufferTimeout.current);
        };
    }, [enabled, handleKeyDown]);

    return {
        shortcuts: NAV_SHORTCUTS,
    };
}
