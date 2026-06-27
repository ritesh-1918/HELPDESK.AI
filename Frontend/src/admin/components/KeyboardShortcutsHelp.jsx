/**
 * KeyboardShortcutsHelp Component
 * Modal component displaying keyboard shortcuts legend for admin dashboard.
 */

import React from 'react';
import { X, Keyboard, Navigation, Search, Settings, FileText, Users, BarChart3, RefreshCw, Filter, Plus } from 'lucide-react';

// Icons mapping
const iconMap = {
    dashboard: Navigation,
    tickets: FileText,
    users: Users,
    settings: Settings,
    analytics: BarChart3,
    search: Search,
    refresh: RefreshCw,
    filter: Filter,
    'new-ticket': Plus,
    help: Keyboard,
};

/**
 * Keyboard Shortcuts Help Modal
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether modal is open
 * @param {Function} props.onClose - Callback to close modal
 * @param {Array} props.shortcuts - Array of shortcut objects
 */
const KeyboardShortcutsHelp = ({ isOpen, onClose, shortcuts = [] }) => {
    if (!isOpen) return null;

    // Default shortcuts if none provided
    const defaultShortcuts = [
        { category: 'Navigation', items: [
            { key: 'G then D', label: 'Go to Dashboard', icon: 'dashboard' },
            { key: 'G then T', label: 'Go to Tickets', icon: 'tickets' },
            { key: 'G then U', label: 'Go to Users', icon: 'users' },
            { key: 'G then S', label: 'Go to Settings', icon: 'settings' },
            { key: 'G then A', label: 'Go to Analytics', icon: 'analytics' },
        ]},
        { category: 'Quick Access', items: [
            { key: '1', label: 'Dashboard', icon: 'dashboard' },
            { key: '2', label: 'Tickets', icon: 'tickets' },
            { key: '3', label: 'Users', icon: 'users' },
            { key: '4', label: 'Settings', icon: 'settings' },
        ]},
        { category: 'Actions', items: [
            { key: 'Ctrl+K', label: 'Open Search', icon: 'search' },
            { key: 'N', label: 'Create New Ticket', icon: 'new-ticket' },
            { key: 'R', label: 'Refresh Page', icon: 'refresh' },
            { key: 'F', label: 'Open Filters', icon: 'filter' },
        ]},
        { category: 'Help', items: [
            { key: '?', label: 'Show This Help', icon: 'help' },
            { key: 'Esc', label: 'Close Modal', icon: null },
        ]},
    ];

    const displayShortcuts = shortcuts.length > 0 ? shortcuts : defaultShortcuts;

    // Detect Mac for display
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const ctrlLabel = isMac ? '鈱? : 'Ctrl';

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={onClose}
            data-modal-open="true"
        >
            <div 
                className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                        <Keyboard className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Keyboard Shortcuts
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 overflow-y-auto max-h-[calc(80vh-80px)]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {displayShortcuts.map((category, idx) => (
                            <div key={idx} className="space-y-2">
                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 dark:text-gray-400 uppercase tracking-wider">
                                    {category.category}
                                </h3>
                                <div className="space-y-1">
                                    {category.items.map((item, itemIdx) => {
                                        const Icon = item.icon ? iconMap[item.icon] : null;
                                        return (
                                            <div 
                                                key={itemIdx}
                                                className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                            >
                                                <div className="flex items-center gap-2">
                                                    {Icon && (
                                                        <Icon className="w-4 h-4 text-gray-400" />
                                                    )}
                                                    <span className="text-sm text-gray-700 dark:text-gray-300">
                                                        {item.label}
                                                    </span>
                                                </div>
                                                <kbd className="px-2 py-1 text-xs font-mono bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 dark:text-gray-300 rounded border border-gray-200 dark:border-gray-600">
                                                    {item.key.replace('Ctrl', ctrlLabel)}
                                                </kbd>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Footer hint */}
                    <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-400 text-center">
                            Press <kbd className="px-1.5 py-0.5 text-xs font-mono bg-gray-100 dark:bg-gray-700 rounded">?</kbd> anytime to show this help, 
                            <kbd className="px-1.5 py-0.5 text-xs font-mono bg-gray-100 dark:bg-gray-700 rounded ml-1">Esc</kbd> to close
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KeyboardShortcutsHelp;
