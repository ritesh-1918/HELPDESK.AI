import { useState, useEffect, useCallback } from 'react';

export const DEFAULT_SHORTCUTS = {
  'g d': { label: 'Go to Dashboard', action: 'navigate', path: '/admin/dashboard' },
  'g t': { label: 'Go to Tickets', action: 'navigate', path: '/admin/tickets' },
  'g u': { label: 'Go to Users', action: 'navigate', path: '/admin/users' },
  'g a': { label: 'Go to Analytics', action: 'navigate', path: '/admin/analytics' },
  'g s': { label: 'Go to Settings', action: 'navigate', path: '/admin/settings' },
  'g p': { label: 'Go to Profile', action: 'navigate', path: '/admin/profile' },
  'g l': { label: 'Go to SLA Monitor', action: 'navigate', path: '/admin/sla' },
  '?': { label: 'Toggle help overlay', action: 'toggleHelp' },
  'n': { label: 'Create new ticket', action: 'navigate', path: '/create-ticket' },
  'escape': { label: 'Close overlay / Go back', action: 'escape' },
};

export function useKeyboardShortcuts(customShortcuts = {}) {
  const shortcuts = { ...DEFAULT_SHORTCUTS, ...customShortcuts };
  const [showHelp, setShowHelp] = useState(false);
  const [pressedKeys, setPressedKeys] = useState([]);

  const executeAction = useCallback((shortcut) => {
    if (shortcut.action === 'toggleHelp') {
      setShowHelp(prev => !prev);
    }
    if (shortcut.action === 'navigate' && shortcut.path) {
      window.__keyboardNavigate?.(shortcut.path);
    }
    if (shortcut.action === 'escape') {
      setShowHelp(false);
    }
  }, []);

  useEffect(() => {
    let timeout;
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT' || e.target.isContentEditable) {
        if (e.key === 'Escape') {
          e.target.blur();
        }
        return;
      }

      if (e.key === '?') {
        e.preventDefault();
        executeAction({ action: 'toggleHelp' });
        return;
      }

      if (e.key === 'Escape') {
        executeAction({ action: 'escape' });
        return;
      }

      const key = e.key.toLowerCase();
      setPressedKeys(prev => {
        const next = [...prev, key].slice(-3);
        clearTimeout(timeout);
        timeout = setTimeout(() => setPressedKeys([]), 1000);

        const chord = next.join(' ');
        const match = shortcuts[chord];
        if (match) {
          e.preventDefault();
          setPressedKeys([]);
          executeAction(match);
        }
        return next;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timeout);
    };
  }, [shortcuts, executeAction]);

  return { showHelp, setShowHelp, shortcuts };
}

export default useKeyboardShortcuts;
