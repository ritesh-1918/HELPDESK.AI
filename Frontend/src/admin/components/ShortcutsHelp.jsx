import React from 'react';
import { Keyboard, X } from 'lucide-react';
import { SHORTCUTS } from '../../hooks/useKeyboardShortcuts';

/**
 * Keyboard shortcuts help overlay.
 * Shows all available shortcuts in a clean, organized layout.
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal is visible
 * @param {Function} props.onClose - Callback to close the modal
 */
const ShortcutsHelp = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const navShortcuts = SHORTCUTS.filter(s => s.keys.length === 2 && s.keys[0] === 'g');
    const actionShortcuts = SHORTCUTS.filter(s => s.keys.length !== 2 || s.keys[0] !== 'g');

    const formatKeys = (keys) => {
        return keys.map((k, i) => (
            <React.Fragment key={i}>
                {i > 0 && keys.length > 2 && <span className="mx-0.5 text-gray-400">+</span>}
                <kbd className="px-1.5 py-0.5 text-xs font-mono bg-gray-700 border border-gray-600 rounded">
                    {k === 'ctrl' ? '⌘' : k === 'Escape' ? 'Esc' : k.toUpperCase()}
                </kbd>
                {i < keys.length - 1 && keys.length === 2 && keys[0] === 'g' && (
                    <span className="mx-1 text-gray-400">then</span>
                )}
            </React.Fragment>
        ));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 w-full max-w-md mx-4">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-700">
                    <div className="flex items-center gap-2">
                        <Keyboard className="w-5 h-5 text-emerald-400" />
                        <h2 className="text-lg font-semibold text-white">Keyboard Shortcuts</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="px-5 py-4 space-y-5 max-h-[60vh] overflow-y-auto">
                    {/* Navigation */}
                    <div>
                        <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
                            Navigation
                        </h3>
                        <div className="space-y-2">
                            {navShortcuts.map((shortcut, i) => (
                                <div key={i} className="flex items-center justify-between py-1">
                                    <span className="text-sm text-gray-300">{shortcut.description}</span>
                                    <div className="flex items-center">
                                        {formatKeys(shortcut.keys)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div>
                        <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
                            Actions
                        </h3>
                        <div className="space-y-2">
                            {actionShortcuts.map((shortcut, i) => (
                                <div key={i} className="flex items-center justify-between py-1">
                                    <span className="text-sm text-gray-300">{shortcut.description}</span>
                                    <div className="flex items-center">
                                        {formatKeys(shortcut.keys)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-5 py-3 border-t border-gray-700 text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Press <kbd className="px-1 py-0.5 text-xs font-mono bg-gray-700 border border-gray-600 rounded">Esc</kbd> to close
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ShortcutsHelp;
