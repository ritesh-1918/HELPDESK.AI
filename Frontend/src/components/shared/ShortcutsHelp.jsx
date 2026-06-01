/**
 * Shortcuts Help Modal
 * Displays available keyboard shortcuts in a styled overlay.
 */

import React, { useState, useEffect } from 'react';
import { formatShortcut, getShortcutDescription } from '../hooks/useKeyboardShortcuts';

const ShortcutsHelp = ({ isOpen, onClose, shortcuts = {} }) => {
    const [selectedCategory, setSelectedCategory] = useState('navigation');

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    // Categorize shortcuts
    const categories = {
        navigation: {
            title: 'Navigation',
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
            ),
            shortcuts: ['g,d', 'g,t', 'g,n', 'g,p', 'g,h', 'g,a', 'g,k', 'g,u', 'g,s'],
        },
        actions: {
            title: 'Quick Actions',
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            ),
            shortcuts: ['ctrl+k', 'ctrl+/', 'escape'],
        },
    };

    // Filter shortcuts based on what's available
    const getAvailableShortcuts = (categoryShortcuts) => {
        return categoryShortcuts.filter(s => s in shortcuts);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" data-modal>
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Keyboard Shortcuts</h2>
                                <p className="text-white/80 text-sm">Navigate faster with keyboard shortcuts</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white/80 hover:text-white transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                    {/* Category Tabs */}
                    <div className="flex space-x-2 mb-6">
                        {Object.entries(categories).map(([key, category]) => {
                            const available = getAvailableShortcuts(category.shortcuts);
                            if (available.length === 0) return null;

                            return (
                                <button
                                    key={key}
                                    onClick={() => setSelectedCategory(key)}
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                                        selectedCategory === key
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    {category.icon}
                                    <span className="font-medium">{category.title}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Shortcuts List */}
                    <div className="space-y-3">
                        {categories[selectedCategory]?.shortcuts.map(shortcut => {
                            if (!(shortcut in shortcuts)) return null;

                            const description = getShortcutDescription(shortcut);
                            const formatted = formatShortcut(shortcut);

                            return (
                                <div
                                    key={shortcut}
                                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                                >
                                    <span className="text-gray-700 font-medium">{description}</span>
                                    <div className="flex items-center space-x-1">
                                        {formatted.split('').map((char, index) => (
                                            <kbd
                                                key={index}
                                                className="px-2 py-1 bg-white border border-gray-300 rounded-md text-sm font-mono text-gray-600 shadow-sm"
                                            >
                                                {char}
                                            </kbd>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Tips */}
                    <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                        <h3 className="text-sm font-semibold text-blue-800 mb-2">💡 Tips</h3>
                        <ul className="text-sm text-blue-700 space-y-1">
                            <li>• Press <kbd className="px-1 py-0.5 bg-blue-100 rounded text-xs">G</kbd> then wait for a second, then press the next key</li>
                            <li>• Shortcuts don't work when typing in input fields</li>
                            <li>• Press <kbd className="px-1 py-0.5 bg-blue-100 rounded text-xs">Esc</kbd> to close any modal</li>
                        </ul>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-500">
                            Press <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono">Ctrl</kbd> + <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono">/</kbd> to toggle this help
                        </p>
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            Got it!
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShortcutsHelp;
