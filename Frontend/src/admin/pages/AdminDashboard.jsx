import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity } from 'lucide-react';

import useAuthStore from "../../store/authStore";
import { supabase } from "../../lib/supabaseClient";
import StatCard from "../components/StatCard";
import TicketTable from "../components/TicketTable";
import { formatTimelineDate } from "../../utils/dateUtils";

// Inline SVG icon components
const TicketIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
        <line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/>
    </svg>
);
const ActivityIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
);
const CpuIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/>
        <line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/>
        <line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/>
        <line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/>
        <line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/>
    </svg>
);
const UsersIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
);

// AI subsystem icons
const ClassifierIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
    </svg>
);
const PriorityIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
        <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
    </svg>
);
const SemanticIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
    </svg>
);
const DuplicateIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="8" y="8" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
    </svg>
);

const aiIconMap = [
    { icon: <ClassifierIcon />, bg: '#F0FDF4', color: '#16a34a' },
    { icon: <PriorityIcon />, bg: '#EFF6FF', color: '#3b82f6' },
    { icon: <SemanticIcon />, bg: '#F5F0FF', color: '#8b5cf6' },
    { icon: <DuplicateIcon />, bg: '#FFF7ED', color: '#f97316' },
];

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { profile } = useAuthStore();
    const [tickets, setTickets] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        if (profile) {
            const fetchStats = async () => {
                setIsLoading(true);
                try {
                    let query = supabase
                        .from('tickets')
                        .select(`
                    *,
                    creator:profiles!tickets_user_id_fkey(full_name, email, profile_picture)
                `)
                        .order('created_at', { ascending: false });
                    if (profile?.role === 'admin' && profile?.company) query = query.eq('company', profile.company);
                    const { data, error } = await query;
                    if (error) {
                        // Secondary check: If the relation fails, try a simpler select
                        console.warn("Retrying dashboard fetch without relation...", error);
                        const { data: basicData, error: basicError } = await supabase.from('tickets').select('*').eq('company', profile?.company).order('created_at', { ascending: false });
                        if (basicError) throw basicError;
                        setTickets(basicData || []);
                    } else {
                        setTickets(data || []);
                    }
                } catch (err) { console.error("Dashboard fetch error:", err); }
                finally { setIsLoading(false); }
            };

            fetchStats();
            const interval = setInterval(fetchStats, 30000);
            return () => clearInterval(interval);
        }
    }, [profile]);

    const metrics = useMemo(() => {
        const total = tickets.length;
        const active = tickets.filter(t => !t.status?.toLowerCase()?.includes('resolv') && !t.status?.toLowerCase()?.includes('closed')).length;
        const autoResolved = tickets.filter(t => t.status?.toLowerCase()?.includes('auto')).length;
        const humanEscalated = tickets.filter(t => t.status?.toLowerCase()?.includes('progress') || t.status?.toLowerCase()?.includes('escalat')).length;
        return { total, active, autoResolved, humanEscalated };
    }, [tickets]);

    const aiSubsystems = useMemo(() => {
        const totalCount = tickets.length || 1;
        const categorized = tickets.filter(t => t.category && t.category.toLowerCase() !== 'unassigned' && t.category !== 'Other').length;
        const prioritized = tickets.filter(t => t.priority).length;
        return [
            { name: 'Classifier Engine', status: categorized > 0 ? 'Active' : 'Standby', latency: `${((categorized / totalCount) * 100).toFixed(0)}% Coverage` },
            { name: 'Priority Routing', status: prioritized > 0 ? 'Active' : 'Standby', latency: `${((prioritized / totalCount) * 100).toFixed(0)}% Routed` },
            { name: 'Semantic Analysis', status: tickets.length > 0 ? 'Active' : 'Standby', latency: `${tickets.length} Scanned` },
            { name: 'Duplicate Detection', status: 'Active', latency: 'Optimal' },
        ];
    }, [tickets]);

    return (
        <div style={{ background: '#f8faf9', minHeight: '100vh', paddingBottom: '40px' }} className="space-y-10 -m-6 p-6 md:-m-10 md:p-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '24px', fontWeight: 800, color: '#0f1f12', letterSpacing: '-0.02em', margin: 0 }}>
                        Dashboard
                    </h1>
                    <p style={{ color: '#6b7280', fontSize: '13px', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }}></span>
                        Real-time updates active
                    </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 16px', background: '#F0FDF4', border: '1.5px solid #BBF7D0', borderRadius: '100px' }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block', animation: 'pulse-dot 2s infinite' }}></span>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#15803d', letterSpacing: '0.08em', textTransform: 'uppercase' }}>System Active</span>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <button onClick={() => navigate('/admin/tickets')} className="text-left group focus:outline-none">
                    <StatCard label="Total Tickets" value={metrics.total} color="indigo" subtitle="Lifetime generated" customIcon={<TicketIcon />} />
                </button>
                <button onClick={() => navigate('/admin/tickets')} className="text-left group focus:outline-none">
                    <StatCard label="Active Tickets" value={metrics.active} color="amber" subtitle="Need attention" customIcon={<ActivityIcon />} />
                </button>
                <button onClick={() => navigate('/admin/tickets?filter=auto')} className="text-left group focus:outline-none">
                    <StatCard label="AI Auto-Resolved" value={metrics.autoResolved} color="emerald" subtitle="Resolved by AI" customIcon={<CpuIcon />} />
                </button>
                <button onClick={() => navigate('/admin/tickets?filter=human')} className="text-left group focus:outline-none">
                    <StatCard label="Escalated Tickets" value={metrics.humanEscalated} color="red" subtitle="Requires support agent" customIcon={<UsersIcon />} />
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Recent Activity */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '15px', fontWeight: 700, color: '#0f1f12', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                            Recent Tickets
                        </h2>
                    </div>
                    <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #f0fdf4', boxShadow: '0 2px 16px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                        <TicketTable tickets={tickets} limit={10} isLoading={isLoading} />
                    </div>
                </div>

                {/* AI System Health */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="px-2 flex items-center justify-between">
                        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '15px', fontWeight: 700, color: '#0f1f12', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>
                            AI Status
                        </h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '100px', padding: '3px 10px' }}>
                            <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e', display: 'inline-block', animation: 'pulse-dot 2s infinite' }}></span>
                            <span style={{ fontSize: '10px', fontWeight: 700, color: '#15803d' }}>LIVE SYNC</span>
                        </div>
                    </div>
                    <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #f0fdf4', padding: '24px' }}>
                        <div className="space-y-4">
                            {aiSubsystems.map((sub, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 transition-all cursor-default hover:bg-white hover:border-green-100" style={{ background: '#f8faf9' }}>
                                    <div className="flex items-center gap-3">
                                        <div style={{ background: aiIconMap[idx].bg, color: aiIconMap[idx].color, width: 36, height: 36, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {aiIconMap[idx].icon}
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '13px', fontWeight: 600, color: '#111827', margin: 0 }}>{sub.name}</p>
                                            <p style={{ fontSize: '11px', color: '#6b7280', marginTop: '1px' }}>Status: {sub.latency}</p>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '3px 10px', background: sub.status === 'Active' ? '#dcfce7' : '#f3f4f6', color: sub.status === 'Active' ? '#15803d' : '#6b7280', border: sub.status === 'Active' ? '1px solid #bbf7d0' : '1px solid #e5e7eb', borderRadius: '100px' }}>
                                        <div style={{ width: 5, height: 5, borderRadius: '50%', background: sub.status === 'Active' ? '#22c55e' : '#9ca3af' }}></div>
                                        <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }}>{sub.status}</span>
                                    </div>
                                </div>
                            ))}
                            <div className="pt-4 mt-4 border-t border-gray-100 flex flex-col items-center gap-2">
                                <p style={{ fontSize: '10px', color: '#9ca3af', letterSpacing: '0.14em', fontWeight: 600, textTransform: 'uppercase' }}>All systems operating normally</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', background: '#f8faf9', borderRadius: '100px', border: '1px solid #e5e7eb' }}>
                                    <Activity size={10} color="#9ca3af" />
                                    <span style={{ fontSize: '9px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                        Last Synced: {formatTimelineDate(new Date())}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pulse dot animation */}
            <style>{`
                @keyframes pulse-dot {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.4); opacity: 0.7; }
                }
            `}</style>
        </div>
    );
};

export default AdminDashboard;
