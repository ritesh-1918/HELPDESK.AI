import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
    ShieldCheck, Zap, Activity, Clock, Search, Download, CheckCircle2,
    AlertTriangle, FileText, Lock, RefreshCw, Key, ArrowRight, User, Globe, Info, Calendar, X, Eye
} from 'lucide-react';
import { supabase } from "../../lib/supabaseClient";
import useAuthStore from "../../store/authStore";
import useToastStore from '../../store/toastStore';
import { Card } from "../../components/ui/card";
import { API_CONFIG } from '../../config';

const AuditLogViewer = () => {
    const { profile } = useAuthStore();
    const { showToast } = useToastStore();

    // Navigation state
    const [activeTab, setActiveTab] = useState('logs'); // 'logs' | 'alerts' | 'compliance' | 'integrity'

    // Filtering State
    const [actionFilter, setActionFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [ipFilter, setIpFilter] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    // Logs Data State
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [offset, setOffset] = useState(0);
    const offsetRef = useRef(0);
    useEffect(() => { offsetRef.current = offset; }, [offset]);
    const limit = 50;

    // Selected Log Detail Modal
    const [selectedLog, setSelectedLog] = useState(null);

    // Alerts Data State
    const [alerts, setAlerts] = useState([]);
    const [alertsLoading, setAlertsLoading] = useState(false);

    // Compliance Reporting State
    const [selectedReport, setSelectedReport] = useState('SOC2');
    const [reportData, setReportData] = useState(null);
    const [reportLoading, setReportLoading] = useState(false);

    // Integrity State
    const [verificationResult, setVerificationResult] = useState(null);
    const [verifying, setVerifying] = useState(false);

    // Fetch Auth Token
    const getAuthHeaders = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        return {
            'Authorization': `Bearer ${session?.access_token || ''}`,
            'Content-Type': 'application/json'
        };
    };

    // 1. Fetch Audit Logs
    const fetchLogs = useCallback(async (reset = false) => {
        setLoading(true);
        try {
            const headers = await getAuthHeaders();
            const currentOffset = reset ? 0 : offsetRef.current;
            
            // Build query params
            const params = new URLSearchParams({
                limit: limit.toString(),
                offset: currentOffset.toString()
            });
            if (actionFilter) params.append('action', actionFilter);
            if (statusFilter) params.append('status', statusFilter);
            if (ipFilter) params.append('ip_address', ipFilter);
            if (dateFrom) params.append('date_from', dateFrom);
            if (dateTo) params.append('date_to', dateTo);

            const response = await fetch(`${API_CONFIG.BACKEND_URL}/api/audit/logs?${params.toString()}`, {
                headers
            });

            if (!response.ok) throw new Error("API call failed");
            
            const data = await response.json();
            if (reset) {
                setLogs(data);
                setOffset(limit);
            } else {
                setLogs(prev => [...prev, ...data]);
                setOffset(prev => prev + limit);
            }
        } catch (err) {
            console.error("Failed to load audit logs:", err);
            showToast("Failed to fetch audit logs.", "error");
        } finally {
            setLoading(false);
        }
    }, [actionFilter, statusFilter, ipFilter, dateFrom, dateTo]);

    // 2. Fetch Security Alerts
    const fetchAlerts = async () => {
        setAlertsLoading(true);
        try {
            const headers = await getAuthHeaders();
            const response = await fetch(`${API_CONFIG.BACKEND_URL}/api/audit/alerts`, {
                headers
            });
            if (!response.ok) throw new Error("Failed to load alerts");
            const data = await response.json();
            setAlerts(data);
        } catch (err) {
            console.error("Alert load error:", err);
            showToast("Could not load security alerts.", "error");
        } finally {
            setAlertsLoading(false);
        }
    };

    // 3. Generate Compliance Report
    const fetchReport = async () => {
        setReportLoading(true);
        setReportData(null);
        try {
            const headers = await getAuthHeaders();
            const response = await fetch(`${API_CONFIG.BACKEND_URL}/api/audit/report?type=${selectedReport}`, {
                headers
            });
            if (!response.ok) throw new Error("Failed to generate report");
            const data = await response.json();
            setReportData(data);
            showToast(`${selectedReport} Compliance Audit Report generated.`, "success");
        } catch (err) {
            console.error("Report generation error:", err);
            showToast("Report generation failed.", "error");
        } finally {
            setReportLoading(false);
        }
    };

    // 4. Verify cryptographic integrity chain
    const verifyChain = async () => {
        setVerifying(true);
        setVerificationResult(null);
        try {
            const headers = await getAuthHeaders();
            const response = await fetch(`${API_CONFIG.BACKEND_URL}/api/audit/verify`, {
                method: 'POST',
                headers
            });
            if (!response.ok) throw new Error("Verification protocol aborted");
            const data = await response.json();
            setVerificationResult(data);
            if (data.verified) {
                showToast("Chain of custody verified: Zero tampering detected.", "success");
            } else {
                showToast("ALERT: Cryptographic chain mismatch! Possible log tampering detected.", "error");
            }
        } catch (err) {
            console.error("Integrity check error:", err);
            showToast("Cryptographic verification failed.", "error");
        } finally {
            setVerifying(false);
        }
    };

    // Export Logs handler
    const triggerExport = async (format) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const params = new URLSearchParams({ format });
            if (actionFilter) params.append('action', actionFilter);
            if (statusFilter) params.append('status', statusFilter);
            if (ipFilter) params.append('ip_address', ipFilter);
            if (dateFrom) params.append('date_from', dateFrom);
            if (dateTo) params.append('date_to', dateTo);

            const downloadUrl = `${API_CONFIG.BACKEND_URL}/api/audit/export?${params.toString()}`;
            
            // Trigger browser download via anchor element
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.style.display = 'none';
            // Access token attached via parameter or handled on backend
            // In our main.py, we check session cookie or Auth header. To make this work with direct downloads,
            // we pass the access token in header by doing a fetch export blob, or pass it as token.
            // Let's download by doing a fetch, converting to blob, and saving it:
            const response = await fetch(downloadUrl, {
                headers: {
                    'Authorization': `Bearer ${session?.access_token || ''}`
                }
            });
            if (!response.ok) throw new Error("Export download failed");
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            a.href = url;
            a.download = `audit_export_${new Date().toISOString().slice(0, 10)}.${format}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            showToast(`Audit log export completed successfully.`, "success");
        } catch (err) {
            console.error("Export error:", err);
            showToast("Failed to export logs.", "error");
        }
    };

    // Re-fetch when tabs or basic filters change
    useEffect(() => {
        if (activeTab === 'logs') {
            fetchLogs(true);
        } else if (activeTab === 'alerts') {
            fetchAlerts();
        } else if (activeTab === 'compliance') {
            fetchReport();
        }
    }, [activeTab, actionFilter, statusFilter, dateFrom, dateTo]);

    // Local client-side search filtering
    const filteredLogs = useMemo(() => {
        if (!searchQuery) return logs;
        const query = searchQuery.toLowerCase();
        return logs.filter(log => 
            (log.action || '').toLowerCase().includes(query) ||
            (log.ip_address || '').toLowerCase().includes(query) ||
            (log.user_id || '').toLowerCase().includes(query) ||
            (log.resource_id || '').toLowerCase().includes(query) ||
            (log.resource_type || '').toLowerCase().includes(query)
        );
    }, [logs, searchQuery]);

    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-20">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-[12px] font-black text-indigo-600 uppercase tracking-[0.3em] mb-2 flex items-center gap-2">
                        <ShieldCheck size={12} /> Compliance & Forensics
                    </h2>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none uppercase italic">Audit Center.</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">Immutable audit trails, cryptographic validation, and SOC2/HIPAA compliance analytics.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => fetchLogs(true)}
                        className="p-4 bg-slate-100 text-slate-600 dark:text-slate-400 rounded-2xl hover:bg-slate-200 transition-all flex items-center justify-center"
                        title="Refresh"
                    >
                        <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
                    </button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-4 border-b border-slate-200">
                <button
                    className={`pb-3 px-4 font-bold text-sm tracking-wide transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'logs' ? 'text-indigo-600 border-indigo-600' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
                    onClick={() => setActiveTab('logs')}
                >
                    <Activity size={16} /> Audit Trails
                </button>
                <button
                    className={`pb-3 px-4 font-bold text-sm tracking-wide transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'alerts' ? 'text-amber-600 border-amber-600' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
                    onClick={() => setActiveTab('alerts')}
                >
                    <AlertTriangle size={16} /> Security Alerts
                    {alerts.length > 0 && <span className="bg-amber-100 text-amber-600 text-[10px] px-2 py-0.5 rounded-full">{alerts.length}</span>}
                </button>
                <button
                    className={`pb-3 px-4 font-bold text-sm tracking-wide transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'compliance' ? 'text-emerald-600 border-emerald-600' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
                    onClick={() => setActiveTab('compliance')}
                >
                    <FileText size={16} /> Compliance Reports
                </button>
                <button
                    className={`pb-3 px-4 font-bold text-sm tracking-wide transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'integrity' ? 'text-indigo-600 border-indigo-600' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
                    onClick={() => setActiveTab('integrity')}
                >
                    <Lock size={16} /> Cryptographic Chain
                </button>
            </div>

            {/* Content Switcher */}
            {activeTab === 'logs' && (
                <div className="space-y-6">
                    {/* Filters Card */}
                    <Card className="p-6 bg-slate-50/50 border border-slate-200 rounded-3xl">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Search Keyword</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="Filter results..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-bold focus:outline-none focus:border-indigo-600 transition-all text-slate-700"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Action Type</label>
                                <select
                                    value={actionFilter}
                                    onChange={(e) => setActionFilter(e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-indigo-600 transition-all text-slate-700"
                                >
                                    <option value="">All Actions</option>
                                    <option value="user_login">User Login</option>
                                    <option value="failed_login_attempt">Failed Login</option>
                                    <option value="user_logout">User Logout</option>
                                    <option value="create_ticket">Create Ticket</option>
                                    <option value="update_ticket">Update Ticket</option>
                                    <option value="delete_ticket">Delete Ticket</option>
                                    <option value="view_tickets">View Tickets List</option>
                                    <option value="view_ticket_detail">View Ticket Detail</option>
                                    <option value="search_tickets">Search Tickets</option>
                                    <option value="log_correction">Log Model Correction</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Status</label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-indigo-600 transition-all text-slate-700"
                                >
                                    <option value="">All Statuses</option>
                                    <option value="success">Success</option>
                                    <option value="failure">Failure</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">IP Address</label>
                                <input
                                    type="text"
                                    placeholder="Filter by IP..."
                                    value={ipFilter}
                                    onChange={(e) => setIpFilter(e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-indigo-600 transition-all text-slate-700"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Date From</label>
                                <input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-indigo-600 transition-all text-slate-700"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Date To</label>
                                <input
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-indigo-600 transition-all text-slate-700"
                                />
                            </div>
                        </div>

                        {/* Export Shortcuts */}
                        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                            <span className="text-[11px] font-bold text-slate-400">Total Filtered Logs: {filteredLogs.length}</span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => triggerExport('csv')}
                                    className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 dark:text-slate-400 rounded-lg text-xs font-bold transition-all shadow-sm"
                                >
                                    <Download size={14} /> Export CSV
                                </button>
                                <button
                                    onClick={() => triggerExport('json')}
                                    className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 dark:text-slate-400 rounded-lg text-xs font-bold transition-all shadow-sm"
                                >
                                    <Download size={14} /> Export JSON
                                </button>
                            </div>
                        </div>
                    </Card>

                    {/* Timeline List */}
                    <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-2xl overflow-hidden">
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/20">
                            <h3 className="text-sm font-black text-slate-800 uppercase italic tracking-wider flex items-center gap-2">
                                <Clock size={16} className="text-slate-400" /> Chronological Event Logs
                            </h3>
                            <span className="text-[10px] font-mono font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                                Immutable Feed
                            </span>
                        </div>

                        <div className="divide-y divide-slate-100">
                            {filteredLogs.map((log) => {
                                const logDate = new Date(log.timestamp);
                                const isFailed = log.status === 'failure' || log.action === 'failed_login_attempt';
                                
                                return (
                                    <div 
                                        key={log.id} 
                                        className="p-6 hover:bg-slate-50/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-6 cursor-pointer"
                                        onClick={() => setSelectedLog(log)}
                                    >
                                        <div className="flex items-start gap-4">
                                            {/* Action Indicator Icon */}
                                            <div className={`p-3 rounded-xl shrink-0 border ${isFailed ? 'bg-red-50 text-red-500 border-red-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>
                                                {log.action.includes('login') ? <Key size={18} /> : log.action.includes('ticket') ? <FileText size={18} /> : <Activity size={18} />}
                                            </div>
                                            
                                            <div>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="text-sm font-black text-slate-800 uppercase italic tracking-tight">
                                                        {log.action.replace(/_/g, ' ')}
                                                    </span>
                                                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${isFailed ? 'bg-red-50 text-red-600 border-red-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
                                                        {log.status}
                                                    </span>
                                                </div>
                                                
                                                <div className="flex flex-wrap items-center gap-4 text-[10px] text-slate-400 font-bold mt-1.5">
                                                    <span className="flex items-center gap-1"><User size={10} /> User: {log.user_id ? log.user_id.slice(0, 8) + '...' : 'System'}</span>
                                                    <span className="flex items-center gap-1"><Globe size={10} /> IP: {log.ip_address || 'n/a'}</span>
                                                    <span className="flex items-center gap-1"><Calendar size={10} /> {logDate.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* View Details CTA */}
                                        <button className="flex items-center gap-1 bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-100 hover:bg-indigo-50 text-[10px] font-black uppercase tracking-widest py-2 px-3 rounded-xl shadow-sm transition-all shrink-0">
                                            <Eye size={12} /> Details
                                        </button>
                                    </div>
                                );
                            })}
                        </div>

                        {filteredLogs.length === 0 && (
                            <div className="py-24 text-center">
                                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 mx-auto mb-4">
                                    <Activity size={32} />
                                </div>
                                <h3 className="text-lg font-black text-slate-900 uppercase italic">No records found</h3>
                                <p className="text-sm text-slate-400 font-medium italic mt-1">Adjust search/filters or load more results.</p>
                            </div>
                        )}

                        {filteredLogs.length > 0 && (
                            <div className="p-6 border-t border-slate-100 flex justify-center bg-slate-50/10">
                                <button
                                    onClick={() => fetchLogs()}
                                    disabled={loading}
                                    className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black rounded-xl text-xs uppercase tracking-widest transition-all disabled:opacity-50"
                                >
                                    {loading ? "Loading..." : "Load More Trails"}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'alerts' && (
                <div className="space-y-6">
                    {/* Security Alerts List */}
                    <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-2xl overflow-hidden">
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-amber-50/20">
                            <h3 className="text-sm font-black text-slate-800 uppercase italic tracking-wider flex items-center gap-2">
                                <AlertTriangle className="text-amber-500" size={18} /> Threat Alerts (Past 24 Hours)
                            </h3>
                            <button
                                onClick={fetchAlerts}
                                disabled={alertsLoading}
                                className="flex items-center gap-1 bg-white border border-slate-200 text-slate-600 dark:text-slate-400 py-1.5 px-3 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm"
                            >
                                <RefreshCw size={10} className={alertsLoading ? 'animate-spin' : ''} /> Rescan
                            </button>
                        </div>

                        {alertsLoading ? (
                            <div className="py-24 text-center">
                                <RefreshCw className="w-10 h-10 text-amber-500 animate-spin mx-auto mb-4" />
                                <p className="text-slate-400 font-black uppercase tracking-widest italic text-xs">Scanning logs for anomalies...</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {alerts.map((alert) => {
                                    const isCritical = alert.severity === 'critical' || alert.severity === 'high';
                                    return (
                                        <div key={alert.id} className="p-6 hover:bg-slate-50/30 transition-colors flex flex-col md:flex-row md:items-start justify-between gap-6">
                                            <div className="flex items-start gap-4">
                                                <div className={`p-3 rounded-xl border ${isCritical ? 'bg-red-50 text-red-600 border-red-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                                    <AlertTriangle size={20} />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="text-sm font-black text-slate-800 uppercase italic tracking-tight">{alert.title}</h4>
                                                        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${isCritical ? 'bg-red-100 text-red-700 border-red-200' : 'bg-amber-100 text-amber-700 border-amber-200'}`}>
                                                            {alert.severity}
                                                        </span>
                                                    </div>
                                                    <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold mt-1 leading-relaxed">{alert.description}</p>
                                                    
                                                    <div className="flex items-center gap-4 text-[10px] text-slate-400 font-bold mt-2">
                                                        <span>Category: {alert.category}</span>
                                                        <span>Detected At: {new Date(alert.timestamp).toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Actionable items */}
                                            <button 
                                                onClick={() => {
                                                    // Trigger search by IP or user in timeline
                                                    if (alert.details?.ip_address) {
                                                        setIpFilter(alert.details.ip_address);
                                                        setActiveTab('logs');
                                                    } else if (alert.details?.user_id) {
                                                        setSearchQuery(alert.details.user_id);
                                                        setActiveTab('logs');
                                                    }
                                                }}
                                                className="flex items-center gap-1 bg-white border border-slate-200 text-slate-500 dark:text-slate-400 hover:text-indigo-600 hover:border-indigo-100 hover:bg-indigo-50 text-[10px] font-black uppercase tracking-widest py-2 px-3 rounded-xl shadow-sm transition-all"
                                            >
                                                Audit Trail <ArrowRight size={10} />
                                            </button>
                                        </div>
                                    );
                                })}

                                {alerts.length === 0 && (
                                    <div className="py-24 text-center">
                                        <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-emerald-100">
                                            <CheckCircle2 size={32} />
                                        </div>
                                        <h3 className="text-lg font-black text-slate-900 uppercase italic">All Systems Secure</h3>
                                        <p className="text-sm text-slate-400 font-medium italic mt-1">No security anomalies or abuse triggers detected in the past 24 hours.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'compliance' && (
                <div className="space-y-6">
                    {/* Compliance Selector Panel */}
                    <Card className="p-6 bg-white border border-slate-200 rounded-[2.5rem]">
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <span className="text-sm font-black text-slate-800 uppercase italic shrink-0">Standard / Governance:</span>
                            <div className="flex flex-wrap gap-2 w-full">
                                {['SOC2', 'HIPAA', 'GDPR', 'Internal'].map(type => (
                                    <button
                                        key={type}
                                        onClick={() => {
                                            setSelectedReport(type);
                                        }}
                                        className={`px-4 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all border ${selectedReport === type ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/25' : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600 dark:text-slate-400'}`}
                                    >
                                        {type} Report
                                    </button>
                                ))}
                            </div>
                        </div>
                    </Card>

                    {/* Report Render */}
                    <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-2xl overflow-hidden">
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h3 className="text-sm font-black text-slate-800 uppercase italic tracking-wider">
                                    Compliance Auditor Panel - {selectedReport} Standard
                                </h3>
                                <p className="text-xs text-slate-400 font-bold mt-1">Simulated compliance coverage for regulatory validation.</p>
                            </div>
                            <button
                                onClick={fetchReport}
                                disabled={reportLoading}
                                className="flex items-center gap-1 bg-white border border-slate-200 text-slate-600 dark:text-slate-400 py-1.5 px-3 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm"
                            >
                                <RefreshCw size={10} className={reportLoading ? 'animate-spin' : ''} /> Regenerate
                            </button>
                        </div>

                        {reportLoading ? (
                            <div className="py-24 text-center">
                                <RefreshCw className="w-10 h-10 text-emerald-500 animate-spin mx-auto mb-4" />
                                <p className="text-slate-400 font-black uppercase tracking-widest italic text-xs">Assembling regulatory records...</p>
                            </div>
                        ) : reportData ? (
                            <div className="p-8 space-y-8">
                                {/* Meta Header */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 bg-slate-50 border border-slate-100 rounded-2xl">
                                    <div>
                                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Standard</span>
                                        <span className="text-xs font-black text-indigo-600 uppercase">{reportData.metadata.report_type}</span>
                                    </div>
                                    <div>
                                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Scope Scope</span>
                                        <span className="text-xs font-black text-slate-700">{reportData.metadata.scope}</span>
                                    </div>
                                    <div>
                                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Total Audited Events</span>
                                        <span className="text-xs font-black text-slate-700">{reportData.metadata.total_events}</span>
                                    </div>
                                    <div>
                                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Generated At</span>
                                        <span className="text-xs font-black text-slate-700">{new Date(reportData.metadata.generated_at).toLocaleString()}</span>
                                    </div>
                                </div>

                                {/* Report Sections */}
                                <div className="space-y-6">
                                    {Object.entries(reportData.sections).map(([key, section]) => (
                                        <div key={key} className="space-y-4">
                                            <div className="border-b border-slate-100 pb-2">
                                                <h4 className="text-xs font-black text-slate-800 uppercase italic tracking-wider flex items-center justify-between">
                                                    <span>{key.replace(/_/g, ' ')}</span>
                                                    <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded border">{section.count} Events</span>
                                                </h4>
                                                <p className="text-[11px] text-slate-400 font-bold italic mt-0.5">{section.description}</p>
                                            </div>

                                            {section.events.length > 0 ? (
                                                <div className="border border-slate-100 rounded-xl overflow-hidden divide-y divide-slate-50">
                                                    {section.events.map((evt, idx) => (
                                                        <div key={idx} className="p-4 bg-slate-50/10 hover:bg-slate-50/30 flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                                                            <div className="flex items-center gap-4">
                                                                <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 dark:text-slate-400">
                                                                    {new Date(evt.timestamp).toLocaleDateString()}
                                                                </span>
                                                                <span className="font-black text-slate-800 uppercase">{evt.action}</span>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-[10px] text-slate-400">Actor: {evt.user_id ? evt.user_id.slice(0, 8) : 'System'}</span>
                                                                <span className="text-[10px] text-slate-400">IP: {evt.ip_address || 'n/a'}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-slate-400 text-xs italic font-medium pl-2">No activity logged in this category within scope period.</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="py-24 text-center">
                                <p className="text-slate-400 italic font-medium">Failed to construct compliance report.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'integrity' && (
                <div className="space-y-6">
                    {/* Integrity Center */}
                    <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-2xl overflow-hidden">
                        <div className="p-8 border-b border-slate-100 bg-indigo-50/20">
                            <h3 className="text-sm font-black text-slate-800 uppercase italic tracking-wider flex items-center gap-2">
                                <Lock className="text-indigo-600" size={16} /> Chain-of-Custody Integrity verification
                            </h3>
                            <p className="text-xs text-slate-400 font-bold mt-1">Verify cryptographically chained hashes of all log actions to guarantee tamper-proof security.</p>
                        </div>

                        <div className="p-8 flex flex-col items-center justify-center space-y-6 max-w-xl mx-auto text-center">
                            <div className={`w-24 h-24 rounded-[2.5rem] flex items-center justify-center border-4 border-white shadow-xl ring-8 ${verificationResult?.verified ? 'bg-emerald-50 text-emerald-500 ring-emerald-50' : verificationResult ? 'bg-red-50 text-red-500 ring-red-50' : 'bg-slate-50 text-slate-400 ring-slate-50'}`}>
                                {verificationResult?.verified ? <CheckCircle2 size={44} /> : verificationResult ? <AlertTriangle size={44} /> : <Lock size={44} />}
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-xl font-black text-slate-900 uppercase italic">
                                    {verificationResult?.verified ? "Chain Verified" : verificationResult ? "Tampering Detected!" : "Integrity Not Verified"}
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed font-semibold">
                                    {verificationResult?.verified ? 
                                        "Cryptographic check successfully traversed the entire audit log database schema. The sequential SHA-256 chain links match, proving no records have been altered or deleted." :
                                     verificationResult ? 
                                        `Validation failed at audit record ID: ${verificationResult.tampered_audit_id || 'Unknown'}. There is a hash mismatch indicating database manipulation.` :
                                        "Execute the cryptographic verification sweep to evaluate the complete hash chain."
                                    }
                                </p>
                            </div>

                            <button
                                onClick={verifyChain}
                                disabled={verifying}
                                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-xl shadow-indigo-500/20 active:scale-95 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                            >
                                {verifying ? <RefreshCw className="animate-spin" size={16} /> : <RefreshCw size={16} />}
                                {verifying ? "Verifying..." : "Run Chain Validation"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Log Detail Modal */}
            {selectedLog && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex justify-end p-0 md:p-6 animate-in fade-in duration-300">
                    <div className="w-full md:w-3/4 max-w-3xl bg-white md:rounded-[2.5rem] border-none shadow-2xl h-full flex flex-col animate-in slide-in-from-right-10 duration-300">
                        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50 md:rounded-t-[2.5rem]">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-xl">
                                    <Info size={24} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tight">Log Details</h3>
                                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                                        Action: <span className="text-indigo-600 uppercase font-black">{selectedLog.action}</span>
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedLog(null)} className="text-slate-400 hover:text-slate-600 bg-white shadow-sm p-3 rounded-xl border border-slate-200 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-8">
                            {/* Metadata Grid */}
                            <div>
                                <h4 className="text-[11px] font-black text-indigo-600 uppercase tracking-widest mb-4">Event Context</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest block mb-1">Audit Log UUID</span>
                                        <span className="text-[10px] font-mono font-black text-slate-800 break-all">{selectedLog.id}</span>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest block mb-1">Timestamp</span>
                                        <span className="text-xs font-black text-slate-800 uppercase italic">{new Date(selectedLog.timestamp).toLocaleString()}</span>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest block mb-1">User UUID</span>
                                        <span className="text-[10px] font-mono font-black text-indigo-600 break-all">{selectedLog.user_id || 'System'}</span>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest block mb-1">IP Address</span>
                                        <span className="text-xs font-black text-slate-800">{selectedLog.ip_address || 'n/a'}</span>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 sm:col-span-2">
                                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest block mb-1">User Agent</span>
                                        <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 line-clamp-2">{selectedLog.user_agent || 'unknown'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Cryptographic Proof */}
                            <div>
                                <h4 className="text-[11px] font-black text-indigo-600 uppercase tracking-widest mb-4">Chain Proof</h4>
                                <div className="space-y-3">
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest block mb-1">Current Hash</span>
                                        <span className="text-[9px] font-mono font-black text-emerald-600 break-all">{selectedLog.hash || 'Not hashed'}</span>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest block mb-1">Chained Previous Hash</span>
                                        <span className="text-[9px] font-mono font-black text-slate-500 dark:text-slate-400 break-all">{selectedLog.previous_hash || 'None'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Before / After Diff (If available) */}
                            {selectedLog.old_value && (
                                <div className="space-y-4">
                                    <h4 className="text-[11px] font-black text-indigo-600 uppercase tracking-widest">Modification Diff</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <span className="text-[10px] text-red-500 font-black uppercase tracking-wider block">Before State (Old Value)</span>
                                            <pre className="p-4 bg-red-50/30 border border-red-100 text-red-700 rounded-2xl text-[10px] font-mono overflow-auto max-h-[300px]">
                                                {JSON.stringify(selectedLog.old_value, null, 2)}
                                            </pre>
                                        </div>
                                        <div className="space-y-2">
                                            <span className="text-[10px] text-emerald-500 font-black uppercase tracking-wider block">After State (New Value)</span>
                                            <pre className="p-4 bg-emerald-50/30 border border-emerald-100 text-emerald-700 rounded-2xl text-[10px] font-mono overflow-auto max-h-[300px]">
                                                {JSON.stringify(selectedLog.new_value, null, 2)}
                                            </pre>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AuditLogViewer;
