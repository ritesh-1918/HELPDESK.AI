import jsPDF from 'jspdf';
import Papa from 'papaparse';
import axios from 'axios';
import { Download, FileText } from 'lucide-react';
import React, { useCallback, useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from "../../store/authStore";
import useToastStore from "../../store/toastStore";
import { supabase } from "../../lib/supabaseClient";
import { API_CONFIG } from "../../config";
import useTicketsRealtime from "../../hooks/useTicketsRealtime";
import {
    Search,
    Inbox,
    Activity,
    ShieldAlert,
    Clock,
    ArrowUpRight,
    ExternalLink,
    AlertCircle,
    Loader2,
    RotateCcw,
    Square,
    CheckSquare2,
} from 'lucide-react';
import { Select } from "../../components/ui/select";
import { formatTicketId } from "../../utils/format";
import SLABadge from "../components/SLABadge";
import { formatTimelineDate } from "../../utils/dateUtils";
import LanguageBadge from "../../components/shared/LanguageBadge";

const AdminTickets = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, profile } = useAuthStore();
    const { showToast } = useToastStore();

    // Data State
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isUpdating, setIsUpdating] = useState(null); // ID of ticket being updated

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [priorityFilter, setPriorityFilter] = useState('All');
    const [teamFilter, setTeamFilter] = useState('All');
    const [languageFilter, setLanguageFilter] = useState('All');
    const [slaAtRisk, setSlaAtRisk] = useState(false);
    const [agents, setAgents] = useState([]); // All staff/admins in the company
    const [selectedTicketIds, setSelectedTicketIds] = useState([]);
    const [bulkStatus, setBulkStatus] = useState('');
    const [bulkPriority, setBulkPriority] = useState('');
    const [bulkTeam, setBulkTeam] = useState('');
    const [bulkAgent, setBulkAgent] = useState('');
    const [bulkActionLoading, setBulkActionLoading] = useState('');
    const [bulkActionError, setBulkActionError] = useState('');

    const ticketMatchesFilters = useCallback((ticket) => {
        if (statusFilter !== 'All' && String(ticket.status || '').toLowerCase() !== statusFilter.toLowerCase()) return false;
        if (categoryFilter !== 'All' && ticket.category !== categoryFilter) return false;
        if (priorityFilter !== 'All' && String(ticket.priority || '').toLowerCase() !== priorityFilter.toLowerCase()) return false;
        if (teamFilter !== 'All' && ticket.assigned_team !== teamFilter) return false;
        if (languageFilter !== 'All') {
            const translated = ticket?.metadata?.translation?.translated;
            if (languageFilter === 'Translated' && !translated) return false;
            if (languageFilter === 'English' && translated) return false;
        }
        return true;
    }, [categoryFilter, priorityFilter, statusFilter, teamFilter, languageFilter]);

    const selectedTicketSet = useMemo(() => new Set(selectedTicketIds.map(String)), [selectedTicketIds]);

    const handleRealtimeInsert = useCallback((ticket) => {
        showToast(`New Incident Reported: #${formatTicketId(ticket.id)}`, "success");
    }, [showToast]);

    const { lastChangedTicketId } = useTicketsRealtime({
        company: profile?.company,
        enabled: Boolean(profile),
        onTicketsChange: setTickets,
        onInsert: handleRealtimeInsert,
        shouldInclude: ticketMatchesFilters,
        channelName: 'admin_tickets_realtime',
    });

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const { profile } = useAuthStore.getState();
            
            // 1. Fetch Agents for this company
            if (profile?.company) {
                const { data: agentData } = await supabase
                    .from('profiles')
                    .select('id, full_name, role')
                    .eq('company', profile.company)
                    .in('role', ['admin', 'super_admin', 'agent']);
                setAgents(agentData || []);
            }

            // 2. Fetch Tickets (Join with both Creator and Assignee)
            fetchTickets();
        } catch (err) {
            console.error("Initialization error:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchTickets = async () => {
        setError(null);
        try {
            const { profile } = useAuthStore.getState();
            
            // Join with profiles for both user_id (creator) and assigned_agent_id (assignee)
            let query = supabase
                .from('tickets')
                .select(`
                    *,
                    creator:profiles!tickets_user_id_fkey(full_name, email, profile_picture),
                    assignee:profiles!tickets_assigned_agent_id_fkey(full_name, email, profile_picture)
                `);

            if (profile?.role === 'admin' && profile?.company) {
                query = query.eq('company', profile.company);
            }

            if (statusFilter !== 'All') query = query.eq('status', statusFilter.toLowerCase());
            if (categoryFilter !== 'All') query = query.eq('category', categoryFilter);
            if (priorityFilter !== 'All') query = query.eq('priority', priorityFilter.toLowerCase());
            if (teamFilter !== 'All') query = query.eq('assigned_team', teamFilter);

            let { data, error: sbError } = await query.order('created_at', { ascending: false });

            if (sbError) {
                // Secondary check: If the FK alias fails, try a simpler select
                console.warn("Retrying fetch without relationship aliases...");
                const basicQuery = supabase.from('tickets').select('*, profiles(full_name, email)');
                const { data: basicData, error: basicError } = await basicQuery.eq('company', profile?.company).order('created_at', { ascending: false });
                if (basicError) throw basicError;
                setTickets(basicData || []);
            } else {
                setTickets(data || []);
            }
        } catch (err) {
            console.error("Admin fetch error:", err);
            setError(err.message);
        }
    };

    useEffect(() => {
        fetchInitialData();
    }, [statusFilter, categoryFilter, priorityFilter, teamFilter]);

    // Seed search from URL
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const q = params.get('q');
        if (q) setSearchQuery(decodeURIComponent(q));
    }, [location.search]);

    const handleUpdateTicket = async (id, updates) => {
        setIsUpdating(id);
        try {
            const { error: upError } = await supabase
                .from('tickets')
                .update(updates)
                .eq('id', id);

            if (upError) throw upError;

            // Optimistic update already handled if real-time is fast, 
            // but manual update ensures immediate feedback
            setTickets(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
            showToast("System synchronization successful.", "success");
        } catch (err) {
            console.error("Update failed:", err);
            showToast("Update failed: " + err.message, "error");
        } finally {
            setIsUpdating(null);
        }
    };

    const toggleTicketSelection = useCallback((ticketId) => {
        setSelectedTicketIds(prev => {
            const ticketKey = String(ticketId);
            return prev.some(id => String(id) === ticketKey)
                ? prev.filter(id => String(id) !== ticketKey)
                : [...prev, ticketId];
        });
    }, []);

    const clearTicketSelection = useCallback(() => {
        setSelectedTicketIds([]);
        setBulkStatus('');
        setBulkPriority('');
        setBulkTeam('');
        setBulkAgent('');
        setBulkActionError('');
    }, []);

    const exportTickets = (rows) => {
        const exportData = rows.map(t => ({
            ID: formatTicketId(t.id),
            Title: t.summary || t.subject || '',
            Category: t.category || '',
            Priority: t.priority || '',
            Status: t.status || '',
            'Created Date': t.created_at ? new Date(t.created_at).toLocaleString() : '',
            'Resolved Date': t.resolved_at ? new Date(t.resolved_at).toLocaleString() : '',
            'Assigned Agent': t.assignee?.full_name || '',
        }));
        const csv = Papa.unparse(exportData);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `tickets_export_${Date.now()}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const exportCSV = (rows = filteredTickets) => exportTickets(rows);

    const exportPDF = (rows = filteredTickets) => {
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text('Ticket Export Report', 14, 15);
        doc.setFontSize(8);
        let y = 25;
        rows.forEach((t, i) => {
            if (y > 270) { doc.addPage(); y = 15; }
            doc.text(
                `#${formatTicketId(t.id)} | ${t.summary || t.subject || 'N/A'} | ${t.category || ''} | ${t.priority || ''} | ${t.status || ''} | ${t.created_at ? new Date(t.created_at).toLocaleDateString() : ''}`,
                14, y
            );
            y += 7;
        });
        doc.save(`tickets_export_${Date.now()}.pdf`);
    };

    const categories = ['All', 'Network', 'Hardware', 'Software', 'Access', 'Account'];
    const priorities = ['All', 'Low', 'Medium', 'High'];
    const statuses = ['All', 'Open', 'Pending', 'In Progress', 'Resolved', 'Closed'];
    const teams = ['All', 'Software Team', 'Hardware Support', 'Network Ops', 'Security Unit', 'General Support'];

    const filteredTickets = useMemo(() => {
        let result = tickets;
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(t =>
                String(t.id).includes(q) ||
                (t.subject || '').toLowerCase().includes(q) ||
                (t.summary || '').toLowerCase().includes(q) ||
                (t.description || '').toLowerCase().includes(q) ||
                (t.profiles?.full_name || '').toLowerCase().includes(q)
            );
        }
        if (languageFilter !== 'All') {
            result = result.filter(t => {
                const translated = t.detected_language && t.detected_language.toLowerCase() !== 'en';
                return languageFilter === 'Translated' ? translated : !translated;
            });
        }
        if (slaAtRisk) {
            result = result.filter(t => {
                const s = (t.sla_status || '').toUpperCase();
                return s === 'BREACHED' || s === 'WARNING';
            });
        }
        return result;
    }, [tickets, searchQuery, languageFilter, slaAtRisk]);

    useEffect(() => {
        const visibleIds = new Set(filteredTickets.map(ticket => String(ticket.id)));
        setSelectedTicketIds((prev) => {
            const next = prev.filter(ticketId => visibleIds.has(String(ticketId)));
            if (next.length === prev.length && next.every((ticketId, index) => String(ticketId) === String(prev[index]))) {
                return prev;
            }
            return next;
        });
    }, [filteredTickets]);

    const selectedTickets = useMemo(
        () => filteredTickets.filter(ticket => selectedTicketSet.has(String(ticket.id))),
        [filteredTickets, selectedTicketSet]
    );
    const selectedCount = selectedTickets.length;
    const isAllVisibleSelected = filteredTickets.length > 0 && filteredTickets.every(ticket => selectedTicketSet.has(String(ticket.id)));
    const bulkAgentOptions = useMemo(() => [
        { value: '', label: 'Choose Agent' },
        ...agents.map(agent => ({ value: agent.id, label: agent.full_name || agent.id })),
    ], [agents]);

    const runBulkAction = async (action, value, successLabel) => {
        if (!selectedCount) {
            setBulkActionError('Select at least one ticket before applying a bulk action.');
            return;
        }
        if (!value) {
            setBulkActionError('Pick a value before applying the bulk action.');
            return;
        }

        setBulkActionError('');
        setBulkActionLoading(action);
        try {
            const { data } = await axios.post(`${API_CONFIG.BACKEND_URL}/tickets/bulk-action`, {
                ticket_ids: selectedTickets.map(ticket => ticket.id),
                action,
                value,
                company_id: profile?.company_id || profile?.company || null,
            });

            showToast(
                `${successLabel} ${data?.updated_count || selectedCount} tickets.`,
                "success"
            );
            await fetchTickets();
            clearTicketSelection();
        } catch (err) {
            const detail = err?.response?.data?.detail || err.message || 'Bulk action failed.';
            setBulkActionError(detail);
            showToast(`Bulk action failed: ${detail}`, "error");
        } finally {
            setBulkActionLoading('');
        }
    };

    const getPriorityStyle = (priority) => {
        const p = String(priority || '').toLowerCase();
        if (p === 'high' || p === 'critical') return 'text-red-600 bg-red-50 border-red-100';
        if (p === 'medium') return 'text-amber-600 bg-amber-50 border-amber-100';
        if (p === 'low') return 'text-emerald-600 bg-emerald-50 border-emerald-100';
        return 'text-slate-500 bg-slate-50 border-slate-100'; // Default
    };

    const getConfidenceColor = (conf) => {
        if (conf >= 0.8) return 'bg-emerald-500';
        if (conf >= 0.5) return 'bg-amber-500';
        return 'bg-red-500';
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* 1. Header & Utility Bar */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">Ticket Management</h1>
                    <p className="text-sm font-bold text-slate-400 mt-1 flex items-center gap-2">
                        <Activity size={14} className="text-indigo-500" /> {filteredTickets.length} tickets matching current filters.
                    </p>
                </div>

                {/* ✅ EXPORT BUTTONS */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => exportCSV(selectedCount > 0 ? selectedTickets : filteredTickets)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20"
                    >
                        <Download size={14} />
                        Export CSV
                    </button>
                    <button
                        onClick={() => exportPDF(selectedCount > 0 ? selectedTickets : filteredTickets)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg shadow-slate-900/10"
                    >
                        <FileText size={14} />
                        Export PDF
                    </button>
                </div>
            </div>

            {selectedCount > 0 && (
                <div className="rounded-[2rem] border border-emerald-200 bg-emerald-50/70 p-5 shadow-lg shadow-emerald-100/40">
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-emerald-500 flex items-center gap-2">
                                <CheckSquare2 size={13} />
                                Bulk Selection Active
                            </p>
                            <h2 className="text-lg font-black text-slate-900">
                                {selectedCount} selected ticket{selectedCount === 1 ? '' : 's'}
                            </h2>
                            <p className="text-sm text-slate-500 font-medium">
                                Apply one action to every selected ticket, then export the current selection if you need a handoff bundle.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <button
                                type="button"
                                onClick={clearTicketSelection}
                                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-800 hover:border-slate-300 transition-all"
                            >
                                <RotateCcw size={14} />
                                Clear
                            </button>
                            <button
                                type="button"
                                onClick={() => exportCSV(selectedTickets)}
                                className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-[11px] font-black uppercase tracking-widest text-emerald-700 hover:bg-emerald-600 hover:text-white transition-all"
                            >
                                <Download size={14} />
                                Export Selected
                            </button>
                        </div>
                    </div>

                    <div className="mt-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                        <div className="flex items-center gap-2 rounded-2xl border border-white bg-white/90 p-3 shadow-sm">
                            <Select
                                value={bulkStatus}
                                onChange={(e) => setBulkStatus(e.target.value)}
                                placeholder="Bulk Status"
                                buttonClassName="w-full bg-transparent border-0 px-0 py-0 text-[11px] font-black uppercase tracking-widest text-slate-700 flex items-center justify-between"
                                options={statuses.filter(s => s !== 'All').map(s => ({ value: s.toLowerCase(), label: s }))}
                            />
                            <button
                                type="button"
                                disabled={!bulkStatus || bulkActionLoading === 'status'}
                                onClick={() => runBulkAction('status', bulkStatus, 'Updated status on')}
                                className="rounded-xl bg-slate-900 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {bulkActionLoading === 'status' ? 'Applying' : 'Apply'}
                            </button>
                        </div>

                        <div className="flex items-center gap-2 rounded-2xl border border-white bg-white/90 p-3 shadow-sm">
                            <Select
                                value={bulkPriority}
                                onChange={(e) => setBulkPriority(e.target.value)}
                                placeholder="Bulk Priority"
                                buttonClassName="w-full bg-transparent border-0 px-0 py-0 text-[11px] font-black uppercase tracking-widest text-slate-700 flex items-center justify-between"
                                options={priorities.filter(p => p !== 'All').map(p => ({ value: p.toLowerCase(), label: p }))}
                            />
                            <button
                                type="button"
                                disabled={!bulkPriority || bulkActionLoading === 'priority'}
                                onClick={() => runBulkAction('priority', bulkPriority, 'Updated priority on')}
                                className="rounded-xl bg-slate-900 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {bulkActionLoading === 'priority' ? 'Applying' : 'Apply'}
                            </button>
                        </div>

                        <div className="flex items-center gap-2 rounded-2xl border border-white bg-white/90 p-3 shadow-sm">
                            <Select
                                value={bulkTeam}
                                onChange={(e) => setBulkTeam(e.target.value)}
                                placeholder="Bulk Team"
                                buttonClassName="w-full bg-transparent border-0 px-0 py-0 text-[11px] font-black uppercase tracking-widest text-slate-700 flex items-center justify-between"
                                options={teams.filter(t => t !== 'All').map(t => ({ value: t, label: t }))}
                            />
                            <button
                                type="button"
                                disabled={!bulkTeam || bulkActionLoading === 'assigned_team'}
                                onClick={() => runBulkAction('assigned_team', bulkTeam, 'Rerouted')}
                                className="rounded-xl bg-slate-900 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {bulkActionLoading === 'assigned_team' ? 'Applying' : 'Apply'}
                            </button>
                        </div>

                        <div className="flex items-center gap-2 rounded-2xl border border-white bg-white/90 p-3 shadow-sm">
                            <Select
                                value={bulkAgent}
                                onChange={(e) => setBulkAgent(e.target.value)}
                                placeholder="Bulk Agent"
                                buttonClassName="w-full bg-transparent border-0 px-0 py-0 text-[11px] font-black uppercase tracking-widest text-slate-700 flex items-center justify-between"
                                options={bulkAgentOptions}
                            />
                            <button
                                type="button"
                                disabled={!bulkAgent || bulkActionLoading === 'assigned_agent_id'}
                                onClick={() => runBulkAction('assigned_agent_id', bulkAgent, 'Assigned')}
                                className="rounded-xl bg-indigo-600 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {bulkActionLoading === 'assigned_agent_id' ? 'Applying' : 'Apply'}
                            </button>
                        </div>
                    </div>

                    {bulkActionError && (
                        <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-red-600">
                            {bulkActionError}
                        </p>
                    )}
                </div>
            )}

            {/* 2. Advanced Filtering Station */}
            <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {/* Search Field */}
                    <div className="relative group lg:col-span-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 focus:bg-white transition-all text-slate-700 placeholder:text-slate-400"
                        />
                    </div>

                    {/* Status Filter */}
                    <Select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        buttonClassName="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-[11px] font-black uppercase tracking-widest text-slate-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all text-left flex justify-between items-center"
                        options={statuses.map(s => ({ value: s, label: s === 'All' ? 'All Statuses' : s }))}
                    />

                    {/* Category Filter */}
                    <Select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        buttonClassName="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-[11px] font-black uppercase tracking-widest text-slate-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all text-left flex justify-between items-center"
                        options={categories.map(c => ({ value: c, label: c === 'All' ? 'All Categories' : c }))}
                    />

                    {/* Priority Filter */}
                    <Select
                        value={priorityFilter}
                        onChange={(e) => setPriorityFilter(e.target.value)}
                        buttonClassName="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-[11px] font-black uppercase tracking-widest text-slate-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all text-left flex justify-between items-center"
                        options={priorities.map(p => ({ value: p, label: p === 'All' ? 'All Priorities' : p }))}
                    />

                    {/* Team Filter */}
                    <Select
                        value={teamFilter}
                        onChange={(e) => setTeamFilter(e.target.value)}
                        buttonClassName="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-[11px] font-black uppercase tracking-widest text-slate-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all text-left flex justify-between items-center"
                        options={teams.map(t => ({ value: t, label: t === 'All' ? 'All Teams' : t }))}
                    />
                </div>

                {/* Combined Filter Row */}
                <div className="flex items-center gap-3">
                    <Select
                        value={languageFilter}
                        onChange={(e) => setLanguageFilter(e.target.value)}
                        buttonClassName="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-[11px] font-black uppercase tracking-widest text-slate-600 focus:outline-none focus:ring-4 focus:ring-sky-500/5 transition-all text-left flex justify-between items-center"
                        options={[
                            { value: 'All', label: '🌐 All Languages' },
                            { value: 'English', label: 'English Only' },
                            { value: 'Translated', label: 'Translated Only' },
                        ]}
                    />

                    <button
                        onClick={() => setSlaAtRisk(prev => !prev)}
                        className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest border transition-all ${
                            slaAtRisk
                                ? 'bg-red-50 border-red-200 text-red-700 shadow-sm'
                                : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-red-200 hover:text-red-600'
                        }`}
                    >
                        <ShieldAlert size={14} />
                        SLA At Risk
                        {slaAtRisk && (
                            <span className="ml-1 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[9px]">
                                {filteredTickets.length}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* 3. High-Density Data Terminal */}
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-2xl shadow-slate-200/50 overflow-hidden relative min-h-[400px]">
                {loading && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
                        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
                    </div>
                )}

                {error && (
                    <div className="p-12 text-center text-red-500 space-y-4">
                        <AlertCircle className="mx-auto w-12 h-12" />
                        <p className="font-bold uppercase tracking-widest text-xs">{error}</p>
                        <button onClick={fetchTickets} className="px-6 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">Retry</button>
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-100">
                                <th className="px-4 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (isAllVisibleSelected) {
                                                setSelectedTicketIds([]);
                                            } else {
                                                setSelectedTicketIds(filteredTickets.map(ticket => ticket.id));
                                            }
                                        }}
                                        className="inline-flex items-center justify-center text-slate-400 hover:text-emerald-600 transition-colors"
                                        title={isAllVisibleSelected ? 'Clear all visible selections' : 'Select all visible tickets'}
                                    >
                                        {isAllVisibleSelected ? <CheckSquare2 size={16} /> : <Square size={16} />}
                                    </button>
                                </th>
                                <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    <div className="flex items-center gap-2">
                                        ID
                                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                                    </div>
                                </th>
                                <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">User</th>
                                <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Subject</th>
                                <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Priority</th>
                                <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">AI Score</th>
                                <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Agent</th>
                                <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">SLA</th>
                                <th className="px-6 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredTickets.map((ticket) => {
                                const wasLiveChanged = String(lastChangedTicketId) === String(ticket.id);
                                const slaState = (ticket.sla_status || '').toUpperCase();
                                const slaRowClass =
                                    slaState === 'BREACHED' ? 'bg-red-50/60 ring-1 ring-red-100' :
                                    slaState === 'WARNING'  ? 'bg-amber-50/50 ring-1 ring-amber-100' : '';

                                return (
                                <tr key={ticket.id} className={`hover:bg-slate-50/50 transition-colors group ${wasLiveChanged ? 'bg-emerald-50/70 ring-1 ring-emerald-100' : slaRowClass} ${isUpdating === ticket.id ? 'opacity-50 pointer-events-none' : ''}`}>
                                    <td className="px-4 py-6 align-top">
                                        <button
                                            type="button"
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                toggleTicketSelection(ticket.id);
                                            }}
                                            className="inline-flex items-center justify-center text-slate-400 hover:text-emerald-600 transition-colors"
                                            title={`Select ticket #${formatTicketId(ticket.id)}`}
                                        >
                                            {selectedTicketSet.has(String(ticket.id)) ? (
                                                <CheckSquare2 size={16} className="text-emerald-600" />
                                            ) : (
                                                <Square size={16} />
                                            )}
                                        </button>
                                    </td>
                                    {/* Ticket ID */}
                                    <td className="px-6 py-6">
                                        <span className="font-mono text-xs font-black text-emerald-600">#{formatTicketId(ticket.id)}</span>
                                    </td>

                                    {/* User (Joined with Profiles) */}
                                    <td className="px-6 py-6">
                                        <div className="flex items-center gap-3">
                                            {ticket.creator?.profile_picture || ticket.profiles?.profile_picture ? (
                                                <img
                                                    src={ticket.creator?.profile_picture || ticket.profiles?.profile_picture}
                                                    alt={ticket.creator?.full_name || ticket.profiles?.full_name || 'User'}
                                                    className="w-8 h-8 rounded-lg object-cover border border-slate-100 shadow-sm"
                                                />
                                            ) : (
                                                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs border border-emerald-100/50">
                                                    {(ticket.creator?.full_name || ticket.profiles?.full_name || 'System').charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <div className="flex flex-col">
                                                <span className="text-xs font-black text-slate-800 tracking-tight italic uppercase truncate max-w-[120px]">
                                                    {ticket.creator?.full_name || ticket.profiles?.full_name || 'System'}
                                                </span>
                                                <span className="text-[10px] font-bold text-slate-400 lowercase truncate max-w-[120px]">
                                                    {ticket.creator?.email || ticket.profiles?.email || '—'}
                                                </span>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Subject */}
                                    <td className="px-6 py-6">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-slate-700 truncate max-w-[200px]" title={ticket.summary || ticket.subject}>
                                                {ticket.summary || ticket.subject}
                                            </span>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                {ticket.category} 
                                                <span className="text-[9px] font-medium text-slate-300">• {formatTimelineDate(ticket.created_at)}</span>
                                            </span>
                                            <LanguageBadge detectedLanguage={ticket?.detected_language} compact />
                                        </div>
                                    </td>

                                    {/* Priority (Editable) */}
                                    <td className="px-6 py-6">
                                        <select
                                            value={String(ticket.priority || 'medium').toLowerCase()}
                                            onChange={(e) => handleUpdateTicket(ticket.id, { priority: e.target.value })}
                                            className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider border outline-none cursor-pointer transition-all flex items-center justify-between ${getPriorityStyle(ticket.priority)}`}
                                        >
                                            {priorities.filter(p => p !== 'All').map(p => (
                                                <option key={p} value={p.toLowerCase()}>{p}</option>
                                            ))}
                                        </select>
                                    </td>

                                    {/* AI Score (Confidence) */}
                                    <td className="px-6 py-6">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-[8px] font-black
                                                ${ticket.confidence >= 0.8 ? 'border-emerald-500 text-emerald-600 bg-emerald-50' : 
                                                  ticket.confidence >= 0.5 ? 'border-amber-500 text-amber-600 bg-amber-50' : 
                                                  'border-red-500 text-red-600 bg-red-50'}`}>
                                                {(ticket.confidence * 100).toFixed(0)}%
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[8px] font-black text-slate-400 uppercase">Confidence</span>
                                                <div className="w-12 h-1 bg-slate-100 rounded-full overflow-hidden mt-0.5">
                                                    <div 
                                                        className={`h-full ${getConfidenceColor(ticket.confidence || 0)}`} 
                                                        style={{ width: `${(ticket.confidence || 0) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Assigned Team (Editable) */}
                                    <td className="px-6 py-6 text-emerald-600 font-bold text-[10px]">
                                        {ticket.assigned_team || 'General'}
                                    </td>

                                    {/* Agent Assignee (Editable) */}
                                    <td className="px-6 py-6">
                                        <div className="flex flex-col gap-1 min-w-[120px]">
                                            {ticket.assigned_agent_id ? (
                                                <select
                                                    value={ticket.assigned_agent_id}
                                                    onChange={(e) => handleUpdateTicket(ticket.id, { 
                                                        assigned_agent_id: e.target.value,
                                                        status: 'in progress'
                                                    })}
                                                    className="bg-transparent text-[10px] font-black text-indigo-600 uppercase tracking-tight italic border-none focus:ring-0 cursor-pointer hover:underline"
                                                >
                                                    {agents.map(a => (
                                                        <option key={a.id} value={a.id}>{a.full_name}</option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <button
                                                    onClick={() => handleUpdateTicket(ticket.id, { 
                                                        assigned_agent_id: user.id,
                                                        status: 'in progress'
                                                    })}
                                                    className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-indigo-100 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                                                >
                                                    Claim
                                                </button>
                                            )}
                                        </div>
                                    </td>

                                    {/* Status (Editable) */}
                                    <td className="px-6 py-6">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-1.5 h-1.5 rounded-full ${ticket.status?.toLowerCase() === 'resolved' || ticket.status?.toLowerCase() === 'closed' ? 'bg-emerald-400' : 'bg-amber-500 animate-pulse'}`}></div>
                                            <Select
                                                value={String(ticket.status || 'open').toLowerCase()}
                                                onChange={(e) => handleUpdateTicket(ticket.id, { status: e.target.value })}
                                                buttonClassName="bg-transparent text-[10px] font-black text-slate-600 uppercase tracking-widest outline-none cursor-pointer flex justify-between items-center w-full"
                                                options={statuses.filter(s => s !== 'All').map(s => ({ value: s.toLowerCase(), label: s }))}
                                            />
                                        </div>
                                    </td>

                                    {/* SLA Badge */}
                                    <td className="px-6 py-6">
                                        <SLABadge
                                            priority={ticket.priority}
                                            createdAt={ticket.created_at}
                                            slaBreachAt={ticket.sla_breach_at}
                                            slaStatus={ticket.sla_status}
                                            status={ticket.status}
                                            ticketId={ticket.id}
                                        />
                                    </td>

                                    {/* Action: Open Ticket */}
                                    <td className="px-6 py-6 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => navigate(`/admin/ticket/${ticket.id}`)}
                                                className="p-2 bg-slate-900 text-white rounded-xl hover:bg-emerald-600 transition-all shadow-lg shadow-slate-900/10 hover:shadow-emerald-500/20"
                                                title="Open Detailed View"
                                            >
                                                <ArrowUpRight size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {!loading && filteredTickets.length === 0 && (
                    <div className="py-32 text-center bg-slate-50/30 w-full flex flex-col items-center">
                        <div className="w-20 h-20 bg-white border border-slate-100 rounded-[2rem] flex items-center justify-center text-slate-200 mb-6 shadow-sm">
                            <Inbox size={40} />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tight">No Incidents Found</h3>
                        <p className="text-sm text-slate-500 font-medium max-w-xs mx-auto mt-2 italic">Refine your search parameters to view more data points.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminTickets;
