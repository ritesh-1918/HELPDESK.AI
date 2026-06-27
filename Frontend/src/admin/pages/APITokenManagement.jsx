import React, { useState, useEffect, useCallback } from 'react';
import {
    Key,
    Plus,
    Trash2,
    RefreshCw,
    Copy,
    CheckCircle,
    XCircle,
    Eye,
    EyeOff,
    Shield,
    Activity,
    AlertTriangle,
    Clock,
    X,
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import useAuthStore from '../../store/authStore';
import { API_CONFIG } from '../../config';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const BACKEND_URL = API_CONFIG.BACKEND_URL;

const ALL_SCOPES = [
    { id: 'tickets:read',     label: 'Tickets — Read',      desc: 'View and search tickets' },
    { id: 'tickets:write',    label: 'Tickets — Write',     desc: 'Create, update, and comment on tickets' },
    { id: 'tickets:delete',   label: 'Tickets — Delete',    desc: 'Permanently delete tickets' },
    { id: 'users:read',       label: 'Users — Read',        desc: 'Look up users and team members' },
    { id: 'analytics:read',   label: 'Analytics — Read',    desc: 'Access dashboards and reports' },
    { id: 'attachments:read', label: 'Attachments — Read',  desc: 'Download files and attachments' },
    { id: 'status:read',      label: 'Status — Read',       desc: 'Health checks and monitoring' },
];

const EXPIRY_OPTIONS = [
    { days: 30,  label: '30 days' },
    { days: 90,  label: '90 days' },
    { days: 180, label: '180 days' },
    { days: 365, label: '1 year' },
];

const STATUS_STYLES = {
    active:  { bg: '#dcfce7', color: '#15803d', border: '#bbf7d0', dot: '#22c55e' },
    revoked: { bg: '#fef2f2', color: '#dc2626', border: '#fecaca', dot: '#ef4444' },
    expired: { bg: '#f3f4f6', color: '#6b7280', border: '#e5e7eb', dot: '#9ca3af' },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fmtDate(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtDateTime(iso) {
    if (!iso) return 'Never';
    return new Date(iso).toLocaleString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}

function daysLeft(expiresAt) {
    if (!expiresAt) return null;
    const diff = Math.ceil((new Date(expiresAt) - Date.now()) / 86_400_000);
    return diff;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatusBadge({ status }) {
    const s = STATUS_STYLES[status] || STATUS_STYLES.expired;
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '2px 10px', borderRadius: 100,
            background: s.bg, color: s.color, border: `1px solid ${s.border}`,
            fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
        }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.dot }} />
            {status}
        </span>
    );
}

function ScopeChip({ scope }) {
    return (
        <span style={{
            display: 'inline-block', padding: '2px 8px',
            background: '#eff6ff', color: '#2563eb',
            border: '1px solid #bfdbfe', borderRadius: 6,
            fontSize: 10, fontWeight: 600, fontFamily: 'monospace',
        }}>
            {scope}
        </span>
    );
}

function CopyButton({ value }) {
    const [copied, setCopied] = useState(false);
    const copy = () => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <button onClick={copy} title="Copy to clipboard" style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: copied ? '#16a34a' : '#6b7280', padding: 4,
            transition: 'color 0.2s',
        }}>
            {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
        </button>
    );
}

// ---------------------------------------------------------------------------
// Create Token Modal
// ---------------------------------------------------------------------------

