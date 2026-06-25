/**
 * KeyboardLegend Modal
 *
 * Displays available keyboard shortcuts in a modal overlay.
 * Triggered by pressing "?" or programmatically.
 */

import React, { useEffect, useRef } from 'react';
import { SHORTCUT_LIST } from '../hooks/useKeyboardShortcuts';

/**
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal is visible
 * @param {Function} props.onClose - Callback when modal should close
 */
export default function KeyboardLegend({ isOpen, onClose }) {
  const overlayRef = useRef(null);
  const closeButtonRef = useRef(null);
  const previousFocusRef = useRef(null);

  // Focus trap and keyboard handling
  useEffect(() => {
    if (!isOpen) return;

    // Store previously focused element
    previousFocusRef.current = document.activeElement;

    // Focus close button when modal opens
    closeButtonRef.current?.focus();

    function handleClickOutside(e) {
      if (overlayRef.current && e.target === overlayRef.current) {
        onClose();
      }
    }

    function handleKeyDown(e) {
      // Close on Escape
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      // Trap Tab/Shift+Tab within modal
      if (e.key === 'Tab') {
        const focusableElements = overlayRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusableElements || focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          // Shift+Tab: if on first element, move to last
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab: if on last element, move to first
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      // Restore focus to previously focused element
      previousFocusRef.current?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-label="Keyboard shortcuts"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        style={{
          background: '#1e293b',
          color: '#f1f5f9',
          borderRadius: '12px',
          padding: '24px 32px',
          maxWidth: '520px',
          width: '90%',
          maxHeight: '80vh',
          overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
          border: '1px solid #334155',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            borderBottom: '1px solid #334155',
            paddingBottom: '12px',
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: '18px',
              fontWeight: 700,
              color: '#f1f5f9',
            }}
          >
            ⌨️ Keyboard Shortcuts
          </h2>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            aria-label="Close"
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              fontSize: '20px',
              padding: '4px 8px',
              borderRadius: '4px',
            }}
            onMouseEnter={(e) => (e.target.style.color = '#f1f5f9')}
            onMouseLeave={(e) => (e.target.style.color = '#94a3b8')}
          >
            ✕
          </button>
        </div>

        {/* Shortcut groups */}
        {SHORTCUT_LIST.map((group) => (
          <div key={group.group} style={{ marginBottom: '16px' }}>
            <h3
              style={{
                fontSize: '12px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: '#6366f1',
                marginBottom: '8px',
              }}
            >
              {group.group}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {group.shortcuts.map((shortcut) => (
                <div
                  key={shortcut.description}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '6px 0',
                  }}
                >
                  <span style={{ color: '#94a3b8', fontSize: '14px' }}>
                    {shortcut.description}
                  </span>
                  <span style={{ display: 'flex', gap: '4px' }}>
                    {shortcut.keys.map((key, idx) => (
                      <React.Fragment key={idx}>
                        {idx > 0 && (
                          <span
                            style={{
                              color: '#64748b',
                              fontSize: '12px',
                              alignSelf: 'center',
                            }}
                          >
                            then
                          </span>
                        )}
                        <kbd
                          style={{
                            display: 'inline-block',
                            padding: '3px 8px',
                            fontSize: '12px',
                            fontWeight: 600,
                            fontFamily: 'monospace',
                            color: '#f1f5f9',
                            background: '#334155',
                            border: '1px solid #475569',
                            borderRadius: '4px',
                            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
                            minWidth: '24px',
                            textAlign: 'center',
                          }}
                        >
                          {key}
                        </kbd>
                      </React.Fragment>
                    ))}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Footer hint */}
        <div
          style={{
            marginTop: '16px',
            paddingTop: '12px',
            borderTop: '1px solid #334155',
            fontSize: '12px',
            color: '#64748b',
            textAlign: 'center',
          }}
        >
          Press <kbd style={kbdStyle}>?</kbd> to toggle this legend
        </div>
      </div>
    </div>
  );
}

const kbdStyle = {
  display: 'inline-block',
  padding: '2px 6px',
  fontSize: '11px',
  fontWeight: 600,
  fontFamily: 'monospace',
  color: '#f1f5f9',
  background: '#334155',
  border: '1px solid #475569',
  borderRadius: '3px',
  margin: '0 2px',
};
