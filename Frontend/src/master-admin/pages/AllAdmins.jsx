import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import useToastStore from "../../store/toastStore";
// eslint-disable-next-line no-unused-vars
import { format } from "date-fns";
import {
    Users, Search, UserCheck, Shield,
    Mail, Briefcase, Building2, MoreHorizontal,
    ArrowUpRight, MailQuestion, Trash2
} from "lucide-react";

function AllAdmins() {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const { showToast } = useToastStore();

    useEffect(() => {
        fetchAdmins();
    }, []);

    const fetchAdmins = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select(`
                    *,
                    company_rel:companies!company_id (name)
                `)
                .eq('role', 'admin')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setAdmins(data || []);
        } catch (err) {
            console.error("Error fetching admins:", err);
        } finally {
            setLoading(false);
        }
    };

    const filteredAdmins = admins.filter(a =>
        a.full_name?.toLowerCase().includes((searchTerm || '').toLowerCase()) ||
        (a.email || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
        a.company_rel?.name?.toLowerCase().includes((searchTerm || '').toLowerCase())
    );

    return (
        <div className="space-y-6 text-sans">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Platform Administrators</h2>
                    <p className="text-slate-400 text-sm mt-1">Global directory of all company-level administrators.</p>
                </div>

                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search admins..."
                        className="bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all w-72"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {loading ? (
                    Array(6).fill(0).map((_, i) => (
                        <div key={i} className="h-64 rounded-2xl bg-white/[0.02] border border-white/5 animate-pulse" />
                    ))
                ) : filteredAdmins.length === 0 ? (
                    <div className="col-span-full py-20 text-center">
                        <p className="text-slate-500 font-medium">No administrators found matching your search.</p>
                    </div>
                ) : (
                    filteredAdmins.map((admin) => (
                        <div key={admin.id} className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all group hover:-translate-y-1">
                            <div className="flex items-start justify-between mb-6">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-emerald-500/10 border border-white/5 flex items-center justify-center text-white text-xl font-bold shadow-inner">
                                    {admin.full_name?.charAt(0) || <Users className="w-6 h-6 text-slate-500" />}
                                </div>
                                <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${admin.status === 'active'
                                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                                    : "bg-amber-500/10 border-amber-500/20 text-amber-500"
                                    }`}>
                                    {admin.status}
                                </div>
                            </div>

                            <div className="mb-6">
                                <h3 className="text-white font-bold text-lg truncate">{admin.full_name}</h3>
                                <p className="text-slate-400 text-sm flex items-center gap-2 mb-4">
                                    <Mail className="w-3.5 h-3.5" />
                                    {admin.email}
                                </p>

                                <div className="space-y-3 pt-4 border-t border-white/5">
                                    <div className="flex items-center gap-3 text-emerald-400 text-xs font-bold uppercase tracking-tight">
                                        <Building2 className="w-4 h-4 text-emerald-500/50" />
                                        {admin.company_rel?.name || admin.company || "Independent Admin"}
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="bg-white/5 rounded-lg p-2 border border-white/5">
                                            <p className="text-[8px] text-slate-500 uppercase tracking-widest font-bold mb-0.5">Industry</p>
                                            <p className="text-[10px] text-slate-300 font-bold truncate">{admin.industry || "General"}</p>
                                        </div>
                                        <div className="bg-white/5 rounded-lg p-2 border border-white/5">
                                            <p className="text-[8px] text-slate-500 uppercase tracking-widest font-bold mb-0.5">Scale</p>
                                            <p className="text-[10px] text-slate-300 font-bold truncate">{admin.company_size || "N/A"}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-500 text-[10px] font-bold uppercase tracking-widest pt-1">
                                        <Shield className="w-3 h-3" />
                                        Platform Administrator
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => showToast("Admin protocol: Direct editing is restricted to Secure Vault. Launching proxy...", "info")}
                                    className="flex-1 py-2 rounded-xl bg-white/5 text-slate-400 text-xs font-bold hover:bg-white/10 hover:text-white transition-all"
                                >
                                    Edit Profile
                                </button>
                                <button
                                    onClick={() => {
                                        if (window.confirm(`Are you sure you want to delete admin ${admin.full_name}? This will NOT delete their company but will remove their access.`)) {
                                            showToast("Security override required for administrator deletion.", "error");
                                        }
                                    }}
                                    className="p-2 rounded-xl bg-white/5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default AllAdmins;
