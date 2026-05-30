import { X } from 'lucide-react';

const GROUP_ORDER = ['Navigation', 'Actions'];
const GROUP_MAP = {
  'Go to Dashboard': 'Navigation',
  'Go to Tickets': 'Navigation',
  'Go to Users': 'Navigation',
  'Go to Analytics': 'Navigation',
  'Go to Settings': 'Navigation',
  'Go to Profile': 'Navigation',
  'Go to SLA Monitor': 'Navigation',
  'Create new ticket': 'Actions',
  'Toggle help overlay': 'Actions',
  'Close overlay / Go back': 'Actions',
};

export default function KeyboardShortcutsHelp({ shortcuts, onClose }) {
  const grouped = {};
  Object.entries(shortcuts).forEach(([keys, def]) => {
    const group = GROUP_MAP[def.label] || 'Other';
    if (!grouped[group]) grouped[group] = [];
    grouped[group].push({ keys, ...def });
  });

  const formatKeys = (keys) =>
    keys
      .split(' ')
      .map(k => k === 'escape' ? 'Esc' : k === '?' ? '?' : k.toUpperCase())
      .join(' then ');

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Keyboard Shortcuts</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {GROUP_ORDER.map(group => {
            const items = grouped[group];
            if (!items) return null;
            return (
              <div key={group}>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">{group}</h3>
                <div className="space-y-2">
                  {items.map(({ keys, label }) => (
                    <div key={keys} className="flex items-center justify-between py-1.5">
                      <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
                      <kbd className="px-2.5 py-1 text-xs font-mono font-bold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md border border-gray-200 dark:border-gray-600">
                        {formatKeys(keys)}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-2xl">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Press <kbd className="px-1.5 py-0.5 text-xs font-mono bg-gray-200 dark:bg-gray-700 rounded">?</kbd> anytime to toggle this overlay
          </p>
        </div>
      </div>
    </div>
  );
}
