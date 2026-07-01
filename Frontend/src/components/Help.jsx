import React from 'react';

const shortcuts = [
  { keys: 'G then D', action: 'Go to Dashboard' },
  { keys: 'G then T', action: 'Go to Tickets' },
  { keys: 'Ctrl/Cmd + F', action: 'Focus global search' },
  { keys: 'Shift + ?', action: 'Open shortcuts help' },
];

export default function Help() {
  return (
    <div className="help-page" style={{ padding: '24px' }}>
      <h1>Help Center</h1>
      <p>Use the keyboard shortcuts below to move through the admin dashboard faster.</p>

      <div
        className="shortcuts-legend"
        style={{
          marginTop: '24px',
          maxWidth: '420px',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '16px',
          background: '#ffffff',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.06)',
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: '12px' }}>Keyboard Shortcuts</h2>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {shortcuts.map((shortcut) => (
            <li
              key={shortcut.keys}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 0',
                borderBottom: '1px solid #f3f4f6',
                gap: '12px',
              }}
            >
              <span
                style={{
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  background: '#f3f4f6',
                  padding: '4px 8px',
                  borderRadius: '8px',
                  whiteSpace: 'nowrap',
                }}
              >
                {shortcut.keys}
              </span>
              <span style={{ color: '#374151', textAlign: 'right' }}>{shortcut.action}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
