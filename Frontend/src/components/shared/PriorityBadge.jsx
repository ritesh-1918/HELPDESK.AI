/**
 * PriorityBadge — visual indicator for ticket priority (issue #3889).
 *
 * Critical/high tickets render with an animated pulsing beacon so urgent items
 * stand out immediately in dashboard lists.
 */
import React from 'react';

const PALETTE = {
    critical: { bg: '#fef2f2', color: '#dc2626', border: '#fecaca', dot: '#dc2626' },
    high: { bg: '#fff7ed', color: '#ea580c', border: '#fed7aa', dot: '#f97316' },
    medium: { bg: '#fefce8', color: '#ca8a04', border: '#fde68a', dot: null },
    low: { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0', dot: null },
};

const PriorityBadge = ({ priority, size = 'sm' }) => {
    const level = String(priority || 'medium').toLowerCase();
    const palette = PALETTE[level] || PALETTE.medium;
    const urgent = level === 'critical' || level === 'high';

    return (
        <>
            <style>{`
                @keyframes helpdesk-pulse-beacon {
                    0% { box-shadow: 0 0 0 0 rgba(220,38,38,0.45); }
                    70% { box-shadow: 0 0 0 8px rgba(220,38,38,0); }
                    100% { box-shadow: 0 0 0 0 rgba(220,38,38,0); }
                }
            `}</style>
            <span
                role="status"
                aria-label={`Priority ${level}`}
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: palette.bg,
                    color: palette.color,
                    border: `1px solid ${palette.border}`,
                    borderRadius: '100px',
                    padding: size === 'md' ? '5px 14px' : '3px 10px',
                    fontSize: size === 'md' ? '12px' : '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                }}
            >
                {urgent && (
                    <span
                        style={{
                            width: '7px',
                            height: '7px',
                            borderRadius: '50%',
                            background: palette.dot,
                            animation: 'helpdesk-pulse-beacon 1.6s ease-out infinite',
                        }}
                    />
                )}
                {level}
            </span>
        </>
    );
};

export default PriorityBadge;
