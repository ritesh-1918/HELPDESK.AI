import React, { useState, useEffect, useRef } from 'react';
import {
    Building2,
    ShieldCheck,
    Key,
    RefreshCw,
    Plus,
    Trash2,
    Sliders,
    Activity,
    Upload,
    Globe,
    Check,
    AlertCircle,
    UserCheck,
    FileText
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import ErrorBoundary from '../../components/ErrorBoundary';
import { supabase } from '../../lib/supabaseClient';
import { API_CONFIG } from '../../config';

const SSOConfig = () => {
    const [activeTab, setActiveTab] = useState('provider');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});

    // SSO Configuration State
    const [providers, setProviders] = useState([]);
    const [mappings, setMappings] = useState([]);
    const [settings, setSettings] = useState({
        enable_jit: true,
        default_role: 'user',
        auto_deprovision: false,
        sync_groups: true
    });
    const [auditLogs, setAuditLogs] = useState([]);
    const mountedRef = useRef(true);

    // Provider Form State
    const [providerForm, setProviderForm] = useState({
        provider_name: 'okta',
        protocol: 'saml',
        domain_names: '',
        metadata_url: '',
        metadata_xml: '',
        client_id: '',
        client_secret: '',
        sso_url: '',
        entity_id: '',
        x509_cert: '',
        is_active: true
    });

    // Mapping Form State
    const [mappingForm, setMappingForm] = useState({
        idp_group: '',
        app_role: 'user'
    });

    // Test Diagnostics State
    const [testForm, setTestForm] = useState({
        metadata_url: '',
        metadata_xml: '',
        assertion_base64: '',
        x509_cert: ''
    });
    const [testResult, setTestResult] = useState(null);
    const [testing, setTesting] = useState(false);

    // Fetch SSO configs on mount
    const fetchSSOConfig = async () => {
        setLoading(true);
        setError('');
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const res = await fetch(`${API_CONFIG.BACKEND_URL}/api/admin/sso/config`, {
                headers: {
                    'Authorization': `Bearer ${session.access_token}`
                }
            });
            if (!res.ok) throw new Error('Failed to load SSO configuration');

            const data = await res.json();
            if (mountedRef.current) setProviders(data.providers || []);
            if (mountedRef.current) setMappings(data.mappings || []);
            if (data.settings && mountedRef.current) setSettings(data.settings);

            // Populate form if there's an existing provider
            if (data.providers && data.providers.length > 0) {
                const current = data.providers[0];
                if (mountedRef.current) setProviderForm({
                    ...current,
                    domain_names: (current.domain_names || []).join(', ')
                });
            }

            // Fetch logs
            const logsRes = await fetch(`${API_CONFIG.BACKEND_URL}/api/admin/sso/logs`, {
                headers: {
                    'Authorization': `Bearer ${session.access_token}`
                }
            });
            if (logsRes.ok) {
                const logs = await logsRes.json();
                if (mountedRef.current) setAuditLogs(logs || []);
            }
        } catch (err) {
            if (mountedRef.current) setError(err.message);
        } finally {
            if (mountedRef.current) setLoading(false);
        }
    };

    useEffect(() => {
        mountedRef.current = true;
        return () => { mountedRef.current = false; };
    }, []);

    useEffect(() => {
        fetchSSOConfig();
    }, []);

    // Save Provider Configurations
    const handleSaveProvider = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');
        setFieldErrors({});

        const newErrors = {};
        const domainsArray = providerForm.domain_names
            .split(',')
            .map(d => d.trim().toLowerCase())
            .filter(d => d.length > 0);

        if (domainsArray.length === 0) {
            newErrors.domain_names = "At least one valid corporate domain is required.";
        }

        if (providerForm.protocol === 'saml') {
            if (!providerForm.sso_url) newErrors.sso_url = "SAML SSO Service URL is required.";
            else if (!/^https?:\/\//.test(providerForm.sso_url)) newErrors.sso_url = "Must be a valid HTTP/HTTPS URL.";
            
            if (!providerForm.entity_id) newErrors.entity_id = "Identity Provider Entity ID is required.";
            if (!providerForm.x509_cert) newErrors.x509_cert = "X.509 Signing Certificate is required.";
        } else {
            if (!providerForm.client_id) newErrors.client_id = "OAuth Client ID is required.";
            if (!providerForm.client_secret) newErrors.client_secret = "OAuth Client Secret is required.";
            
            if (providerForm.protocol === 'oidc') {
                if (!providerForm.metadata_url) newErrors.metadata_url = "OIDC Discovery Issuer URL is required.";
                else if (!/^https?:\/\//.test(providerForm.metadata_url)) newErrors.metadata_url = "Must be a valid HTTP/HTTPS URL.";
            }
        }

        if (Object.keys(newErrors).length > 0) {
            setFieldErrors(newErrors);
            setSaving(false);
            return;
        }

        try {
            const { data: { session } } = await supabase.auth.getSession();
            const payload = {
                ...providerForm,
                domain_names: domainsArray
            };

            const res = await fetch(`${API_CONFIG.BACKEND_URL}/api/admin/sso/config`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error('Failed to save Identity Provider credentials');
            
            setSuccess('Identity Provider configuration updated successfully!');
            fetchSSOConfig();
        } catch (err) {
            if (mountedRef.current) setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    // Save Provisioning Settings
    const handleSaveSettings = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const res = await fetch(`${API_CONFIG.BACKEND_URL}/api/admin/sso/settings`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify(settings)
            });

            if (!res.ok) throw new Error('Failed to save provisioning configurations');

            setSuccess('Provisioning settings updated successfully!');
            fetchSSOConfig();
        } catch (err) {
            if (mountedRef.current) setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    // Add Role Mapping
    const handleAddMapping = async (e) => {
        e.preventDefault();
        if (!mappingForm.idp_group) return;
        setSaving(true);
        setError('');
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const res = await fetch(`${API_CONFIG.BACKEND_URL}/api/admin/sso/mappings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify(mappingForm)
            });

            if (!res.ok) throw new Error('Failed to save mapping rule');

            setMappingForm({ idp_group: '', app_role: 'user' });
            setSuccess('Group-to-role mapping rule added!');
            fetchSSOConfig();
        } catch (err) {
            if (mountedRef.current) setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    // Delete Role Mapping
    const handleDeleteMapping = async (id) => {
        setError('');
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const res = await fetch(`${API_CONFIG.BACKEND_URL}/api/admin/sso/mappings/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`
                }
            });

            if (!res.ok) throw new Error('Failed to delete mapping rule');
            
            setSuccess('Mapping rule deleted.');
            fetchSSOConfig();
        } catch (err) {
            if (mountedRef.current) setError(err.message);
        }
    };

    // Run Diagnostics
    const handleRunTest = async (testType) => {
        setTesting(true);
        setTestResult(null);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const payload = {};
            if (testType === 'url') payload.metadata_url = testForm.metadata_url;
            if (testType === 'xml') payload.metadata_xml = testForm.metadata_xml;
            if (testType === 'verify') {
                payload.assertion_base64 = testForm.assertion_base64;
                payload.x509_cert = testForm.x509_cert || providerForm.x509_cert;
            }

            const res = await fetch(`${API_CONFIG.BACKEND_URL}/api/admin/sso/test`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            setTestResult(data);
        } catch (err) {
            setTestResult({ status: 'error', message: err.message });
        } finally {
            setTesting(false);
        }
    };

    if (loading) {
        return (
            <Card className="border-none shadow-2xl shadow-slate-200/40 rounded-[2rem] bg-white overflow-hidden p-12 text-center">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-600 mb-4" />
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">Loading SSO Parameters...</p>
            </Card>
        );
    }

    return (
        <ErrorBoundary>
            <Card className="border-none shadow-2xl shadow-slate-200/40 rounded-[2rem] bg-white overflow-hidden">
            {/* Header */}
            <div className="px-8 py-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
                <h3 className="text-sm font-black uppercase italic tracking-tight flex items-center gap-3">
                    <Building2 size={18} className="text-emerald-400" /> Enterprise Single Sign-On (SSO)
                </h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 px-3 py-1 rounded-full uppercase tracking-wider">
                    SaaS Identity Isolation
                </span>
            </div>

            <CardContent className="p-8">
                {/* Status Banners */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-start gap-3 text-xs font-semibold">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>{error}</span>
                    </div>
                )}
                {success && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-2xl flex items-start gap-3 text-xs font-semibold">
                        <Check className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>{success}</span>
                    </div>
                )}

                {/* Sub Tab Navigation */}
                <div className="flex gap-2 border-b border-slate-100 pb-4 mb-8">
                    {[
                        { id: 'provider', label: 'Identity Provider', icon: Key },
                        { id: 'mappings', label: 'Role Mappings', icon: Sliders },
                        { id: 'provisioning', label: 'JIT Provisioning', icon: UserCheck },
                        { id: 'diagnostics', label: 'Diagnostics & Logs', icon: Activity }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => { setActiveTab(tab.id); setError(''); setSuccess(''); }}
                            className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 ${
                                activeTab === tab.id
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-50'
                            }`}
                        >
                            <tab.icon size={14} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* TAB 1: PROVIDER CONFIG */}
                {activeTab === 'provider' && (
                    <form onSubmit={handleSaveProvider} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Provider Name</label>
                                <select
                                    value={providerForm.provider_name}
                                    onChange={(e) => { if (mountedRef.current) setProviderForm({ ...providerForm, provider_name: e.target.value  }})}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-black text-slate-700 uppercase outline-none focus:border-indigo-600 transition-colors"
                                >
                                    <option value="okta">Okta Identity</option>
                                    <option value="azure">Microsoft Azure AD / Entra</option>
                                    <option value="google">Google Workspace</option>
                                    <option value="generic">Generic SAML 2.0</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Protocol</label>
                                <select
                                    value={providerForm.protocol}
                                    onChange={(e) => { if (mountedRef.current) setProviderForm({ ...providerForm, protocol: e.target.value  }})}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-black text-slate-700 uppercase outline-none focus:border-indigo-600 transition-colors"
                                >
                                    <option value="saml">SAML 2.0 Assertion</option>
                                    <option value="oauth">OAuth 2.0 Flow</option>
                                    <option value="oidc">OpenID Connect (OIDC)</option>
                                </select>
                            </div>

                            <div className="md:col-span-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Corporate Domains</label>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Comma separated email domains mapped to this login (e.g. enterprise.com, custom-domain.org)</p>
                                <input
                                    type="text"
                                    placeholder="enterprise.com, co.org"
                                    value={providerForm.domain_names}
                                    onChange={(e) => { if (mountedRef.current) setProviderForm({ ...providerForm, domain_names: e.target.value  }})}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 outline-none focus:border-indigo-600 transition-colors"
                                />
                            </div>

                            {/* SAML specific fields */}
                            {providerForm.protocol === 'saml' && (
                                <>
                                    <div className="md:col-span-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">SAML Single Sign-On Service URL</label>
                                        <input
                                            type="url"
                                            placeholder="https://identity.okta.com/app/sso/saml"
                                            value={providerForm.sso_url || ''}
                                            onChange={(e) => { if (mountedRef.current) setProviderForm({ ...providerForm, sso_url: e.target.value  }})}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 outline-none focus:border-indigo-600 transition-colors"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">SAML Identity Provider Entity ID</label>
                                        <input
                                            type="text"
                                            placeholder="http://www.okta.com/exk..."
                                            value={providerForm.entity_id || ''}
                                            onChange={(e) => { if (mountedRef.current) setProviderForm({ ...providerForm, entity_id: e.target.value  }})}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 outline-none focus:border-indigo-600 transition-colors"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">X.509 Signing Certificate (Base64)</label>
                                        <textarea
                                            rows={6}
                                            placeholder="MIIDrjCCApagAwIBAgIGAX..."
                                            value={providerForm.x509_cert || ''}
                                            onChange={(e) => { if (mountedRef.current) setProviderForm({ ...providerForm, x509_cert: e.target.value  }})}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-[10px] font-mono text-slate-700 outline-none focus:border-indigo-600 transition-colors resize-none"
                                        />
                                    </div>
                                </>
                            )}

                            {/* OAuth / OIDC specific fields */}
                            {providerForm.protocol !== 'saml' && (
                                <>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">OAuth Client ID</label>
                                        <input
                                            type="text"
                                            placeholder="your-client-id"
                                            value={providerForm.client_id || ''}
                                            onChange={(e) => { if (mountedRef.current) setProviderForm({ ...providerForm, client_id: e.target.value  }})}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 outline-none focus:border-indigo-600 transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">OAuth Client Secret</label>
                                        <input
                                            type="password"
                                            placeholder="••••••••••••••••"
                                            value={providerForm.client_secret || ''}
                                            onChange={(e) => { if (mountedRef.current) setProviderForm({ ...providerForm, client_secret: e.target.value  }})}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 outline-none focus:border-indigo-600 transition-colors"
                                        />
                                    </div>
                                    {providerForm.protocol === 'oidc' && (
                                        <div className="md:col-span-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">OIDC Discovery Issuer URL</label>
                                            <input
                                                type="url"
                                                placeholder="https://accounts.google.com"
                                                value={providerForm.metadata_url || ''}
                                                onChange={(e) => { if (mountedRef.current) setProviderForm({ ...providerForm, metadata_url: e.target.value  }})}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 outline-none focus:border-indigo-600 transition-colors"
                                            />
                                        </div>
                                    )}
                                </>
                            )}

                            <div>
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">SSO Provider Status</h4>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Activate or deactivate login redirection for matched domains.</p>
                                <button
                                    type="button"
                                    onClick={() => if (mountedRef.current) setProviderForm({ ...providerForm, is_active: !providerForm.is_active })}
                                    className={`w-14 h-8 rounded-full relative transition-all duration-300 shadow-inner shrink-0 ${providerForm.is_active ? 'bg-indigo-600' : 'bg-slate-200'}`}
                                >
                                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all duration-300 shadow-md ${providerForm.is_active ? 'right-1' : 'left-1'}`}></div>
                                </button>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100 flex justify-end">
                            <button
                                type="submit"
                                disabled={saving}
                                className="bg-indigo-600 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 active:scale-[0.98] transition-all flex items-center gap-2"
                            >
                                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                                Save Configurations
                            </button>
                        </div>
                    </form>
                )}

                {/* TAB 2: ROLE MAPPINGS */}
                {activeTab === 'mappings' && (
                    <div className="space-y-8">
                        <div>
                            <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest mb-1">Directory Group Mapping Rules</h4>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-4">Map your corporate Okta / Azure Active Directory groups to HelpDesk roles.</p>

                            {/* Add Mapping Form */}
                            <form onSubmit={handleAddMapping} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-6">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">IdP Corporate Group Name</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. IT_Admins"
                                        value={mappingForm.idp_group}
                                        onChange={(e) => setMappingForm({ ...mappingForm, idp_group: e.target.value })}
                                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-indigo-600 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Assigned Application Role</label>
                                    <select
                                        value={mappingForm.app_role}
                                        onChange={(e) => setMappingForm({ ...mappingForm, app_role: e.target.value })}
                                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-black text-slate-700 uppercase outline-none focus:border-indigo-600 transition-colors"
                                    >
                                        <option value="user">Standard User</option>
                                        <option value="admin">Company Admin</option>
                                        <option value="super_admin">Super Administrator</option>
                                    </select>
                                </div>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="bg-indigo-600 text-white px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                >
                                    <Plus size={14} /> Add Mapping
                                </button>
                            </form>

                            {/* Mappings Table */}
                            {mappings.length > 0 ? (
                                <div className="border border-slate-100 rounded-2xl overflow-hidden bg-white shadow-xl shadow-slate-100/40">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                <th className="px-6 py-4">Corporate Directory Group</th>
                                                <th className="px-6 py-4">HelpDesk.AI System Role</th>
                                                <th className="px-6 py-4 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 text-xs font-bold text-slate-700">
                                            {mappings.map((mapping) => (
                                                <tr key={mapping.id} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-6 py-4 font-mono text-[11px] text-indigo-600">{mapping.idp_group}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                                                            mapping.app_role === 'super_admin' ? 'bg-red-50 text-red-600 border-red-200' :
                                                            mapping.app_role === 'admin' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                                                            'bg-emerald-50 text-emerald-600 border-emerald-200'
                                                        }`}>
                                                            {mapping.app_role.replace('_', ' ')}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button
                                                            onClick={() => handleDeleteMapping(mapping.id)}
                                                            className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 active:scale-95 transition-all inline-flex items-center gap-1.5"
                                                        >
                                                            <Trash2 size={13} /> Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs font-semibold">
                                    No group mapping rules configured. Users will be assigned the default role.
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* TAB 3: PROVISIONING SETTINGS */}
                {activeTab === 'provisioning' && (
                    <form onSubmit={handleSaveSettings} className="space-y-8">
                        <div className="space-y-6">
                            {/* Enable JIT */}
                            <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                                <div>
                                    <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest">Just-In-Time (JIT) Provisioning</h4>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                                        Automatically create employee profiles in HelpDesk.AI during their first corporate SSO login.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSettings({ ...settings, enable_jit: !settings.enable_jit })}
                                    className={`w-14 h-8 rounded-full relative transition-all duration-300 shadow-inner shrink-0 ${settings.enable_jit ? 'bg-indigo-600' : 'bg-slate-200'}`}
                                >
                                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all duration-300 shadow-md ${settings.enable_jit ? 'right-1' : 'left-1'}`}></div>
                                </button>
                            </div>

                            {/* Group sync */}
                            <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                                <div>
                                    <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest">Group Synchronization</h4>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                                        Dynamically align application roles with corporate directories at each authentication event.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSettings({ ...settings, sync_groups: !settings.sync_groups })}
                                    className={`w-14 h-8 rounded-full relative transition-all duration-300 shadow-inner shrink-0 ${settings.sync_groups ? 'bg-indigo-600' : 'bg-slate-200'}`}
                                >
                                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all duration-300 shadow-md ${settings.sync_groups ? 'right-1' : 'left-1'}`}></div>
                                </button>
                            </div>

                            {/* Auto Deprovision */}
                            <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                                <div>
                                    <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest">Automated De-Provisioning</h4>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                                        Deactivate users automatically when they are disabled or deleted in the identity provider.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSettings({ ...settings, auto_deprovision: !settings.auto_deprovision })}
                                    className={`w-14 h-8 rounded-full relative transition-all duration-300 shadow-inner shrink-0 ${settings.auto_deprovision ? 'bg-indigo-600' : 'bg-slate-200'}`}
                                >
                                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all duration-300 shadow-md ${settings.auto_deprovision ? 'right-1' : 'left-1'}`}></div>
                                </button>
                            </div>

                            {/* Default Role */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
                                <div>
                                    <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest">Fallback Default Role</h4>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                                        Fallback role assigned to provisioned employees if they do not match any group mappings.
                                    </p>
                                </div>
                                <select
                                    value={settings.default_role}
                                    onChange={(e) => setSettings({ ...settings, default_role: e.target.value })}
                                    className="w-full md:w-auto min-w-[160px] bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-black text-slate-700 uppercase outline-none focus:border-indigo-600 transition-colors"
                                >
                                    <option value="user">Standard User</option>
                                    <option value="admin">Company Admin</option>
                                </select>
                            </div>

                            {/* Webhook Endpoint Token Display */}
                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                                    <Globe className="w-4 h-4 text-emerald-500" /> Webhook Synchronization Directory Sync
                                </h4>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1 mb-4">
                                    Use these details to configure SCIM / Webhook synchronization inside Okta, Microsoft Azure AD, or custom applications.
                                </p>

                                <div className="space-y-4">
                                    <div>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Webhook URL Endpoint</span>
                                        <code className="text-xs select-all bg-slate-200/50 text-indigo-600 px-3 py-1.5 rounded-lg block font-mono border border-slate-200">
                                            {API_CONFIG.BACKEND_URL}/api/sso/webhook
                                        </code>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Secret Token (Bearer Header)</span>
                                        <code className="text-xs select-all bg-slate-200/50 text-slate-700 px-3 py-1.5 rounded-lg block font-mono border border-slate-200">
                                            {providerForm.client_secret || 'Secret token will appear after saving OAuth or configuring credentials.'}
                                        </code>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4 border-t border-slate-100">
                            <button
                                type="submit"
                                disabled={saving}
                                className="bg-indigo-600 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 active:scale-[0.98] transition-all flex items-center gap-2"
                            >
                                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                                Save Provisioning Settings
                            </button>
                        </div>
                    </form>
                )}

                {/* TAB 4: DIAGNOSTICS & AUDIT LOGS */}
                {activeTab === 'diagnostics' && (
                    <div className="space-y-10">
                        {/* Testing diagnostics */}
                        <div className="space-y-6">
                            <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest">SAML Connection Testing Tool</h4>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                Validate Identity Provider configurations by testing XML Metadata urls or verifying base64 assertions.
                            </p>

                            <div className="grid grid-cols-1 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Identity Provider Metadata URL</label>
                                    <div className="flex gap-3">
                                        <input
                                            type="url"
                                            placeholder="https://identity.okta.com/app/sso/saml/metadata"
                                            value={testForm.metadata_url}
                                            onChange={(e) => setTestForm({ ...testForm, metadata_url: e.target.value })}
                                            className="flex-grow bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-indigo-600 transition-colors"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleRunTest('url')}
                                            disabled={testing || !testForm.metadata_url}
                                            className="bg-slate-900 text-white px-5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 active:scale-[0.98] transition-all shrink-0"
                                        >
                                            Fetch & Parse
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Test Verify SAML Response Assertion (Base64)</label>
                                    <textarea
                                        rows={4}
                                        placeholder="Paste a base64-encoded SAMLResponse string here..."
                                        value={testForm.assertion_base64}
                                        onChange={(e) => setTestForm({ ...testForm, assertion_base64: e.target.value })}
                                        className="w-full bg-white border border-slate-200 rounded-xl p-4 text-[10px] font-mono text-slate-700 outline-none focus:border-indigo-600 transition-colors resize-none mb-3"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleRunTest('verify')}
                                        disabled={testing || !testForm.assertion_base64}
                                        className="bg-indigo-600 text-white px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 active:scale-[0.98] transition-all flex items-center gap-2"
                                    >
                                        {testing ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                                        Inspect SAML Assertion Claims
                                    </button>
                                </div>

                                {/* Diagnostic outcome */}
                                {testResult && (
                                    <div className="bg-white p-6 rounded-xl border border-slate-200">
                                        <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Diagnostic Output Result</h5>
                                        <pre className="text-[10px] font-mono text-slate-700 bg-slate-50 p-4 rounded-xl overflow-x-auto border border-slate-100 max-h-60 select-all">
                                            {JSON.stringify(testResult, null, 2)}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Audit log list */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                                <FileText className="w-4 h-4 text-slate-500 dark:text-slate-400" /> Authentication & Synchronization Logs
                            </h4>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                System audit history detailing SSO login attempts, provisioning actions, and group mappings.
                            </p>

                            {auditLogs.length > 0 ? (
                                <div className="border border-slate-100 rounded-2xl overflow-hidden bg-white shadow-xl shadow-slate-100/40">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                <th className="px-6 py-4">Timestamp</th>
                                                <th className="px-6 py-4">Event Type</th>
                                                <th className="px-6 py-4">User Email</th>
                                                <th className="px-6 py-4">Provider</th>
                                                <th className="px-6 py-4">Details</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 text-[11px] font-bold text-slate-600 dark:text-slate-400">
                                            {auditLogs.map((log) => (
                                                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-6 py-4 text-slate-400 select-none">
                                                        {new Date(log.created_at).toLocaleString()}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${
                                                            log.event_type === 'login_success' ? 'bg-green-50 text-green-700 border-green-200' :
                                                            log.event_type === 'login_failed' ? 'bg-red-50 text-red-700 border-red-200' :
                                                            log.event_type === 'provision_user' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                            'bg-slate-50 text-slate-700 border-slate-200'
                                                        }`}>
                                                            {log.event_type.replace('_', ' ')}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">{log.user_email}</td>
                                                    <td className="px-6 py-4 uppercase font-mono text-[10px]">{log.provider_name}</td>
                                                    <td className="px-6 py-4 font-mono text-[10px] text-slate-500 dark:text-slate-400 max-w-xs truncate">
                                                        {JSON.stringify(log.details)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs font-semibold">
                                    No authentication logs recorded yet.
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
        </ErrorBoundary>
    );
};

export default SSOConfig;
