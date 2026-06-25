import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Clock,
  Bot,
  UserCog,
  ShieldCheck,
  Calendar,
  Zap,
  Image as ImageIcon,
  MessageSquare,
  RotateCcw,
  Loader2,
  CheckCircle2,
  History,
  Copy,
} from 'lucide-react';
import { supabase } from "../../lib/supabaseClient";
import useToastStore from "../../store/toastStore";
import { Card, CardContent } from "../../components/ui/card";
import TicketStatusBadge from "../components/TicketStatusBadge";
import TicketTimeline from "../components/TicketTimeline";
import TicketChat from "../../components/shared/TicketChat";
import { formatTicketId } from "../../utils/format";
import CSATModal from "../components/CSATModal";

const TicketDetail = () => {
    const { ticket_id } = useParams();
    const navigate = useNavigate();
    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isReopening, setIsReopening] = useState(false);
    const [showCsat, setShowCsat] = useState(false);
    const [csatHasBeenDismissed, setCsatHasBeenDismissed] = useState(false);
    const [showOriginalText, setShowOriginalText] = useState(false);
    const [copied, setCopied] = useState(false);
    const { showToast } = useToastStore();

    useEffect(() => {
        window.scrollTo(0, 0);

        const fetchInitialTicket = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${API_CONFIG.BACKEND_URL}/tickets/${ticket_id}`);
                const data = response.data;
                const error = null;

                if (error) throw error;
                if (data) {
                    setTicket({
                        ...data,
                        ticket_id: data.id,
                        text: data.description,
                        summary: data.subject,
                    });
                }
            } catch (err) {
                logger.error("Error fetching ticket:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialTicket();

        const channel = supabase
            .channel(`ticket_update_${ticket_id}`)
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'tickets',
                filter: `id=eq.${ticket_id}`
            }, (payload) => {
                setTicket(prev => ({
                    ...prev,
                    ...payload.new,
                    ticket_id: payload.new.id,
                    text: payload.new.description,
                    summary: payload.new.subject,
                }));
            })
            .on('postgres_changes', {
                event: 'DELETE',
                schema: 'public',
                table: 'tickets',
                filter: `id=eq.${ticket_id}`
            }, (payload) => {
                console.warn("Ticket was deleted:", payload.old);
                showToast('This ticket has been removed.', 'warning');
                navigate('/my-tickets');
            })
            .subscribe();

        return () => supabase.removeChannel(channel);
    }, [ticket_id]);

    useEffect(() => {
        if (ticket?.status?.toLowerCase()?.includes('resolv') && !ticket.csat_rating && !csatHasBeenDismissed) {
            const timer = setTimeout(() => setShowCsat(true), 1200);
            return () => clearTimeout(timer);
        } else {
            setShowCsat(false);
        }
    }, [ticket?.status, ticket?.csat_rating, csatHasBeenDismissed]);

    const handleReopen = async () => {
        setIsReopening(true);
        try {
            const updates = { status: 'pending_human', metadata: { ...(ticket.metadata || {}), reopened_at: new Date().toISOString() } };
            const { error: upError } = await supabase.from('tickets').update(updates).eq('id', ticket.ticket_id);
            if (upError) throw upError;
            setTicket(prev => ({ ...prev, ...updates }));
        } catch (err) {
            logger.error("Failed to reopen ticket:", err);
        } finally {
            setIsReopening(false);
        }
    };

    if (loading) return (
        <div className="flex h-screen items-center justify-center bg-slate-950">
            <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
        </div>
    );

    if (!ticket) return (
        <div className="flex flex-col items-center justify-center min-h-screen text-white p-6">
            <h2 className="text-2xl font-black font-syne uppercase tracking-wider mb-4">Ticket Matrix Not Found</h2>
            <button onClick={() => navigate('/my-tickets')} className="px-6 py-3 bg-emerald-600 rounded-xl font-bold uppercase tracking-widest text-[10px]">Return to Index</button>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-950 pb-20 pt-28 px-4 sm:px-6">
            <main className="max-w-7xl mx-auto flex flex-col gap-8">
                {/* Header Node */}
                <div className="flex flex-col gap-6">
                    <button onClick={() => navigate('/my-tickets')} className="flex items-center gap-2 text-[10px] font-black text-slate-500 dark:text-slate-400 hover:text-emerald-400 uppercase tracking-[0.2em] w-fit transition-colors">
                        <ArrowLeft size={14} /> Back to Repository
                    </button>
                    
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-white/[0.05] pb-8">
                        <div className="flex-1 space-y-3">
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono font-bold px-3 py-1 rounded-lg text-xs flex items-center gap-2">
                                    #{formatTicketId(ticket.ticket_id)}
                                    <button
                                      onClick={() => {
                                        navigator.clipboard.writeText(ticket.ticket_id);
                                        setCopied(true);
                                        setTimeout(() => setCopied(false), 2000);
                                      }}
                                      className="hover:text-emerald-300 transition-colors"
                                      title="Copy Ticket ID"
                                    >
                                      {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                                    </button>
                                </span>
                                <TicketStatusBadge status={ticket.status} />
                            </div>
                            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight font-syne italic uppercase leading-tight">
                                {ticket.summary || ticket.subject || "No Subject Payload"}
                            </h1>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Timeline & Chat */}
                    <div className="lg:col-span-2 flex flex-col gap-8">
                        <Card className="rounded-[2.5rem] border border-white/[0.08] bg-white/[0.02] p-8 shadow-2xl">
                            <h2 className="text-sm font-black text-white font-syne uppercase tracking-widest mb-8 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-emerald-400" /> Transmission Timeline
                            </h2>
                            <TicketTimeline ticket={ticket} />
                        </Card>

                        <div className="h-[500px]">
                            <TicketChat ticketId={ticket.ticket_id} currentUserRole="user" />
                        </div>
                    </div>

                    {/* Right: Metadata Panel */}
                    <div className="flex flex-col gap-6">
                        <Card className="rounded-[2.5rem] border border-white/[0.08] bg-white/[0.02] p-8 shadow-2xl space-y-8">
                            <h2 className="text-sm font-black text-white font-syne uppercase tracking-widest flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Parameter Details
                            </h2>
                            <div className="grid grid-cols-1 gap-6">
                                {[
                                    { label: 'Domain', value: ticket.category },
                                    { label: 'Urgency', value: ticket.priority },
                                    { label: 'Assigned Unit', value: ticket.assigned_team },
                                    { 
                                        label: 'Created At', 
                                        value: ticket.created_at ? new Date(ticket.created_at).toLocaleString(undefined, {
                                            year: 'numeric', month: 'short', day: 'numeric',
                                            hour: '2-digit', minute: '2-digit'
                                        }) : 'Unknown'
                                    }
                                ].map((item, i) => (
                                    <div key={i}>
                                        <p className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">{item.label}</p>
                                        <p className="text-sm font-bold text-slate-200 bg-white/[0.03] p-3 rounded-xl border border-white/[0.05]">
                                            {item.value || 'Unassigned'}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        {/* Resolution/Escalation Node */}
                        {(ticket.status?.toLowerCase().includes('resolv') || ticket.status?.toLowerCase().includes('escalat')) && (
                            <div className="p-6 rounded-[2rem] border border-white/5 bg-white/[0.02] shadow-xl">
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Resolution Override</p>
                                <button
                                    onClick={handleReopen}
                                    disabled={isReopening}
                                    className="w-full h-12 flex items-center justify-center gap-2 bg-white/5 hover:bg-rose-500/20 text-rose-400 font-black text-[10px] uppercase tracking-widest rounded-xl transition-all border border-white/10"
                                >
                                    {isReopening ? <Loader2 className="animate-spin" size={14} /> : <RotateCcw size={14} />}
                                    Reopen Incident Node
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {showCsat && (
                <CSATModal
                    ticketId={ticket.ticket_id}
                    onSubmit={() => { setShowCsat(false); setCsatHasBeenDismissed(true); }}
                    onDismiss={() => { setShowCsat(false); setCsatHasBeenDismissed(true); }}
                />
            )}
        </div>
    );
};

export default TicketDetail;
