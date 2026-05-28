import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, ShieldCheck } from 'lucide-react';
import { api } from '../../services/api';

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
 * SLABadge — shows SLA countdown for a ticket with an interactive AI-powered estimate tooltip.
 *
 * Props:
 *  - priority:    string ('critical' | 'high' | 'medium' | 'low')
 *  - createdAt:   string (ISO date) — used as fallback when slaBreachAt is absent
 *  - slaBreachAt: string (ISO date) — preferred; exact deadline from backend
 *  - slaStatus:   string ('ACTIVE' | 'WARNING' | 'BREACHED') — skip timer when BREACHED
 *  - status:      string — if ticket is resolved/closed, show "Met" without countdown
 *  - compact:     bool  — if true, shows just the badge with no label text
 *  - ticketId:    string (UUID) — if provided, enables hover estimates
 */
export default function SLABadge({ priority, createdAt, slaBreachAt, slaStatus, status, compact = false, ticketId = null }) {
    const [remaining, setRemaining] = useState(null);
    const [estimate, setEstimate] = useState(null);
    const [loadingEstimate, setLoadingEstimate] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);

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

    const handleMouseEnter = async () => {
        setShowTooltip(true);
        if (!ticketId || estimate || loadingEstimate || isResolved) return;
        setLoadingEstimate(true);
        try {
            const res = await api.getSlaEstimate(ticketId);
            if (res) {
                setEstimate(res);
            }
        } catch (e) {
            console.error("Failed to load SLA estimate", e);
        } finally {
            setLoadingEstimate(false);
        }
    };

    const handleMouseLeave = () => {
        setShowTooltip(false);
    };

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
        <div 
            className="relative inline-block"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full border uppercase tracking-wide whitespace-nowrap cursor-help ${colorClasses}`}>
                <Icon className="w-3 h-3" />
                {isBreached ? 'SLA Breached' : formatDuration(remaining)}
            </span>
            {showTooltip && ticketId && !isResolved && (
                <div className="absolute z-[999] bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-3.5 bg-slate-950 text-white rounded-2xl shadow-2xl text-[11px] font-semibold min-w-[210px] border border-slate-800 pointer-events-none transition-all duration-200 ease-out select-none">
                    {loadingEstimate ? (
                        <div className="flex items-center gap-2 py-1.5 justify-center">
                            <span className="animate-spin h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full"></span>
                            <span className="text-[9px] tracking-wider uppercase font-black text-slate-400">AI Predicting...</span>
                        </div>
                    ) : estimate ? (
                        <div className="flex flex-col gap-1.5 leading-normal">
                            <div className="flex items-center justify-between border-b border-white/10 pb-1.5 mb-1.5">
                                <span className="font-black text-emerald-400 tracking-wider text-[9px]">SLA PREDICTOR</span>
                                <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${estimate.breach_risk ? 'bg-red-600 text-white animate-pulse' : 'bg-emerald-600 text-white'}`}>
                                    {estimate.breach_risk ? 'At Risk' : 'On Track'}
                                </span>
                            </div>
                            <div className="flex justify-between gap-4">
                                <span className="text-slate-400 font-medium">Est. Resolution:</span>
                                <span className="font-mono text-white font-bold">{estimate.estimated_minutes} min</span>
                            </div>
                            {estimate.factors && (
                                <>
                                    <div className="flex justify-between gap-4">
                                        <span className="text-slate-400 font-medium">Priority Baseline:</span>
                                        <span className="font-mono text-slate-200">{estimate.factors.baseline_minutes} min</span>
                                    </div>
                                    <div className="flex justify-between gap-4">
                                        <span className="text-slate-400 font-medium">Category SLA Adjustment:</span>
                                        <span className="font-mono text-slate-200">{estimate.factors.category_multiplier}x</span>
                                    </div>
                                    <div className="flex justify-between gap-4">
                                        <span className="text-slate-400 font-medium">Workload Congestion:</span>
                                        <span className="font-mono text-slate-200">{estimate.factors.workload_multiplier}x</span>
                                    </div>
                                </>
                            )}
                            {estimate.metadata?.confidence_score !== undefined && (
                                <div className="flex justify-between border-t border-white/10 pt-1.5 mt-1.5">
                                    <span className="text-slate-400 font-medium">Predictor Confidence:</span>
                                    <span className="font-mono text-white font-bold">{Math.round(estimate.metadata.confidence_score * 100)}%</span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <span className="text-red-400">Error loading estimate</span>
                    )}
                </div>
            )}
        </div>
    );
}
