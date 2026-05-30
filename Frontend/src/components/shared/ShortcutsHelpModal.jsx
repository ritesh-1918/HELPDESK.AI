import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Keyboard } from 'lucide-react';

const DEFAULT_SHORTCUTS = [
    { keys: ['G', 'D'], description: 'Go to Dashboard' },
    { keys: ['G', 'T'], description: 'Go to Tickets' },
    { keys: ['G', 'A'], description: 'Go to Analytics' },
    { keys: ['G', 'U'], description: 'Go to Users' },
    { keys: ['G', 'P'], description: 'Go to Profile' },
    { keys: ['G', 'S'], description: 'Go to SLA Dashboard' },
    { separator: true },
    { keys: ['Ctrl', '/'], description: 'Toggle this help' },
    { keys: ['Esc'], description: 'Close this help' },
];

const ShortcutsHelpModal = ({ isOpen, onClose, shortcuts, title }) => {
    const items = shortcuts || DEFAULT_SHORTCUTS;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 z-40"
                        onClick={() => onClose()}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[420px] z-50 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-slate-700">
                            <div className="flex items-center gap-2">
                                <Keyboard className="w-4 h-4 text-emerald-500" />
                                <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                                    {title || 'Keyboard Shortcuts'}
                                </h2>
                            </div>
                            <button
                                onClick={() => onClose()}
                                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                                aria-label="Close shortcuts"
                            >
                                <X className="w-4 h-4 text-gray-400" />
                            </button>
                        </div>

                        {/* Shortcuts List */}
                        <div className="px-5 py-4 max-h-[60vh] overflow-y-auto">
                            {items.map((item, idx) => {
                                if (item.separator) {
                                    return <hr key={`sep-${idx}`} className="my-3 border-gray-100 dark:border-slate-700" />;
                                }

                                const keys = item.keys || [];
                                return (
                                    <div
                                        key={idx}
                                        className="flex items-center justify-between py-2"
                                    >
                                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                            {item.description}
                                        </span>
                                        <div className="flex items-center gap-1">
                                            {keys.map((k, ki) => (
                                                <React.Fragment key={ki}>
                                                    {ki > 0 && (
                                                        <span className="text-xs text-gray-300 dark:text-gray-600 mx-0.5">+</span>
                                                    )}
                                                    <kbd className="inline-flex items-center justify-center min-w-[24px] h-[22px] px-1.5 text-[11px] font-bold text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-md shadow-sm">
                                                        {k}
                                                    </kbd>
                                                </React.Fragment>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Footer */}
                        <div className="px-5 py-3 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-100 dark:border-slate-700">
                            <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center">
                                Press <kbd className="inline-flex items-center justify-center px-1 h-[18px] text-[10px] font-bold text-gray-500 bg-gray-100 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded">Ctrl</kbd> + <kbd className="inline-flex items-center justify-center px-1 h-[18px] text-[10px] font-bold text-gray-500 bg-gray-100 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded">/</kbd> anytime to toggle
                            </p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ShortcutsHelpModal;
