/**
 * useKeyboardShortcuts Hook
 *
 * Provides keyboard shortcuts for rapid admin dashboard navigation
 * and a keyboard legend helper modal.
 *
 * Shortcuts:
 *   ?           — Toggle keyboard shortcuts legend
 *   g d         — Go to Dashboard
 *   g t         — Go to Tickets
 *   g u         — Go to Users
 *   g a         — Go to Analytics
 *   g s         — Go to Settings
 *   g p         — Go to Profile
 *   Esc         — Close modal / cancel action
 *   n           — Create new ticket (when not in input)
 *   r           — Refresh current view
 *   /           — Focus search input
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// Route map for navigation shortcuts
const ADMIN_ROUTES = {
  d: '/admin',
  t: '/admin/tickets',
  u: '/admin/users',
  a: '/admin/analytics',
  s: '/admin/settings',
  p: '/admin/profile',
};

/**
 * Check if the active element is an input field where shortcuts should not fire.
 */
function isInputFocused() {
  const el = document.activeElement;
  if (!el) return false;
  const tag = el.tagName.toLowerCase();
  return (
    tag === 'input' ||
    tag === 'textarea' ||
    tag === 'select' ||
    el.isContentEditable
  );
}

/**
 * useKeyboardShortcuts
 *
 * @param {Object} options
 * @param {boolean} options.enabled - Whether shortcuts are active (default: true)
 * @param {Function} options.onNewTicket - Callback for "new ticket" action
 * @param {Function} options.onRefresh - Callback for "refresh" action
 * @returns {{ showLegend: boolean, toggleLegend: Function, closeLegend: Function }}
 */
export function useKeyboardShortcuts({
  enabled = true,
  onNewTicket,
  onRefresh,
} = {}) {
  const [showLegend, setShowLegend] = useState(false);
  const navigate = useNavigate();
  const pendingKeyRef = useRef(null);
  const pendingTimerRef = useRef(null);

  const toggleLegend = useCallback(() => {
    setShowLegend((prev) => !prev);
  }, []);

  const closeLegend = useCallback(() => {
    setShowLegend(false);
  }, []);

  const focusSearch = useCallback(() => {
    const searchInput =
      document.querySelector('input[type="search"]') ||
      document.querySelector('input[placeholder*="search" i]') ||
      document.querySelector('input[placeholder*="Search" i]');
    if (searchInput) {
      searchInput.focus();
      searchInput.select();
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    function handleKeyDown(e) {
      // Always allow Escape
      if (e.key === 'Escape') {
        if (showLegend) {
          setShowLegend(false);
          e.preventDefault();
          return;
        }
        // Blur any focused element
        if (document.activeElement) {
          document.activeElement.blur();
        }
        return;
      }

      // Don't fire shortcuts when typing in inputs
      if (isInputFocused()) return;

      // Don't fire when modifier keys are held (except Shift for ?)
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      const key = e.key.toLowerCase();

      // Handle two-key sequences (g + ...)
      if (pendingKeyRef.current === 'g') {
        clearTimeout(pendingTimerRef.current);
        pendingKeyRef.current = null;

        if (ADMIN_ROUTES[key]) {
          e.preventDefault();
          navigate(ADMIN_ROUTES[key]);
          return;
        }
        // If not a valid second key, fall through
      }

      // Single-key shortcuts
      switch (key) {
        case '?':
          e.preventDefault();
          toggleLegend();
          break;

        case 'g':
          // Start two-key sequence
          pendingKeyRef.current = 'g';
          pendingTimerRef.current = setTimeout(() => {
            pendingKeyRef.current = null;
          }, 1000);
          break;

        case 'n':
          e.preventDefault();
          if (onNewTicket) onNewTicket();
          break;

        case 'r':
          e.preventDefault();
          if (onRefresh) onRefresh();
          else window.location.reload();
          break;

        case '/':
          e.preventDefault();
          focusSearch();
          break;

        default:
          break;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (pendingTimerRef.current) {
        clearTimeout(pendingTimerRef.current);
      }
    };
  }, [enabled, showLegend, navigate, toggleLegend, onNewTicket, onRefresh, focusSearch]);

  return {
    showLegend,
    toggleLegend,
    closeLegend,
  };
}

/**
 * Keyboard shortcut definitions for display in the legend modal.
 */
export const SHORTCUT_LIST = [
  { group: 'Navigation', shortcuts: [
    { keys: ['g', 'd'], description: 'Go to Dashboard' },
    { keys: ['g', 't'], description: 'Go to Tickets' },
    { keys: ['g', 'u'], description: 'Go to Users' },
    { keys: ['g', 'a'], description: 'Go to Analytics' },
    { keys: ['g', 's'], description: 'Go to Settings' },
    { keys: ['g', 'p'], description: 'Go to Profile' },
  ]},
  { group: 'Actions', shortcuts: [
    { keys: ['n'], description: 'Create new ticket' },
    { keys: ['r'], description: 'Refresh current view' },
    { keys: ['/'], description: 'Focus search' },
  ]},
  { group: 'General', shortcuts: [
    { keys: ['?'], description: 'Toggle this legend' },
    { keys: ['Esc'], description: 'Close modal / unfocus' },
  ]},
];

export default useKeyboardShortcuts;
