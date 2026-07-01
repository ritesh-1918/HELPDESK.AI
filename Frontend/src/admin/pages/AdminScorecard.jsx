import React, { useState, useEffect, useCallback } from 'react';
import {
    Trophy, Target, TrendingUp, TrendingDown, Zap, Users,
    Clock, AlertTriangle, CheckCircle2, Bot, RefreshCw,
    ChevronDown, ChevronUp, Star, BookOpen, Lightbulb
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { API_CONFIG } from '../../config';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function ScoreRing({ score }) {
    const radius = 36;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    const color =
        score >= 80 ? '#10b981' :
        score >= 60 ? '#f59e0b' :
        score >= 40 ? '#f97316' : '#ef4444';

    return (
        <div className="relative inline-flex items-center justify-center">
            <svg width="88" height="88" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="44" cy="44" r={radius} fill="none" stroke="#f0fdf4" strokeWidth="8" />
                <circle
                    cx="44" cy="44" r={radius} fill="none"
                    stroke={color} strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 1s ease' }}
                />
            </svg>
            <span
                className="absolute text-xl font-extrabold"
                style={{ color, transform: 'rotate(0deg)' }}
            >
                {score}
            </span>
        </div>
    );
}

function MetricPill({ label, value, accent }) {
    return (
        <div
            className="flex flex-col items-center px-4 py-3 rounded-xl"
            style={{ background: accent + '14', border: `1px solid ${accent}28` }}
        >
            <span className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: accent }}>
                {label}
            </span>
            <span className="text-lg font-extrabold" style={{ color: '#0f1f12' }}>{value}</span>
        </div>
    );
}

function TagList({ items, color }) {
    if (!items || items.length === 0) return <span className="text-xs text-gray-400">—</span>;
    return (
        <div className="flex flex-wrap gap-1.5">
            {items.map((item, i) => (
                <span
                    key={i}
                    className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
                    style={{ background: color + '18', color }}
                >
                    {item}
                </span>
            ))}
        </div>
    );
}

// ---------------------------------------------------------------------------
// ScorecardCard — single agent / team card
// ---------------------------------------------------------------------------

