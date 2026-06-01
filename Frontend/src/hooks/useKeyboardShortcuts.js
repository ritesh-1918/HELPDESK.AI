/**
 * Keyboard Shortcuts Hook
 * Provides global keyboard shortcuts for rapid navigation.
 */

import { useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// Default shortcuts configuration
const DEFAULT_SHORTCUTS = {
    // Navigation shortcuts (G + key)
    'g,d': '/dashboard',
    'g,t': '/my-tickets',
    'g,n': '/create-ticket',
    'g,p': '/profile',
    'g,h': '/help',
    'g,a': '/admin/dashboard',
    'g,k': '/admin/tickets',
    'g,u': '/admin/users',
    'g,s': '/admin/settings',

    // Quick actions
    'ctrl+k': 'search',
    'ctrl+/': 'shortcuts-help',
    'escape': 'close-modal',
};

/**
 * Hook to register keyboard shortcuts
 * @param {Object} customShortcuts - Additional shortcuts to merge with defaults
 * @param {Object} options - Configuration options
 * @param {boolean} options.enabled - Whether shortcuts are enabled (default: true)
 * @param {Function} options.onSearch - Callback for search shortcut
 * @param {Function} options.onShortcutsHelp - Callback for shortcuts help
 */
export const useKeyboardShortcuts = (customShortcuts = {}, options = {}) => {
    const {
        enabled = true,
        onSearch = null,
        onShortcutsHelp = null,
    } = options;

    const navigate = useNavigate();
    const location = useLocation();
    const pendingKeyRef = useRef(null);
    const timeoutRef = useRef(null);

    // Merge default and custom shortcuts
    const shortcuts = { ...DEFAULT_SHORTCUTS, ...customShortcuts };

    const handleKeyDown = useCallback((event) => {
        if (!enabled) return;

        // Don't trigger shortcuts when typing in inputs
        const target = event.target;
        if (
            target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.tagName === 'SELECT' ||
            target.isContentEditable
        ) {
            return;
        }

        const key = event.key.toLowerCase();
        const ctrl = event.ctrlKey || event.metaKey;
        const shift = event.shiftKey;
        const alt = event.altKey;

        // Handle Escape key
        if (key === 'escape') {
            const action = shortcuts['escape'];
            if (action === 'close-modal') {
                // Close any open modals
                document.querySelectorAll('[data-modal]').forEach(modal => {
                    modal.click();
                });
            }
            pendingKeyRef.current = null;
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
            return;
        }

        // Handle Ctrl+K (search)
        if (ctrl && key === 'k') {
            event.preventDefault();
            if (onSearch) {
                onSearch();
            }
            return;
        }

        // Handle Ctrl+/ (shortcuts help)
        if (ctrl && key === '/') {
            event.preventDefault();
            if (onShortcutsHelp) {
                onShortcutsHelp();
            }
            return;
        }

        // Handle G + key combinations (vim-style navigation)
        if (pendingKeyRef.current === 'g') {
            const combo = `g,${key}`;
            const target = shortcuts[combo];

            if (target) {
                event.preventDefault();
                navigate(target);
            }

            pendingKeyRef.current = null;
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
            return;
        }

        // Set pending key for G combinations
        if (key === 'g' && !ctrl && !shift && !alt) {
            pendingKeyRef.current = 'g';
            timeoutRef.current = setTimeout(() => {
                pendingKeyRef.current = null;
            }, 1000); // 1 second timeout for key sequence
            return;
        }
    }, [enabled, shortcuts, navigate, location, onSearch, onShortcutsHelp]);

    useEffect(() => {
        if (!enabled) return;

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [enabled, handleKeyDown]);

    return {
        shortcuts,
        pendingKey: pendingKeyRef.current,
    };
};

/**
 * Get shortcut display string
 * @param {string} shortcut - Shortcut key combination
 * @returns {string} - Formatted string for display
 */
export const formatShortcut = (shortcut) => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

    return shortcut
        .split('+')
        .map(key => {
            switch (key.toLowerCase()) {
                case 'ctrl':
                    return isMac ? '⌘' : 'Ctrl';
                case 'shift':
                    return isMac ? '⇧' : 'Shift';
                case 'alt':
                    return isMac ? '⌥' : 'Alt';
                case 'g':
                    return 'G';
                default:
                    return key.toUpperCase();
            }
        })
        .join(isMac ? '' : '+');
};

/**
 * Get shortcut description
 * @param {string} shortcut - Shortcut key combination
 * @returns {string} - Human-readable description
 */
export const getShortcutDescription = (shortcut) => {
    const descriptions = {
        'g,d': 'Go to Dashboard',
        'g,t': 'Go to My Tickets',
        'g,n': 'Create New Ticket',
        'g,p': 'Go to Profile',
        'g,h': 'Go to Help',
        'g,a': 'Go to Admin Dashboard',
        'g,k': 'Go to Admin Tickets',
        'g,u': 'Go to Admin Users',
        'g,s': 'Go to Admin Settings',
        'ctrl+k': 'Open Search',
        'ctrl+/': 'Show Shortcuts',
        'escape': 'Close Modal',
    };

    return descriptions[shortcut] || shortcut;
};

export default useKeyboardShortcuts;
