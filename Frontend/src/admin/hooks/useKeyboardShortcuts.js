import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * useKeyboardShortcuts — Rapid Admin Dashboard Navigation
 * 
 * Shortcuts:
 *   Ctrl+1 → Dashboard
 *   Ctrl+2 → Tickets  
 *   Ctrl+3 → Users
 *   Ctrl+4 → Analytics
 *   Ctrl+5 → Profile
 *   Ctrl+6 → Settings
 *   Ctrl+/ or ? → Toggle shortcuts help
 * 
 * Works cross-platform (Cmd for Mac, Ctrl for Windows/Linux).
 */

const ROUTES = {
    '1': '/admin/dashboard',
    '2': '/admin/tickets',
    '3': '/admin/users',
    '4': '/admin/analytics',
    '5': '/admin/profile',
    '6': '/admin/settings',
};

const SHORTCUT_LABELS = {
    '1': 'Dashboard',
    '2': 'Tickets',
    '3': 'Users',
    '4': 'Analytics',
    '5': 'Profile',
    '6': 'Settings',
};

/**
 * Check if the active element is an editable field where shortcuts should NOT fire.
 * Covers: input, textarea, select, and contenteditable elements.
 */
const isEditableElement = (el) => {
    if (!el) return false;
    const tag = el.tagName?.toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return true;
    if (el.isContentEditable || el.getAttribute?.('contenteditable') === 'true') return true;
    return false;
};

const useKeyboardShortcuts = () => {
    const navigate = useNavigate();
    const [helpOpen, setHelpOpen] = useState(false);
    const helpOpenRef = useRef(helpOpen);
    const navigateRef = useRef(navigate);
    navigateRef.current = navigate;

    // Keep ref in sync so the stable event handler always reads the latest value
    useEffect(() => {
        helpOpenRef.current = helpOpen;
    }, [helpOpen]);

    const toggleHelp = useCallback(() => setHelpOpen(prev => !prev), []);
    const closeHelp = useCallback(() => setHelpOpen(false), []);

    const handler = useCallback((e) => {
        const mod = e.ctrlKey || e.metaKey;

        // Navigation: Ctrl/Cmd + 1-6
        if (mod && ROUTES[e.key]) {
            e.preventDefault();
            // Don't navigate if inside input/textarea/select/contenteditable
            if (isEditableElement(document.activeElement)) return;
            navigateRef.current(ROUTES[e.key]);
            return;
        }

        // Help: ? or Ctrl+/
        if (
            (!mod && e.key === '?') ||
            (mod && e.key === '/')
        ) {
            e.preventDefault();
            toggleHelp();
            return;
        }

        // Close help on Escape (read latest helpOpen from ref to avoid stale closure)
        if (e.key === 'Escape' && helpOpenRef.current) {
            closeHelp();
        }
    }, [toggleHelp, closeHelp]);

    useEffect(() => {
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [handler]);

    return { helpOpen, closeHelp, toggleHelp, shortcuts: SHORTCUT_LABELS };
}

export default useKeyboardShortcuts;
