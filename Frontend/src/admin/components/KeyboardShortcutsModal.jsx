/**
 * KeyboardShortcutsModal — Displays all keyboard shortcuts in a clean grid layout.
 * Grouped into: Navigation, UI.
 */

import React, { useEffect, useRef } from 'react';
import { X, Keyboard } from 'lucide-react';
import ShortcutBadge from './ShortcutBadge';
import { SHORTCUT_GROUPS } from '../../hooks/useKeyboardShortcuts';
import { useFocusTrap } from '../../hooks/useAccessibility';

/**
 * @param {{ isOpen: boolean, onClose: function }} props
 */
const KeyboardShortcutsModal = ({ isOpen, onClose }) => {
    const { containerRef } = useFocusTrap(isOpen, onClose);

    if (!isOpen) return null;

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-label="Keyboard shortcuts"
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
            }}
        >
            {/* Backdrop */}
            <div
                aria-hidden="true"
                onClick={onClose}
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(0, 0, 0, 0.7)',
                    backdropFilter: 'blur(4px)',
                }}
            />

            {/* Modal panel */}
            <div
                ref={containerRef}
                style={{
                    position: 'relative',
                    background: '#0f1f12',
                    border: '1px solid #1e3a21',
                    borderRadius: '16px',
                    width: '100%',
                    maxWidth: '520px',
                    maxHeight: '80vh',
                    overflowY: 'auto',
                    boxShadow: '0 24px 48px rgba(0,0,0,0.6)',
                    padding: '24px',
                }}
            >
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ background: '#10b981', borderRadius: '8px', padding: '6px', display: 'flex' }}>
                            <Keyboard size={16} color="#fff" />
                        </div>
                        <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#e2e8f0', margin: 0 }}>
                            Keyboard Shortcuts
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        aria-label="Close keyboard shortcuts"
                        style={{
                            background: 'transparent',
                            border: '1px solid #1e3a21',
                            borderRadius: '8px',
                            padding: '6px',
                            cursor: 'pointer',
                            color: '#6b7280',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Shortcut groups */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {SHORTCUT_GROUPS.map((group) => (
                        <section key={group.group} aria-label={group.group}>
                            <h3
                                style={{
                                    fontSize: '10px',
                                    fontWeight: 700,
                                    color: '#10b981',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.1em',
                                    marginBottom: '10px',
                                    paddingBottom: '6px',
                                    borderBottom: '1px solid #1e3a21',
                                }}
                            >
                                {group.group}
                            </h3>

                            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {group.shortcuts.map((shortcut, i) => (
                                    <li
                                        key={i}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '8px 12px',
                                            borderRadius: '8px',
                                            background: '#152218',
                                        }}
                                    >
                                        <span style={{ fontSize: '13px', color: '#cbd5e1' }}>
                                            {shortcut.description}
                                        </span>
                                        <ShortcutBadge keys={shortcut.keys} />
                                    </li>
                                ))}
                            </ul>
                        </section>
                    ))}
                </div>

                {/* Footer hint */}
                <p style={{ marginTop: '20px', fontSize: '11px', color: '#4b5563', textAlign: 'center' }}>
                    Press <ShortcutBadge keys={['?']} /> to toggle this panel
                </p>
            </div>
        </div>
    );
};

export default KeyboardShortcutsModal;
