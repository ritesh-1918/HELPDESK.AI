import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Ticket,
    AlertTriangle,
    Bot,
    Users,
    Activity,
    ShieldCheck,
    Cpu,
    Binary,
    Eye,
    Copy
} from 'lucide-react';
import useTicketStore from "../../store/ticketStore";
import useAuthStore from "../../store/authStore";
import { supabase } from "../../lib/supabaseClient";
import StatCard from "../components/StatCard";
import TicketTable from "../components/TicketTable";
import { Card, CardContent } from "../../components/ui/card";
import { formatTimelineDate } from "../../utils/dateUtils";

/**
 * AdminDashboard Page
 * Central hub for monitoring system KPIs, recent activity, and AI subsystem health.
 * Follows the high-fidelity Emerald Prime design system.
 */
const AdminDashboard = () => {
    const navigate = useNavigate();
    const [tickets, setTickets] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(true);

    const fetchStats = async () => {
        setIsLoading(true);
        try {
            let query = supabase
                .from('tickets')
                .select('*')
                .order('created_at', { ascending: false });

            const { profile } = useAuthStore.getState();
            if (profile?.role === 'admin' && profile?.company) {
                query = query.eq('company', profile.company);
            }

            const { data, error } = await query;

            if (error) throw error;
            setTickets(data || []);
        } catch (err) {
            console.error("Dashboard fetch error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        fetchStats();
        // Polling for real-time-ish updates every 30s
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, []);

    // Derived Metrics for KPI Cards
    const metrics = useMemo(() => {
        const total = tickets.length;
        const active = tickets.filter(t => !t.status?.toLowerCase()?.includes('resolv') && !t.status?.toLowerCase()?.includes('closed')).length;
        const autoResolved = tickets.filter(t => t.status?.toLowerCase()?.includes('auto')).length;
        const humanEscalated = tickets.filter(t =>
            t.status?.toLowerCase()?.includes('progress') ||
            t.status?.toLowerCase()?.includes('escalat')
        ).length;

        return { total, active, autoResolved, humanEscalated };
    }, [tickets]);

    // Dynamic AI and System Coverage Data
    const aiSubsystems = useMemo(() => {
        const totalCount = tickets.length || 1;
        const categorized = tickets.filter(t => t.category && t.category.toLowerCase() !== 'unassigned' && t.category !== 'Other').length;
        const prioritized = tickets.filter(t => t.priority).length;

        return [
            { name: 'Classifier Engine', icon: Cpu, status: categorized > 0 ? 'Active' : 'Standby', latency: `${((categorized / totalCount) * 100).toFixed(0)}% Coverage` },
            { name: 'Priority Routing', icon: Binary, status: prioritized > 0 ? 'Active' : 'Standby', latency: `${((prioritized / totalCount) * 100).toFixed(0)}% Routed` },
            { name: 'Semantic Analysis', icon: Eye, status: tickets.length > 0 ? 'Active' : 'Standby', latency: `${tickets.length} Scanned` },
            { name: 'Duplicate Detection', icon: Copy, status: 'Active', latency: 'Optimal' },
        ];
    }, [tickets]);

    return (
        <div className="space-y-10">
            {/* 1. Header Area with Global Status */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">System Overview</h1>
                    <p className="text-sm font-bold text-slate-400 mt-1 flex items-center gap-2">
                        <Activity size={14} className="text-emerald-500" /> Real-time operational telemetry active.
                    </p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-2xl">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Global Protocol Active</span>
                </div>
            </div>

            {/* 2. KPI Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <button
                    onClick={() => navigate('/admin/tickets')}
                    className="text-left group focus:outline-none"
                >
                    <StatCard
                        label="Total Tickets"
                        value={metrics.total}
                        icon={Ticket}
                        color="indigo"
                        subtitle="Lifetime generated"
                        className="group-hover:shadow-2xl group-hover:-translate-y-1 transition-all"
                    />
                </button>
                <button
                    onClick={() => navigate('/admin/tickets')}
                    className="text-left group focus:outline-none"
                >
                    <StatCard
                        label="Active Incidents"
                        value={metrics.active}
                        icon={AlertTriangle}
                        color="amber"
                        subtitle="Requires attention"
                        className="group-hover:shadow-2xl group-hover:-translate-y-1 transition-all"
                    />
                </button>
                <button
                    onClick={() => navigate('/admin/tickets?filter=auto')}
                    className="text-left group focus:outline-none"
                >
                    <StatCard
                        label="AI Auto-Resolved"
                        value={metrics.autoResolved}
                        icon={Bot}
                        color="emerald"
                        subtitle="Success without human"
                        className="group-hover:shadow-2xl group-hover:-translate-y-1 transition-all"
                    />
                </button>
                <button
                    onClick={() => navigate('/admin/tickets?filter=human')}
                    className="text-left group focus:outline-none"
                >
                    <StatCard
                        label="Human Escalations"
                        value={metrics.humanEscalated}
                        icon={Users}
                        color="red"
                        subtitle="Expert intervention"
                        className="group-hover:shadow-2xl group-hover:-translate-y-1 transition-all"
                    />
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* 3. Recent Activity (8 cols) */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-xl font-black text-slate-900 tracking-tight italic uppercase flex items-center gap-3">
                            <Activity size={24} className="text-indigo-600" /> Recent Ticket Activity
                        </h2>
                    </div>
                    <TicketTable tickets={tickets} limit={10} isLoading={isLoading} />
                </div>

                {/* 4. AI System Health (4 cols) */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="px-2 flex items-center justify-between">
                        <h2 className="text-xl font-black text-slate-900 tracking-tight italic uppercase flex items-center gap-3">
                            <Cpu size={24} className="text-emerald-600" /> AI System Health
                        </h2>
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Sync</span>
                        </div>
                    </div>
                    <Card className="border-none shadow-2xl shadow-slate-200/50 bg-white rounded-[2rem] overflow-hidden">
                        <CardContent className="p-8 space-y-6">
                            {aiSubsystems.map((sub, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100 group hover:bg-white hover:border-emerald-100 transition-all cursor-default">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-white shadow-sm border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-emerald-500 transition-colors">
                                            <sub.icon size={20} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-800 tracking-tight uppercase italic">{sub.name}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-1">Status: {sub.latency}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-full shadow-sm">
                                        <div className={`w-1.5 h-1.5 rounded-full ${sub.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
                                        <span className={`text-[9px] font-black uppercase tracking-widest ${sub.status === 'Active' ? 'text-emerald-600' : 'text-slate-400'}`}>{sub.status}</span>
                                    </div>
                                </div>
                            ))}

                            <div className="pt-4 mt-6 border-t border-slate-100 flex flex-col items-center gap-2">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] italic text-center">
                                    All AI Nodes Synchronized
                                </p>
                                <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-full border border-slate-100">
                                    <Activity size={10} className="text-slate-400" />
                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                                        Last Telemetry Sync: {formatTimelineDate(new Date())}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
