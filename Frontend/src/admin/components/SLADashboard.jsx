/**
 * SLA Dashboard Widget — Real-time SLA monitoring panel
 *
 * Displays:
 *   - Active vs breached vs warning counts
 *   - Breach rate percentage
 *   - Per-priority breakdown
 *   - Recent escalations
 *   - Trend indicators
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Clock,
  AlertTriangle,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Activity,
  RefreshCw,
  ArrowUpRight,
  ChevronRight,
  Users,
  Gauge,
} from 'lucide-react';

const PRIORITY_COLORS = {
  critical: { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA', dot: '#DC2626' },
  high: { bg: '#FFF7ED', text: '#EA580C', border: '#FED7AA', dot: '#EA580C' },
  medium: { bg: '#FEFCE8', text: '#CA8A04', border: '#FDE68A', dot: '#CA8A04' },
  low: { bg: '#F0FDF4', text: '#16A34A', border: '#BBF7D0', dot: '#16A34A' },
};

const API_BASE = import.meta.env.VITE_API_URL || 'https://helpdesk-ai-backend-iq0w.onrender.com';

/**
 * Fetch SLA dashboard stats from the backend.
 */
async function fetchSLAStats() {
  const res = await fetch(`${API_BASE}/sla/stats`, {
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/**
 * Fetch recent escalations.
 */
async function fetchEscalations(limit = 10) {
  const res = await fetch(`${API_BASE}/sla/escalations?limit=${limit}`, {
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/**
 * Format seconds to human-readable duration.
 */
function formatDuration(seconds) {
  if (!seconds && seconds !== 0) return '—';
  if (seconds <= 0) return 'Overdue';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hrs > 0) return `${hrs}h ${mins}m`;
  return `${mins}m`;
}

/**
 * Main SLA Dashboard Component
 */
export default function SLADashboard({ compact = false, onViewAll }) {
  const [stats, setStats] = useState(null);
  const [escalations, setEscalations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const [statsData, escData] = await Promise.all([
        fetchSLAStats(),
        fetchEscalations(compact ? 5 : 10),
      ]);
      setStats(statsData);
      setEscalations(escData?.escalations || escData || []);
      setError(null);
    } catch (err) {
      console.error('[SLA-Dashboard] Fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(fetchData, 60_000);
    return () => clearInterval(interval);
  }, []);

  // ── KPIs ──────────────────────────────────────────────────────────────────

  const kpis = useMemo(() => {
    if (!stats) return [];
    return [
      {
        label: 'Active Tickets',
        value: stats.active ?? 0,
        icon: Activity,
        color: '#3b82f6',
        bg: '#EFF6FF',
        border: '#BFDBFE',
        subtitle: 'Being monitored',
      },
      {
        label: 'SLA Warnings',
        value: stats.warning ?? 0,
        icon: AlertTriangle,
        color: '#F59E0B',
        bg: '#FEFCE8',
        border: '#FDE68A',
        subtitle: 'Nearing breach',
        pulse: (stats.warning ?? 0) > 0,
      },
      {
        label: 'SLA Breached',
        value: stats.breached ?? 0,
        icon: AlertCircle,
        color: '#DC2626',
        bg: '#FEF2F2',
        border: '#FECACA',
        subtitle: 'Requires immediate action',
        pulse: (stats.breached ?? 0) > 0,
      },
      {
        label: 'Breach Rate',
        value: stats.breach_rate != null ? `${stats.breach_rate}%` : '0%',
        icon: Gauge,
        color: (stats.breach_rate ?? 0) > 10 ? '#DC2626' : '#16A34A',
        bg: (stats.breach_rate ?? 0) > 10 ? '#FEF2F2' : '#F0FDF4',
        border: (stats.breach_rate ?? 0) > 10 ? '#FECACA' : '#BBF7D0',
        subtitle: 'Of total tickets',
      },
    ];
  }, [stats]);

  // ── Loading state ─────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="py-16 text-center">
        <RefreshCw size={32} className="animate-spin mx-auto mb-4 text-emerald-500" />
        <p className="text-sm text-gray-400 font-semibold uppercase tracking-wider">
          Loading SLA Dashboard...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-16 text-center" style={{ border: '2px dashed #FECACA', borderRadius: '16px' }}>
        <AlertCircle size={40} className="mx-auto mb-3 text-red-400" />
        <h3 className="text-sm font-bold text-red-600 mb-1">Connection Error</h3>
        <p className="text-xs text-gray-500">{error}</p>
        <button
          onClick={fetchData}
          className="mt-4 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-red-100 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  // ── Empty state ───────────────────────────────────────────────────────────

  if (!stats || (stats.active === 0 && stats.breached === 0)) {
    return (
      <div className="py-16 text-center" style={{ border: '2px dashed #D1FAE5', borderRadius: '16px' }}>
        <ShieldCheck size={40} className="mx-auto mb-3 text-emerald-400" />
        <h3 className="text-sm font-bold text-emerald-700 mb-1">All SLA Targets Met</h3>
        <p className="text-xs text-gray-500">No active SLA violations.</p>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header with refresh */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock size={18} className="text-emerald-500" />
          <h3 className="text-sm font-bold text-gray-800">SLA Monitoring</h3>
        </div>
        <button
          onClick={fetchData}
          disabled={refreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-500 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* KPI Cards */}
      <div className={`grid gap-4 ${compact ? 'grid-cols-2' : 'grid-cols-2 lg:grid-cols-4'}`}>
        {kpis.map((kpi, idx) => (
          <div
            key={idx}
            className="rounded-xl p-4 border transition-all hover:shadow-md"
            style={{
              background: kpi.bg,
              borderColor: kpi.border,
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <kpi.icon size={20} style={{ color: kpi.color }} />
              <div
                className={`w-2 h-2 rounded-full ${kpi.pulse ? 'animate-pulse' : ''}`}
                style={{ background: kpi.color }}
              />
            </div>
            <p className="text-2xl font-bold" style={{ color: kpi.color }}>
              {kpi.value}
            </p>
            <p className="text-xs font-semibold text-gray-600 mt-1">{kpi.label}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{kpi.subtitle}</p>
          </div>
        ))}
      </div>

      {/* Per-Priority Breakdown */}
      {stats?.by_priority && !compact && (
        <div className="rounded-2xl border border-gray-100 bg-white p-5">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
            SLA Breakdown by Priority
          </h4>
          <div className="space-y-3">
            {Object.entries(stats.by_priority).map(([priority, data]) => {
              const colors = PRIORITY_COLORS[priority] || PRIORITY_COLORS.medium;
              const total = data.total || 0;
              const breached = data.breached || 0;
              const warning = data.warning || 0;
              const healthy = total - breached - warning;
              const breachPct = total > 0 ? Math.round((breached / total) * 100) : 0;

              return (
                <div key={priority} className="flex items-center gap-3">
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider min-w-[60px]"
                    style={{ color: colors.text }}
                  >
                    {priority}
                  </span>
                  <div className="flex-1 h-2.5 rounded-full bg-gray-100 overflow-hidden flex">
                    {healthy > 0 && (
                      <div
                        className="h-full transition-all duration-500"
                        style={{
                          width: `${total > 0 ? (healthy / total) * 100 : 0}%`,
                          background: '#16A34A',
                        }}
                      />
                    )}
                    {warning > 0 && (
                      <div
                        className="h-full transition-all duration-500"
                        style={{
                          width: `${total > 0 ? (warning / total) * 100 : 0}%`,
                          background: '#F59E0B',
                        }}
                      />
                    )}
                    {breached > 0 && (
                      <div
                        className="h-full transition-all duration-500"
                        style={{
                          width: `${total > 0 ? (breached / total) * 100 : 0}%`,
                          background: '#DC2626',
                        }}
                      />
                    )}
                  </div>
                  <span className="text-xs font-semibold text-gray-600 min-w-[40px] text-right">
                    {total}
                  </span>
                  {breachPct > 0 && (
                    <span className="text-[10px] font-bold text-red-500 min-w-[36px] text-right">
                      {breachPct}%
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Escalations */}
      {escalations.length > 0 && !compact && (
        <div className="rounded-2xl border border-gray-100 bg-white p-5">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Recent Escalations
            </h4>
            {onViewAll && (
              <button
                onClick={onViewAll}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                View All <ChevronRight size={12} />
              </button>
            )}
          </div>
          <div className="space-y-2">
            {escalations.slice(0, compact ? 3 : 5).map((esc, idx) => {
              const status = esc.sla_status || 'breached';
              const level = esc.escalation_level || 0;
              const isBreached = status === 'breached';
              return (
                <div
                  key={esc.id || idx}
                  className="flex items-center justify-between p-3 rounded-xl border transition-colors hover:bg-gray-50"
                  style={{
                    borderColor: isBreached ? '#FECACA' : '#FDE68A',
                    background: isBreached ? '#FFFBFB' : '#FFFEF9',
                  }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: isBreached ? '#FEF2F2' : '#FEFCE8' }}
                    >
                      {isBreached
                        ? <AlertCircle size={14} className="text-red-500" />
                        : <AlertTriangle size={14} className="text-amber-500" />
                      }
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-gray-800 truncate">
                        {esc.ticket_subject || `Ticket #${(esc.ticket_id || '').toString().slice(0, 8)}`}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        L{level} · {esc.assigned_team || 'Unassigned'}
                        {esc.remaining_seconds != null && ` · ${formatDuration(esc.remaining_seconds)}`}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider flex-shrink-0 ${
                      isBreached
                        ? 'bg-red-50 text-red-600 border border-red-200'
                        : 'bg-amber-50 text-amber-600 border border-amber-200'
                    }`}
                  >
                    {status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
