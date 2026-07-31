import React, { useMemo, useState } from 'react';
import { ShieldCheck, Clock, AlertTriangle, RefreshCw, CheckCircle2 } from 'lucide-react';

const SLA_LIMITS = {
    critical: { hours: 2, color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
    high: { hours: 4, color: '#ea580c', bg: '#fff7ed', border: '#fed7aa' },
    medium: { hours: 8, color: '#ca8a04', bg: '#fefce8', border: '#fde68a' },
    low: { hours: 24, color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
};

const DEFAULT_CONFIG = {
    critical: 2,
    high: 4,
    medium: 8,
    low: 24,
};

const SLAPage = () => {
    const [config, setConfig] = useState(DEFAULT_CONFIG);
    const [saved, setSaved] = useState(false);

    const rows = useMemo(
        () => Object.entries(SLA_LIMITS).map(([key, meta]) => ({
            key,
            label: meta.label ?? key,
            ...meta,
            hours: config[key],
        })),
        [config]
    );

    const updateLimit = (key, value) => {
        const parsed = parseInt(value, 10);
        if (Number.isNaN(parsed) || parsed < 1 || parsed > 168) return;
        setConfig((prev) => ({ ...prev, [key]: parsed }));
        setSaved(false);
    };

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const handleReset = () => {
        setConfig(DEFAULT_CONFIG);
        setSaved(false);
    };

    return (
        <div className="p-6 lg:p-10 space-y-8">
            {/* Header — flex row with consistent centering and leading so the
                title/subtitle stay aligned on narrow viewports (issue #3864). */}
            <header
                className="flex flex-wrap items-center gap-4"
                style={{ fontFamily: 'Syne, sans-serif' }}
            >
                <div className="w-11 h-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center shrink-0">
                    <ShieldCheck size={20} />
                </div>
                <div className="min-w-0">
                    <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight leading-none uppercase italic m-0">
                        SLA Management.
                    </h1>
                    <p className="mt-2 mb-0 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 leading-none">
                        Response time guarantees per priority
                    </p>
                </div>
                <div className="ml-auto flex items-center gap-2">
                    <button
                        onClick={handleReset}
                        className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all flex items-center gap-2 text-[11px] font-black uppercase tracking-widest"
                        aria-label="Reset SLA limits to defaults"
                    >
                        <RefreshCw size={14} /> Reset
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-5 py-2 bg-slate-900 text-white rounded-xl hover:bg-emerald-600 transition-all flex items-center gap-2 text-[11px] font-black uppercase tracking-widest"
                        aria-label="Save SLA limits"
                    >
                        {saved ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                        {saved ? 'Saved' : 'Save Changes'}
                    </button>
                </div>
            </header>

            {/* SLA limits card + responsive table (issue #3881). */}
            <section className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-6 lg:px-8 py-5 border-b border-slate-100 flex items-center justify-between gap-3">
                    <h2 className="m-0 text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <Clock size={14} className="text-slate-500" /> SLA Targets
                    </h2>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 flex items-center gap-1.5">
                        <AlertTriangle size={12} className="hidden sm:inline" /> Auto-escalation active
                    </span>
                </div>

                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full min-w-[620px] border-collapse">
                        <thead>
                            <tr className="bg-slate-50/60">
                                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                    Priority
                                </th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                    SLA Target (hours)
                                </th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row) => (
                                <tr key={row.key} className="hover:bg-slate-50/40 transition-colors">
                                    <td className="px-8 py-5 border-b border-slate-50">
                                        <div className="flex items-center gap-3">
                                            <span
                                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                                style={{ background: row.color }}
                                            />
                                            <span className="text-sm font-bold uppercase tracking-wide" style={{ color: row.color }}>
                                                {row.label}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 border-b border-slate-50">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                min="1"
                                                max="168"
                                                value={row.hours}
                                                onChange={(e) => updateLimit(row.key, e.target.value)}
                                                aria-label={`${row.label} SLA target in hours`}
                                                className="w-24 px-3 py-2 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                                            />
                                            <span className="text-xs font-semibold text-slate-400">hours</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 border-b border-slate-50">
                                        <span
                                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest"
                                            style={{ background: row.bg, color: row.color, border: `1px solid ${row.border}` }}
                                        >
                                            <AlertTriangle size={11} /> Enforced
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="px-6 lg:px-8 py-4 bg-slate-50/50 flex flex-wrap items-center gap-3">
                    <AlertTriangle size={14} className="text-amber-500 shrink-0" />
                    <p className="m-0 text-xs text-slate-500 font-semibold">
                        Tickets exceeding their SLA target are automatically escalated by the backend SLA monitor and flagged for the assigned team.
                    </p>
                </div>
            </section>
        </div>
    );
};

export default SLAPage;
