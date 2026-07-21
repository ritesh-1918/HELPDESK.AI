/**
 * ShortcutBadge — Renders a keyboard shortcut combination badge.
 * e.g. ["G", "D"] → renders two key bubbles: [G] then [D]
 * e.g. ["?"]       → renders [?]
 */

import React from 'react';

const KEY_STYLE = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '24px',
    height: '22px',
    padding: '0 6px',
    background: '#1e3a21',
    border: '1px solid #2d5230',
    borderRadius: '5px',
    fontSize: '11px',
    fontWeight: 700,
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    color: '#a7f3d0',
    lineHeight: 1,
    boxShadow: '0 1px 0 #152218',
    flexShrink: 0,
};

const THEN_STYLE = {
    fontSize: '10px',
    color: '#6b7280',
    margin: '0 2px',
};

/**
 * @param {{ keys: string[], className?: string }} props
 */
const ShortcutBadge = ({ keys = [], className = '' }) => {
    if (!keys || keys.length === 0) return null;

    return (
        <span
            className={`shortcut-badge ${className}`}
            aria-label={`Shortcut: ${keys.join(' then ')}`}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}
        >
            {keys.map((key, i) => (
                <React.Fragment key={i}>
                    {i > 0 && <span style={THEN_STYLE} aria-hidden="true">then</span>}
                    <kbd style={KEY_STYLE}>{key}</kbd>
                </React.Fragment>
            ))}
        </span>
    );
};

export default ShortcutBadge;
