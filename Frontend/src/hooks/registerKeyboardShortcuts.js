/**
 * registerKeyboardShortcuts Hook
 * Provides interactive keyboard shortcuts for rapid admin dashboard navigation.
 * Includes keyboard legend helper modal support.
 */

import { useEffect, useCallback, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// Default shortcuts configuration for admin dashboard
const DEFAULT_ADMIN_SHORTCUTS = {
    // Navigation shortcuts (G + key) - Vim-style
    'g,d': { action: 'navigate', target: '/admin/dashboard', label: 'Go to Dashboard' },
    'g,t': { action: 'navigate', target: '/admin/tickets', label: 'Go to Tickets' },
    'g,u': { action: 'navigate', target: '/admin/users', label: 'Go to Users' },
    'g,s': { action: 'navigate', target: '/admin/settings', label: 'Go to Settings' },
    'g,a': { action: 'navigate', target: '/admin/analytics', label: 'Go to Analytics' },
    'g,r': { action: 'navigate', target: '/admin/reports', label: 'Go to Reports' },
    
    // Quick navigation (number keys)
    '1': { action: 'navigate', target: '/admin/dashboard', label: 'Dashboard' },
    '2': { action: 'navigate', target: '/admin/tickets', label: 'Tickets' },
    '3': { action: 'navigate', target: '/admin/users', label: 'Users' },
    '4': { action: 'navigate', target: '/admin/settings', label: 'Settings' },
    
    // Quick actions
    'ctrl+k': { action: 'search', label: 'Open Search' },
    'ctrl+/': { action: 'show-help', label: 'Show Keyboard Shortcuts' },
    'escape': { action: 'close-modal', label: 'Close Modal/Dialog' },
    '?': { action: 'show-help', label: 'Show Keyboard Shortcuts' },
    
    // Ticket actions (when on ticket pages)
    'n': { action: 'new-ticket', label: 'Create New Ticket' },
    'r': { action: 'refresh', label: 'Refresh Current Page' },
    'f': { action: 'filter', label: 'Open Filters' },
};

/**
 * Hook to register keyboard shortcuts for admin dashboard
 * @param {Object} options - Configuration options
 * @param {boolean} options.enabled - Whether shortcuts are enabled (default: true)
 * @param {Object} options.customShortcuts - Additional shortcuts to merge with defaults
 * @param {Function} options.onSearch - Callback for search shortcut
 * @param {Function} options.onNewTicket - Callback for new ticket shortcut
 * @param {Function} options.onRefresh - Callback for refresh shortcut
 * @param {Function} options.onFilter - Callback for filter shortcut
 * @param {Function} options.onShowHelp - Callback to show help modal
 * @param {Function} options.onCloseModal - Callback to close modal
 * @returns {Object} - shortcuts list, showHelp state, and toggleHelp function
 */
export const registerKeyboardShortcuts = (options = {}) => {
    const {
        enabled = true,
        customShortcuts = {},
        onSearch = null,
        onNewTicket = null,
        onRefresh = null,
        onFilter = null,
        onShowHelp = null,
        onCloseModal = null,
    } = options;

    const navigate = useNavigate();
    const location = useLocation();
    const pendingKeyRef = useRef(null);
    const timeoutRef = useRef(null);
    const [showHelp, setShowHelp] = useState(false);

    // Merge default and custom shortcuts
    const shortcuts = { ...DEFAULT_ADMIN_SHORTCUTS, ...customShortcuts };

    // Toggle help modal
    const toggleHelp = useCallback(() => {
        setShowHelp(prev => !prev);
    }, []);

    // Close help modal
    const closeHelp = useCallback(() => {
        setShowHelp(false);
    }, []);

    const handleKeyDown = useCallback((event) => {
        if (!enabled) return;

        // Don't trigger shortcuts when typing in inputs
        const target = event.target;
        const isInputElement = 
            target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.tagName === 'SELECT' ||
            target.isContentEditable;

        const key = event.key.toLowerCase();
        const ctrl = event.ctrlKey || event.metaKey;
        const shift = event.shiftKey;
        const alt = event.altKey;

        // Handle Escape key - always works, even in inputs
        if (key === 'escape') {
            event.preventDefault();
            if (showHelp) {
                setShowHelp(false);
            } else if (onCloseModal) {
                onCloseModal();
            } else {
                // Default: close any open modals
                document.querySelectorAll('[data-modal-open="true"]').forEach(modal => {
                    modal.setAttribute('data-modal-open', 'false');
                });
                // Dispatch custom event for modal components
                window.dispatchEvent(new CustomEvent('close-modal'));
            }
            pendingKeyRef.current = null;
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
            return;
        }

        // Skip other shortcuts if in input field
        if (isInputElement) return;

        // Handle Ctrl+K (search)
        if (ctrl && key === 'k') {
            event.preventDefault();
            if (onSearch) {
                onSearch();
            }
            return;
        }

        // Handle Ctrl+/ or ? (show help)
        if ((ctrl && key === '/') || (key === '?' && !ctrl)) {
            event.preventDefault();
            if (onShowHelp) {
                onShowHelp();
            } else {
                toggleHelp();
            }
            return;
        }

        // Handle G + key combinations (vim-style navigation)
        if (pendingKeyRef.current === 'g') {
            const combo = `g,${key}`;
            const shortcut = shortcuts[combo];

            if (shortcut && shortcut.action === 'navigate') {
                event.preventDefault();
                navigate(shortcut.target);
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
            // Visual feedback could be added here
            timeoutRef.current = setTimeout(() => {
                pendingKeyRef.current = null;
            }, 1000); // 1 second timeout for key sequence
            return;
        }

        // Handle single key shortcuts (numbers for quick nav)
        if (/^[1-9]$/.test(key) && !ctrl && !shift && !alt) {
            const shortcut = shortcuts[key];
            if (shortcut && shortcut.action === 'navigate') {
                event.preventDefault();
                navigate(shortcut.target);
            }
            return;
        }

        // Handle action shortcuts
        const shortcut = shortcuts[key];
        if (shortcut && !ctrl && !shift && !alt) {
            switch (shortcut.action) {
                case 'new-ticket':
                    event.preventDefault();
                    if (onNewTicket) {
                        onNewTicket();
                    } else {
                        navigate('/create-ticket');
                    }
                    break;
                case 'refresh':
                    event.preventDefault();
                    if (onRefresh) {
                        onRefresh();
                    } else {
                        window.location.reload();
                    }
                    break;
                case 'filter':
                    event.preventDefault();
                    if (onFilter) {
                        onFilter();
                    }
                    break;
                case 'show-help':
                    event.preventDefault();
                    if (onShowHelp) {
                        onShowHelp();
                    } else {
                        toggleHelp();
                    }
                    break;
            }
        }
    }, [enabled, shortcuts, navigate, location, showHelp, toggleHelp, onSearch, onNewTicket, onRefresh, onFilter, onShowHelp, onCloseModal]);

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
        showHelp,
        toggleHelp,
        closeHelp,
        pendingKey: pendingKeyRef.current,
    };
};

/**
 * Get formatted shortcut display string
 * @param {string} shortcut - Shortcut key combination
 * @returns {string} - Formatted string for display
 */
export const formatShortcut = (shortcut) => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

    return shortcut
        .split(',')
        .map(part => {
            return part
                .split('+')
                .map(key => {
                    switch (key.toLowerCase().trim()) {
                        case 'ctrl':
                            return isMac ? '鈱? : 'Ctrl';
                        case 'shift':
                            return isMac ? '鈬? : 'Shift';
                        case 'alt':
                            return isMac ? '鈱? : 'Alt';
                        case 'g':
                            return 'G';
                        default:
                            return key.toUpperCase();
                    }
                })
                .join(isMac ? '' : '+');
        })
        .join(' then ');
};

/**
 * Get all shortcuts as array for display
 * @param {Object} shortcuts - Shortcuts object
 * @returns {Array} - Array of {key, label, action} objects
 */
export const getShortcutsList = (shortcuts = DEFAULT_ADMIN_SHORTCUTS) => {
    return Object.entries(shortcuts).map(([key, config]) => ({
        key: formatShortcut(key),
        rawKey: key,
        label: config.label,
        action: config.action,
        target: config.target,
    }));
};

export default registerKeyboardShortcuts;
