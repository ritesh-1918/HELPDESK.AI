import React from 'react';
import {
    CheckCircle2, Clock,
    Hash, Flag, FolderOpen, Users, BrainCircuit, ScanSearch, Layers, Network, Zap
} from 'lucide-react';
import { formatFullTimestamp } from '../../utils/dateUtils';
 
import { motion, AnimatePresence } from 'framer-motion';
import useTicketStore from '../../store/ticketStore';

// ─── Step definitions ─────────────────────────────────────────────────────────

const STEPS = [
    {
        Icon: ScanSearch,
        title: '1. Ingestion',
        description: 'Ticket received and OCR text extracted.',
        timelineKey: 'created'
    },
    {
        Icon: BrainCircuit,
        title: '2. AI Analysis',
        description: 'Context understood by LLM Engine.',
        timelineKey: 'ai_analyzed'
    },
    {
        Icon: Layers,
        title: '3. Neural Triage',
        description: 'Category & Priority identified.',
        timelineKey: 'triaged'
    },
    {
        Icon: ScanSearch,
        title: '4. Metadata Harvesting',
        description: 'IPs, Hostnames & Errors extracted.',
        timelineKey: 'metadata_harvested'
    },
    {
        Icon: Network,
        title: '5. Intelligent Routing',
        description: 'Routed to optimal support team.',
        timelineKey: 'routed'
    },
    {
        Icon: Zap,
        title: '6. Resolution Phase',
        description: 'Solving / Auto-resolution in progress.',
        timelineKey: 'resolution_started',
        finalKey: 'resolved_at'
    },
];

// ─── Status → step index ──────────────────────────────────────────────────────

const STATUS_STEP_MAP = {
    submitted: 0,
    open: 0,
    new: 0,
    analyzing: 1,
    processing: 1,
    duplicate_check: 2,
    checking_duplicates: 2,
    auto_resolve: 3,
    troubleshooting: 3,
    pending_human: 4,
    escalated: 4,
    assigned: 4,
    in_progress: 4,
    resolved: 5,
    closed: 5,
    done: 5,
};

const getActiveStep = (status = '') => {
    const key = (status || '').toLowerCase().replace(/\s+/g, '_').trim();
    if (key in STATUS_STEP_MAP) return STATUS_STEP_MAP[key];

    // Fuzzy matching
    if (key.includes('resolv') || key.includes('closed') || key.includes('done')) return 5;
    if (key.includes('human') || key.includes('escalat') || key.includes('assign') || key.includes('progress')) return 4;
    if (key.includes('auto') || key.includes('plan')) return 3;
    if (key.includes('duplicate')) return 2;
    if (key.includes('analys') || key.includes('process') || key.includes('understanding')) return 1;
    if (key.includes('submit') || key.includes('open') || key.includes('new')) return 0;

    return 0;
};

const getStepState = (idx, activeStep) => {
    if (idx < activeStep) return 'completed';
    if (idx === activeStep) return 'active';
    return 'pending';
};

// ─── Priority color ───────────────────────────────────────────────────────────

