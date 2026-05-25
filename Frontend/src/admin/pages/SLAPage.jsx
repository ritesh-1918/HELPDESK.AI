/**
 * SLAPage — Dedicated SLA Monitoring & Management Page
 *
 * Features:
 *   - Real-time SLA dashboard with KPIs
 *   - Per-priority breakdown visualization
 *   - Active violations list with escalation tracking
 *   - Escalation timeline / audit log
 *   - Alert configuration panel
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Clock,
  AlertTriangle,
  AlertCircle,
  ShieldCheck,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Filter,
  Bell,
  Settings,
  ExternalLink,
  Gauge,
  Activity,
  Users,
  TrendingUp,
} from 'lucide-react';
import SLADashboard from '../components/SLADashboard';
import SLABadge from '../components/SLABadge';

const API_BASE = import.meta.env.VITE_API_URL || 'https://helpdesk-ai-backend-iq0w.onrender.com';

// ── Data fetching helpers ────────────────────────────────────────────────────

async function fetchSLATickets(status = 'all') {
  const params = status !== 'all' ? `?status=${status}` : '';
  const res = await fetch(`${API_BASE}/sla/tickets${params}`, {
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function fetchEscalations(limit = 50) {
  const res = await fetch(`${API_BASE}/sla/escalations?limit=${limit}`, {
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function fetchSLAPolicies() {
  const res = await fetch(`${API_BASE}/sla/policies`, {
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ── Status styles ────────────────────────────────────────────────────────────

const STATUS_STYLES = {
  breached: { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA', icon: AlertCircle, label: 'Breached' },
  warning: { bg: '#FEFCE8', text: '#CA8A04', border: '#FDE68A', icon: AlertTriangle, label: 'Warning' },
  active: { bg: '#F0FDF4', text: '#16A34A', border: '#BBF7D0', icon: Activity, label: 'Active' },
  met: { bg: '#F1F5F9', text: '#64748B', border: '#E2E8F0', icon: ShieldCheck, label: 'SLA Met' },
};

const PRIORITY_STYLES = {
  critical: { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA' },
  high: { bg: '#FFF7ED', text: '#EA580C', border: '#FED7AA' },
  medium: { bg: '#FEFCE8', text: '#CA8A04', border: '#FDE68A' },
  low: { bg: '#F0FDF4', text: '#16A34A', border: '#BBF7D0' },
};

function formatDuration(seconds) {
  if (seconds == null) return '—';
  if (seconds <= 0) return 'Overdue';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hrs > 0) return `${hrs}h ${mins}m`;
  return `${mins}m`;
}

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now - d;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// ── SLAPage Component ────────────────────────────────────────────────────────

export default function SLAPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [tickets, setTickets] = useState([]);
  const [escalations, setEscalations] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [expandedEsc, setExpandedEsc] = useState(null);

  // ── Data Loading ────────────────────────────────────────────────────────────

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [ticketData, escData, policyData] = await Promise.all([
        fetchSLATickets(filterStatus),
        fetchEscalations(),
        fetchSLAPolicies(),
      ]);
      setTickets(Array.isArray(ticketData) ? ticketData : ticketData?.tickets || []);
      setEscalations(Array.isArray(escData) ? escData : escData?.escalations || []);
      setPolicies(Array.isArray(policyData) ? policyData : policyData?.policies || []);
    } catch (err) {
      console.error('[SLAPage] Fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Filtered tickets ────────────────────────────────────────────────────────

  const filteredTickets = useMemo(() => {
    let result = tickets;
    if (filterPriority !== 'all') {
      result = result.filter(t => (t.priority || '').toLowerCase() === filterPriority);
    }
    // Sort by severity: breached first, then warning, then active
    const order = { breached: 0, warning: 1, active: 2, met: 3 };
    result = [...result].sort((a, b) => {
      const aOrder = order[a.sla_status] ?? 99;
      const bOrder = order[b.sla_status] ?? 99;
      return aOrder - bOrder;
    });
    return result;
  }, [tickets, filterPriority]);

  // ── Stats card component ────────────────────────────────────────────────────

  const StatCard = ({ label, value, icon: Icon, color, bg, border, subtitle, pulse }) => (
    <div
      className="rounded-xl p-5 border transition-all hover:shadow-md"
      style={{ background: bg, borderColor: border }}
    >
      <div className="flex items-center justify-between mb-3">
        <Icon size={22} style={{ color }} />
        {pulse && <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />}
      </div>
      <p className="text-3xl font-bold" style={{ color }}>{value}</p>
      <p className="text-sm font-semibold text-gray-600 mt-1">{label}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
    </div>
  );

  // ── Tab navigation ──────────────────────────────────────────────────────────

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Gauge },
    { id: 'violations', label: 'Violations', icon: AlertTriangle },
    { id: 'escalations', label: 'Escalations', icon: Bell },
    { id: 'policies', label: 'SLA Policies', icon: Settings },
  ];

  // ── Render filters bar ──────────────────────────────────────────────────────

  const FiltersBar = () => (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg">
        <Filter size={14} className="text-gray-400" />
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="text-xs font-semibold text-gray-600 bg-transparent border-none outline-none cursor-pointer"
        >
          <option value="all">All Status</option>
          <option value="breached">Breached</option>
          <option value="warning">Warning</option>
          <option value="active">Active</option>
          <option value="met">Met</option>
        </select>
      </div>
      <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg">
        <Filter size={14} className="text-gray-400" />
        <select
          value={filterPriority}
          onChange={e => setFilterPriority(e.target.value)}
          className="text-xs font-semibold text-gray-600 bg-transparent border-none outline-none cursor-pointer"
        >
          <option value="all">All Priorities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>
      <button
        onClick={loadData}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <RefreshCw size={12} /> Refresh
      </button>
    </div>
  );

  // ── Render: Dashboard Tab ───────────────────────────────────────────────────

  const renderDashboard = () => <SLADashboard />;

  // ── Render: Violations Tab ──────────────────────────────────────────────────

  const renderViolations = () => {
    if (loading) {
      return (
        <div className="py-24 text-center">
          <RefreshCw size={32} className="animate-spin mx-auto mb-4 text-emerald-500" />
          <p className="text-sm text-gray-400 font-semibold">Loading violations...</p>
        </div>
      );
    }

    const activeViolations = filteredTickets.filter(
      t => t.sla_status === 'breached' || t.sla_status === 'warning'
    );

    if (activeViolations.length === 0) {
      return (
        <div className="py-24 text-center" style={{ border: '2px dashed #D1FAE5', borderRadius: '16px' }}>
          <ShieldCheck size={48} className="mx-auto mb-3 text-emerald-400" />
          <h3 className="text-lg font-bold text-emerald-700">No Active Violations</h3>
          <p className="text-sm text-gray-500 mt-1">All tickets within SLA limits.</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {activeViolations.map(ticket => {
          const pStyle = PRIORITY_STYLES[ticket.priority?.toLowerCase()] || PRIORITY_STYLES.medium;
          const sStyle = STATUS_STYLES[ticket.sla_status] || STATUS_STYLES.active;

          return (
            <div
              key={ticket.id}
              className="flex items-center justify-between p-4 rounded-xl border bg-white transition-all hover:shadow-md"
              style={{ borderColor: sStyle.border }}
            >
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <sStyle.icon size={20} style={{ color: sStyle.text }} className="flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-800 truncate">
                      {ticket.subject || ticket.summary || 'Untitled'}
                    </span>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded uppercase"
                      style={{ background: pStyle.bg, color: pStyle.text, border: `1px solid ${pStyle.border}` }}
                    >
                      {ticket.priority || 'MEDIUM'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-gray-400">
                      #{((ticket.ticket_id || ticket.id) || '').toString().slice(0, 8)}
                    </span>
                    <span className="text-xs text-gray-400">{ticket.assigned_team || 'Unassigned'}</span>
                    <span className="text-xs text-gray-400">
                      {formatDuration(ticket.remaining_seconds)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <SLABadge
                  priority={ticket.priority}
                  createdAt={ticket.created_at}
                  status={ticket.status}
                  compact
                />
                <a
                  href={`/admin/ticket/${ticket.ticket_id || ticket.id}`}
                  className="p-2 text-gray-400 hover:text-emerald-500 transition-colors"
                >
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // ── Render: Escalations Tab ─────────────────────────────────────────────────

  const renderEscalations = () => {
    if (loading) {
      return (
        <div className="py-24 text-center">
          <RefreshCw size={32} className="animate-spin mx-auto mb-4 text-emerald-500" />
          <p className="text-sm text-gray-400 font-semibold">Loading escalations...</p>
        </div>
      );
    }

    if (escalations.length === 0) {
      return (
        <div className="py-24 text-center" style={{ border: '2px dashed #E5E7EB', borderRadius: '16px' }}>
          <Bell size={40} className="mx-auto mb-3 text-gray-300" />
          <h3 className="text-sm font-bold text-gray-500">No Escalations Logged</h3>
          <p className="text-xs text-gray-400 mt-1">All tickets resolved within SLA.</p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {escalations.map((esc, idx) => {
          const isBreached = esc.sla_status === 'breached';
          const isExpanded = expandedEsc === (esc.id || idx);
          const level = esc.escalation_level || 0;

          return (
            <div
              key={esc.id || idx}
              className="rounded-xl border bg-white overflow-hidden transition-all"
              style={{ borderColor: isBreached ? '#FECACA' : '#E5E7EB' }}
            >
              <button
                onClick={() => setExpandedEsc(isExpanded ? null : (esc.id || idx))}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: isBreached ? '#FEF2F2' : '#FEFCE8' }}
                  >
                    {isBreached
                      ? <AlertCircle size={16} className="text-red-500" />
                      : <AlertTriangle size={16} className="text-amber-500" />
                    }
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {esc.ticket_subject || `Ticket #${((esc.ticket_id || '') + '').slice(0, 8)}`}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded"
                        style={{
                          background: isBreached ? '#FEF2F2' : '#FEFCE8',
                          color: isBreached ? '#DC2626' : '#CA8A04',
                        }}
                      >
                        L{level}
                      </span>
                      <span className="text-xs text-gray-400">{esc.assigned_team || 'Unassigned'}</span>
                      <span className="text-xs text-gray-400">{formatDate(esc.triggered_at)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span
                    className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${
                      isBreached ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                    }`}
                  >
                    {esc.sla_status}
                  </span>
                  {isExpanded ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
                </div>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 pt-0 border-t border-gray-100 bg-gray-50/50">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                    <div>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase">Status</p>
                      <p className="text-xs font-bold text-gray-700 mt-1">{esc.sla_status}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase">Level</p>
                      <p className="text-xs font-bold text-gray-700 mt-1">{level}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase">Remaining</p>
                      <p className="text-xs font-bold text-gray-700 mt-1">{formatDuration(esc.remaining_seconds)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase">Priority</p>
                      <p className="text-xs font-bold text-gray-700 mt-1">{esc.priority || 'N/A'}</p>
                    </div>
                  </div>
                  {esc.notification_channels && esc.notification_channels.length > 0 && (
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-[10px] font-semibold text-gray-400 uppercase">Channels:</span>
                      {esc.notification_channels.map((ch, i) => (
                        <span
                          key={i}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            ch.includes('OK') ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
                          }`}
                        >
                          {ch}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // ── Render: Policies Tab ────────────────────────────────────────────────────

  const renderPolicies = () => {
    if (policies.length === 0) {
      return (
        <div className="py-16 text-center" style={{ border: '2px dashed #E5E7EB', borderRadius: '16px' }}>
          <Settings size={40} className="mx-auto mb-3 text-gray-300" />
          <h3 className="text-sm font-bold text-gray-500">Default Policies Active</h3>
          <p className="text-xs text-gray-400 mt-1">Custom policies can be configured from the database.</p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
              <th className="text-[10px] font-bold text-gray-500 uppercase tracking-wider p-4 text-left">Priority</th>
              <th className="text-[10px] font-bold text-gray-500 uppercase tracking-wider p-4 text-left">Max Hours</th>
              <th className="text-[10px] font-bold text-gray-500 uppercase tracking-wider p-4 text-left">Warning At</th>
              <th className="text-[10px] font-bold text-gray-500 uppercase tracking-wider p-4 text-left">Auto Escalate</th>
              <th className="text-[10px] font-bold text-gray-500 uppercase tracking-wider p-4 text-left">L2 Escalation</th>
              <th className="text-[10px] font-bold text-gray-500 uppercase tracking-wider p-4 text-left">L3 Escalation</th>
            </tr>
          </thead>
          <tbody>
            {policies.map((p, idx) => {
              const colors = PRIORITY_STYLES[p.priority] || PRIORITY_STYLES.medium;
              return (
                <tr key={p.id || idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <span
                      className="text-xs font-bold uppercase px-3 py-1 rounded-full"
                      style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
                    >
                      {p.priority}
                    </span>
                  </td>
                  <td className="p-4 text-sm font-semibold text-gray-700">{p.max_hours}h</td>
                  <td className="p-4 text-sm font-semibold text-gray-700">{Math.round((p.warning_pct || 0.75) * 100)}%</td>
                  <td className="p-4">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded ${
                        p.auto_escalate ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {p.auto_escalate ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-600">{p.l2_after_minutes > 0 ? `${p.l2_after_minutes}m` : 'Immediate'}</td>
                  <td className="p-4 text-sm text-gray-600">{p.l3_after_minutes > 0 ? `${p.l3_after_minutes}m` : '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  // ── Main Render ────────────────────────────────────────────────────────────

  return (
    <div style={{ background: '#F8FAF9', minHeight: '100vh', paddingBottom: '60px' }} className="space-y-8 -m-6 p-6 md:-m-10 md:p-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900" style={{ fontFamily: 'Syne, sans-serif' }}>
            SLA Monitor
          </h1>
          <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
            Service-Level Agreement Management
          </p>
        </div>
        <FiltersBar />
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 bg-white rounded-xl border border-gray-100 w-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === tab.id
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'violations' && renderViolations()}
        {activeTab === 'escalations' && renderEscalations()}
        {activeTab === 'policies' && renderPolicies()}
      </div>
    </div>
  );
}
