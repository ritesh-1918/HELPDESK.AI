import React, { useState, useEffect, useRef } from 'react';
import { API_CONFIG } from '../../config';

/**
 * Formats a remaining-seconds value into a human-readable countdown string.
 * @param {number} seconds - Remaining seconds (negative means already breached).
 * @returns {string}
 */
function formatCountdown(seconds) {
    if (seconds <= 0) return null;

    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    if (h > 0) return m > 0 ? `${h}h ${m}m until breach` : `${h}h until breach`;
    if (m > 0) return `${m}m until breach`;
    return `${s}s until breach`;
}

/**
 * Formats how long ago the SLA was breached.
 * @param {number} seconds - Negative remaining seconds (i.e. seconds past the deadline).
 * @returns {string}
 */
function formatBreachAge(seconds) {
    const elapsed = Math.abs(seconds);
    const h = Math.floor(elapsed / 3600);
    const m = Math.floor((elapsed % 3600) / 60);

    if (h > 0) return `${h}h ${m}m ago`;
    if (m > 0) return `${m}m ago`;
    return `just now`;
}

const SEVERITY_STYLES = {
    healthy: {
        icon: '🟢',
        label: 'SLA Healthy',
        badge: 'bg-emerald-50 border-emerald-200 text-emerald-800',
        dot: 'bg-emerald-500',
    },
    warning: {
        icon: '🟡',
        label: 'SLA Warning',
        badge: 'bg-yellow-50 border-yellow-200 text-yellow-800',
        dot: 'bg-yellow-500',
    },
    critical: {
        icon: '🔴',
        label: 'SLA Critical',
        badge: 'bg-red-50 border-red-200 text-red-800',
        dot: 'bg-red-500 animate-pulse',
    },
    breached: {
        icon: '❌',
        label: 'SLA Breached',
        badge: 'bg-rose-100 border-rose-300 text-rose-900',
        dot: 'bg-rose-700',
    },
};

const POLL_INTERVAL_MS = 5000;

/**
 * SlaStatusBadge — polls the /api/tickets/{id}/sla-status endpoint every 5 s
 * and renders a colour-coded countdown badge.  Polling is paused when the
 * browser tab is hidden and resumes automatically when it becomes visible.
 *
 * @param {object} props
 * @param {string} props.ticketId  - The UUID of the ticket to monitor.
 * @param {string} [props.ticketStatus] - Current ticket status (stops polling for resolved/closed).
 */
const SlaStatusBadge = ({ ticketId, ticketStatus }) => {
    const [slaData, setSlaData] = useState(null);
    const [fetchError, setFetchError] = useState(false);
    const intervalRef = useRef(null);

    const isTerminal =
        ticketStatus &&
        ['resolved', 'closed', 'auto-resolved', 'auto resolved'].includes(
            ticketStatus.toLowerCase(),
        );

    const fetchSlaStatus = async () => {
        if (!ticketId) return;
        try {
            const res = await fetch(
                `${API_CONFIG.BACKEND_URL}/api/tickets/${ticketId}/sla-status`,
            );
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setSlaData(data);
            setFetchError(false);
        } catch {
            setFetchError(true);
        }
    };

    const startPolling = () => {
        if (intervalRef.current) return;
        fetchSlaStatus();
        intervalRef.current = setInterval(fetchSlaStatus, POLL_INTERVAL_MS);
    };

    const stopPolling = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    useEffect(() => {
        if (!ticketId || isTerminal) return;

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                startPolling();
            } else {
                stopPolling();
            }
        };

        startPolling();
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            stopPolling();
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ticketId, isTerminal]);

    // Don't render anything if the ticket is in a terminal state or we have no data yet.
    if (isTerminal || !slaData) return null;

    // Silently suppress rendering on persistent fetch failure to avoid disrupting the page.
    if (fetchError && !slaData) return null;

    const { severity, remaining_seconds } = slaData;
    const styles = SEVERITY_STYLES[severity] ?? SEVERITY_STYLES.healthy;

    const countdownText =
        severity === 'breached'
            ? `Breached ${formatBreachAge(remaining_seconds)}`
            : formatCountdown(remaining_seconds);

    return (
        <div
            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border text-xs font-semibold ${styles.badge}`}
            role="status"
            aria-label={`SLA status: ${styles.label}`}
            id={`sla-status-badge-${ticketId}`}
        >
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${styles.dot}`} aria-hidden="true" />
            <div className="flex flex-col leading-tight">
                <span className="font-black uppercase tracking-wider" style={{ fontSize: '0.6rem' }}>
                    {styles.icon} {styles.label}
                </span>
                {countdownText && (
                    <span className="font-semibold mt-0.5 tabular-nums">{countdownText}</span>
                )}
            </div>
        </div>
    );
};

export default SlaStatusBadge;
