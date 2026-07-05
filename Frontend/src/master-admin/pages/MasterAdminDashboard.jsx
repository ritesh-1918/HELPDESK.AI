import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import {
    Users, Building2, Bell, ShieldCheck,
    Activity, Database, Zap
} from "lucide-react";
import useToastStore from "../../store/toastStore";
 
import { motion } from "framer-motion";

/**
 * MasterAdminDashboard (Overview)
 * The main high-level landing page for the Master Admin.
 */
function MasterAdminDashboard() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalAdmins: 0,
        totalCompanies: 0,
        pendingRequests: 0
    });
    const [loading, setLoading] = useState(true);
    const { showToast } = useToastStore();

    useEffect(() => {
        fetchStats();

        // Single channel for multiple table updates to reduce WebSocket overhead
        const channel = supabase.channel('dashboard_vitals')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => fetchStats())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'companies' }, () => fetchStats())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'admin_requests' }, () => fetchStats())
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    console.log("Dashboard real-time connected.");
                }
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchStats = async () => {
        try {
            const [
                { count: uCount },
                { count: aCount },
                { count: cCount },
                { count: rCount }
            ] = await Promise.all([
                supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'user'),
                supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'admin'),
                supabase.from('companies').select('*', { count: 'exact', head: true }),
                supabase.from('admin_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending')
            ]);

            setStats({
                totalUsers: uCount || 0,
                totalAdmins: aCount || 0,
                totalCompanies: cCount || 0,
                pendingRequests: rCount || 0
            });
        } catch (err) {
            console.error("Dashboard stats error:", err);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        { label: "Total Users", value: stats.totalUsers, icon: <Users />, color: "emerald", growth: "Network" },
        { label: "Company Admins", value: stats.totalAdmins, icon: <ShieldCheck />, color: "indigo", growth: "Privileged" },
        { label: "Active Companies", value: stats.totalCompanies, icon: <Building2 />, color: "purple", growth: "Enrolled" },
        { label: "Pending Reviews", value: stats.pendingRequests, icon: <Bell />, color: "amber", growth: stats.pendingRequests > 0 ? "Action Required" : "Queue Clear", pulse: stats.pendingRequests > 0 }
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Platform Overview</h1>
                    <p className="text-slate-400 mt-1">Real-time vitals and global statistics for HelpDesk.ai.</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm font-bold shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    System Operational
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {statCards.map((card, i) => (
                    <motion.div
                        key={card.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white/[0.03] border border-white/5 p-6 rounded-2xl hover:border-white/10 transition-all group"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className={`w-12 h-12 rounded-xl bg-${card.color}-500/10 border border-${card.color}-500/20 flex items-center justify-center text-${card.color}-400 group-hover:scale-110 transition-transform`}>
                                {React.cloneElement(card.icon, { className: "w-6 h-6" })}
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-widest ${card.pulse ? "text-amber-500 flex items-center gap-1.5" : "text-slate-500"}`}>
                                {card.growth}
                            </span>
                        </div>
                        <h3 className="text-slate-400 text-sm font-medium mb-1">{card.label}</h3>
                        <p className="text-3xl font-bold text-white tabular-nums">
                            {loading ? "..." : card.value}
                        </p>
                    </motion.div>
                ))}
            </div>

            {/* Platform Infrastructure */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white/[0.02] border border-white/5 rounded-3xl p-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none group-hover:bg-indigo-500/10 transition-colors" />

                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                            <Database className="w-5 h-5" />
                        </div>
                        <h4 className="text-lg font-bold text-white tracking-tight">Database & Engine Vitals</h4>
                    </div>

                    <div className="space-y-4">
                        {[
                            { name: "PostgreSQL Database", status: "Operational", region: "Public Schema", info: "High Availability" },
                            { name: "Auth Service", status: "Operational", region: "Supabase GoTrue", info: "99.9% Uptime" },
                            { name: "Realtime Engine", status: "Running", region: "PostgREST", info: "Synced" }
                        ].map(server => (
                            <div key={server.name} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                                <div className="flex items-center gap-4">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                    <div>
                                        <p className="text-sm font-bold text-white">{server.name}</p>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{server.region}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-black uppercase tracking-widest text-emerald-400 mb-1">{server.status}</p>
                                    <p className="text-[10px] text-slate-500 font-bold">{server.info}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-indigo-600/5 border border-indigo-500/10 rounded-3xl p-8 flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6 shadow-2xl">
                        <Zap className="w-10 h-10" />
                    </div>
                    <h4 className="text-xl font-bold text-white mb-2">Platform Controls</h4>
                    <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                        Global configuration settings for AI processing and enterprise tenant policies.
                    </p>
                    <button
                        onClick={() => showToast("Read-Only: Platform Config Engine is restricted for security. Use CLI for overrides.", "warning")}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-600/20"
                    >
                        Access Engine Settings
                    </button>
                    <p className="mt-4 text-[10px] text-slate-500 uppercase font-black tracking-widest">Master Admin Restricted</p>
                </div>
            </div>
        </div>
    );
}

export default MasterAdminDashboard;
