import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    CheckCircle2, ArrowRight, Search, Database, Zap,
    AlertTriangle, Lightbulb, TicketCheck
} from 'lucide-react';
import useTicketStore from '../store/ticketStore';

/* ─── Animated progress steps at the top ─────────────────────────────────── */
const steps = [
    { icon: Search, label: 'Your Issue', desc: 'Captured & analysed' },
    { icon: Database, label: 'Case History', desc: 'Scanning 10 000+ cases' },
    { icon: Zap, label: 'Match Found', desc: 'Similarity calculated' },
];

function KnowledgeCheck() {
    const { aiTicket } = useTicketStore();
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState(0);

    /* Animate the step indicators on mount */
    useEffect(() => {
        const timers = [
            setTimeout(() => setActiveStep(1), 600),
            setTimeout(() => setActiveStep(2), 1300),
        ];
        return () => timers.forEach(clearTimeout);
    }, []);

    useEffect(() => {
        if (!aiTicket) { navigate('/create-ticket'); return; }

        // Update status for timeline sync
        if (aiTicket.status !== 'duplicate_check') {
            useTicketStore.getState().setAITicket({ ...aiTicket, status: 'duplicate_check' });
        }

        if (!aiTicket.duplicate_ticket && !aiTicket.auto_resolve) navigate('/ticket-tracking');
    }, [aiTicket, navigate]);

    if (!aiTicket) return null;

    /* ── Derive resolution steps from AI data ── */
    let resolutionSteps = null;
    const rawSteps = aiTicket.resolution_steps || aiTicket.suggested_solution || aiTicket.solution_steps || aiTicket.steps || null;

    if (Array.isArray(rawSteps) && rawSteps.length > 0) {
        resolutionSteps = rawSteps;
    } else if (typeof rawSteps === 'string' && rawSteps.trim()) {
        resolutionSteps = rawSteps.split(/\n+/).map(s => s.replace(/^\d+[.)]\s*/, '').trim()).filter(Boolean);
    }

    const similarityPct = aiTicket.similarity_score
        ? Math.round(aiTicket.similarity_score * 100)
        : aiTicket.confidence
            ? Math.round(aiTicket.confidence * 100)
            : null;

    return (
        <main className="flex-1 w-full max-w-[820px] mx-auto px-6 py-12 flex flex-col gap-10">

            {/* ── Premium Dark Hero Header ── */}
            <div className="relative rounded-3xl overflow-hidden bg-slate-900 px-8 py-10 shadow-2xl shadow-slate-900/30">
                {/* Glow blobs */}
                <div className="absolute -top-20 -left-20 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-20 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                {/* Dot-grid overlay */}
                <div className="absolute inset-0 opacity-[0.04]"
                    style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                {/* Scanning beam */}
                <div className="absolute top-0 left-0 h-full pointer-events-none overflow-hidden w-full">
                    <div className="absolute top-0 bottom-0 w-[3px] bg-gradient-to-b from-transparent via-emerald-400/70 to-transparent"
                        style={{ animation: 'knowledgeScan 3.5s ease-in-out infinite' }} />
                </div>
                <style>{`@keyframes knowledgeScan{0%{left:0%;opacity:0}10%{opacity:1}90%{opacity:1}100%{left:100%;opacity:0}}`}</style>

                <div className="relative z-10">
                    {/* Live badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/25 rounded-full mb-5">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.18em]">Analyzing History</span>
                    </div>

                    <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-1">
                        Scanning our <span className="text-emerald-400">case history</span>
                    </h1>
                    <p className="text-slate-400 text-sm font-medium mb-9">
                        We searched previous issues to see if this problem was already solved.
                    </p>

                    {/* Glowing animated steps */}
                    <div className="flex items-center">
                        {steps.map((step, i) => {
                            const Icon = step.icon;
                            const done = i <= activeStep;
                            const active = i === activeStep;
                            return (
                                <React.Fragment key={i}>
                                    <div className={`flex flex-col items-center text-center transition-all duration-700 ${done ? 'opacity-100' : 'opacity-20'}`}>
                                        <div className="relative mb-3">
                                            {active && (
                                                <>
                                                    <span className="absolute inset-0 rounded-2xl bg-emerald-500/40 animate-ping" />
                                                    <span className="absolute -inset-2 rounded-3xl bg-emerald-500/10 blur-lg" />
                                                </>
                                            )}
                                            <div className={`relative w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-500
                                                ${active ? 'bg-emerald-500 text-white scale-110 shadow-emerald-500/50'
                                                    : done ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                                        : 'bg-white/5 text-slate-500 border border-white/10'}`}>
                                                <Icon size={22} />
                                            </div>
                                        </div>
                                        <p className={`text-[11px] font-black uppercase tracking-widest leading-none mb-1 transition-colors duration-500
                                            ${active ? 'text-white' : done ? 'text-slate-300' : 'text-slate-600'}`}>
                                            {step.label}
                                        </p>
                                        <p className={`text-[10px] font-medium hidden sm:block transition-colors duration-500
                                            ${active ? 'text-emerald-400' : 'text-slate-500'}`}>
                                            {step.desc}
                                        </p>
                                    </div>
                                    {i < steps.length - 1 && (
                                        <div className="flex-1 mx-4 mt-[-28px] relative h-[2px]">
                                            <div className="absolute inset-0 bg-white/10 rounded-full" />
                                            <div className="absolute inset-y-0 left-0 bg-emerald-400 rounded-full transition-all duration-700 shadow-[0_0_6px_rgba(52,211,153,0.5)]"
                                                style={{ width: i < activeStep ? '100%' : '0%' }} />
                                        </div>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ── Match card ── */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">

                {/* Header */}
                <div className="px-8 py-6 bg-amber-50 border-b border-amber-100 flex items-start gap-4">
                    <div className="p-2.5 bg-amber-100 rounded-xl shrink-0">
                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                        <h2 className="text-base font-black text-amber-900 tracking-tight">Similar Issue Found</h2>
                        <p className="text-sm text-amber-700/80 mt-0.5 font-medium">
                            We found a previously resolved ticket that is
                            {similarityPct ? <strong className="text-amber-900"> {similarityPct}% similar</strong> : ' highly similar'} to your issue.
                        </p>
                    </div>
                </div>

                <div className="p-8 space-y-8">

                    {/* Matched ticket info */}
                    <div className="bg-slate-50 rounded-2xl border border-slate-100 p-6 space-y-3">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
                                <TicketCheck size={14} className="text-emerald-500" />
                                Matched Ticket
                            </div>
                            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black rounded-full uppercase tracking-widest">
                                Resolved
                            </span>
                        </div>
                        <p className="text-sm font-bold text-slate-700 leading-relaxed">
                            #{aiTicket.duplicate_ticket || '—'} — {aiTicket.summary}
                        </p>
                        {similarityPct && (
                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Similarity</span>
                                    <span className="text-xs font-black text-emerald-600">{similarityPct}%</span>
                                </div>
                                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
                                        style={{ width: `${similarityPct}%` }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Suggested Solution — only rendered if AI provides steps */}
                    {resolutionSteps && resolutionSteps.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Lightbulb size={16} className="text-amber-500" />
                                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Suggested Solution</h3>
                            </div>
                            <ol className="space-y-3">
                                {resolutionSteps.map((step, i) => (
                                    <li key={i} className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5">
                                            {i + 1}
                                        </span>
                                        <span className="text-sm font-medium text-slate-700 leading-relaxed">{step}</span>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <button
                            onClick={() => navigate('/auto-resolve')}
                            className="flex-1 bg-emerald-600 text-white px-6 py-3.5 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-emerald-700 active:scale-[0.98] transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                        >
                            <CheckCircle2 size={16} />
                            Try This Solution
                        </button>
                        <button
                            onClick={() => navigate('/ticket-tracking')}
                            className="flex-1 bg-white border border-slate-200 text-slate-700 px-6 py-3.5 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-slate-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                        >
                            Create New Ticket Anyway
                            <ArrowRight size={16} className="text-slate-400" />
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default KnowledgeCheck;
