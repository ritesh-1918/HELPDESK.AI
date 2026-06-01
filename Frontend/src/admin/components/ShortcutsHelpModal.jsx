import React, { useEffect } from 'react';
import { X, Keyboard } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';

const shortcuts = [
    { keys: 'G + D', label: 'Go to Dashboard' },
    { keys: 'G + T', label: 'Go to Tickets' },
    { keys: 'G + S', label: 'Go to Settings' },
    { keys: 'G + P', label: 'Go to Profile' },
    { keys: 'G + H', label: 'Go to Help' },
    { keys: 'G + U', label: 'Go to Users (admin)' },
    { keys: 'G + A', label: 'Go to Analytics (admin)' },
    { keys: 'Ctrl + F', label: 'Focus search bar' },
    { keys: '?', label: 'Toggle this help' },
    { keys: 'Esc', label: 'Close this help' },
];

const ShortcutsHelpModal = ({ isOpen, onClose, isAdmin = false }) => {
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const visibleShortcuts = shortcuts.filter((s) => {
        if (!isAdmin && (s.label.includes('(admin)'))) return false;
        return true;
    });

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-lg mx-4 animate-in fade-in zoom-in-95 duration-200">
                <Card className="shadow-2xl border border-gray-200">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100 pb-4">
                        <div className="flex items-center gap-2">
                            <Keyboard className="w-5 h-5 text-emerald-600" />
                            <CardTitle className="text-lg font-bold text-gray-900">Keyboard Shortcuts</CardTitle>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                            aria-label="Close shortcuts help"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </CardHeader>

                    <CardContent className="pt-4 pb-2">
                        <div className="space-y-1.5">
                            {visibleShortcuts.map((shortcut) => (
                                <div
                                    key={shortcut.keys}
                                    className="flex items-center justify-between py-2 px-1 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <span className="text-sm text-gray-700">{shortcut.label}</span>
                                    <kbd className="inline-flex items-center gap-0.5 px-2 py-1 text-xs font-mono font-medium text-gray-600 bg-gray-100 border border-gray-200 rounded-md">
                                        {shortcut.keys.split(' + ').map((part, i) => (
                                            <React.Fragment key={i}>
                                                {i > 0 && <span className="text-gray-400 mx-0.5">+</span>}
                                                <span className="px-1 py-0.5 bg-white rounded border border-gray-200 shadow-sm">
                                                    {part}
                                                </span>
                                            </React.Fragment>
                                        ))}
                                    </kbd>
                                </div>
                            ))}
                        </div>

                        <p className="text-xs text-gray-400 mt-4 pb-1 text-center">
                            Press <kbd className="px-1 py-0.5 text-[10px] font-mono bg-gray-100 border border-gray-200 rounded">?</kbd> anytime to toggle this help
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ShortcutsHelpModal;
