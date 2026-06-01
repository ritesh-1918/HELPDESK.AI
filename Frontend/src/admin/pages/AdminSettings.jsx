import { Card, CardContent } from "../../components/ui/card";
import WebhookSettings from "../../components/shared/WebhookSettings";
import { API_CONFIG } from "@/config";
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Settings,
    Cpu,
    Inbox,
    Bell,
    Save,
    ShieldCheck,
    Lock,
    Eye
    Mail,
    Send,
    Lock,
    Eye
} from 'lucide-react';
import useAdminStore from '../store/adminStore';
import useAuthStore from '../../store/authStore';
import { supabase } from '../../lib/supabaseClient';
import {
    DEFAULT_ADMIN_SETTINGS,
    resolveCompanyId,
    settingsFromSystemSettingsRow,
    settingsToSystemSettingsRow
} from '../../utils/adminSettingsPersistence';

import { Select } from "../../components/ui/select";

/**
 * AdminSettings Page
 * Comprehensive configuration for system parameters, AI thresholds, and notifications.
 */
const AdminSettings = () => {
    const { settings, updateSettings } = useAdminStore();
    const { user, profile } = useAuthStore();
    const [isLoadingSettings, setIsLoadingSettings] = useState(false);
    const [isSavingSettings, setIsSavingSettings] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [isSendingTest, setIsSendingTest] = useState(false);
    const [testEmailStatus, setTestEmailStatus] = useState('');
    const [lastDigestSent, setLastDigestSent] = useState(null);

    const companyId = useMemo(() => resolveCompanyId(profile, user), [profile, user]);

    useEffect(() => {
        let isMounted = true;

        const loadCompanySettings = async () => {
            if (!companyId) {
                setStatusMessage('Company profile is required before settings can be synced.');
                return;
            }

            setIsLoadingSettings(true);
            setStatusMessage('');

            const { data, error } = await supabase
                .from('system_settings')
                .select('ai_confidence_threshold, duplicate_sensitivity, enable_auto_resolve, auto_close_days, email_notifications, admin_alerts, digest_enabled, digest_admin_email, digest_last_sent, enable_encryption, enable_pii_redaction')
                .eq('company_id', companyId)
                .maybeSingle();

            if (!isMounted) return;

            if (error) {
                setStatusMessage(`Unable to load saved settings: ${error.message}`);
            } else if (data) {
                updateSettings(settingsFromSystemSettingsRow(data, DEFAULT_ADMIN_SETTINGS));
                if (data.digest_last_sent) {
                    setLastDigestSent(data.digest_last_sent);
                }
                setHasUnsavedChanges(false);
                setStatusMessage('Saved company settings loaded.');
            }

            setIsLoadingSettings(false);
        };

        loadCompanySettings();

        return () => {
            isMounted = false;
        };
    }, [companyId, updateSettings]);

    const saveCompanySettings = useCallback(async (nextSettings, { silent = false } = {}) => {
        if (!companyId) {
            setStatusMessage('Company profile is required before settings can be saved.');
            return;
        }

        setIsSavingSettings(true);
        if (!silent) {
            setStatusMessage('');
        }

        const { error } = await supabase
            .from('system_settings')
            .upsert(settingsToSystemSettingsRow(nextSettings, companyId), { onConflict: 'company_id' });

        if (error) {
            setStatusMessage(`Unable to save settings: ${error.message}`);
        } else {
            setHasUnsavedChanges(false);
            setStatusMessage('Settings saved for this company.');
        }

        setIsSavingSettings(false);
    }, [companyId]);

    const handleChange = (key, value) => {
        updateSettings({ [key]: value });
        setHasUnsavedChanges(true);
        setStatusMessage('Saving changes...');
    };

    const handleSaveSettings = useCallback(() => {
        saveCompanySettings(settings);
    }, [saveCompanySettings, settings]);

    useEffect(() => {
        if (!hasUnsavedChanges || isLoadingSettings || isSavingSettings) return undefined;

        const saveTimer = window.setTimeout(() => {
            saveCompanySettings(settings, { silent: true });
        }, 800);

        return () => window.clearTimeout(saveTimer);
    }, [hasUnsavedChanges, isLoadingSettings, isSavingSettings, saveCompanySettings, settings]);

    return (
        <div className="max-w-4xl mx-auto py-6 space-y-10 pb-20 animate-in fade-in duration-700">
            {/* 1. Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase flex items-center gap-3">
                        <Settings size={28} className="text-indigo-600" /> Settings
                    </h1>
                    <p className="text-sm font-bold text-slate-400 mt-1 flex items-center gap-2 uppercase tracking-[0.2em]">
                        <ShieldCheck size={14} className="text-emerald-500" /> Administrator Account
                    </p>
                </div>
                <div className="flex flex-col items-start md:items-end gap-2">
                    <button
                        type="button"
                        onClick={handleSaveSettings}
                        disabled={!companyId || isLoadingSettings || isSavingSettings || !hasUnsavedChanges}
                        className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-slate-200 transition-all hover:bg-indigo-600 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
                    >
                        <Save size={16} />
                        {isSavingSettings ? 'Saving...' : 'Save Now'}
                    </button>
                    {statusMessage && (
                        <p className="max-w-xs text-left md:text-right text-[10px] font-bold uppercase tracking-widest text-slate-400">
                            {statusMessage}
                        </p>
                    )}
                </div>
            </div>

            <div className="space-y-8">
                {/* 2. System Settings (AI Parameters) */}
                <Card className="border-none shadow-2xl shadow-slate-200/40 rounded-[2rem] overflow-hidden bg-white">
                    <div className="px-8 py-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
                        <h3 className="text-sm font-black uppercase italic tracking-tight flex items-center gap-3">
                            <Cpu size={18} className="text-indigo-400" /> AI Settings
                        </h3>
                    </div>
                    <CardContent className="p-8 space-y-8">
                        {/* AI Confidence Threshold */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-black text-slate-700 uppercase tracking-widest">
                                    AI Confidence Threshold (<span className="text-indigo-600">{(settings.aiConfidenceThreshold * 100).toFixed(0)}%</span>)
                                </label>
                            </div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest max-w-lg mb-2">
                                Minimum confidence required for AI to process and categorize tickets automatically.
                            </p>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.05"
                                value={settings.aiConfidenceThreshold}
                                onChange={(e) => handleChange('aiConfidenceThreshold', parseFloat(e.target.value))}
                                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                            />
                        </div>

                        {/* Duplicate Detection Sensitivity */}
                        <div className="space-y-4 pt-4 border-t border-slate-100">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-black text-slate-700 uppercase tracking-widest">
                                    Duplicate Detection (<span className="text-indigo-600">{(settings.duplicateSensitivity * 100).toFixed(0)}%</span>)
                                </label>
                            </div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest max-w-lg mb-2">
                                Semantic similarity score needed to flag incoming tickets as duplicates.
                            </p>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.05"
                                value={settings.duplicateSensitivity}
                                onChange={(e) => handleChange('duplicateSensitivity', parseFloat(e.target.value))}
                                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                            />
                        </div>

                        {/* Auto Resolve Toggle */}
                        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                            <div>
                                <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest">Enable Auto Resolve</h4>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Allow AI to close easily solved requests.</p>
                            </div>
                            <button
                                onClick={() => handleChange('enableAutoResolve', !settings.enableAutoResolve)}
                                className={`w-14 h-8 rounded-full relative transition-all duration-300 shadow-inner shrink-0 ${settings.enableAutoResolve ? 'bg-indigo-600' : 'bg-slate-200'}`}
                            >
                                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all duration-300 shadow-md ${settings.enableAutoResolve ? 'right-1' : 'left-1'}`}></div>
                            </button>
                        </div>
                    </CardContent>
                </Card>

                {/* 3. Ticket Settings */}
                <Card className="border-none shadow-2xl shadow-slate-200/40 rounded-[2rem] overflow-hidden bg-white">
                    <div className="px-8 py-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="text-sm font-black text-slate-900 uppercase italic tracking-tight flex items-center gap-3">
                            <Inbox size={18} className="text-emerald-500" /> Ticket Settings
                        </h3>
                    </div>
                    <CardContent className="p-8 space-y-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div>
                                <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest">Auto-Close Tickets</h4>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Automatically archive resolved tickets after inactivity.</p>
                            </div>
                            <Select
                                value={settings.autoCloseDays}
                                onChange={(e) => handleChange('autoCloseDays', parseInt(e.target.value))}
                                className="w-full md:w-auto"
                                buttonClassName="w-full md:w-auto min-w-[140px] bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-black text-slate-700 uppercase outline-none focus:border-indigo-600 transition-colors flex justify-between items-center"
                                options={[
                                    { value: 3, label: "3 Days" },
                                    { value: 7, label: "7 Days" },
                                    { value: 14, label: "14 Days" }
                                ]}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* 4. Security & Encryption Settings */}
                <Card className="border-none shadow-2xl shadow-slate-200/40 rounded-[2rem] overflow-hidden bg-white">
                    <div className="px-8 py-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
                        <h3 className="text-sm font-black uppercase italic tracking-tight flex items-center gap-3">
                            <Lock size={18} className="text-emerald-400" /> Security &amp; Encryption
                        </h3>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-950 px-3 py-1 rounded-full">
                            AES-256-GCM
                        </span>
                    </div>
                    <CardContent className="p-8 space-y-6">
                        {/* Master encryption toggle */}
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                            <div>
                                <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest">Backup Payload Encryption</h4>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                                    Encrypt all ticket data with AES-256-GCM before writing to Supabase bucket storage.
                                </p>
                            </div>
                            <button
                                onClick={() => handleChange('backupEncryptionEnabled', !settings.backupEncryptionEnabled)}
                                className={`w-14 h-8 rounded-full relative transition-all duration-300 shadow-inner shrink-0 ${settings.backupEncryptionEnabled ? 'bg-emerald-500' : 'bg-slate-200'}`}
                            >
                                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all duration-300 shadow-md ${settings.backupEncryptionEnabled ? 'right-1' : 'left-1'}`}></div>
                            </button>
                        </div>

                        {/* PII redaction toggle */}
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                            <div>
                                <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                                    <Eye size={14} className="text-indigo-500" /> PII Auto-Redaction
                                </h4>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                                    Automatically mask emails, phone numbers, and API keys in ticket descriptions before backup.
                                </p>
                            </div>
                            <button
                                onClick={() => handleChange('piiRedactionEnabled', !settings.piiRedactionEnabled)}
                                className={`w-14 h-8 rounded-full relative transition-all duration-300 shadow-inner shrink-0 ${settings.piiRedactionEnabled ? 'bg-indigo-500' : 'bg-slate-200'}`}
                            >
                                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all duration-300 shadow-md ${settings.piiRedactionEnabled ? 'right-1' : 'left-1'}`}></div>
                            </button>
                        </div>

                        {/* IP address redaction sub-toggle */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest">Redact IP Addresses</h4>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                                    Also strip IPv4 addresses from ticket content (requires PII Redaction enabled).
                                </p>
                            </div>
                            <button
                                disabled={!settings.piiRedactionEnabled}
                                onClick={() => handleChange('redactIpAddresses', !settings.redactIpAddresses)}
                                className={`w-14 h-8 rounded-full relative transition-all duration-300 shadow-inner shrink-0 ${settings.piiRedactionEnabled && settings.redactIpAddresses ? 'bg-indigo-400' : 'bg-slate-200'} disabled:opacity-40 disabled:cursor-not-allowed`}
                            >
                                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all duration-300 shadow-md ${settings.piiRedactionEnabled && settings.redactIpAddresses ? 'right-1' : 'left-1'}`}></div>
                            </button>
                        </div>
                    </CardContent>
                </Card>

                {/* 5. Notification Settings */}
                <Card className="border-none shadow-2xl shadow-slate-200/40 rounded-[2rem] overflow-hidden bg-white">
                    <div className="px-8 py-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="text-sm font-black text-slate-900 uppercase italic tracking-tight flex items-center gap-3">
                            <Bell size={18} className="text-amber-500" /> Notifications
                        </h3>
                    </div>
                    <CardContent className="p-8 space-y-6">
                        {/* Email Notifications toggle */}
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                            <div>
                                <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest">Email Notifications</h4>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Receive daily system digests via email.</p>
                            </div>
                            <button
                                onClick={() => handleChange('emailNotifications', !settings.emailNotifications)}
                                className={`w-14 h-8 rounded-full relative transition-all duration-300 shadow-inner shrink-0 ${settings.emailNotifications ? 'bg-amber-500' : 'bg-slate-200'}`}
                            >
                                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all duration-300 shadow-md ${settings.emailNotifications ? 'right-1' : 'left-1'}`}></div>
                            </button>
                        </div>

                        {/* Weekly Digest toggle */}
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                            <div>
                                <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest">Weekly Digest Email</h4>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                                    Receive weekly performance reports. Last digest sent: {lastDigestSent ? new Date(lastDigestSent).toLocaleDateString() : "Never"}
                                </p>
                            </div>
                            <button
                                onClick={() => handleChange('digestEnabled', !settings.digestEnabled)}
                                className={`w-14 h-8 rounded-full relative transition-all duration-300 shadow-inner shrink-0 ${settings.digestEnabled ? 'bg-amber-500' : 'bg-slate-200'}`}
                            >
                                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all duration-300 shadow-md ${settings.digestEnabled ? 'right-1' : 'left-1'}`}></div>
                            </button>
                        </div>

                        {/* Admin Alert Notifications toggle */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest">Critical Admin Alerts</h4>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Push notifications for Priority 1 system events.</p>
                            </div>
                            <button
                                onClick={() => handleChange('adminAlerts', !settings.adminAlerts)}
                                className={`w-14 h-8 rounded-full relative transition-all duration-300 shadow-inner shrink-0 ${settings.adminAlerts ? 'bg-amber-500' : 'bg-slate-200'}`}
                            >
                                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all duration-300 shadow-md ${settings.adminAlerts ? 'right-1' : 'left-1'}`}></div>
                            </button>
                        </div>
                    </CardContent>
                </Card>

                {/* AI Weekly Operations Digest */}
                <Card className="border-none shadow-2xl shadow-slate-200/40 rounded-[2rem] overflow-hidden bg-white">
                    <div className="px-8 py-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="text-sm font-black text-slate-900 uppercase italic tracking-tight flex items-center gap-3">
                            <Mail size={18} className="text-indigo-500" /> AI Weekly Operations Digest
                        </h3>
                    </div>
                    <CardContent className="p-8 space-y-6">
                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                            Automatically emails a beautiful, data-rich summary of resolution rates, SLA breaches, and ticket trends generated by Gemini AI to administrators every Monday morning at 8:00 AM UTC.
                        </p>

                        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                            <div>
                                <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest">Enable Weekly Digest</h4>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Send scheduled email performance summaries to admins.</p>
                            </div>
                            <button
                                onClick={() => handleChange('digestEnabled', !settings.digestEnabled)}
                                className={`w-14 h-8 rounded-full relative transition-all duration-300 shadow-inner shrink-0 ${settings.digestEnabled ? 'bg-indigo-600' : 'bg-slate-200'}`}
                            >
                                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all duration-300 shadow-md ${settings.digestEnabled ? 'right-1' : 'left-1'}`}></div>
                            </button>
                        </div>

                        {settings.digestEnabled && (
                            <div className="space-y-4 pt-2 animate-in slide-in-from-top-4 duration-300">
                                <div>
                                    <label className="text-xs font-black text-slate-700 uppercase tracking-widest block mb-2">
                                        Recipient Admin Email
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="admin@company.com"
                                        value={settings.digestAdminEmail || ""}
                                        onChange={(e) => handleChange('digestAdminEmail', e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 placeholder-slate-300 outline-none focus:border-indigo-600 focus:bg-white transition-all"
                                    />
                                </div>

                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-slate-100">
                                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                        {lastDigestSent ? (
                                            <span>Last Sent: <strong className="text-slate-600">{new Date(lastDigestSent).toLocaleDateString()} {new Date(lastDigestSent).toLocaleTimeString()}</strong></span>
                                        ) : (
                                            <span>Last Sent: <strong className="text-slate-600">Never</strong></span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3 w-full sm:w-auto">
                                        <button
                                            type="button"
                                            onClick={async () => {
                                                if (!companyId || !settings.digestAdminEmail) {
                                                    setTestEmailStatus("Recipient email is required.");
                                                    return;
                                                }
                                                setIsSendingTest(true);
                                                setTestEmailStatus("");
                                                try {
                                                    const backendUrl = API_CONFIG.BACKEND_URL;
                                                    const response = await fetch(`${backendUrl}/api/digest/send-now`, {
                                                        method: "POST",
                                                        headers: { "Content-Type": "application/json" },
                                                        body: JSON.stringify({
                                                            company_id: companyId,
                                                            email: settings.digestAdminEmail,
                                                        }),
                                                    });
                                                    const data = await response.json();
                                                    if (response.ok) {
                                                        setTestEmailStatus("Test digest sent successfully!");
                                                        setLastDigestSent(new Date().toISOString());
                                                    } else {
                                                        setTestEmailStatus(`Failed to send: ${data.detail || "Unknown error"}`);
                                                    }
                                                } catch (err) {
                                                    setTestEmailStatus(`Error: ${err.message || "Network error"}`);
                                                } finally {
                                                    setIsSendingTest(false);
                                                }
                                            }}
                                            disabled={isSendingTest || !settings.digestAdminEmail}
                                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 hover:bg-slate-200 px-4 py-2.5 text-xs font-black uppercase tracking-widest text-slate-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Send size={12} />
                                            {isSendingTest ? 'Sending...' : 'Send Test Now'}
                                        </button>
                                    </div>
                                </div>
                                {testEmailStatus && (
                                    <p className={`text-[10px] font-black uppercase tracking-widest ${testEmailStatus.startsWith('Error') || testEmailStatus.startsWith('Failed') ? 'text-red-500' : 'text-emerald-500'}`}>
                                        {testEmailStatus}
                                    </p>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* 5. Webhook Notification Settings */}
                <Card className="border-none shadow-2xl shadow-slate-200/40 rounded-[2rem] overflow-hidden bg-white">
                    <div className="px-8 py-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="text-sm font-black text-slate-900 uppercase italic tracking-tight flex items-center gap-3">
                            <Bell size={18} className="text-blue-500" /> Slack & Teams Webhooks
                        </h3>
                    </div>
                    <CardContent className="p-8">
                        <WebhookSettings />
                    </CardContent>
                </Card>

            </div>

                {/* Security and Encryption Settings */}
                <Card className="border-none shadow-2xl shadow-slate-200/40 rounded-[2rem] overflow-hidden bg-white">
                    <div className="px-8 py-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
                        <h3 className="text-sm font-black uppercase italic tracking-tight flex items-center gap-3">
                            <Lock size={18} className="text-emerald-400" /> Security and Encryption
                        </h3>
                    </div>
                    <CardContent className="p-8 space-y-6">
                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                            Protect sensitive data with AES-256-GCM payload encryption and automated PII redaction for all outgoing ticket logs and database backups.
                        </p>
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                            <div>
                                <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                                    <Lock size={14} className="text-emerald-500" /> AES-256-GCM Encryption
                                </h4>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                                    Encrypt sensitive fields (email, description, raw_text) before database storage.
                                </p>
                            </div>
                            <button
                                onClick={() => handleChange('enableEncryption', !settings.enableEncryption)}
                                className={"w-14 h-8 rounded-full relative transition-all duration-300 shadow-inner shrink-0 " + (settings.enableEncryption ? 'bg-emerald-500' : 'bg-slate-200')}
                            >
                                <div className={"absolute top-1 w-6 h-6 bg-white rounded-full transition-all duration-300 shadow-md " + (settings.enableEncryption ? 'right-1' : 'left-1')}></div>
                            </button>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                                    <Eye size={14} className="text-amber-500" /> PII Redaction
                                </h4>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                                    Automatically redact emails, phone numbers, SSNs, and API keys from ticket data before backup.
                                </p>
                            </div>
                            <button
                                onClick={() => handleChange('enablePiiRedaction', !settings.enablePiiRedaction)}
                                className={"w-14 h-8 rounded-full relative transition-all duration-300 shadow-inner shrink-0 " + (settings.enablePiiRedaction ? 'bg-amber-500' : 'bg-slate-200')}
                            >
                                <div className={"absolute top-1 w-6 h-6 bg-white rounded-full transition-all duration-300 shadow-md " + (settings.enablePiiRedaction ? 'right-1' : 'left-1')}></div>
                            </button>
                        </div>
                        {settings.enableEncryption ? (
                            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                                <p className="text-[10px] text-emerald-700 font-bold uppercase tracking-widest">
                                    Encryption Active: Sensitive fields will be encrypted with AES-256-GCM before storage.
                                    Ensure DB_ENCRYPTION_SECRET_KEY is set in your environment variables.
                                </p>
                            </div>
                        ) : null}
                        {settings.enablePiiRedaction ? (
                            <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                                <p className="text-[10px] text-amber-700 font-bold uppercase tracking-widest">
                                    PII Redaction Active: Emails, phone numbers, SSNs, API keys, and credit card numbers will be replaced with [REDACTED] in backups.
                                </p>
                            </div>
                        ) : null}
                    </CardContent>
                </Card>

            {/* SLA Rules Configuration */}
<Card className="border-none shadow-2xl shadow-slate-200/40 rounded-[2rem] overflow-hidden bg-white">
  <CardContent className="px-8 py-6">
    <h3 className="text-sm font-black text-slate-900 uppercase italic tracking-tight flex items-center gap-3">
      SLA Configuration
    </h3>
    <div className="space-y-4 mt-4">
      {["critical","high","medium","low"].map((priority) => (
        <div key={priority} className="flex items-center justify-between border-t border-slate-100 pt-4">
          <div>
            <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest capitalize">{priority}</h4>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Resolution deadline in hours</p>
          </div>
          <input
            type="number"
            min="1"
            defaultValue={priority === "critical" ? 4 : priority === "high" ? 8 : priority === "medium" ? 24 : 72}
            className="w-20 text-center border border-slate-200 rounded-xl px-3 py-2 text-sm font-black text-slate-700"
          />
        </div>
      ))}
    </div>
  </CardContent>
</Card>
        </div>
    );
};

export default AdminSettings;
