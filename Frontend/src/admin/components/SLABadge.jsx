import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, ShieldCheck } from 'lucide-react';

// SLA time limits in milliseconds based on priority
const SLA_LIMITS = {
    critical: 2 * 60 * 60 * 1000,   // 2 hours
    high: 4 * 60 * 60 * 1000,   // 4 hours
    medium: 8 * 60 * 60 * 1000,   // 8 hours
    low: 24 * 60 * 60 * 1000,  // 24 hours
};

function formatDuration(ms) {
    if (ms <= 0) return 'Breached';
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
}

/**
 * SLABadge — shows SLA countdown for a ticket.
 *
 * Props:
 *  - priority:    string ('critical' | 'high' | 'medium' | 'low')
 *  - createdAt:   string (ISO date) — used as fallback when slaBreachAt is absent
 *  - slaBreachAt: string (ISO date) — preferred; exact deadline from backend
 *  - slaStatus:   string ('ACTIVE' | 'WARNING' | 'BREACHED') — skip timer when BREACHED
 *  - status:      string — if ticket is resolved/closed, show "Met" without countdown
 *  - compact:     bool  — if true, shows just the badge with no label text
 */
export default function SLABadge({ priority, createdAt, slaBreachAt, slaStatus, status, compact = false }) {
    const [remaining, setRemaining] = useState(null);

    const isResolved = ['resolved', 'closed', 'auto-resolved'].includes(status?.toLowerCase());
    const isAlreadyBreached = slaStatus?.toUpperCase() === 'BREACHED';

    useEffect(() => {
        if (isResolved) return;

        // Prefer slaBreachAt (exact backend deadline) over priority + createdAt heuristic
        const getDeadlineMs = () => {
            if (slaBreachAt) return new Date(slaBreachAt).getTime();
            if (!priority || !createdAt) return null;
            const priorityKey = priority.toLowerCase();
            const limit = SLA_LIMITS[priorityKey] || SLA_LIMITS.medium;
            return new Date(createdAt).getTime() + limit;
        };

        const deadlineMs = getDeadlineMs();
        if (deadlineMs === null) return;

        const calculate = () => setRemaining(deadlineMs - Date.now());

        calculate();
        const timer = setInterval(calculate, 60 * 1000);
        return () => clearInterval(timer);
    }, [priority, createdAt, slaBreachAt, isResolved]);

    if (isResolved) {
        return (
            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase tracking-wide whitespace-nowrap`}>
                <ShieldCheck className="w-3 h-3" />
                {!compact && 'SLA Met'}
            </span>
        );
    }

    if (remaining === null && !isAlreadyBreached) return null;

    const isBreached = isAlreadyBreached || (remaining !== null && remaining <= 0);
    const isCritical = remaining <= 30 * 60 * 1000 && remaining > 0; // < 30 min
    const isWarning = remaining <= 60 * 60 * 1000 && remaining > 30 * 60 * 1000; // 30–60 min

    let colorClasses = 'bg-blue-50 text-blue-700 border-blue-100';
    let Icon = Clock;

    if (isBreached) {
        colorClasses = 'bg-red-100 text-red-700 border-red-200 animate-pulse';
        Icon = AlertTriangle;
    } else if (isCritical) {
        colorClasses = 'bg-red-50 text-red-600 border-red-100';
        Icon = AlertTriangle;
    } else if (isWarning) {
        colorClasses = 'bg-amber-50 text-amber-700 border-amber-100';
        Icon = Clock;
    } else {
        colorClasses = 'bg-green-50 text-emerald-700 border-emerald-100';
        Icon = Clock;
    }

    return (
        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full border uppercase tracking-wide whitespace-nowrap ${colorClasses}`}>
            <Icon className="w-3 h-3" />
            {isBreached ? 'SLA Breached' : formatDuration(remaining)}
        </span>
    );
}
