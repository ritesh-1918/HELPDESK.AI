const USER_NAVIGATION_SHORTCUTS = {
  'g,d': '/user/dashboard',
  'g,t': '/user/my-tickets',
  'g,n': '/user/create-ticket',
  'g,p': '/user/profile',
  'g,h': '/user/help',
};

const ADMIN_NAVIGATION_SHORTCUTS = {
  'g,d': '/admin/dashboard',
  'g,t': '/admin/tickets',
  'g,u': '/admin/users',
  'g,s': '/admin/settings',
  'g,p': '/admin/profile',
  'g,a': '/admin/analytics',
};

const QUICK_ACTION_SHORTCUTS = {
  'ctrl+f': 'search',
  'ctrl+k': 'search',
  'ctrl+/': 'shortcuts-help',
  '?': 'shortcuts-help',
  escape: 'close-modal',
};

export const SHORTCUTS_LEGEND = [
  { combo: 'G + D', description: 'Go to Dashboard' },
  { combo: 'G + T', description: 'Go to Tickets' },
  { combo: 'Ctrl + F', description: 'Focus Search' },
  { combo: 'Ctrl + /', description: 'Show Keyboard Shortcuts' },
];

export const SHORTCUT_GROUPS = [
  {
    group: 'Navigation',
    shortcuts: [
      { keys: ['G', 'D'], description: 'Go to Dashboard' },
      { keys: ['G', 'T'], description: 'Go to Tickets' },
      { keys: ['G', 'U'], description: 'Go to Users (admin)' },
      { keys: ['G', 'S'], description: 'Go to Settings' },
      { keys: ['G', 'P'], description: 'Go to Profile' },
      { keys: ['G', 'A'], description: 'Go to Analytics (admin)' },
    ],
  },
  {
    group: 'Quick actions',
    shortcuts: [
      { keys: ['Ctrl', 'F'], description: 'Focus search' },
      { keys: ['Ctrl', 'K'], description: 'Focus search' },
      { keys: ['Ctrl', '/'], description: 'Show keyboard shortcuts' },
      { keys: ['?'], description: 'Show keyboard shortcuts' },
      { keys: ['Esc'], description: 'Close modal' },
    ],
  },
];

export const SHORTCUT_LIST = SHORTCUT_GROUPS;

export const normalizeRole = (role) => {
  if (role === 'admin' || role === true || role?.isAdmin) return 'admin';
  return 'user';
};

export const createRoleAwareShortcuts = (role = 'user') => ({
  ...(normalizeRole(role) === 'admin' ? ADMIN_NAVIGATION_SHORTCUTS : USER_NAVIGATION_SHORTCUTS),
  ...QUICK_ACTION_SHORTCUTS,
});

export const normalizeShortcutKey = (key = '') => {
  const normalized = String(key).toLowerCase();
  if (normalized === 'esc') return 'escape';
  return normalized;
};

export const getShortcutAction = (shortcuts, keys) => {
  const combo = keys.map(normalizeShortcutKey).join('+').replace('g+', 'g,');
  return shortcuts[combo] || null;
};

export const isShortcutTypingTarget = (target) => {
  if (!target) return false;

  const tagName = target.tagName?.toUpperCase();
  return (
    tagName === 'INPUT' ||
    tagName === 'TEXTAREA' ||
    tagName === 'SELECT' ||
    target.isContentEditable === true
  );
};

export const getShortcutDescription = (shortcut) => {
  const normalizedShortcut = String(shortcut).toLowerCase();
  const match = SHORTCUT_GROUPS
    .flatMap((group) => group.shortcuts)
    .find(
      (entry) =>
        entry.keys
          .map(normalizeShortcutKey)
          .join('+')
          .replace('g+', 'g,') === normalizedShortcut
    );

  return match?.description || shortcut;
};
