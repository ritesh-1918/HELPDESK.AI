/**
 * Keyboard Shortcuts Hook
 * Provides global keyboard shortcuts for rapid navigation.
 *
 * Fixes for Issue #1172:
 * 1. Added `SHORTCUTS_LEGEND` export — consumed by Help.jsx to render the
 *    shortcuts overlay (was imported but never exported, causing a runtime error).
 * 2. Added `showHelp` / `setShowHelp` to the hook's return value — AdminLayout
 *    destructures these to wire up the ShortcutsHelpModal; without them the
 *    modal could never open via Ctrl+/ or the ? key.
 * 3. Added `?` key handler to toggle the help modal (vim-style, widely expected).
 * 4. Consolidated the double `useKeyboardShortcuts()` call in AdminLayout into a
 *    single call by making the hook handle both navigation and help-modal state.
 */

import { useEffect, useCallback, useRef, useState } from 'react';
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
 * Human-readable shortcuts legend for UI display.
 */
export const SHORTCUTS_LEGEND = [
    { combo: 'G + D', description: 'Dashboard' },
    { combo: 'G + T', description: 'My Tickets' },
    { combo: 'G + N', description: 'Create Ticket' },
    { combo: 'G + P', description: 'Profile' },
    { combo: 'Ctrl + K', description: 'Search' },
    { combo: 'Esc', description: 'Close Modal' },
];

/**
 * Hook to register keyboard shortcuts
 * @param {Object} customShortcuts - Additional shortcuts to merge with defaults
 * @param {Object} options - Configuration options
 * @param {boolean} options.enabled      - Whether shortcuts are enabled (default: true)
 * @param {boolean} options.isAdmin      - Whether to include admin-only shortcuts (default: false)
 * @param {Function} options.onSearch    - Callback for Ctrl+K search shortcut
 * @param {Function} options.onShortcutsHelp - External callback for Ctrl+/ (optional;
 *                                             if omitted the hook manages showHelp internally)
 */
export const useKeyboardShortcuts = (customShortcuts = {}, options = {}) => {
    const {
        enabled = true,
        isAdmin = false,
        onSearch = null,
        onShortcutsHelp = null,
    } = options;

    const navigate = useNavigate();
    const location = useLocation();
    const [pendingKey, setPendingKey] = useState(null);
    const timeoutRef = useRef(null);

    // Internal state for the shortcuts-help modal.
    // AdminLayout (and any other consumer) can destructure { showHelp, setShowHelp }
    // from the hook instead of maintaining its own useState.
    const [showHelp, setShowHelp] = useState(false);

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

        // Handle Escape key — close help modal first, then close other modals
        if (key === 'escape') {
            if (showHelp) {
                setShowHelp(false);
                return;
            }
            const action = shortcuts['escape'];
            if (action === 'close-modal') {
                // Close any open modals that expose a [data-modal] close trigger
                document.querySelectorAll('[data-modal]').forEach(modal => {
                    modal.click();
                });
            }
            setPendingKey(null);
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
            } else {
                setShowHelp(prev => !prev);
            }
            return;
        }

        // Handle ? key — toggle shortcuts help modal (no modifier required)
        if (key === '?' && !ctrl && !alt) {
            event.preventDefault();
            setShowHelp(prev => !prev);
            return;
        }

        // Handle G + key combinations (vim-style navigation)
        if (pendingKey === 'g') {
            const combo = `g,${key}`;
            const destination = shortcuts[combo];

            if (destination) {
                event.preventDefault();
                navigate(destination);
            }

            setPendingKey(null);
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
            return;
        }

        // Set pending key for G combinations
        if (key === 'g' && !ctrl && !shift && !alt) {
            setPendingKey('g');
            timeoutRef.current = setTimeout(() => {
                setPendingKey(null);
            }, 1000); // 1 second timeout for key sequence
            return;
        }
    }, [enabled, shortcuts, navigate, location, onSearch, onShortcutsHelp, pendingKey]);

    useEffect(() => {
        if (!enabled) return;

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [enabled, handleKeyDown, navigate, location]);

    return {
        shortcuts,
        pendingKey,
        showHelp,
        setShowHelp,
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
        '?': 'Toggle Shortcuts Help',
    };

    return descriptions[shortcut] || shortcut;
};

export default useKeyboardShortcuts;