const priorityStyle = (p = '') => {
    const l = String(p || '').toLowerCase();
    if (l === 'critical' || l === 'high') return 'text-red-600   bg-red-50   border-red-100';
    if (l === 'medium') return 'text-amber-600 bg-amber-50 border-amber-100';
    return 'text-emerald-700 bg-emerald-50 border-emerald-100';
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const StepNode = ({ state, Icon }) => {
    const ring = 'w-10 h-10 rounded-full flex items-center justify-center';

    if (state === 'completed') {
        return (
            <div className={`${ring} bg-emerald-500 shadow-md shadow-emerald-200/70 shrink-0 z-10`}>
                <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
        );
    }
    if (state === 'active') {
        return (
            <div className="relative shrink-0 z-10">
                <div className={`${ring} bg-emerald-500 shadow-md shadow-emerald-200/70`}>
                    <Icon className="w-4 h-4 text-white" />
                </div>
                <motion.div
                    className="absolute inset-0 rounded-full border-2 border-emerald-400"
                    animate={{ scale: [1, 1.65, 1], opacity: [0.85, 0, 0.85] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                />
            </div>
        );
    }
    return (
        <div className={`${ring} bg-gray-50 border-2 border-dashed border-gray-200 shrink-0 z-10`}>
            <Icon className="w-4 h-4 text-gray-200" />
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────
// Subscribes directly to the Zustand store so it re-renders on any status change.
// Optional `ticketId` prop: looks up the specific ticket in `tickets[]`.
// Falls back to `activeTicket` if no ID is provided.

const TicketTimeline = ({ ticketId, ticket: passedTicket, className = '', forceStep }) => {
    // Reactive store subscription
    const activeTicket = useTicketStore(s => s.activeTicket);
    const tickets = useTicketStore(s => s.tickets);
    const aiTicket = useTicketStore(s => s.aiTicket);

    // Resolve which ticket to display
    const ticket = passedTicket || (ticketId
        ? (tickets.find(t => t.ticket_id === ticketId) || activeTicket)
        : (activeTicket || aiTicket));

    if (!ticket) return null;

    const activeStep = forceStep !== undefined ? forceStep : getActiveStep(ticket.status);
    const completedCount = activeStep;
    const progressPct = Math.round((completedCount / (STEPS.length - 1)) * 100);

    const getTimestamp = (idx, state) => {
        if (state === 'pending') return null;
        
        const step = STEPS[idx];
        const timeline = ticket.timeline || {};
        
        // Use specific timeline key if it exists
        if (timeline[step.timelineKey]) {
            return formatFullTimestamp(timeline[step.timelineKey]);
        }

        // Fallback or Final Resolution Handle
        if (idx === STEPS.length - 1 && (ticket.resolved_at || ticket.status === 'resolved')) {
            return formatFullTimestamp(ticket.resolved_at || ticket.updated_at);
        }

        // Final Fallback for ingestion
        if (idx === 0) return formatFullTimestamp(ticket.created_at || ticket.timestamp);
        
        return state === 'active' ? 'In progress' : 'Completed';
    };

    return (
        <div className={`bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden ${className}`}>

            {/* ════════════════════════════════════
                TICKET SUMMARY CARD
            ════════════════════════════════════ */}
            <div className="px-6 pt-6 pb-5 border-b border-gray-50">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">
                    Ticket Summary
                </h3>

                <div className="grid grid-cols-2 gap-3">
                    <SummaryField
                        Icon={Hash}
                        label="Ticket ID"
                        value={ticket.ticket_id ? `#${ticket.ticket_id}` : '—'}
                    />
                    <SummaryField
                        Icon={Flag}
                        label="Priority"
                        value={ticket.priority || '—'}
                        valueClass={`font-black text-xs px-2 py-0.5 rounded-full border ${priorityStyle(ticket.priority)}`}
                    />
                    <SummaryField
                        Icon={FolderOpen}
                        label="Category"
                        value={ticket.category || '—'}
                    />
                    <SummaryField
                        Icon={Users}
                        label="Assigned Team"
                        value={ticket.assigned_team || '—'}
                    />
                </div>
            </div>

            {/* ════════════════════════════════════
                PROGRESS HEADER
            ════════════════════════════════════ */}
            <div className="px-6 pt-5 pb-4 border-b border-gray-50">
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <p className="text-sm font-black text-gray-900">Issue Progress</p>
                        <p className="text-xs text-gray-400 font-medium mt-0.5">
                            {completedCount} of {STEPS.length} steps complete
                        </p>
                    </div>
                    <AnimatePresence mode="wait">
                        <motion.span
                            key={progressPct}
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 4 }}
                            className="text-2xl font-black text-emerald-600 tabular-nums"
                        >
                            {progressPct}%
                        </motion.span>
                    </AnimatePresence>
                </div>

                {/* Progress bar */}
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full"
                        animate={{ width: `${progressPct}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                    />
                </div>
            </div>

            {/* ════════════════════════════════════
                TIMELINE STEPS
            ════════════════════════════════════ */}
            <div className="px-6 py-6">
                {STEPS.map((step, idx) => {
                    const state = getStepState(idx, activeStep);
                    const ts = getTimestamp(idx, state);
                    const isLast = idx === STEPS.length - 1;

                    return (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -6 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.22, delay: idx * 0.05 }}
                            className="relative flex gap-5"
                        >
                            {/* Left: icon + connector */}
                            <div className="flex flex-col items-center">
                                <StepNode state={state} Icon={step.Icon} />
                                {!isLast && (
                                    <div className="w-[2px] flex-1 my-1 min-h-[36px]">
                                        <motion.div
                                            className="w-full h-full rounded-full"
                                            animate={{
                                                backgroundColor: state === 'completed' ? '#6ee7b7' : '#f1f5f4'
                                            }}
                                            transition={{ duration: 0.5 }}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Right: text */}
                            <div className={`flex-1 min-w-0 pt-1.5 ${isLast ? 'pb-0' : 'pb-8'}`}>
                                <p className={`text-sm font-black leading-none mb-1 ${state === 'pending' ? 'text-gray-250' :
                                    state === 'active' ? 'text-gray-900' :
                                        'text-gray-600'
                                    }`} style={state === 'pending' ? { color: '#d1d5db' } : undefined}>
                                    {step.title}
                                </p>

                                <p className={`text-xs font-medium leading-relaxed ${state === 'pending' ? 'text-gray-200' :
                                    state === 'active' ? 'text-gray-500' :
                                        'text-gray-400'
                                    }`}>
                                    {step.description}
                                </p>

                                {ts && (
                                    <div className="flex items-center gap-1 mt-2">
                                        <Clock className="w-3 h-3 text-gray-300 shrink-0" />
                                        <span className={`text-[10px] font-semibold tracking-wide ${state === 'active' ? 'text-emerald-500' : 'text-gray-300'
                                            }`}>
                                            {ts}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

// ─── Small helper: one summary field ─────────────────────────────────────────

const SummaryField = ({ Icon, label, value, valueClass }) => (
    <div className="flex items-start gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 mt-0.5">
            <Icon className="w-3.5 h-3.5 text-gray-400" />
        </div>
        <div className="min-w-0">
            <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-0.5">{label}</p>
            {valueClass
                ? <span className={valueClass}>{value}</span>
                : <p className="text-xs font-bold text-gray-700 truncate">{value}</p>
            }
        </div>
    </div>
);

export default TicketTimeline;