function CreateTokenModal({ onClose, onCreated }) {
    const [name, setName] = useState('');
    const [selectedScopes, setSelectedScopes] = useState([]);
    const [expiryDays, setExpiryDays] = useState(90);
    const [ipList, setIpList] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const { profile } = useAuthStore();

    const toggleScope = (id) => {
        setSelectedScopes(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    };

    const handleCreate = async () => {
        if (!name.trim()) { setError('Token name is required.'); return; }
        if (selectedScopes.length === 0) { setError('Select at least one scope.'); return; }
        setLoading(true);
        setError(null);
        try {
            const { data: sessionData } = await supabase.auth.getSession();
            const accessToken = sessionData?.session?.access_token;
            const res = await fetch(`${BACKEND_URL}/api-tokens`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
                },
                body: JSON.stringify({
                    name: name.trim(),
                    scopes: selectedScopes,
                    expires_in_days: expiryDays,
                    allowed_ips: ipList.split('\n').map(s => s.trim()).filter(Boolean),
                }),
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.detail || 'Failed to create token.');
            }
            const token = await res.json();
            onCreated(token);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
            backdropFilter: 'blur(4px)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
        }}>
            <div style={{
                background: '#fff', borderRadius: 20, width: '100%', maxWidth: 560,
                boxShadow: '0 24px 60px rgba(0,0,0,0.18)', maxHeight: '90vh', overflowY: 'auto',
            }}>
                {/* Modal header */}
                <div style={{ padding: '24px 28px 16px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ background: '#eff6ff', borderRadius: 10, padding: 8 }}>
                            <Key size={18} color="#2563eb" />
                        </div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#0f172a' }}>Create API Token</h2>
                            <p style={{ margin: '2px 0 0', fontSize: 11, color: '#6b7280' }}>Token secret shown once — save it immediately.</p>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 4 }}>
                        <X size={18} />
                    </button>
                </div>

                <div style={{ padding: '20px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {/* Name */}
                    <div>
                        <label style={{ fontSize: 11, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>
                            Token Name *
                        </label>
                        <input
                            id="token-name-input"
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="e.g. Vendor Reporting Integration"
                            style={{
                                width: '100%', boxSizing: 'border-box',
                                border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '10px 14px',
                                fontSize: 14, color: '#0f172a', outline: 'none',
                                fontFamily: 'inherit',
                            }}
                        />
                    </div>

                    {/* Scopes */}
                    <div>
                        <label style={{ fontSize: 11, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 10 }}>
                            Permission Scopes *
                        </label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {ALL_SCOPES.map(s => (
                                <label key={s.id} style={{
                                    display: 'flex', alignItems: 'center', gap: 10,
                                    padding: '8px 12px', borderRadius: 10, cursor: 'pointer',
                                    background: selectedScopes.includes(s.id) ? '#eff6ff' : '#f9fafb',
                                    border: `1.5px solid ${selectedScopes.includes(s.id) ? '#93c5fd' : '#e5e7eb'}`,
                                    transition: 'all 0.15s',
                                }}>
                                    <input
                                        type="checkbox"
                                        checked={selectedScopes.includes(s.id)}
                                        onChange={() => toggleScope(s.id)}
                                        style={{ accentColor: '#2563eb', width: 14, height: 14 }}
                                    />
                                    <div style={{ flex: 1 }}>
                                        <span style={{ fontSize: 12, fontWeight: 600, color: '#0f172a', fontFamily: 'monospace' }}>{s.id}</span>
                                        <p style={{ margin: 0, fontSize: 11, color: '#6b7280' }}>{s.desc}</p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Expiry */}
                    <div>
                        <label style={{ fontSize: 11, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>
                            Expiration
                        </label>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            {EXPIRY_OPTIONS.map(opt => (
                                <button
                                    key={opt.days}
                                    onClick={() => setExpiryDays(opt.days)}
                                    style={{
                                        padding: '6px 14px', borderRadius: 8, cursor: 'pointer',
                                        border: `1.5px solid ${expiryDays === opt.days ? '#2563eb' : '#e5e7eb'}`,
                                        background: expiryDays === opt.days ? '#eff6ff' : '#f9fafb',
                                        color: expiryDays === opt.days ? '#2563eb' : '#6b7280',
                                        fontSize: 12, fontWeight: 600, transition: 'all 0.15s',
                                    }}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* IP Allowlist */}
                    <div>
                        <label style={{ fontSize: 11, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>
                            IP Allowlist <span style={{ fontWeight: 400, textTransform: 'none' }}>(optional — one IP or CIDR per line)</span>
                        </label>
                        <textarea
                            value={ipList}
                            onChange={e => setIpList(e.target.value)}
                            placeholder={'203.0.113.10\n198.51.100.0/24'}
                            rows={3}
                            style={{
                                width: '100%', boxSizing: 'border-box',
                                border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '10px 14px',
                                fontSize: 12, color: '#0f172a', fontFamily: 'monospace',
                                resize: 'vertical', outline: 'none',
                            }}
                        />
                    </div>

                    {error && (
                        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 14px', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                            <AlertTriangle size={14} color="#dc2626" style={{ flexShrink: 0, marginTop: 1 }} />
                            <span style={{ fontSize: 12, color: '#dc2626' }}>{error}</span>
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                        <button onClick={onClose} style={{
                            padding: '10px 20px', borderRadius: 10,
                            border: '1.5px solid #e5e7eb', background: '#f9fafb',
                            color: '#6b7280', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                        }}>
                            Cancel
                        </button>
                        <button
                            id="create-token-submit-btn"
                            onClick={handleCreate}
                            disabled={loading}
                            style={{
                                padding: '10px 24px', borderRadius: 10, border: 'none',
                                background: loading ? '#93c5fd' : '#2563eb',
                                color: '#fff', fontSize: 13, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                                transition: 'background 0.2s',
                            }}
                        >
                            {loading ? 'Creating…' : 'Create Token'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// One-Time Token Display Modal
// ---------------------------------------------------------------------------

function TokenSecretModal({ token, onClose }) {
    const [visible, setVisible] = useState(false);

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(4px)', zIndex: 1100,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
        }}>
            <div style={{
                background: '#fff', borderRadius: 20, width: '100%', maxWidth: 520,
                boxShadow: '0 24px 60px rgba(0,0,0,0.22)',
            }}>
                <div style={{ padding: '24px 28px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                        <div style={{ background: '#f0fdf4', borderRadius: 10, padding: 8 }}>
                            <Shield size={18} color="#16a34a" />
                        </div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#0f172a' }}>Token Created</h2>
                            <p style={{ margin: '2px 0 0', fontSize: 11, color: '#dc2626', fontWeight: 600 }}>
                                ⚠ Copy your secret now — it will never be shown again.
                            </p>
                        </div>
                    </div>

                    <div style={{
                        background: '#0f172a', borderRadius: 12, padding: '14px 16px',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                        marginBottom: 16,
                    }}>
                        <code style={{
                            color: '#a3e635', fontFamily: 'monospace', fontSize: 13,
                            flex: 1, wordBreak: 'break-all',
                            filter: visible ? 'none' : 'blur(5px)',
                            userSelect: visible ? 'text' : 'none',
                            transition: 'filter 0.2s',
                        }}>
                            {token.raw_token}
                        </code>
                        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                            <button
                                onClick={() => setVisible(v => !v)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 4 }}
                                title={visible ? 'Hide token' : 'Reveal token'}
                            >
                                {visible ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                            <CopyButton value={token.raw_token} />
                        </div>
                    </div>

                    <div style={{ background: '#fefce8', border: '1px solid #fef08a', borderRadius: 10, padding: '10px 14px', marginBottom: 20 }}>
                        <p style={{ margin: 0, fontSize: 12, color: '#854d0e', lineHeight: 1.6 }}>
                            Use this token as an <strong>Authorization: Bearer</strong> header. It expires on{' '}
                            <strong>{fmtDate(token.expires_at)}</strong>
                            {token.allowed_ips?.length ? ` and is restricted to ${token.allowed_ips.length} IP(s).` : '.'}
                        </p>
                    </div>
                </div>

                <div style={{ padding: '0 28px 24px', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                        id="token-secret-done-btn"
                        onClick={onClose}
                        style={{
                            padding: '10px 28px', borderRadius: 10, border: 'none',
                            background: '#0f172a', color: '#fff',
                            fontSize: 13, fontWeight: 700, cursor: 'pointer',
                        }}
                    >
                        I've saved it — Done
                    </button>
                </div>
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Token Row
// ---------------------------------------------------------------------------

function TokenRow({ token, onRevoke, onRotate }) {
    const days = daysLeft(token.expires_at);
    const expiringSoon = days !== null && days <= 14 && token.status === 'active';

    return (
        <div style={{
            background: '#fff', border: '1px solid #f0f0f0', borderRadius: 16,
            padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10,
        }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{token.name}</span>
                        <StatusBadge status={token.status} />
                        {expiringSoon && (
                            <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: 4,
                                fontSize: 10, fontWeight: 700, color: '#d97706',
                                background: '#fffbeb', border: '1px solid #fde68a',
                                borderRadius: 100, padding: '2px 8px',
                            }}>
                                <Clock size={10} /> Expires in {days}d
                            </span>
                        )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <code style={{ fontSize: 11, color: '#6b7280', background: '#f8fafc', padding: '2px 8px', borderRadius: 6 }}>
                            {token.token_prefix}…
                        </code>
                        <span style={{ fontSize: 11, color: '#9ca3af' }}>•</span>
                        <span style={{ fontSize: 11, color: '#9ca3af' }}>
                            Created {fmtDate(token.created_at)}
                        </span>
                        <span style={{ fontSize: 11, color: '#9ca3af' }}>•</span>
                        <span style={{ fontSize: 11, color: '#9ca3af' }}>
                            Last used: {fmtDateTime(token.last_used_at)}
                        </span>
                    </div>
                </div>

                {token.status === 'active' && (
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                        <button
                            onClick={() => onRotate(token)}
                            title="Rotate token"
                            style={{
                                display: 'flex', alignItems: 'center', gap: 5,
                                padding: '6px 12px', borderRadius: 8, cursor: 'pointer',
                                border: '1.5px solid #e5e7eb', background: '#f9fafb',
                                color: '#374151', fontSize: 11, fontWeight: 600,
                                transition: 'all 0.15s',
                            }}
                        >
                            <RefreshCw size={12} /> Rotate
                        </button>
                        <button
                            onClick={() => onRevoke(token)}
                            title="Revoke token"
                            style={{
                                display: 'flex', alignItems: 'center', gap: 5,
                                padding: '6px 12px', borderRadius: 8, cursor: 'pointer',
                                border: '1.5px solid #fecaca', background: '#fef2f2',
                                color: '#dc2626', fontSize: 11, fontWeight: 600,
                                transition: 'all 0.15s',
                            }}
                        >
                            <Trash2 size={12} /> Revoke
                        </button>
                    </div>
                )}
            </div>

            {/* Scopes */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {(token.scopes || []).map(s => <ScopeChip key={s} scope={s} />)}
            </div>

            {/* IP Allowlist indicator */}
            {token.allowed_ips?.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Shield size={12} color="#6b7280" />
                    <span style={{ fontSize: 11, color: '#6b7280' }}>
                        Restricted to {token.allowed_ips.length} IP{token.allowed_ips.length !== 1 ? 's' : ''}:
                        {' '}{token.allowed_ips.slice(0, 3).join(', ')}{token.allowed_ips.length > 3 ? '…' : ''}
                    </span>
                </div>
            )}
        </div>
    );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

const APITokenManagement = () => {
    const { profile } = useAuthStore();
    const [tokens, setTokens] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreate, setShowCreate] = useState(false);
    const [newToken, setNewToken] = useState(null);
    const [revokeTarget, setRevokeTarget] = useState(null);
    const [revokeReason, setRevokeReason] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    const fetchTokens = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { data: sessionData } = await supabase.auth.getSession();
            const accessToken = sessionData?.session?.access_token;
            const res = await fetch(`${BACKEND_URL}/api-tokens`, {
                headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
            });
            if (!res.ok) throw new Error('Failed to load tokens.');
            const data = await res.json();
            setTokens(data);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchTokens(); }, [fetchTokens]);

    const handleCreated = (token) => {
        setShowCreate(false);
        setNewToken(token);
        fetchTokens();
    };

    const handleRevoke = async () => {
        if (!revokeTarget) return;
        setActionLoading(true);
        try {
            const { data: sessionData } = await supabase.auth.getSession();
            const accessToken = sessionData?.session?.access_token;
            const res = await fetch(`${BACKEND_URL}/api-tokens/${revokeTarget.id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
                },
                body: JSON.stringify({ reason: revokeReason }),
            });
            if (!res.ok) throw new Error('Revocation failed.');
            setRevokeTarget(null);
            setRevokeReason('');
            fetchTokens();
        } catch (e) {
            setError(e.message);
        } finally {
            setActionLoading(false);
        }
    };

    const handleRotate = async (token) => {
        setActionLoading(true);
        try {
            const { data: sessionData } = await supabase.auth.getSession();
            const accessToken = sessionData?.session?.access_token;
            const res = await fetch(`${BACKEND_URL}/api-tokens/${token.id}/rotate`, {
                method: 'POST',
                headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
            });
            if (!res.ok) throw new Error('Rotation failed.');
            const rotated = await res.json();
            setNewToken(rotated);
            fetchTokens();
        } catch (e) {
            setError(e.message);
        } finally {
            setActionLoading(false);
        }
    };

    const activeCount  = tokens.filter(t => t.status === 'active').length;
    const revokedCount = tokens.filter(t => t.status === 'revoked').length;
    const expiredCount = tokens.filter(t => t.status === 'expired').length;

    return (
        <div style={{ maxWidth: 900, margin: '0 auto', paddingBottom: 48 }}>
            {/* ── Header ──────────────────────────────────────────────── */}
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 32, flexWrap: 'wrap' }}>
                <div>
                    <h1 style={{
                        margin: 0, fontSize: 26, fontWeight: 900, color: '#0f172a',
                        display: 'flex', alignItems: 'center', gap: 10,
                        fontFamily: 'Syne, sans-serif', letterSpacing: '-0.02em',
                    }}>
                        <Key size={22} color="#2563eb" /> API Token Management
                    </h1>
                    <p style={{ margin: '6px 0 0', fontSize: 13, color: '#6b7280', fontWeight: 500 }}>
                        Create scoped credentials for integrations. Tokens follow the Principle of Least Privilege.
                    </p>
                </div>
                <button
                    id="open-create-token-modal-btn"
                    onClick={() => setShowCreate(true)}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '10px 20px', borderRadius: 12, border: 'none',
                        background: '#2563eb', color: '#fff',
                        fontSize: 13, fontWeight: 700, cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(37,99,235,0.3)',
                        transition: 'transform 0.15s, box-shadow 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}
                >
                    <Plus size={16} /> New Token
                </button>
            </div>

            {/* ── Stats row ───────────────────────────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
                {[
                    { label: 'Active', value: activeCount,  bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0', icon: <CheckCircle size={18} /> },
                    { label: 'Revoked', value: revokedCount, bg: '#fef2f2', color: '#dc2626', border: '#fecaca', icon: <XCircle size={18} /> },
                    { label: 'Expired', value: expiredCount, bg: '#f3f4f6', color: '#6b7280', border: '#e5e7eb', icon: <Clock size={18} /> },
                ].map(item => (
                    <div key={item.label} style={{
                        background: item.bg, border: `1px solid ${item.border}`,
                        borderRadius: 14, padding: '16px 20px',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}>
                        <div>
                            <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: item.color, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                {item.label}
                            </p>
                            <p style={{ margin: '4px 0 0', fontSize: 28, fontWeight: 900, color: item.color, lineHeight: 1 }}>
                                {item.value}
                            </p>
                        </div>
                        <span style={{ color: item.color, opacity: 0.7 }}>{item.icon}</span>
                    </div>
                ))}
            </div>

            {/* ── Scope reference ─────────────────────────────────────── */}
            <div style={{ background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 14, padding: '16px 20px', marginBottom: 28 }}>
                <p style={{ margin: '0 0 10px', fontSize: 11, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Activity size={13} /> Available Scopes
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {ALL_SCOPES.map(s => (
                        <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <ScopeChip scope={s.id} />
                            <span style={{ fontSize: 11, color: '#6b7280' }}>{s.desc}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Error banner ────────────────────────────────────────── */}
            {error && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '12px 16px', marginBottom: 20, display: 'flex', gap: 10, alignItems: 'center' }}>
                    <AlertTriangle size={16} color="#dc2626" />
                    <span style={{ fontSize: 13, color: '#dc2626' }}>{error}</span>
                    <button onClick={() => setError(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626' }}>
                        <X size={14} />
                    </button>
                </div>
            )}

            {/* ── Token list ──────────────────────────────────────────── */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '48px 0', color: '#9ca3af', fontSize: 13 }}>
                    Loading tokens…
                </div>
            ) : tokens.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 0' }}>
                    <Key size={40} color="#d1d5db" style={{ marginBottom: 12 }} />
                    <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#6b7280' }}>No API tokens yet</p>
                    <p style={{ margin: '6px 0 0', fontSize: 13, color: '#9ca3af' }}>Create your first token to enable secure integrations.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {tokens.map(token => (
                        <TokenRow
                            key={token.id}
                            token={token}
                            onRevoke={t => { setRevokeTarget(t); setRevokeReason(''); }}
                            onRotate={handleRotate}
                        />
                    ))}
                </div>
            )}

            {/* ── Modals ──────────────────────────────────────────────── */}
            {showCreate && (
                <CreateTokenModal
                    onClose={() => setShowCreate(false)}
                    onCreated={handleCreated}
                />
            )}

            {newToken && (
                <TokenSecretModal
                    token={newToken}
                    onClose={() => setNewToken(null)}
                />
            )}

            {/* Revoke confirm dialog */}
            {revokeTarget && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
                    backdropFilter: 'blur(4px)', zIndex: 1000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
                }}>
                    <div style={{ background: '#fff', borderRadius: 18, width: '100%', maxWidth: 420, boxShadow: '0 20px 50px rgba(0,0,0,0.18)', padding: 28 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                            <div style={{ background: '#fef2f2', borderRadius: 10, padding: 8 }}>
                                <AlertTriangle size={18} color="#dc2626" />
                            </div>
                            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#0f172a' }}>Revoke Token</h2>
                        </div>
                        <p style={{ margin: '0 0 14px', fontSize: 13, color: '#374151', lineHeight: 1.6 }}>
                            You are about to immediately revoke <strong>{revokeTarget.name}</strong>.
                            Any integration using this token will lose access instantly.
                        </p>
                        <label style={{ fontSize: 11, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>
                            Reason (optional)
                        </label>
                        <input
                            type="text"
                            value={revokeReason}
                            onChange={e => setRevokeReason(e.target.value)}
                            placeholder="e.g. Contractor offboarding"
                            style={{
                                width: '100%', boxSizing: 'border-box',
                                border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '8px 12px',
                                fontSize: 13, fontFamily: 'inherit', outline: 'none', marginBottom: 18,
                            }}
                        />
                        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                            <button onClick={() => setRevokeTarget(null)} style={{
                                padding: '9px 18px', borderRadius: 10,
                                border: '1.5px solid #e5e7eb', background: '#f9fafb',
                                color: '#6b7280', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                            }}>
                                Cancel
                            </button>
                            <button
                                id="confirm-revoke-token-btn"
                                onClick={handleRevoke}
                                disabled={actionLoading}
                                style={{
                                    padding: '9px 18px', borderRadius: 10, border: 'none',
                                    background: actionLoading ? '#fca5a5' : '#dc2626',
                                    color: '#fff', fontSize: 13, fontWeight: 700,
                                    cursor: actionLoading ? 'not-allowed' : 'pointer',
                                }}
                            >
                                {actionLoading ? 'Revoking…' : 'Revoke Now'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Security note ───────────────────────────────────────── */}
            <div style={{ marginTop: 32, display: 'flex', gap: 10, padding: '14px 18px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 12 }}>
                <Shield size={16} color="#2563eb" style={{ flexShrink: 0, marginTop: 1 }} />
                <p style={{ margin: 0, fontSize: 12, color: '#1d4ed8', lineHeight: 1.6 }}>
                    <strong>Security:</strong> Token secrets are hashed with SHA-256 and never stored in plaintext.
                    If a token is compromised, revoke it immediately without affecting other integrations.
                    All token events are captured in the audit log.
                </p>
            </div>
        </div>
    );
};

export default APITokenManagement;
