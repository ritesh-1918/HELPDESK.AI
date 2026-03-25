import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    CheckCircle2, Clock, AlertCircle, User,
    Activity, ShieldCheck, Briefcase, Globe, BarChart3,
    ImageIcon, CornerUpLeft, CheckSquare, XCircle,
    ArrowUpRight, Cpu, Binary, Eye, MessageSquare,
    ChevronDown, Save, Eraser, MoveRight, Loader2, Star
} from 'lucide-react';
import { supabase } from "../../lib/supabaseClient";
import useAuthStore from "../../store/authStore";
import useToastStore from "../../store/toastStore";
import { Card, CardContent } from "../../components/ui/card";
import { Select } from "../../components/ui/select";
import TicketChat from "../../components/shared/TicketChat";
import { formatTicketId } from "../../utils/format";
import SLABadge from "../components/SLABadge";
import { formatFullTimestamp, formatTimelineDate } from "../../utils/dateUtils";
import TicketTimeline from "../../user/components/TicketTimeline"; // Reuse the 6-step timeline

const AdminTicketDetail = () => {
    const { ticket_id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { showToast } = useToastStore();

    const [ticket, setTicket] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isReassigning, setIsReassigning] = useState(false);
    const [isCorrecting, setIsCorrecting] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState('');
    const [imageUrl, setImageUrl] = useState(null);
    const [isUpdating, setIsUpdating] = useState(null); // 'accept', 'resolve', 'reassign', 'correct'
    const [isLive, setIsLive] = useState(false);

    const [correctionForm, setCorrectionForm] = useState({
        category: '',
        subcategory: '',
        priority: ''
    });

    const fetchTicketDetail = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const { data, error: sbError } = await supabase
                .from('tickets')
                .select('*, profiles!user_id(full_name, email)')
                .eq('id', ticket_id)
                .single();

            if (sbError) throw sbError;
            if (!data) throw new Error("Incident record not found.");

            setTicket(data);
            setCorrectionForm({
                category: data.category || '',
                subcategory: data.subcategory || '',
                priority: data.priority || ''
            });

            // Parse metadata for image URL
            if (data.image_url) {
                setImageUrl(data.image_url);
            } else if (data.metadata?.capturedFileBase64) {
                setImageUrl(data.metadata.capturedFileBase64);
            }
        } catch (err) {
            console.error("Fetch detail error:", err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTicketDetail();

        // 3. Subscribe to REAL-TIME updates for THIS ticket
        const channel = supabase
            .channel(`admin_sync_${ticket_id}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'tickets',
                    filter: `id=eq.${ticket_id}`
                },
                (payload) => {
                    console.log("Admin real-time update received:", payload.new);
                    setTicket(prev => ({ ...prev, ...payload.new }));
                }
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') setIsLive(true);
                else setIsLive(false);
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [ticket_id]);


    // 2. Administrative Action Handlers
    const handleUpdate = async (updates, actionType) => {
        setIsUpdating(actionType);
        try {
            const { error: upError } = await supabase
                .from('tickets')
                .update(updates)
                .eq('id', ticket_id);

            if (upError) throw upError;
            // Real-time listener will update local state, but optimistic update is safer for UI
            setTicket(prev => ({ ...prev, ...updates }));
            showToast("System synchronization complete. Incident record updated.", "success");
        } catch (err) {
            showToast("Update failed: " + err.message, "error");
        } finally {
            setIsUpdating(null);
        }
    };

    const handleAccept = () => {
        handleUpdate({
            status: 'in progress',
            metadata: { ...ticket.metadata, accepted_by: user.id, accepted_at: new Date().toISOString() }
        }, 'accept');
    };

    const handleReassign = () => {
        if (!selectedTeam) return;
        handleUpdate({
            assigned_team: selectedTeam,
            metadata: { ...ticket.metadata, reassigned_at: new Date().toISOString() }
        }, 'reassign');
        setIsReassigning(false);
    };

    const handleSaveCorrection = () => {
        handleUpdate({
            category: correctionForm.category,
            subcategory: correctionForm.subcategory,
            priority: correctionForm.priority,
            metadata: { ...ticket.metadata, corrected_at: new Date().toISOString() }
        }, 'correct');
        setIsCorrecting(false);
    };

    const handleClose = () => {
        handleUpdate({
            status: 'resolved',
            metadata: { ...ticket.metadata, resolved_at: new Date().toISOString() }
        }, 'resolve');
    };

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
            <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mb-4" />
            <p className="text-gray-400 font-black uppercase tracking-[0.2em] italic">Accessing Neural Records...</p>
        </div>
    );

    if (error) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
            <AlertCircle className="w-16 h-16 text-red-500" />
            <h3 className="text-xl font-black text-slate-900 uppercase italic">Access Denied</h3>
            <p className="text-sm text-slate-500 max-w-xs">{error}</p>
            <button onClick={() => navigate('/admin/tickets')} className="px-6 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">Return to Base</button>
        </div>
    );

    if (!ticket) return null;

    const confidence = ticket.metadata?.confidence || 0.85;
    const entities = ticket.metadata?.entities || ticket.entities || [];
    const displaySummary = ticket.summary || ticket.subject || 'No Summary';
    const displayText = ticket.description || ticket.text || displaySummary;

    return (
        <div className="space-y-6 relative pb-20 animate-in fade-in duration-700">
            {/* 0. Sticky Action Terminal */}
            <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200 -mx-6 md:-mx-10 px-6 md:px-10 py-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/admin/tickets')}
                        className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 transition-colors"
                    >
                        <CornerUpLeft size={20} />
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-sm font-black text-slate-900 uppercase tracking-tighter italic">Inspection // #{formatTicketId(ticket.id)}</h2>
                            {isLive && (
                                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 rounded-md border border-emerald-100">
                                    <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></div>
                                    <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">Live Sync</span>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{displayStatus || 'Routing...'}</p>
                            <SLABadge priority={displayPriority} createdAt={ticket.created_at} status={displayStatus} compact />
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    {!ticket.status?.toLowerCase()?.includes('resolv') ? (
                        <>
                            {ticket.status?.toLowerCase() !== 'in progress' && (
                                <button
                                    onClick={handleAccept}
                                    disabled={!!isUpdating}
                                    className="flex-1 md:flex-none px-5 py-2.5 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isUpdating === 'accept' ? <Loader2 size={14} className="animate-spin" /> : <CheckSquare size={14} />}
                                    Accept
                                </button>
                            )}
                            <button
                                onClick={() => setIsReassigning(true)}
                                disabled={!!isUpdating}
                                className="flex-1 md:flex-none px-5 py-2.5 bg-white border border-slate-200 text-slate-700 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                            >
                                {isUpdating === 'reassign' ? <Loader2 size={14} className="animate-spin" /> : <MoveRight size={14} className="text-indigo-500" />}
                                Divert
                            </button>
                            <button
                                onClick={() => setIsCorrecting(true)}
                                disabled={!!isUpdating}
                                className="flex-1 md:flex-none px-5 py-2.5 bg-white border border-slate-200 text-slate-700 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                            >
                                {isUpdating === 'correct' ? <Loader2 size={14} className="animate-spin" /> : <Eraser size={14} className="text-amber-500" />}
                                Correct
                            </button>
                            <button
                                onClick={handleClose}
                                disabled={!!isUpdating}
                                className="flex-1 md:flex-none px-5 py-2.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-black transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-900/10 disabled:opacity-50"
                            >
                                {isUpdating === 'resolve' ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                                Resolve
                            </button>
                        </>
                    ) : (
                        <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl">
                            <CheckCircle2 size={16} className="text-emerald-500" />
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Protocol Finalized</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* 1. Primary Evidence Column (Left - 8 cols) */}
                <div className="lg:col-span-8 space-y-8">
                    {/* User Raw Message */}
                    <Card className="border-none shadow-xl shadow-slate-200/40 rounded-[2rem] overflow-hidden bg-white">
                        <div className="px-8 py-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-sm font-black text-slate-900 uppercase italic tracking-tight flex items-center gap-2">
                                <MessageSquare size={18} className="text-indigo-600" /> User Input Payload
                            </h3>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">{formatFullTimestamp(ticket.created_at)}</span>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="p-8 bg-slate-900 text-white rounded-3xl border-l-[6px] border-indigo-600 shadow-2xl shadow-slate-900/10">
                                <p className="text-lg font-medium leading-[1.6] italic">"{displayText}"</p>
                            </div>

                            {/* Artifact Visualization */}
                            {imageUrl && (
                                <div className="space-y-4">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                        <ImageIcon size={14} className="text-indigo-400" /> Visual Telemetry Record
                                    </p>
                                    <div
                                        className="rounded-3xl overflow-hidden border border-slate-100 bg-slate-50 shadow-sm transition-transform duration-700 hover:scale-[1.01] cursor-zoom-in relative group"
                                        onClick={() => window.open(imageUrl, '_blank')}
                                    >
                                        <img src={imageUrl} alt="Telemetry Evidence" className="w-full object-contain max-h-[500px]" />
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-slate-900/10 transition-opacity">
                                            <span className="bg-white/90 text-slate-900 text-xs font-bold px-4 py-2 rounded-xl shadow-lg flex items-center gap-2">
                                                <Eye size={16} /> View Full Resolution
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Collaborative Communications */}
                    <div className="h-[600px] shadow-2xl shadow-slate-200/50 rounded-[2rem] overflow-hidden border border-slate-100">
                        <TicketChat
                            ticketId={ticket.id}
                            currentUserRole="admin"
                        />
                    </div>

                    {/* Integrated Journey Timeline */}
                    <Card className="border-none shadow-xl shadow-slate-200/40 rounded-[2rem] overflow-hidden bg-white p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <Clock size={18} className="text-emerald-500" />
                            <h3 className="text-sm font-black text-slate-900 uppercase italic tracking-tight">Full Lifecycle Journey</h3>
                        </div>
                        <TicketTimeline ticket={ticket} />
                    </Card>
                </div>

                {/* 2. AI Analytics Column (Right - 4 cols) */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Neural Analytics Card */}
                    <Card className="border-none shadow-2xl shadow-slate-200/40 rounded-[2rem] overflow-hidden bg-white sticky top-24">
                        <div className="px-8 py-6 bg-slate-900 text-white flex items-center justify-between">
                            <h3 className="text-sm font-black uppercase italic tracking-tight flex items-center gap-2">
                                <Cpu size={18} className="text-emerald-400" /> Neural Insights
                            </h3>
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                        </div>
                        <div className="p-8 space-y-8">
                            {/* Summary Byte */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">AI Generated Summary</label>
                                <p className="text-xs font-bold text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100 underline-offset-4 decoration-emerald-500/30">
                                    {displaySummary}
                                </p>
                            </div>

                            {/* Classification Matrix */}
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Sector Mapping</label>
                                <div className="grid grid-cols-1 gap-3">
                                    <div className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Briefcase size={12} className="text-indigo-400" /> Category</span>
                                        <span className="text-[11px] font-black text-slate-900 uppercase italic">{ticket.category}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><BarChart3 size={12} className="text-amber-400" /> Priority</span>
                                        <span className={`text-[11px] font-black uppercase italic ${ticket.priority?.toLowerCase() === 'high' ? 'text-red-600' : 'text-slate-900'}`}>
                                            {ticket.priority}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Confidence Gauge */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Routing Confidence</label>
                                    <span className="text-xs font-black text-emerald-600">{(confidence * 100).toFixed(0)}%</span>
                                </div>
                                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className="bg-emerald-500 h-full transition-all duration-1000 shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                                        style={{ width: `${confidence * 100}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Extracted Artifacts (Entities) */}
                            {entities && entities.length > 0 && (
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Identified Entities</label>
                                    <div className="flex flex-wrap gap-2">
                                        {entities.map((e, idx) => (
                                            <span key={idx} className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase tracking-widest rounded-lg border border-indigo-100">
                                                {typeof e === 'object' ? e.text : String(e)}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* CSAT Rating Card */}
                    {ticket.csat_rating && (
                        <Card className="border-none shadow-2xl shadow-slate-200/50 bg-white rounded-[2rem] overflow-hidden">
                            <div className="px-8 py-6 bg-emerald-900 text-white flex items-center justify-between">
                                <h3 className="text-sm font-black uppercase italic tracking-tight flex items-center gap-2">
                                    <Star size={18} className="text-yellow-300 fill-yellow-300" /> Customer Satisfaction
                                </h3>
                            </div>
                            <div className="p-8 space-y-4">
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <Star
                                            key={star}
                                            className={`w-7 h-7 ${star <= ticket.csat_rating
                                                    ? 'text-yellow-400 fill-yellow-400'
                                                    : 'text-slate-200 fill-slate-200'
                                                }`}
                                        />
                                    ))}
                                </div>
                                <p className="text-xs font-black text-slate-500 uppercase tracking-widest">
                                    {['', 'Very Dissatisfied', 'Dissatisfied', 'Neutral', 'Satisfied', 'Very Satisfied'][ticket.csat_rating]}
                                </p>
                                {ticket.csat_comment && (
                                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">User Comment</p>
                                        <p className="text-sm text-slate-700 leading-relaxed italic">"{ticket.csat_comment}"</p>
                                    </div>
                                )}
                            </div>
                        </Card>
                    )}
                </div>
            </div>

            {/* Modals & Overlays */}
            {isReassigning && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
                    <Card className="w-full max-w-sm bg-white rounded-[2rem] border-none shadow-2xl p-8 space-y-6">
                        <div className="space-y-2">
                            <h3 className="text-xl font-black text-slate-900 uppercase italic">Divert Protocol</h3>
                            <p className="text-xs text-slate-400 font-medium">Reassign incident to a specialized unit.</p>
                        </div>
                        <div className="space-y-2">
                            {['Network Team', 'Hardware Team', 'Software Team', 'Account Ops'].map(team => (
                                <button
                                    key={team}
                                    onClick={() => setSelectedTeam(team)}
                                    className={`w-full text-left px-4 py-3 rounded-xl text-xs font-black uppercase transition-all border-2 ${selectedTeam === team ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-slate-50 border-transparent text-slate-600 hover:border-slate-200'}`}
                                >
                                    {team}
                                </button>
                            ))}
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button onClick={handleReassign} className="flex-1 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">Confirm</button>
                            <button onClick={() => setIsReassigning(false)} className="flex-1 py-3 bg-slate-50 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest">Abort</button>
                        </div>
                    </Card>
                </div>
            )}

            {isCorrecting && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6 text-slate-900">
                    <Card className="w-full max-w-sm bg-white rounded-[2rem] border-none shadow-2xl p-8 space-y-6 text-black">
                        <div className="space-y-2">
                            <h3 className="text-xl font-black text-slate-900 uppercase italic">Override Protocol</h3>
                            <p className="text-xs text-slate-400 font-medium">Manually correct AI classification labels.</p>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Refined Category</label>
                                <Select
                                    value={correctionForm.category}
                                    onChange={(e) => setCorrectionForm({ ...correctionForm, category: e.target.value })}
                                    buttonClassName="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-xl px-4 py-3 text-xs font-black uppercase transition-all outline-none flex justify-between items-center"
                                    options={[
                                        { value: "Network", label: "Network Ops" },
                                        { value: "Hardware", label: "Hardware Systems" },
                                        { value: "Software", label: "Cloud Applications" },
                                        { value: "Access", label: "Security & Access" }
                                    ]}
                                />
                            </div>
                            <div>
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Priority Assessment</label>
                                <Select
                                    value={correctionForm.priority}
                                    onChange={(e) => setCorrectionForm({ ...correctionForm, priority: e.target.value })}
                                    buttonClassName="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-xl px-4 py-3 text-xs font-black uppercase transition-all outline-none flex justify-between items-center"
                                    options={[
                                        { value: "Low", label: "Low Risk" },
                                        { value: "Medium", label: "Medium Incident" },
                                        { value: "High", label: "Critical Escalation" }
                                    ]}
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button onClick={handleSaveCorrection} className="flex-1 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">Save Correction</button>
                            <button onClick={() => setIsCorrecting(false)} className="flex-1 py-3 bg-slate-50 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest">Abort</button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default AdminTicketDetail;
