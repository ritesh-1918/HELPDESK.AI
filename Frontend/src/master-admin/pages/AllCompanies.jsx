import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import useToastStore from "../../store/toastStore";
import { format } from "date-fns";
import {
    Building2, Search, ExternalLink, Calendar,
    Filter, MoreHorizontal, User, ShieldCheck,
    ArrowUpRight, CheckCircle2, XCircle
} from "lucide-react";

function AllCompanies() {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const { showToast } = useToastStore();

    useEffect(() => {
        fetchCompanies();

        // Real-time subscription to company changes
        const channel = supabase
            .channel('companies_table_updates')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'companies' }, () => fetchCompanies())
            .subscribe();

        return () => supabase.removeChannel(channel);
    }, []);

    const fetchCompanies = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('companies')
                .select(`
                    *,
                    admin:profiles!admin_id (full_name, email)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setCompanies(data || []);
        } catch (err) {
            console.error("Error fetching companies:", err);
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async (company) => {
        const newStatus = company.status === 'active' ? 'inactive' : 'active';
        const confirmMsg = `Are you sure you want to ${newStatus === 'active' ? 'activate' : 'deactivate'} ${company.name}?`;

        if (!window.confirm(confirmMsg)) return;

        try {
            const { error } = await supabase
                .from('companies')
                .update({ status: newStatus })
                .eq('id', company.id);

            if (error) throw error;
            showToast(`${company.name} is now ${newStatus}.`, "success");
            // fetchCompanies() is called via subscription
        } catch (err) {
            console.error("Status toggle error:", err);
            showToast("Failed to update status: " + err.message, "error");
        }
    };

    const filteredCompanies = companies.filter(c =>
        (c.name || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
        c.admin?.full_name?.toLowerCase().includes((searchTerm || '').toLowerCase()) ||
        c.admin?.email?.toLowerCase().includes((searchTerm || '').toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Enterprise Network</h2>
                    <p className="text-slate-400 text-sm mt-1">Manage all registered companies and their service status.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                        <input
                            type="text"
                            placeholder="Filter by name..."
                            className="bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all w-64"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-colors">
                        <Filter className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm shadow-xl">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/5 bg-white/[0.01]">
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Company Entity</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Administrator</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Registered Date</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.03]">
                        {loading && companies.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-12 text-center">
                                    <div className="flex flex-col items-center">
                                        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                                        <p className="text-slate-500 text-sm">Syncing with registry...</p>
                                    </div>
                                </td>
                            </tr>
                        ) : filteredCompanies.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-12 text-center text-slate-500 font-medium">
                                    No companies found matching your query.
                                </td>
                            </tr>
                        ) : (
                            filteredCompanies.map((company) => (
                                <tr key={company.id} className="hover:bg-white/[0.01] transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                                                <Building2 className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-white font-bold text-sm tracking-tight">{company.name}</p>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Tenant ID: {company.id.slice(0, 8)}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400">
                                                {company.admin?.full_name?.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-300">{company.admin?.full_name || "N/A"}</p>
                                                <p className="text-xs text-slate-500">{company.admin?.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${company.status === 'active'
                                            ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-500"
                                            : "bg-red-500/10 border border-red-500/20 text-red-500"
                                            }`}>
                                            <span className={`w-1 h-1 rounded-full ${company.status === 'active' ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`}></span>
                                            {company.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-400 font-medium">
                                        {format(new Date(company.created_at), 'MMM d, yyyy')}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => toggleStatus(company)}
                                                className={`p-2 rounded-lg transition-all ${company.status === 'active'
                                                    ? "hover:bg-red-500/10 text-slate-500 hover:text-red-400"
                                                    : "hover:bg-emerald-500/10 text-slate-500 hover:text-emerald-400"
                                                    }`}
                                                title={company.status === 'active' ? "Deactivate Company" : "Activate Company"}
                                            >
                                                {company.status === 'active' ? <XCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                                            </button>
                                            <button className="p-2 rounded-lg hover:bg-white/10 text-slate-500 hover:text-white transition-all">
                                                <ExternalLink className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex items-center justify-between px-6 py-4 bg-white/[0.01] border border-white/5 rounded-2xl">
                <p className="text-xs font-medium text-slate-500">
                    Showing <span className="text-white">{filteredCompanies.length}</span> of <span className="text-white">{companies.length}</span> registered enterprises
                </p>
                <div className="flex gap-2">
                    <button disabled className="px-4 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-bold text-slate-500 cursor-not-allowed">Previous</button>
                    <button disabled className="px-4 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-bold text-slate-500 cursor-not-allowed">Next</button>
                </div>
            </div>
        </div>
    );
}

export default AllCompanies;
