import React from 'react';
import { X, Keyboard } from 'lucide-react';

const SHORTCUTS = [
    { keys: ['G', 'D'], label: 'Go to Dashboard' },
    { keys: ['G', 'T'], label: 'Go to Tickets' },
    { keys: ['G', 'U'], label: 'Go to Users' },
    { keys: ['G', 'A'], label: 'Go to Analytics' },
    { keys: ['G', 'S'], label: 'Go to Settings' },
    { keys: ['G', 'P'], label: 'Go to Profile' },
    { keys: ['G', 'L'], label: 'Go to SLA Monitor' },
    { keys: ['?'], label: 'Toggle this shortcuts menu' },
];

const Kbd = ({ children }) => (
    <kbd className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-md border border-gray-300 bg-gray-100 text-xs font-bold text-gray-700 shadow-sm font-mono">
        {children}
    </kbd>
);

const KeyboardShortcutsHelp = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md mx-4 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <Keyboard className="w-5 h-5 text-emerald-600" />
                        <h2 className="text-lg font-bold text-gray-900">Keyboard Shortcuts</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label="Close shortcuts"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Shortcuts List */}
                <div className="px-6 py-4 space-y-3">
                    {SHORTCUTS.map((shortcut, index) => (
                        <div key={index} className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">{shortcut.label}</span>
                            <div className="flex items-center gap-1.5">
                                {shortcut.keys.map((key, ki) => (
                                    <React.Fragment key={ki}>
                                        {ki > 0 && <span className="text-xs text-gray-400 mx-0.5">then</span>}
                                        <Kbd>{key}</Kbd>
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                        Press <Kbd>?</Kbd> to toggle this menu at any time.
                        Shortcuts work on admin pages only.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default KeyboardShortcutsHelp;