function ScorecardCard({ data, rank }) {
    const [expanded, setExpanded] = useState(false);
    const { agent_team, metrics, coaching } = data;

    const score = coaching?.performance_score ?? 0;
    const rankColors = ['#f59e0b', '#9ca3af', '#cd7f32'];
    const rankColor = rank <= 3 ? rankColors[rank - 1] : '#6b7280';
    const resolveRate = metrics.total_tickets
        ? Math.round((metrics.resolved_tickets / metrics.total_tickets) * 100)
        : 0;

    return (
        <div
            className="rounded-2xl bg-white transition-all duration-300"
            style={{
                border: '1px solid #f0fdf4',
                boxShadow: '0 1px 4px rgba(0,0,0,0.04), 0 4px 20px rgba(0,0,0,0.05)',
            }}
        >
            {/* Header */}
            <div className="flex items-center gap-4 p-5">
                {/* Rank badge */}
                <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black shrink-0"
                    style={{ background: rankColor + '20', color: rankColor }}
                >
                    {rank <= 3 ? <Trophy size={16} /> : `#${rank}`}
                </div>

                {/* Score ring */}
                <ScoreRing score={score} />

                {/* Name + quick stats */}
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800 text-base truncate">{agent_team}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                        {metrics.total_tickets} tickets &bull; {resolveRate}% resolved
                    </p>
                </div>

                {/* SLA breach indicator */}
                {metrics.sla_breach_rate > 0 && (
                    <div className="flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full shrink-0">
                        <AlertTriangle size={12} />
                        {metrics.sla_breach_rate}% SLA breach
                    </div>
                )}

                <button
                    onClick={() => setExpanded(e => !e)}
                    className="shrink-0 p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
                >
                    {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
            </div>

            {/* Metric pills row */}
            <div className="grid grid-cols-4 gap-2 px-5 pb-4">
                <MetricPill label="Tickets" value={metrics.total_tickets} accent="#6366f1" />
                <MetricPill label="Resolved" value={metrics.resolved_tickets} accent="#10b981" />
                <MetricPill
                    label="Avg. Time"
                    value={metrics.avg_resolution_hours > 0 ? `${metrics.avg_resolution_hours}h` : '—'}
                    accent="#3b82f6"
                />
                <MetricPill label="Auto-res." value={`${metrics.auto_resolved_rate}%`} accent="#8b5cf6" />
            </div>

            {/* Expanded coaching panel */}
            {expanded && (
                <div
                    className="mx-4 mb-4 rounded-xl p-4 space-y-4"
                    style={{ background: '#f8fafb', border: '1px solid #f0fdf4' }}
                >
                    {/* AI Coaching tip */}
                    {coaching?.coaching_tip && (
                        <div className="flex gap-3">
                            <div className="mt-0.5 p-1.5 rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
                                <Bot size={16} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 mb-1">
                                    AI Coaching Insight
                                </p>
                                <p className="text-sm text-gray-700 leading-relaxed">{coaching.coaching_tip}</p>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Strengths */}
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 mb-2 flex items-center gap-1">
                                <CheckCircle2 size={12} /> Strengths
                            </p>
                            <ul className="space-y-1">
                                {(coaching?.strengths || []).map((s, i) => (
                                    <li key={i} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-1.5">
                                        <span className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                                        {s}
                                    </li>
                                ))}
                                {(!coaching?.strengths?.length) && (
                                    <li className="text-xs text-gray-400">No strengths data.</li>
                                )}
                            </ul>
                        </div>

                        {/* Improvement areas */}
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-2 flex items-center gap-1">
                                <TrendingUp size={12} /> Areas to Improve
                            </p>
                            <ul className="space-y-1">
                                {(coaching?.improvement_areas || []).map((a, i) => (
                                    <li key={i} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-1.5">
                                        <span className="mt-1 w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                                        {a}
                                    </li>
                                ))}
                                {(!coaching?.improvement_areas?.length) && (
                                    <li className="text-xs text-gray-400">No areas data.</li>
                                )}
                            </ul>
                        </div>
                    </div>

                    {/* Recommended training */}
                    {coaching?.recommended_training?.length > 0 && (
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 mb-2 flex items-center gap-1">
                                <BookOpen size={12} /> Recommended Training
                            </p>
                            <TagList items={coaching.recommended_training} color="#6366f1" />
                        </div>
                    )}

                    {/* Top categories */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">
                                Top Categories
                            </p>
                            <TagList items={metrics.top_categories} color="#3b82f6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">
                                Common Issues
                            </p>
                            <TagList items={metrics.common_subcategories} color="#8b5cf6" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

const AdminScorecard = () => {
    const { profile } = useAuthStore();
    const [scorecards, setScorecards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [generatedAt, setGeneratedAt] = useState(null);

    const fetchScorecard = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = profile?.company_id
                ? `?company_id=${encodeURIComponent(profile.company_id)}`
                : '';
            const res = await fetch(`${API_CONFIG.BACKEND_URL}/ai/agent_scorecard${params}`);
            if (!res.ok) throw new Error(`Server responded with ${res.status}`);
            const json = await res.json();
            setScorecards(json.scorecards || []);
            setGeneratedAt(json.generated_at || null);
        } catch (err) {
            setError(err.message || 'Failed to load scorecard data');
        } finally {
            setLoading(false);
        }
    }, [profile?.company_id]);

    useEffect(() => {
        if (profile) fetchScorecard();
    }, [profile, fetchScorecard]);

    const topScore = scorecards[0]?.coaching?.performance_score ?? 0;
    const avgScore = scorecards.length
        ? Math.round(scorecards.reduce((s, c) => s + (c.coaching?.performance_score ?? 0), 0) / scorecards.length)
        : 0;
    const totalTickets = scorecards.reduce((s, c) => s + (c.metrics?.total_tickets ?? 0), 0);

    return (
        <div className="space-y-8">
            {/* Page header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-800 tracking-tight">
                        Agent Performance Scorecard
                    </h1>
                    <p className="text-sm text-gray-400 mt-1">
                        Real-time metrics and AI-generated coaching insights for each support team.
                        {generatedAt && (
                            <span className="ml-2 text-gray-300">
                                Updated {new Date(generatedAt).toLocaleTimeString()}
                            </span>
                        )}
                    </p>
                </div>
                <button
                    onClick={fetchScorecard}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors disabled:opacity-50"
                >
                    <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
                    Refresh
                </button>
            </div>

            {/* Summary stat bar */}
            {!loading && scorecards.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Teams Tracked', value: scorecards.length, icon: Users, color: '#6366f1' },
                        { label: 'Avg. Performance', value: `${avgScore}/100`, icon: Target, color: '#10b981' },
                        { label: 'Top Score', value: `${topScore}/100`, icon: Star, color: '#f59e0b' },
                        { label: 'Total Tickets', value: totalTickets, icon: Zap, color: '#3b82f6' },
                    ].map(({ label, value, icon: Icon, color }) => (
                        <div
                            key={label}
                            className="bg-white rounded-2xl p-5"
                            style={{ border: '1px solid #f0fdf4', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
                        >
                            <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#9ca3af' }}>
                                {label}
                            </p>
                            <div className="flex items-center justify-between">
                                <span className="text-2xl font-extrabold text-gray-800">{value}</span>
                                <div className="p-2 rounded-xl" style={{ background: color + '18' }}>
                                    <Icon size={18} style={{ color }} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Loading state */}
            {loading && (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                    <div className="relative">
                        <div className="w-16 h-16 rounded-full border-4 border-emerald-100" />
                        <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
                    </div>
                    <div className="text-center">
                        <p className="font-semibold text-gray-700">Generating scorecards…</p>
                        <p className="text-sm text-gray-400 mt-1">Querying tickets and running Gemini analysis</p>
                    </div>
                </div>
            )}

            {/* Error state */}
            {!loading && error && (
                <div className="rounded-2xl bg-red-50 border border-red-100 p-6 flex items-start gap-4">
                    <AlertTriangle size={22} className="text-red-400 shrink-0 mt-0.5" />
                    <div>
                        <p className="font-semibold text-red-700">Failed to load scorecard</p>
                        <p className="text-sm text-red-500 mt-1">{error}</p>
                        <p className="text-xs text-red-400 mt-1">
                            Make sure the backend is running and <code>GEMINI_API_KEY</code> is configured.
                        </p>
                    </div>
                </div>
            )}

            {/* Empty state */}
            {!loading && !error && scorecards.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
                    <div className="p-4 rounded-2xl bg-gray-50">
                        <Users size={32} className="text-gray-300" />
                    </div>
                    <p className="font-semibold text-gray-600 dark:text-gray-400">No scorecard data yet</p>
                    <p className="text-sm text-gray-400">Tickets need to be assigned to teams before scorecards can be generated.</p>
                </div>
            )}

            {/* Scorecards list */}
            {!loading && !error && scorecards.length > 0 && (
                <div className="space-y-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                        {scorecards.length} team{scorecards.length !== 1 ? 's' : ''} — ranked by AI performance score
                    </p>
                    {scorecards.map((card, i) => (
                        <ScorecardCard key={card.agent_team} data={card} rank={i + 1} />
                    ))}
                </div>
            )}
        </div>
    );
import { Users, RefreshCw, TrendingUp, ChevronLeft, Activity, Trophy } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { API_CONFIG } from '../../config';
import AgentLeaderboard from '../../components/AgentLeaderboard';
import AgentScorecard from '../../components/AgentScorecard';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const BACKEND = API_CONFIG.BACKEND_URL;

async function fetchCompanyScorecard(companyId, days = 30) {
  const url = `${BACKEND}/api/scorecard/company/${encodeURIComponent(companyId)}?days=${days}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

// ─── AdminScorecard Page ──────────────────────────────────────────────────────
const AdminScorecard = () => {
  const { profile } = useAuthStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [days, setDays] = useState(30);
  const [lastRefresh, setLastRefresh] = useState(null);

  const load = useCallback(async () => {
    if (!profile?.company_id) return;
    setLoading(true);
    setError(null);
    try {
      const result = await fetchCompanyScorecard(profile.company_id, days);
      setData(result);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('[Scorecard] fetch error:', err);
      setError(err.message || 'Failed to load scorecards');
    } finally {
      setLoading(false);
    }
  }, [profile?.company_id, days]);

  useEffect(() => { load(); }, [load]);

  const agents = data?.agents || [];

  return (
    <div
      id="admin-scorecard-page"
      style={{ background: '#f8faf9', minHeight: '100vh', paddingBottom: 80, fontFamily: 'Inter, sans-serif' }}
      className="space-y-8 -m-6 p-6 md:-m-10 md:p-10 animate-in fade-in duration-700"
    >
      {/* ── Page Header ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {selectedAgent && (
          <button
            id="scorecard-back-btn"
            onClick={() => setSelectedAgent(null)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'transparent', border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 600, color: '#16a34a', padding: 0, marginBottom: 4
            }}
          >
            <ChevronLeft size={16} /> Back to Leaderboard
          </button>
        )}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 26, fontWeight: 800, color: '#0f1f12', margin: 0 }}>
              {selectedAgent ? `${selectedAgent.agent_name}'s Scorecard` : 'Agent Performance'}
            </h1>
            <p style={{ fontSize: 11, letterSpacing: '0.14em', color: '#9ca3af', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, textTransform: 'uppercase' }}>
              <Activity size={14} color="#16a34a" />
              {selectedAgent
                ? 'Individual scorecard · AI coaching insights'
                : 'Real-time leaderboard · AI coaching insights'}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Period selector */}
            <select
              id="scorecard-period-select"
              value={days}
              onChange={e => setDays(Number(e.target.value))}
              style={{
                fontSize: 12, fontWeight: 600, color: '#374151',
                border: '1px solid #e5e7eb', borderRadius: 8, padding: '6px 10px',
                background: '#ffffff', cursor: 'pointer', outline: 'none'
              }}
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>

            {/* Refresh */}
            <button
              id="scorecard-refresh-btn"
              onClick={load}
              disabled={loading}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: '#0f1f12', color: '#ffffff', border: 'none',
                borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1,
                transition: 'opacity 0.2s'
              }}
            >
              <RefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
              {loading ? 'Loading…' : 'Refresh'}
            </button>
          </div>
        </div>

        {lastRefresh && !loading && (
          <p style={{ fontSize: 10, color: '#9ca3af', marginTop: -4 }}>
            Last updated: {lastRefresh.toLocaleTimeString()}
          </p>
        )}
      </div>

      {/* ── Error ── */}
      {error && !loading && (
        <div style={{
          background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 12,
          padding: '14px 20px', color: '#991b1b', fontSize: 13, fontWeight: 500
        }}>
          ⚠️ {error}. Make sure the backend is reachable and company_id is set in your profile.
        </div>
      )}

      {/* ── Detail view (single agent) ── */}
      {selectedAgent ? (
        <div style={{ maxWidth: 640 }}>
          <AgentScorecard
            agentId={selectedAgent.agent_id}
            companyId={profile?.company_id}
            agentName={selectedAgent.profiles?.full_name || selectedAgent.profiles?.email || 'Agent'}
          />
        </div>
      ) : (
        /* ── Leaderboard view ── */
        <>
          {/* Quick summary cards */}
          {!loading && agents.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
              {[
                {
                  id: 'stat-total-agents',
                  label: 'Total Agents',
                  value: agents.length,
                  icon: Users,
                  color: '#6366f1',
                  bg: '#eef2ff'
                },
                {
                  id: 'stat-top-agent',
                  label: 'Top Agent',
                  value: agents[0]?.profiles?.full_name?.split(' ')[0] || agents[0]?.agent_name?.split(' ')[0] || '—',
                  icon: Trophy,
                  color: '#f59e0b',
                  bg: '#fefce8'
                },
                {
                  id: 'stat-team-score',
                  label: 'Team Score',
                  value: agents.length
                    ? `${(agents.reduce((s, a) => s + (a.performance_score ?? a.score ?? 0), 0) / agents.length).toFixed(1)}/100`
                    : '—',
                  icon: TrendingUp,
                  color: '#16a34a',
                  bg: '#dcfce7'
                },
              ].map(({ id, label, value, icon: Icon, color, bg }) => (
                <div key={id} id={id} style={{
                  background: '#ffffff', borderRadius: 16, padding: '20px 20px',
                  border: '1px solid #f0fdf4', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  display: 'flex', alignItems: 'center', gap: 14
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, background: bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>
                    <Icon size={20} color={color} />
                  </div>
                  <div>
                    <p style={{ fontSize: 20, fontWeight: 800, color: '#111827', margin: 0 }}>{value}</p>
                    <p style={{ fontSize: 10, color: '#9ca3af', margin: '2px 0 0', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      {label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Leaderboard table */}
          <AgentLeaderboard
            agents={agents}
            loading={loading}
            onSelectAgent={(agent) => setSelectedAgent(agent)}
          />
        </>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default AdminScorecard;
