import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import useAuthStore from "../../store/authStore";
import useToastStore from "../../store/toastStore";
import { format } from "date-fns";
import {
    User, Mail, Phone, Briefcase, Building2, Globe, Users, Check, X,
    MoreVertical, ExternalLink, Calendar, Loader2, Info
} from "lucide-react";
 
 
import { motion, AnimatePresence } from "framer-motion";

function PendingAdminRequests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null); // id of request being processed
    const { user: masterAdmin } = useAuthStore();
    const { showToast } = useToastStore();

    useEffect(() => {
        fetchRequests();

        // Real-time subscription
        const channel = supabase
            .channel('admin_requests_changes')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'admin_requests' },
                () => fetchRequests()
            )
            .subscribe();

        return () => supabase.removeChannel(channel);
    }, []);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            // Join with profiles to get admin details
            const { data, error } = await supabase
                .from('admin_requests')
                .select(`
                    *,
                    admin:profiles!admin_id (*)
                `)
                .eq('status', 'pending')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setRequests(data || []);
        } catch (err) {
            console.error("Error fetching admin requests:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (request) => {
        setActionLoading(request.id);
        try {
            // 1. Create or Resolve Company
            let company;
            const { data: existingCompany } = await supabase
                .from('companies')
                .select('*')
                .eq('name', request.admin.company)
                .single();

            if (existingCompany) {
                console.log("Company already exists, reusing:", existingCompany.id);
                company = existingCompany;
            } else {
                const { data: newCompany, error: companyErr } = await supabase
                    .from('companies')
                    .insert([{
                        name: request.admin.company,
                        status: 'active',
                        admin_id: request.admin_id
                    }])
                    .select()
                    .single();

                if (companyErr) throw companyErr;
                company = newCompany;
            }

            // 2. Update Admin Profile
            const { error: profileErr } = await supabase
                .from('profiles')
                .update({
                    status: 'active',
                    company_id: company.id
                })
                .eq('id', request.admin_id);

            if (profileErr) throw profileErr;

            // 3. Mark Request as Approved
            const { error: requestErr } = await supabase
                .from('admin_requests')
                .update({
                    status: 'approved',
                    reviewed_by: masterAdmin.id,
                    reviewed_at: new Date().toISOString()
                })
                .eq('id', request.id);

            if (requestErr) throw requestErr;

            showToast(`Company protocol activated: ${request.admin.company} is now live.`, "success");
        } catch (err) {
            console.error("Approval flow failed:", err);
            showToast("Approval failed: " + err.message, "error");
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (request) => {
        const reason = window.prompt("Reason for rejection (optional):");
        if (reason === null) return; // User cancelled

        setActionLoading(request.id);
        try {
            // 1. Update Profile
            const { error: profileErr } = await supabase
                .from('profiles')
                .update({ status: 'rejected' })
                .eq('id', request.admin_id);

            if (profileErr) throw profileErr;

            // 2. Mark Request as Rejected
            const { error: requestErr } = await supabase
                .from('admin_requests')
                .update({
                    status: 'rejected',
                    reviewed_by: masterAdmin.id,
                    reviewed_at: new Date().toISOString()
                })
                .eq('id', request.id);

            if (requestErr) throw requestErr;

            showToast(`Administrator request for ${request.admin.full_name} rejected.`, "warning");
        } catch (err) {
            console.error("Rejection flow failed:", err);
            showToast("Rejection failed: " + err.message, "error");
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
                <p className="text-slate-400 text-sm">Loading registration queue...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Pending Admin Requests</h2>
                    <p className="text-slate-400 text-sm mt-1">Review and approve new company registration requests.</p>
                </div>
                <div className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                    <span className="text-indigo-400 font-bold">{requests.length}</span>
                    <span className="text-slate-500 text-sm ml-2 font-medium">pending Review</span>
                </div>
            </div>

            {requests.length === 0 ? (
                <div className="bg-white/[0.02] border border-dashed border-white/10 rounded-2xl p-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mx-auto mb-4">
                        <Check className="w-8 h-8 text-slate-500" />
                    </div>
                    <p className="text-slate-400 font-medium font-sans">Queue is clear! No pending requests.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <AnimatePresence mode="popLayout">
                        {requests.map((request) => (
                            <motion.div
                                key={request.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="bg-white/[0.03] border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all flex flex-col group relative"
                            >
                                {actionLoading === request.id && (
                                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10 flex items-center justify-center">
                                        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                                    </div>
                                )}

                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-white text-xl font-bold">
                                                {request.admin.full_name.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-white">{request.admin.full_name}</h3>
                                                <div className="flex items-center gap-2 text-indigo-400 text-sm font-medium">
                                                    <Briefcase className="w-3.5 h-3.5" />
                                                    {request.admin.job_title || "Company Admin"}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] uppercase font-bold tracking-wider">
                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                                                Pending Review
                                            </span>
                                            <div className="mt-2 text-slate-500 text-xs flex items-center justify-end gap-1.5 font-medium">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {format(new Date(request.created_at), 'MMM d, yyyy')}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2.5 text-sm text-slate-400">
                                                <Mail className="w-4 h-4 text-slate-500" />
                                                {request.admin.email}
                                            </div>
                                            <div className="flex items-center gap-2.5 text-sm text-slate-400">
                                                <Phone className="w-4 h-4 text-slate-500" />
                                                {request.admin.phone || "No phone provided"}
                                            </div>
                                        </div>
                                        <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                            <div className="flex items-center gap-2 text-white font-bold text-sm mb-1 uppercase tracking-tight">
                                                <Building2 className="w-4 h-4 text-emerald-400" />
                                                {request.admin.company || "Unnamed Company"}
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold flex items-center gap-2">
                                                    <Users className="w-3 h-3" />
                                                    {request.admin.company_size || "Unknown Size"} • {request.admin.industry || "General Industry"}
                                                </div>
                                                {request.admin.website && (
                                                    <a
                                                        href={request.admin.website}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-2 underline underline-offset-2 decoration-indigo-500/30"
                                                    >
                                                        <Globe className="w-3 h-3" />
                                                        {request.admin.website.replace(/^https?:\/\//, '')}
                                                        <ExternalLink className="w-2.5 h-2.5" />
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-auto border-t border-white/5 bg-white/[0.01] p-4 flex items-center justify-between gap-4">
                                    <button
                                        onClick={() => handleReject(request)}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-500/20 text-red-400 text-sm font-bold hover:bg-red-500/10 transition-all active:scale-95"
                                    >
                                        <X className="w-4 h-4" />
                                        Reject Request
                                    </button>
                                    <button
                                        onClick={() => handleApprove(request)}
                                        className="flex-[1.5] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-bold hover:bg-emerald-500 hover:text-white transition-all shadow-[0_4px_15px_rgba(16,185,129,0.1)] active:scale-95"
                                    >
                                        <Check className="w-4 h-4" />
                                        Approve & Activate
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}

export default PendingAdminRequests;
