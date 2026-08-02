import React, { useState, useEffect, useMemo } from 'react';
import { Clock, AlertTriangle, ShieldCheck } from 'lucide-react';
import { parseDate } from '../../utils/dateUtils';

// SLA fallback time limits in milliseconds based on priority (used only when no
// explicit deadline such as sla_breach_at is provided by the backend).
const SLA_LIMITS = {
    critical: 2 * 60 * 60 * 1000, // 2 hours
    high: 4 * 60 * 60 * 1000, // 4 hours
    medium: 8 * 60 * 60 * 1000, // 8 hours
    low: 24 * 60 * 60 * 1000, // 24 hours
};

const pad = (n) => String(n).padStart(2, '0');

function formatCountdown(ms) {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (days > 0) return `${days}d ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

const RESOLVED_STATUSES = ['resolved', 'closed', 'auto-resolved', 'auto_resolved'];

/**
 * SLACountdown — a live ticking resolution clock for a ticket's SLA target.
 *
 * Props:
 *  - deadline: string | null — explicit target timestamp (e.g. sla_breach_at).
 *              When absent, falls back to priority + createdAt (see SLA_LIMITS).
 *  - priority: string — used for the fallback budget and bar colour.
 *  - createdAt: string — used for the fallback budget.
 *  - status: string — if the ticket is resolved/closed, shows "SLA Met".
 *  - compact: bool — small pill layout (list/table friendly).
 */
export default function SLACountdown({
    deadline,
    priority,
    createdAt,
    status,
    compact = false,
    className = '',
}) {
    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        setNow(Date.now());
        const timer = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(timer);
    }, []);

    const { target, total } = useMemo(() => {
        const explicit = deadline ? parseDate(deadline) : null;
        if (explicit) return { target: explicit.getTime(), total: null };

        const createdMs = createdAt ? parseDate(createdAt) : null;
        const limit = SLA_LIMITS[String(priority || '').toLowerCase()] || SLA_LIMITS.medium;
        return { target: createdMs ? createdMs.getTime() + limit : null, total: limit };
    }, [deadline, priority, createdAt]);

    const isResolved = RESOLVED_STATUSES.includes(String(status || '').toLowerCase());

    if (isResolved) {
        return (
            <span
                title="SLA target met"
                className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase tracking-wide whitespace-nowrap ${className}`}
            >
                <ShieldCheck className="w-3 h-3" />
                {!compact && 'SLA Met'}
            </span>
        );
    }

    if (target === null) return null;

    const remaining = target - now;
    const isBreached = remaining <= 0;
    const isCritical = !isBreached && remaining <= 30 * 60 * 1000; // < 30 min
    const isWarning = !isBreached && !isCritical && remaining <= 60 * 60 * 1000; // 30-60 min

    let barColor = 'bg-emerald-500';
    let textColor = 'text-gray-900';
    let Icon = Clock;
    let iconColor = 'text-emerald-600';

    if (isBreached) {
        barColor = 'bg-red-500 animate-pulse';
        textColor = 'text-red-700';
        Icon = AlertTriangle;
        iconColor = 'text-red-600';
    } else if (isCritical) {
        barColor = 'bg-red-500';
        textColor = 'text-red-700';
        Icon = AlertTriangle;
        iconColor = 'text-red-600';
    } else if (isWarning) {
        barColor = 'bg-amber-500';
        textColor = 'text-amber-700';
        Icon = Clock;
        iconColor = 'text-amber-600';
    }

    const pct = total ? Math.max(0, Math.min(100, (remaining / total) * 100)) : null;

    if (compact) {
        return (
            <span
                title={`SLA deadline ${new Date(target).toLocaleString()}`}
                className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full border uppercase tracking-wide whitespace-nowrap ${isBreached ? 'bg-red-100 text-red-700 border-red-200 animate-pulse' : isCritical ? 'bg-red-50 text-red-600 border-red-100' : isWarning ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'} ${className}`}
            >
                <Icon className="w-3 h-3" />
                {isBreached ? 'SLA Breached' : formatCountdown(remaining)}
            </span>
        );
    }

    return (
        <div
            title={`SLA deadline ${new Date(target).toLocaleString()}`}
            className={`rounded-2xl border p-4 ${isBreached ? 'bg-red-50 border-red-200' : isCritical ? 'bg-red-50/60 border-red-100' : isWarning ? 'bg-amber-50/60 border-amber-100' : 'bg-emerald-50/60 border-emerald-100'} ${className}`}
        >
            <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.18em] flex items-center gap-1.5">
                    <Icon className={`w-3.5 h-3.5 ${iconColor}`} /> SLA Resolution Clock
                </span>
                {isBreached && (
                    <span className="text-[10px] font-black text-red-700 uppercase tracking-widest animate-pulse">Breached</span>
                )}
            </div>

            <p className={`font-mono font-black text-3xl tracking-tight tabular-nums ${textColor}`}>
                {isBreached ? '00:00:00' : formatCountdown(remaining)}
            </p>

            {pct !== null && (
                <div className="mt-3 h-1.5 w-full bg-white rounded-full overflow-hidden border border-black/5">
                    <div
                        className={`h-full rounded-full transition-all duration-1000 ${barColor}`}
                        style={{ width: `${isBreached ? 0 : pct}%` }}
                    />
                </div>
            )}

            <p className="mt-2 text-[10px] font-semibold text-gray-500">
                Target {new Date(target).toLocaleString()}
                {pct !== null && !isBreached && ` · ${Math.round(pct)}% of budget left`}
            </p>
        </div>
    );
}
