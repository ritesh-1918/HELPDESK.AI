import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FileText, Database, Zap,
    CheckCircle2, AlertTriangle, ArrowRight,
    Lightbulb, SearchX, TicketCheck, Search
} from 'lucide-react';
import axios from 'axios';
import useTicketStore from "../../store/ticketStore";
import { useAuthStore } from "../../store/authStore";
import { API_CONFIG } from "../../config";

// ─── Animated Step Pipeline ───────────────────────────────────────────────────
const pipelineSteps = [
    { icon: FileText, label: 'Your Issue', desc: 'Captured & analysed' },
    { icon: Database, label: 'Case History', desc: 'Scanned 10 000+ cases' },
    { icon: Zap, label: 'Match Found', desc: 'Similarity calculated' },
];

// ─── Shimmer skeleton ─────────────────────────────────────────────────────────
const Shimmer = ({ className = '' }) => (
    <div className={`relative overflow-hidden rounded-xl bg-slate-100 ${className}`}>
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent animate-[shimmer_1.5s_infinite]" />
    </div>
);

const SkeletonLoader = () => (
    <div className="min-h-screen bg-[#f6f8f7] pb-20 pt-28 px-6">
        <style>{`@keyframes shimmer{100%{transform:translateX(100%)}}`}</style>
        <div className="w-full max-w-[820px] mx-auto space-y-8">
            <Shimmer className="h-44 w-full rounded-3xl" />
            <Shimmer className="h-52 w-full rounded-3xl" />
            <Shimmer className="h-36 w-full rounded-3xl" />
        </div>
    </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const DuplicateDetection = () => {
    const navigate = useNavigate();
    const aiTicket = useTicketStore((state) => state.aiTicket);
    const [isLoading, setIsLoading] = useState(true);
    const [activeStep, setActiveStep] = useState(0);
    const [countdown, setCountdown] = useState(2);

    // Loading delay + step animation
    useEffect(() => {
        const t0 = setTimeout(() => setIsLoading(false), 600);
        const t1 = setTimeout(() => setActiveStep(1), 900);
        const t2 = setTimeout(() => setActiveStep(2), 1700);
        return () => [t0, t1, t2].forEach(clearTimeout);
    }, []);

    useEffect(() => {
        if (!isLoading && !aiTicket) navigate('/create-ticket');
    }, [isLoading, aiTicket, navigate]);

    const isDuplicate = aiTicket?.duplicate_ticket?.is_duplicate === true;

    // Auto-redirect when no duplicate
    useEffect(() => {
        if (isLoading || !aiTicket || isDuplicate) return;
        const interval = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) { clearInterval(interval); return 0; }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [isLoading, aiTicket, isDuplicate]);

    const handleCreateTicket = async () => {
        if (!aiTicket) return;
        setIsLoading(true);
        try {
            const { user, profile } = useAuthStore.getState();
            // Map AI Analysis into the TicketSaveRequest format
            const savePayload = {
                user_id: user?.id,
                subject: aiTicket.summary,
                description: aiTicket.originalIssue,
                category: aiTicket.category,
                subcategory: aiTicket.subcategory,
                priority: aiTicket.priority,
                assigned_team: aiTicket.assigned_team,
                status: aiTicket.auto_resolve ? 'auto_resolved' : 'pending_human',
                auto_resolve: aiTicket.auto_resolve,
                is_duplicate: aiTicket.duplicate_ticket?.is_duplicate || false,
                confidence: aiTicket.confidence,
                image_url: aiTicket.image_url || null,
                company: profile?.company || "System",
                sla_breach_at: aiTicket.sla_breach_at,
                metadata: {
                    confidence: aiTicket.confidence,
                    entities: aiTicket.entities,
                    decision_factors: aiTicket.decision_factors,
                    ocr_text: aiTicket.ocr_text,
                    image_description: aiTicket.image_description
                },
                entities: aiTicket.entities,
                solution_steps: resolutionSteps || [],
                ocr_text: aiTicket.ocr_text || "",
                needs_review: aiTicket.needs_review,
                routing_confidence: aiTicket.confidence
            };

            const res = await axios.post(`${API_CONFIG.BACKEND_URL}/tickets/save`, savePayload);
            if (res.data?.ticket_id) {
                navigate(`/ticket/${res.data.ticket_id}`);
            }
        } catch (err) {
            console.error("Failed to save ticket:", err);
            navigate('/create-ticket');
        } finally {
            setIsLoading(false);
        }
    };

    // Navigate when countdown reaches 0
    useEffect(() => {
        if (countdown === 0 && !isDuplicate && aiTicket) {
            handleCreateTicket();
        }
    }, [countdown, isDuplicate, aiTicket]);

    if (isLoading) return <SkeletonLoader />;
    if (!aiTicket) return null;

    const duplicate = aiTicket.duplicate_ticket || {};
    const similarity = duplicate.similarity ? Math.round(duplicate.similarity * 100) : 0;

    // ── Dynamic solution steps — from AI data, no hardcoding ──────────────────
    const resolutionSteps = (() => {
        const raw =
            aiTicket.resolution_steps ||
            aiTicket.suggested_solution ||
            aiTicket.solution_steps ||
            duplicate.solution_steps ||
            null;
        if (Array.isArray(raw) && raw.length > 0) return raw;
        if (typeof raw === 'string' && raw.trim()) {
            return raw.split(/\n+/).map(s => s.replace(/^\d+[\.\)]\s*/, '').trim()).filter(Boolean);
        }
        return null; // hide section entirely if no steps
    })();

    return (
        <div className="min-h-screen bg-[#f6f8f7] pb-20 pt-28 px-6">
            <style>{`@keyframes knowledgeScan{0%{left:0%;opacity:0}10%{opacity:1}90%{opacity:1}100%{left:100%;opacity:0}}`}</style>
            <div className="w-full max-w-[820px] mx-auto space-y-8">

                {/* ── Premium Dark Hero Header ──────────────────────────── */}
                <div className="relative rounded-3xl overflow-hidden bg-slate-900 px-8 py-10 shadow-2xl shadow-slate-900/25">
                    {/* Ambient glow blobs */}
                    <div className="absolute -top-20 -left-20 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-16 right-4 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                    {/* Dot-grid texture */}
                    <div className="absolute inset-0 opacity-[0.035]"
                        style={{ backgroundImage: 'radial-gradient(circle,#fff 1px,transparent 1px)', backgroundSize: '24px 24px' }} />
                    {/* Scanning beam */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute top-0 bottom-0 w-[3px] bg-gradient-to-b from-transparent via-emerald-400/60 to-transparent"
                            style={{ animation: 'knowledgeScan 3.5s ease-in-out infinite' }} />
                    </div>

                    <div className="relative z-10">
                        {/* Live badge */}
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/25 rounded-full mb-5">
                            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.18em]">Analyzing History</span>
                        </div>

                        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-1.5">
                            Scanning our <span className="text-emerald-400">case history</span>
                        </h1>
                        <p className="text-slate-400 text-sm font-medium mb-9">
                            We searched previous issues to see if this problem was already solved.
                        </p>

                        {/* ── Animated step nodes ── */}
                        <div className="flex items-center">
                            {pipelineSteps.map((step, i) => {
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
                                        {i < pipelineSteps.length - 1 && (
                                            <div className="flex-1 mx-4 mt-[-28px] relative h-[2px]">
                                                <div className="absolute inset-0 bg-white/10 rounded-full" />
                                                <div className="absolute inset-y-0 left-0 bg-emerald-400 rounded-full transition-all duration-700"
                                                    style={{ width: i < activeStep ? '100%' : '0%', boxShadow: '0 0 6px rgba(52,211,153,0.5)' }} />
                                            </div>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* ── Match / No-match result card ─────────────────────── */}
                {isDuplicate ? (
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
                        {/* Card header */}
                        <div className="px-8 py-6 bg-amber-50 border-b border-amber-100 flex items-start gap-4">
                            <div className="p-2.5 bg-amber-100 rounded-xl shrink-0">
                                <AlertTriangle className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                                <h2 className="text-base font-black text-amber-900 tracking-tight">Similar Issue Found</h2>
                                <p className="text-sm text-amber-700/80 mt-0.5 font-medium">
                                    We found a previously resolved ticket that is{' '}
                                    <strong className="text-amber-900">{similarity}% similar</strong> to your issue.
                                </p>
                            </div>
                        </div>

                        <div className="p-8 space-y-6">
                            {/* Matched ticket chip */}
                            <div className="bg-slate-50 rounded-2xl border border-slate-100 p-5 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
                                        <TicketCheck size={14} className="text-emerald-500" />
                                        Matched Ticket
                                    </div>
                                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black rounded-full uppercase tracking-widest">
                                        Resolved
                                    </span>
                                </div>
                                <p className="text-sm font-bold text-slate-700 leading-relaxed">
                                    #{duplicate.duplicate_ticket_id || '—'} — {aiTicket.summary}
                                </p>

                                {/* Similarity bar */}
                                <div className="space-y-1.5">
                                    <div className="flex justify-between">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Similarity</span>
                                        <span className="text-xs font-black text-emerald-600">{similarity}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full transition-all duration-1000 ${similarity >= 80 ? 'bg-emerald-500' : similarity >= 50 ? 'bg-amber-500' : 'bg-slate-400'}`}
                                            style={{ width: `${similarity}%` }} />
                                    </div>
                                </div>
                            </div>

                            {/* Suggested Solution — only shown if AI provides steps */}
                            {resolutionSteps && resolutionSteps.length > 0 && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Lightbulb size={15} className="text-amber-500" />
                                        <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Suggested Solution</h3>
                                    </div>
                                    <ol className="space-y-2.5">
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
                            <div className="flex flex-col sm:flex-row gap-3 pt-1">
                                <button onClick={() => navigate('/auto-resolve')}
                                    className="flex-1 bg-emerald-600 text-white px-6 py-3.5 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-emerald-700 active:scale-[0.98] transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2">
                                    <CheckCircle2 size={16} />
                                    Try This Solution
                                </button>
                                <button onClick={handleCreateTicket}
                                    className="flex-1 bg-white border border-slate-200 text-slate-700 px-6 py-3.5 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-slate-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                                    Create New Ticket
                                    <ArrowRight size={16} className="text-slate-400" />
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* ── No duplicate found ── */
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 p-8 flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0">
                            <SearchX className="w-7 h-7 text-slate-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-slate-900 mb-1">No previous match found</h2>
                            <p className="text-sm text-slate-500 font-medium">
                                This issue appears to be new. Redirecting to ticket creation in{' '}
                                <span className="font-black text-emerald-600">{countdown}s</span>…
                            </p>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default DuplicateDetection;
