import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Shield, ShieldCheck, Mail, Database, Download, Trash2, Calendar,
    Clock, CheckCircle, HelpCircle, Eye, RefreshCw, Info, AlertTriangle, ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import useToastStore from "../../store/toastStore";
import useAuthStore from "../../store/authStore";
import { supabase } from "../../lib/supabaseClient";
import { API_CONFIG } from '../../config';

const PrivacySettings = () => {
    const navigate = useNavigate();
    const { user, profile } = useAuthStore();
    const { showToast } = useToastStore();

    const [preferences, setPreferences] = useState({
        marketing_emails: true,
        product_updates: true,
        announcements: true,
        usage_analytics: true,
        performance_monitoring: true,
        behavior_tracking: true,
        experimental_features: false,
        research_participation: false
    });
    
    const [privacyRequests, setPrivacyRequests] = useState([]);
    const [loadingPrefs, setLoadingPrefs] = useState(true);
    const [loadingRequests, setLoadingRequests] = useState(true);
    const mountedRef = useRef(true);
    const [updatingPrefs, setUpdatingPrefs] = useState(false);
    const [exportLoading, setExportLoading] = useState(null); // 'json' | 'csv' | null
    const [deleteLoading, setDeleteLoading] = useState(false);
    
    // Check DNT Browser signal
    const isDNTEnabled = navigator.doNotTrack === "1" || window.doNotTrack === "1" || navigator.msDoNotTrack === "1";

    const fetchPreferences = useCallback(async () => {
        if (!user) return;
        setLoadingPrefs(true);
        try {
            const session = await supabase.auth.getSession();
            const token = session.data.session?.access_token;
            
            const response = await fetch(`${API_CONFIG.BACKEND_URL}/api/privacy/preferences`, {
                headers: {
                    "Authorization": token ? `Bearer ${token}` : ""
                }
            });
            if (response.ok && mountedRef.current) {
                const data = await response.json();
                setPreferences(data);
            }
        } catch (err) {
            console.error("Failed to load privacy preferences:", err);
        } finally {
            if (mountedRef.current) setLoadingPrefs(false);
        }
    }, [user]);

    const fetchPrivacyRequests = useCallback(async () => {
        if (!user) return;
        setLoadingRequests(true);
        try {
            const session = await supabase.auth.getSession();
            const token = session.data.session?.access_token;

            const response = await fetch(`${API_CONFIG.BACKEND_URL}/api/privacy/requests`, {
                headers: {
                    "Authorization": token ? `Bearer ${token}` : ""
                }
            });
            if (response.ok && mountedRef.current) {
                const data = await response.json();
                setPrivacyRequests(data);
            }
        } catch (err) {
            console.error("Failed to load privacy requests:", err);
        } finally {
            if (mountedRef.current) setLoadingRequests(false);
        }
    }, [user]);

    useEffect(() => {
        mountedRef.current = true;
        return () => { mountedRef.current = false; };
    }, []);

    useEffect(() => {
        fetchPreferences();
        fetchPrivacyRequests();
    }, [fetchPreferences, fetchPrivacyRequests]);

    const handlePreferenceToggle = (key) => {
        setPreferences(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const savePreferences = async () => {
        setUpdatingPrefs(true);
        try {
            const session = await supabase.auth.getSession();
            const token = session.data.session?.access_token;

            const response = await fetch(`${API_CONFIG.BACKEND_URL}/api/privacy/preferences`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": token ? `Bearer ${token}` : ""
                },
                body: JSON.stringify(preferences)
            });

            if (response.ok) {
                showToast("Privacy preferences and consent states updated.", "success");
            } else {
                throw new Error("Failed to save settings");
            }
        } catch (err) {
            showToast("Failed to save changes: " + err.message, "error");
        } finally {
            setUpdatingPrefs(false);
        }
    };

    const handleExport = async (format) => {
        setExportLoading(format);
        try {
            const session = await supabase.auth.getSession();
            const token = session.data.session?.access_token;

            const response = await fetch(`${API_CONFIG.BACKEND_URL}/api/privacy/export`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": token ? `Bearer ${token}` : ""
                },
                body: JSON.stringify({ format })
            });

            if (!response.ok) throw new Error("Export failed");

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `helpdesk_export_${user.email.split('@')[0]}.${format}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            showToast("Data package downloaded successfully.", "success");
            fetchPrivacyRequests(); // refresh logs
        } catch (err) {
            showToast("Portability request failed: " + err.message, "error");
        } finally {
            setExportLoading(null);
        }
    };

    const handleDeleteRequest = async () => {
        const msg = "WARNING: Requesting account deletion will enter your profile and tickets into a 30-day confirmation window, after which all PII will be deleted and support activity anonymized. Do you wish to proceed?";
        if (!window.confirm(msg)) return;

        setDeleteLoading(true);
        try {
            const session = await supabase.auth.getSession();
            const token = session.data.session?.access_token;

            const response = await fetch(`${API_CONFIG.BACKEND_URL}/api/privacy/delete-request`, {
                method: 'POST',
                headers: {
                    "Authorization": token ? `Bearer ${token}` : ""
                }
            });

            if (response.ok) {
                showToast("Account deletion request submitted. 30-day confirmation window has started.", "success");
                fetchPrivacyRequests();
            } else {
                throw new Error("Submission failed");
            }
        } catch (err) {
            showToast("Failed to request erasure: " + err.message, "error");
        } finally {
            setDeleteLoading(false);
        }
    };

    // Calculate pending delete days remaining
    const getDeletionWindowStatus = () => {
        const activeDel = privacyRequests.find(r => r.request_type === 'deletion' && r.status === 'Submitted');
        if (!activeDel) return null;
        
        const createdDate = new Date(activeDel.created_at);
        const targetDate = new Date(createdDate.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
        const now = new Date();
        const diffMs = targetDate - now;
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        
        return {
            id: activeDel.id,
            daysRemaining: Math.max(0, diffDays),
            submittedAt: createdDate.toLocaleDateString()
        };
    };

    const deletionStatus = getDeletionWindowStatus();

    const dataDisclosures = [
        { cat: "Identity Info", fields: "Full Name, Email Address, Phone Number, Job Title, Avatar picture", retention: "Active account + 30 days confirmation", purpose: "Authentication, account management, agent communication" },
        { cat: "Support Logs", fields: "Support tickets, descriptions, categories, priority, custom metadata, and uploaded screenshots", retention: "1 year after resolution (archived), permanent anonymization upon account erasure", purpose: "Automated ticket triage, IT support resolution workflows" },
        { cat: "Communication History", fields: "Messages, internal comments, date/time logs, call telemetry logs", retention: "Linked to ticket lifecycle", purpose: "Real-time communication, audit logging, escalation notes" },
        { cat: "Consent Ledger", fields: "Preferences choices, opt-in/opt-out change history log", retention: "Wiped on account deletion", purpose: "Regulatory compliance tracking (GDPR/CCPA/CPRA)" }
    ];

    return (
        <div className="min-h-screen bg-[#f6f8f7] pb-20 dark:bg-gray-950">
            <main className="pt-32 px-6 flex justify-center">
                <div className="w-full max-w-[1100px] flex flex-col gap-8">
                    
                    {/* Header */}
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => navigate('/profile')}
                            className="flex items-center gap-2 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-500 w-fit transition-colors"
                        >
                            <ArrowLeft size={16} /> Back to Profile
                        </button>
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight italic uppercase">
                            Privacy Preference Center
                        </h1>
                        <p className="text-sm font-bold text-slate-400 dark:text-gray-400 uppercase tracking-widest italic">
                            Manage data access portability, right to erasure, and regulatory compliance settings (GDPR/CCPA)
                        </p>
                    </div>

                    {/* DNT Signal Alert */}
                    {isDNTEnabled && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900 rounded-3xl p-5 flex items-start gap-4"
                        >
                            <Shield className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-bold text-emerald-800 dark:text-emerald-400 text-sm">Do Not Track (DNT) Signal Detected</h4>
                                <p className="text-xs text-emerald-700/80 dark:text-emerald-300/80 mt-1">
                                    Your browser is transmitting a privacy signal. Non-essential tracking and advertising features are automatically deactivated in accordance with GPC standards.
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {/* Deletion Warning Status */}
                    {deletionStatus && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-red-50 border-2 border-red-200 dark:bg-red-950/20 dark:border-red-900 rounded-[2rem] p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
                        >
                            <div className="flex items-start gap-4">
                                <AlertTriangle className="w-8 h-8 text-red-500 shrink-0 mt-1" />
                                <div>
                                    <h4 className="font-black text-red-800 dark:text-red-400 text-lg uppercase italic tracking-tight">Active Erasure Request Pending</h4>
                                    <p className="text-sm font-bold text-red-700/80 dark:text-red-300/80 mt-1">
                                        Your account is scheduled for erasure. The 30-day confirmation window will expire in <span className="font-mono text-base font-black underline">{deletionStatus.daysRemaining} days</span> (Submitted: {deletionStatus.submittedAt}).
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-3 shrink-0">
                                <Button
                                    variant="outline"
                                    onClick={async () => {
                                        if (window.confirm("Do you want to cancel the deletion request and keep your account?")) {
                                            try {
                                                const session = await supabase.auth.getSession();
                                                const token = session.data.session?.access_token;
                                                const response = await fetch(`${API_CONFIG.BACKEND_URL}/api/admin/privacy/requests/${deletionStatus.id}/approve`, {
                                                    method: 'POST',
                                                    headers: {
                                                        'Content-Type': 'application/json',
                                                        "Authorization": token ? `Bearer ${token}` : ""
                                                    },
                                                    body: JSON.stringify({ admin_notes: "Cancelled by User" })
                                                });
                                                if (response.ok) {
                                                    showToast("Erasure request cancelled successfully.", "success");
                                                    fetchPrivacyRequests();
                                                }
                                            } catch (e) {
                                                showToast("Failed to cancel request.", "error");
                                            }
                                        }
                                    }}
                                    className="bg-white hover:bg-gray-100 text-red-600 border border-red-200 rounded-xl font-bold text-xs uppercase tracking-widest h-10 px-5"
                                >
                                    Cancel Erasure
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        
                        {/* LEFT COLUMN: Preferences & Actions */}
                        <div className="lg:col-span-2 flex flex-col gap-8">
                            
                            {/* Consent Settings Card */}
                            <Card className="border-none shadow-xl shadow-slate-200/40 rounded-[2.5rem] bg-white dark:bg-gray-900 overflow-hidden">
                                <CardHeader className="p-8 pb-4 bg-slate-50/50 dark:bg-gray-800/30">
                                    <CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 italic">
                                        <ShieldCheck size={16} className="text-emerald-500" />
                                        Consent Settings Ledger
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-8 space-y-6">
                                    
                                    {/* Comms */}
                                    <div className="space-y-4">
                                        <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest italic border-b pb-2 border-slate-100 dark:border-slate-800">
                                            1. Communications Consent
                                        </h3>
                                        {[
                                            { key: "marketing_emails", title: "Marketing & Promotional Emails", desc: "Receive updates about features, tutorials, and sales packages." },
                                            { key: "product_updates", title: "Product Technical Updates", desc: "Receive technical notes regarding AI model refreshes and bug resolutions." },
                                            { key: "announcements", title: "System News & Announcements", desc: "Receive global announcements regarding operations and service health." }
                                        ].map(item => (
                                            <div key={item.key} className="flex justify-between items-center bg-slate-50 dark:bg-gray-800/20 p-4 rounded-2xl border border-slate-100/50 dark:border-gray-800">
                                                <div className="text-left pr-4">
                                                    <p className="text-sm font-bold text-slate-900 dark:text-white uppercase italic tracking-tight">{item.title}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{item.desc}</p>
                                                </div>
                                                <button
                                                    onClick={() => handlePreferenceToggle(item.key)}
                                                    className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-all duration-300 ${preferences[item.key] ? 'bg-emerald-600 justify-end' : 'bg-slate-300 justify-start'}`}
                                                >
                                                    <motion.div layout className="bg-white w-4 h-4 rounded-full shadow" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Analytics */}
                                    <div className="space-y-4">
                                        <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest italic border-b pb-2 border-slate-100 dark:border-slate-800">
                                            2. System Analytics & Tracking
                                        </h3>
                                        {[
                                            { key: "usage_analytics", title: "Usage Activity Analytics", desc: "Allows HelpDesk to analyze ticketing patterns to optimize team load." },
                                            { key: "performance_monitoring", title: "Performance Telemetry Logging", desc: "Logs loading speed, API latency, and model inference duration." },
                                            { key: "behavior_tracking", title: "Behavior Flow Analysis", desc: "Records clicks and navigation layout flows to optimize accessibility." }
                                        ].map(item => (
                                            <div key={item.key} className="flex justify-between items-center bg-slate-50 dark:bg-gray-800/20 p-4 rounded-2xl border border-slate-100/50 dark:border-gray-800">
                                                <div className="text-left pr-4">
                                                    <p className="text-sm font-bold text-slate-900 dark:text-white uppercase italic tracking-tight">{item.title}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{item.desc}</p>
                                                </div>
                                                <button
                                                    disabled={isDNTEnabled && ["usage_analytics", "behavior_tracking"].includes(item.key)}
                                                    onClick={() => handlePreferenceToggle(item.key)}
                                                    className={`w-12 h-6 flex items-center rounded-full p-1 transition-all duration-300 ${
                                                        (isDNTEnabled && ["usage_analytics", "behavior_tracking"].includes(item.key))
                                                            ? 'bg-slate-200 cursor-not-allowed justify-start'
                                                            : preferences[item.key] ? 'bg-emerald-600 justify-end' : 'bg-slate-300 justify-start'
                                                    }`}
                                                >
                                                    <motion.div layout className="bg-white w-4 h-4 rounded-full shadow" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Optional */}
                                    <div className="space-y-4">
                                        <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest italic border-b pb-2 border-slate-100 dark:border-slate-800">
                                            3. Optional / Experimental clearance
                                        </h3>
                                        {[
                                            { key: "experimental_features", title: "Experimental AI Diagnostics", desc: "Opt-in to use shadow LLM engines and experimental troubleshooting tools." },
                                            { key: "research_participation", title: "Product Research & Internships", desc: "Participate in development feedback and SPRINGBOARD Intern research projects." }
                                        ].map(item => (
                                            <div key={item.key} className="flex justify-between items-center bg-slate-50 dark:bg-gray-800/20 p-4 rounded-2xl border border-slate-100/50 dark:border-gray-800">
                                                <div className="text-left pr-4">
                                                    <p className="text-sm font-bold text-slate-900 dark:text-white uppercase italic tracking-tight">{item.title}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{item.desc}</p>
                                                </div>
                                                <button
                                                    onClick={() => handlePreferenceToggle(item.key)}
                                                    className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-all duration-300 ${preferences[item.key] ? 'bg-emerald-600 justify-end' : 'bg-slate-300 justify-start'}`}
                                                >
                                                    <motion.div layout className="bg-white w-4 h-4 rounded-full shadow" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    <Button
                                        onClick={savePreferences}
                                        disabled={updatingPrefs}
                                        className="w-full h-14 bg-slate-900 hover:bg-emerald-600 text-white font-black rounded-2xl shadow-xl transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                                    >
                                        {updatingPrefs ? <RefreshCw size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                                        {updatingPrefs ? "Updating preferences..." : "Synchronize Consent Settings"}
                                    </Button>

                                </CardContent>
                            </Card>

                            {/* Data Portability & Erasure Action Center */}
                            <Card className="border-none shadow-xl shadow-slate-200/40 rounded-[2.5rem] bg-white dark:bg-gray-900 overflow-hidden">
                                <CardHeader className="p-8 pb-4 bg-slate-50/50 dark:bg-gray-800/30">
                                    <CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 italic">
                                        <Database size={16} className="text-indigo-500" />
                                        Data Rights Portal
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-8 space-y-8">
                                    
                                    {/* Access & Portability */}
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase italic">1. Right to Access & Portability (Data Export)</h4>
                                        <p className="text-xs font-semibold text-slate-400 dark:text-gray-400 uppercase tracking-widest leading-relaxed">
                                            Request a complete machine-readable copy of your personal data stored within HELPDESK.AI, including profile logs, ticket history, comments, and settings.
                                        </p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <Button
                                                onClick={() => handleExport('json')}
                                                disabled={exportLoading !== null}
                                                className="h-14 bg-slate-50 hover:bg-slate-100 text-slate-900 border-2 border-slate-100 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                                            >
                                                {exportLoading === 'json' ? <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" /> : <Download className="w-4 h-4 text-emerald-600" />}
                                                Download JSON Export
                                            </Button>
                                            <Button
                                                onClick={() => handleExport('csv')}
                                                disabled={exportLoading !== null}
                                                className="h-14 bg-slate-50 hover:bg-slate-100 text-slate-900 border-2 border-slate-100 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                                            >
                                                {exportLoading === 'csv' ? <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" /> : <Download className="w-4 h-4 text-indigo-600" />}
                                                Download CSV Summary
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Erasure */}
                                    <div className="space-y-4 pt-4 border-t border-slate-50 dark:border-gray-800">
                                        <h4 className="text-sm font-black text-red-600 uppercase italic">2. Right to Erasure (Delete Account & Anonymize)</h4>
                                        <p className="text-xs font-semibold text-slate-400 dark:text-gray-400 uppercase tracking-widest leading-relaxed">
                                            Initiate a permanent account wipe. Identifying fields will be deleted from the database. Ticket messages and telemetry logs will be anonymized to preserve business metrics.
                                        </p>
                                        <Button
                                            onClick={handleDeleteRequest}
                                            disabled={deleteLoading || deletionStatus !== null}
                                            className="w-full h-14 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border-2 border-red-100 hover:border-red-600 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                                        >
                                            {deleteLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                            {deletionStatus !== null ? "Erasure Sequence Initiated" : "Request Permanent Account Deletion"}
                                        </Button>
                                    </div>

                                </CardContent>
                            </Card>

                        </div>

                        {/* RIGHT COLUMN: Transparency Disclosures & Logs */}
                        <div className="flex flex-col gap-8">
                            
                            {/* Compliance Disclosures */}
                            <Card className="border-none shadow-xl shadow-slate-200/40 rounded-[2.5rem] bg-white dark:bg-gray-900 overflow-hidden">
                                <CardHeader className="p-8 pb-4 bg-slate-50/50 dark:bg-gray-800/30">
                                    <CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 italic">
                                        <Info size={16} className="text-slate-400" />
                                        Data Processing Transparency
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-8 space-y-6">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                                        Under Article 13 of the GDPR and California Civil Code Section 1798.100, we disclose our user data categories and processing retention parameters:
                                    </p>

                                    <div className="space-y-4">
                                        {dataDisclosures.map((disc, idx) => (
                                            <div key={idx} className="p-4 bg-slate-50 dark:bg-gray-800/20 rounded-2xl border border-slate-100/50 dark:border-gray-800 space-y-2">
                                                <h5 className="text-[11px] font-black text-slate-900 dark:text-white uppercase italic">{disc.cat}</h5>
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest"><span className="text-[10px] font-black text-slate-400">PII Fields:</span> {disc.fields}</p>
                                                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest"><span className="text-[10px] font-black text-indigo-400">Retention:</span> {disc.retention}</p>
                                                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest"><span className="text-[10px] font-black text-emerald-400">Purpose:</span> {disc.purpose}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Request Timeline logs */}
                            <Card className="border-none shadow-xl shadow-slate-200/40 rounded-[2.5rem] bg-white dark:bg-gray-900 overflow-hidden">
                                <CardHeader className="p-8 pb-4 bg-slate-50/50 dark:bg-gray-800/30">
                                    <CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 italic">
                                        <Clock size={16} className="text-emerald-500" />
                                        Request Ledger History
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-8">
                                    {loadingRequests ? (
                                        <div className="flex justify-center py-8">
                                            <RefreshCw className="w-6 h-6 animate-spin text-emerald-500" />
                                        </div>
                                    ) : privacyRequests.length === 0 ? (
                                        <div className="text-center py-8">
                                            <CheckCircle className="w-8 h-8 text-slate-200 mx-auto mb-3" />
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No active requests logged</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {privacyRequests.map((req, idx) => (
                                                <div key={req.id || idx} className="flex gap-4 items-start">
                                                    <div className="mt-1 w-2 h-2 rounded-full bg-emerald-500 shadow-lg shrink-0" />
                                                    <div className="flex-1 text-left">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-xs font-black text-slate-800 dark:text-white uppercase italic">
                                                                {req.request_type === 'export' ? 'Data Portability Export' : 'Profile Erasure request'}
                                                            </span>
                                                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${
                                                                req.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                                            }`}>
                                                                {req.status}
                                                            </span>
                                                        </div>
                                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                                            ID: {req.id.substring(0, 8)} • Date: {new Date(req.created_at).toLocaleDateString()}
                                                        </p>
                                                        {req.admin_notes && (
                                                            <p className="text-[10px] italic text-slate-500 dark:text-slate-400 mt-1 bg-slate-50 dark:bg-gray-800/40 p-2 rounded-lg border border-slate-100 dark:border-gray-800">
                                                                {req.admin_notes}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                        </div>

                    </div>

                </div>
            </main>
        </div>
    );
};

export default PrivacySettings;
