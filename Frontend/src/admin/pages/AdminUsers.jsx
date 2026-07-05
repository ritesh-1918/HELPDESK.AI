import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useToastStore from '../../store/toastStore';
import {
    Users, Search, ShieldCheck, Zap, Activity, MoreVertical, Eye, Trash2,
    UserX, UserCheck, AlertTriangle, Clock, Mail, Hash, X, User as UserIcon, Loader2
} from 'lucide-react';
import { supabase } from "../../lib/supabaseClient";
import useAuthStore from "../../store/authStore";
import StatCard from '../components/StatCard';
import { Card } from "../../components/ui/card";
import { Select } from "../../components/ui/select";

const AdminUsers = () => {
// eslint-disable-next-line no-unused-vars
    const navigate = useNavigate();
    const { user: currentUser, profile: currentProfile } = useAuthStore();
    const { showToast } = useToastStore();

    // Data State
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [_error, setError] = useState(null);
 
    const [isProcessing, setIsProcessing] = useState(null); // ID of user being updated

    const [searchQuery, setSearchQuery] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userToAction, setUserToAction] = useState(null);

    const [activeTab, setActiveTab] = useState('active'); // 'active' | 'pending'
    const [pendingRequests, setPendingRequests] = useState([]);

    // Modals state
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [activeProfile, setActiveProfile] = useState(null);

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            // 0. EXTREME SELF-HEALING: Sync profile and auto-repair broken accounts
            let activeCompanyId = currentProfile?.company_id;
            let activeCompanyName = currentProfile?.company;

            if (currentUser) {
                let { data: freshProfile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', currentUser.id)
                    .single();

                // If profile is completely missing from public.profiles, create it now!
                if (!freshProfile) {
                    console.warn("⚠️ Local profile missing from DB. Initiating Emergency Repair for:", currentUser.email);
                    const { data: repaired, error: repairErr } = await supabase
                        .from('profiles')
                        .insert([{
                            id: currentUser.id,
                            email: currentUser.email,
                            full_name: currentUser.user_metadata?.full_name || 'Admin',
                            role: currentUser.user_metadata?.role || 'admin',
                            status: 'active',
                            company: currentUser.user_metadata?.company || 'RITESH PVT LTD'
                        }])
                        .select()
                        .single();

                    if (!repairErr) freshProfile = repaired;
                    else console.error("Identity repair failed:", repairErr);
                }

                if (freshProfile) {
                    // Try to resolve company_id if it's missing but we have a name
                    if (!freshProfile.company_id && freshProfile.company) {
                        const { data: comp } = await supabase
                            .from('companies')
                            .select('id')
                            .eq('name', freshProfile.company)
                            .single();

                        if (comp) {
                            await supabase
                                .from('profiles')
                                .update({ company_id: comp.id })
                                .eq('id', currentUser.id);
                            freshProfile.company_id = comp.id;
                        }
                    }

                    activeCompanyId = freshProfile.company_id;
                    activeCompanyName = freshProfile.company;
                    useAuthStore.setState({ profile: freshProfile });
                }
            }

            console.log("Admin session synchronized. Company ID:", activeCompanyId, "Name:", activeCompanyName);

            // 1. Fetch ACTIVE users
            let query = supabase.from('profiles').select('*').eq('status', 'active');

            if (activeCompanyId) {
                query = query.eq('company_id', activeCompanyId);
            } else if (activeCompanyName) {
                query = query.eq('company', activeCompanyName);
            } else {
                setUsers([]);
                setLoading(false);
                return;
            }

            const { data, error: sbError } = await query.order('created_at', { ascending: false });
            if (sbError) throw sbError;
            setUsers(data || []);

            // 2. Fetch PENDING entities (Profile-based status lookup below handles all pending users)
            let allPending = [];

            // Path B: Direct profile lookup (Ensure Anjali is visible even if request row failed)
            let profileQuery = supabase.from('profiles')
                .select('*')
                .eq('status', 'pending_approval');

            // Inclusion Logic: Find any user that matches our ID OR our Name
            if (activeCompanyId && activeCompanyName) {
                profileQuery = profileQuery.or(`company_id.eq.${activeCompanyId},company.eq."${activeCompanyName}"`);
            } else if (activeCompanyId) {
                profileQuery = profileQuery.eq('company_id', activeCompanyId);
            } else if (activeCompanyName) {
                profileQuery = profileQuery.eq('company', activeCompanyName);
            }

            const { data: profData } = await profileQuery;

            if (profData) {
                profData.forEach(p => {
                    const alreadyPresent = allPending.some(r => r.user_id === p.id);
                    if (!alreadyPresent) {
                        allPending.push({
                            id: `p-${p.id}`,
                            user_id: p.id,
                            company_id: p.company_id || activeCompanyId, // Auto-associate with admin's company
                            status: 'pending',
                            created_at: p.created_at,
                            user: p,
                            isManual: true
                        });
                    }
                });
            }
            setPendingRequests(allPending);
        } catch (err) {
            console.error("Admin user sync error:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
     
    }, []);

 
    const handleUpdateRole = async (userId, newRole) => {
        setIsProcessing(userId);
        try {
            const { error: upError } = await supabase
                .from('profiles')
                .update({ role: newRole })
                .eq('id', userId);

            if (upError) throw upError;
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
            if (activeProfile?.id === userId) setActiveProfile(prev => ({ ...prev, role: newRole }));
            showToast(`Protocol: Security clearance updated to ${newRole}.`, "success");
        } catch (err) {
            showToast("Update failed: " + err.message, "error");
        } finally {
            setIsProcessing(null);
        }
    };

    const handleDeleteUser = async () => {
        if (!userToAction) return;
        setIsProcessing(userToAction.id);
        try {
            // Note: This only deletes the profile record. 
            // Deleting the Auth user requires Admin API (service role).
            const { error: delError } = await supabase
                .from('profiles')
                .delete()
                .eq('id', userToAction.id);

            if (delError) throw delError;
            setUsers(prev => prev.filter(u => u.id !== userToAction.id));
            setShowDeleteModal(false);
            setUserToAction(null);
            if (activeProfile?.id === userToAction.id) setShowProfileModal(false);
            showToast("User record purged from active directory.", "success");
        } catch (err) {
            showToast("Deletion failed: " + err.message, "error");
        } finally {
            setIsProcessing(null);
        }
    };

    const handleApproveUser = async (request) => {
        setIsProcessing(request.id);

        try {
            // 1. Resolve Company ID with high redundancy
            let targetCompanyId = currentProfile?.company_id || request.company_id;

            // Deep fetch if still missing — ensures we aren't blocked by stale local state
            if (!targetCompanyId && currentUser) {
                console.log("⚠️ Target Company ID missing in state, reaching out to database...");
                const { data: freshProfile, error: _profileFetchErr } = await supabase
                    .from('profiles')
                    .select('company_id, company')
 
                    .eq('id', currentUser.id)
                    .single();

                if (freshProfile?.company_id) {
                    targetCompanyId = freshProfile.company_id;
                    // Update store in background for future actions
                    useAuthStore.setState({ profile: { ...currentProfile, ...freshProfile } });
                } else if (freshProfile?.company) {
                    // Final fallback: Find company by name
                    const { data: compData } = await supabase
                        .from('companies')
                        .select('id')
                        .eq('name', freshProfile.company)
                        .single();
                    if (compData) targetCompanyId = compData.id;
                }
            }

            console.log("🚀 Initiating approval for:", request.user_id, "Company ID:", targetCompanyId);

            if (!targetCompanyId) {
                console.error("❌ Critical: Could not resolve Company Association.");
                throw new Error("Security Protocol Error: Your administrator account is not linked to a registered company. Please contact support.");
            }

            // 2. Perform the update
            const { data: updateResult, error: profileErr } = await supabase
                .from('profiles')
                .update({
                    status: 'active',
                    company_id: targetCompanyId
                })
                .eq('id', request.user_id)
                .select(); // Requesting data back to confirm it worked

            if (profileErr) {
                console.error("Supabase Profile Update Error:", profileErr);
                throw profileErr;
            }

            console.log("✅ Profile updated successfully:", updateResult);

            // 3. Log the request audit (Non-blocking)
            if (!request.isManual) {
                const { error: requestErr } = await supabase
                    .from('user_requests')
                    .update({
                        status: 'approved',
                        reviewed_by: currentUser.id,
                        reviewed_at: new Date().toISOString()
                    })
                    .eq('id', request.id);
                if (requestErr) console.warn("Audit log update failed:", requestErr.message);
            }

            // 4. Send notification (Non-blocking)
            supabase.functions.invoke('send-user-approval-email', {
                body: {
                    userId: request.user_id,
                    email: request.user?.email,
                    name: request.user?.full_name,
                    company: request.user?.company || currentProfile?.company
                }
            });

            // Re-fetch UI
            await fetchUsers();
            showToast(`Protocol: Identity verified. ${request.user?.full_name} is now active.`, "success");
        } catch (err) {
            console.error("Critical Approval Failure:", err);
            showToast("Approval failed: " + err.message, "error");
        } finally {
            setIsProcessing(null);
        }
    };

    const handleRejectUser = async (request) => {
        if (!window.confirm(`Are you sure you want to reject ${request.user?.full_name || 'this user'}?`)) return;
        setIsProcessing(request.id);
        try {
            // 1. Update Profile
            const { error: profileErr } = await supabase
                .from('profiles')
                .update({ status: 'rejected' })
                .eq('id', request.user_id);
            if (profileErr) throw profileErr;

            // 2. Mark Request as Rejected (Only if real record)
            if (!request.isManual) {
                const { error: requestErr } = await supabase
                    .from('user_requests')
                    .update({
                        status: 'rejected',
                        reviewed_by: currentUser.id,
                        reviewed_at: new Date().toISOString()
                    })
                    .eq('id', request.id);
                if (requestErr) console.warn("Request log rejection failed:", requestErr.message);
            }

            // Remove from local state
            setPendingRequests(prev => prev.filter(r => r.id !== request.id));
            showToast(`Access request rejected.`, "warning");
        } catch (err) {
            showToast("Rejection failed: " + err.message, "error");
        } finally {
            setIsProcessing(null);
        }
    };

    // 1. Filter Logic
    const filteredUsers = useMemo(() => {
        return users.filter(user =>
            (user.full_name || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
            (user.email || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
            (user.role || '').toLowerCase().includes((searchQuery || '').toLowerCase())
        );
    }, [users, searchQuery]);

    const stats = useMemo(() => ({
        total: users.length,
        admins: users.filter(u => u.role === 'admin').length,
        pending: pendingRequests.length
    }), [users, pendingRequests]);

    // 2. Lifecycle Action Handlers
    const confirmDelete = (user) => {
        setUserToAction(user);
        setShowDeleteModal(true);
    };

    const openProfile = (user) => {
        setActiveProfile(user);
        setShowProfileModal(true);
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
            <p className="text-slate-400 font-black uppercase tracking-widest italic">Loading directory...</p>
        </div>
    );

    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-[12px] font-black text-indigo-600 uppercase tracking-[0.3em] mb-2 flex items-center gap-2">
                        <ShieldCheck size={12} /> Access Control
                    </h2>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none uppercase italic">User Directory.</h1>
                    <p className="text-slate-500 font-medium mt-2">Manage your team members and their roles here.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={fetchUsers}
                        className="p-4 bg-slate-100 text-slate-600 rounded-2xl hover:bg-slate-200 transition-all flex items-center justify-center"
                        title="Refresh Data"
                    >
                        <Zap size={20} className={loading ? "animate-pulse" : ""} />
                    </button>
                </div>
            </div>


            {/* Metrics Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    label="Total Users"
                    value={stats.total}
                    subtitle="Registered system accounts"
                    icon={Users}
                    color="slate"
                />
                <StatCard
                    label="Administrators"
                    value={stats.admins}
                    subtitle="Full administrative access"
                    icon={ShieldCheck}
                    color="indigo"
                />
                <StatCard
                    label="Pending Requests"
                    value={stats.pending}
                    subtitle="New signup requests"
                    icon={Clock}
                    color={stats.pending > 0 ? "amber" : "slate"}
                />
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-slate-200">
                <button
                    className={`pb-3 px-4 font-bold text-sm tracking-wide transition-colors border-b-2 ${activeTab === 'active' ? 'text-indigo-600 border-indigo-600' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
                    onClick={() => setActiveTab('active')}
                >
                    All Users
                </button>
                <button
                    className={`pb-3 px-4 font-bold text-sm tracking-wide transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'pending' ? 'text-amber-600 border-amber-600' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
                    onClick={() => setActiveTab('pending')}
                >
                    Pending Requests
                    {stats.pending > 0 && <span className="bg-amber-100 text-amber-600 text-[10px] px-2 py-0.5 rounded-full">{stats.pending}</span>}
                </button>
            </div>

            {/* Terminal Interface */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/40 overflow-hidden">
                {activeTab === 'active' ? (
                    <>
                        <div className="p-8 border-b border-slate-100 bg-slate-50/30">
                            <div className="relative group max-w-md">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search by name, email, or role..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-3 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all text-slate-700"
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50">
                                        <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">User ID</th>
                                        <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">User</th>
                                        <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Role</th>
                                        <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Joined On</th>
                                        <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filteredUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2">
                                                    <Hash size={12} className="text-slate-300" />
                                                    <span className="font-mono text-[11px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">
                                                        {user.id.slice(0, 8)}...
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    {user.profile_picture ? (
                                                        <img
                                                            src={user.profile_picture}
                                                            alt={user.full_name || 'User'}
                                                            className="w-10 h-10 rounded-xl object-cover border border-slate-100 shadow-sm"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-black text-sm group-hover:bg-white group-hover:shadow-sm transition-all border border-transparent group-hover:border-slate-100">
                                                            {user.full_name?.charAt(0) || '?'}
                                                        </div>
                                                    )}
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-black text-slate-800 tracking-tight italic uppercase">{user.full_name || 'Unnamed User'}</span>
                                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 lowercase">
                                                            <Mail size={10} /> {user.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <Select
                                                    value={user.role}
                                                    disabled={isProcessing === user.id || user.id === currentUser?.id}
                                                    onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                                                    buttonClassName={`flex items-center justify-between px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border bg-transparent outline-none cursor-pointer transition-all ${user.role === 'admin' ? 'border-indigo-200 text-indigo-600' : 'border-slate-200 text-slate-500'} ${isProcessing === user.id || user.id === currentUser?.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    options={[
                                                        { value: "user", label: "User" },
                                                        { value: "admin", label: "Admin" }
                                                    ]}
                                                />
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2 text-[11px] font-black text-slate-500 uppercase italic">
                                                    <Clock size={12} className="text-slate-300" />
                                                    {new Date(user.created_at).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => openProfile(user)}
                                                        className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 text-slate-400 rounded-xl hover:text-indigo-600 hover:border-indigo-100 hover:bg-indigo-50 transition-all shadow-sm"
                                                        title="View Profile"
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => confirmDelete(user)}
                                                        disabled={isProcessing === user.id || user.id === currentUser?.id}
                                                        className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 text-slate-400 rounded-xl hover:text-red-600 hover:border-red-100 hover:bg-red-50 transition-all shadow-sm disabled:opacity-30"
                                                        title="Permanent Delete"
                                                    >
                                                        {isProcessing === user.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {filteredUsers.length === 0 && (
                            <div className="py-24 text-center">
                                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 mx-auto mb-4">
                                    <Users size={32} />
                                </div>
                                <h3 className="text-lg font-black text-slate-900 uppercase italic">No users found</h3>
                                <p className="text-sm text-slate-400 font-medium italic mt-1">Adjust search query to find who you're looking for.</p>
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        {/* Pending Requests Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50">
                                        <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Request ID</th>
                                        <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">User</th>
                                        <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Requested On</th>
                                        <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {pendingRequests.map((request) => (
                                        <tr key={request.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2">
                                                    <Hash size={12} className="text-slate-300" />
                                                    <span className="font-mono text-[11px] font-black text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">
                                                        {request.id.slice(0, 8)}...
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    {request.user?.profile_picture ? (
                                                        <img
                                                            src={request.user.profile_picture}
                                                            alt={request.user.full_name || 'User'}
                                                            className="w-10 h-10 rounded-xl object-cover border border-slate-100 shadow-sm"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 font-black text-sm group-hover:bg-white border border-transparent group-hover:border-amber-200 transition-all">
                                                            {request.user?.full_name?.charAt(0) || '?'}
                                                        </div>
                                                    )}
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-black text-slate-800 tracking-tight italic uppercase">{request.user?.full_name || 'Unnamed User'}</span>
                                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 lowercase">
                                                            <Mail size={10} /> {request.user?.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2 text-[11px] font-black text-slate-500 uppercase italic">
                                                    <Clock size={12} className="text-slate-300" />
                                                    {new Date(request.created_at).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => handleRejectUser(request)}
                                                        disabled={isProcessing === request.id}
                                                        className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 text-slate-400 rounded-xl hover:text-red-600 hover:border-red-100 hover:bg-red-50 transition-all shadow-sm disabled:opacity-30"
                                                        title="Reject Request"
                                                    >
                                                        {isProcessing === request.id ? <Loader2 size={18} className="animate-spin" /> : <X size={18} />}
                                                    </button>
                                                    <button
                                                        onClick={() => handleApproveUser(request)}
                                                        disabled={isProcessing === request.id}
                                                        className="flex flex-1 max-w-[120px] items-center justify-center gap-2 bg-emerald-50 text-emerald-600 border border-emerald-200 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-500 hover:text-white transition-all shadow-sm py-2 px-3 disabled:opacity-30"
                                                        title="Approve User"
                                                    >
                                                        {isProcessing === request.id ? <Loader2 size={14} className="animate-spin" /> : <UserCheck size={14} />} Approve
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {pendingRequests.length === 0 && (
                            <div className="py-24 text-center">
                                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 mx-auto mb-4">
                                    <ShieldCheck size={32} />
                                </div>
                                <h3 className="text-lg font-black text-slate-900 uppercase italic">Queue is clear</h3>
                                <p className="text-sm text-slate-400 font-medium italic mt-1">No pending user requests found for your organization.</p>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Profile Detail Modal */}
            {showProfileModal && activeProfile && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex justify-end p-0 md:p-6 animate-in fade-in duration-300">
                    <div className="w-full md:w-3/4 max-w-2xl bg-white md:rounded-[2.5rem] border-none shadow-2xl h-full flex flex-col animate-in slide-in-from-right-10 duration-300">
                        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50 md:rounded-t-[2.5rem]">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 border border-indigo-200">
                                    <UserIcon size={28} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tight">{activeProfile.full_name}</h3>
                                    <p className="text-sm font-bold text-slate-500 flex items-center gap-2">
                                        <Mail size={14} /> {activeProfile.email}
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setShowProfileModal(false)} className="text-slate-400 hover:text-slate-600 bg-white shadow-sm p-3 rounded-xl border border-slate-200 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-8">
                            {/* User Info */}
                            <div>
                                <h4 className="text-[11px] font-black text-indigo-600 uppercase tracking-widest mb-4">Entity Metadata</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-1">System Hash / UUID</span>
                                        <span className="text-[11px] font-mono font-black text-slate-800 break-all">{activeProfile.id}</span>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-1">Assigned Role</span>
                                        <span className={`text-xs font-black uppercase tracking-widest ${activeProfile.role === 'admin' ? 'text-indigo-600' : 'text-slate-600'}`}>
                                            {activeProfile.role}
                                        </span>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-1">Joined Terminal</span>
                                        <span className="text-xs font-black text-slate-800 uppercase italic">{new Date(activeProfile.created_at).toLocaleString()}</span>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-1">Status</span>
                                        <span className="text-xs font-black text-emerald-500 uppercase tracking-widest">Authorized</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Profile Actions */}
                        <div className="p-6 border-t border-slate-100 bg-slate-50 md:rounded-b-[2.5rem] flex gap-3">
                            <button
                                onClick={() => handleUpdateRole(activeProfile.id, activeProfile.role === 'admin' ? 'user' : 'admin')}
                                disabled={activeProfile.id === currentUser?.id}
                                className="flex-1 py-4 bg-white border border-slate-200 text-slate-700 font-black rounded-2xl hover:bg-slate-50 transition-all text-xs uppercase tracking-widest shadow-sm flex items-center justify-center gap-2 disabled:opacity-30"
                            >
                                <ShieldCheck size={16} className="text-indigo-500" />
                                {activeProfile.role === 'admin' ? "Demote to User" : "Elevate to Admin"}
                            </button>
                            <button
                                onClick={() => confirmDelete(activeProfile)}
                                disabled={activeProfile.id === currentUser?.id}
                                className="flex-1 py-4 bg-red-50 text-red-600 font-black rounded-2xl hover:bg-red-100 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-sm disabled:opacity-30"
                            >
                                <Trash2 size={16} /> Purge Record
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <Card className="w-full max-w-sm bg-white rounded-[2.5rem] border-none shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 text-center space-y-6">
                            <div className="w-20 h-20 bg-red-50 rounded-[2rem] flex items-center justify-center text-red-500 mx-auto border-4 border-white shadow-lg ring-8 ring-red-50">
                                <AlertTriangle size={40} />
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tight">Purge User?</h3>
                                <p className="text-sm text-slate-500 font-medium px-4 leading-relaxed">
                                    You are about to permanently delete <span className="font-black text-red-600 italic">@{userToAction?.full_name}</span>. This action remove their profile record from the system.
                                </p>
                            </div>

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={handleDeleteUser}
                                    className="w-full py-4 bg-red-600 text-white font-black rounded-2xl hover:bg-red-700 shadow-xl shadow-red-500/20 active:scale-95 transition-all text-xs uppercase tracking-widest"
                                >
                                    Confirm Destruction
                                </button>
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="w-full py-4 bg-slate-50 text-slate-400 font-black rounded-2xl hover:bg-slate-100 transition-all text-xs uppercase tracking-widest"
                                >
                                    Abort
                                </button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;
