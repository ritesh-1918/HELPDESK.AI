import React, { useState, useEffect, useCallback } from 'react';
import { Users, RefreshCw, TrendingUp, ChevronLeft, Activity, Trophy } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { API_CONFIG } from '../../config';
import AgentLeaderboard from '../components/AgentLeaderboard';
import AgentScorecard from '../components/AgentScorecard';

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
            agentName={selectedAgent.agent_name}
            score={selectedAgent.score}
            metrics={selectedAgent.metrics || {}}
            coachingTip={selectedAgent.coaching_tip}
            sparklineData={selectedAgent.sparkline_data || []}
            insufficientData={selectedAgent.insufficient_data}
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
                  value: agents[0]?.agent_name?.split(' ')[0] || '—',
                  icon: Trophy,
                  color: '#f59e0b',
                  bg: '#fefce8'
                },
                {
                  id: 'stat-team-score',
                  label: 'Team Score',
                  value: agents.length
                    ? `${(agents.reduce((s, a) => s + a.score, 0) / agents.length).toFixed(1)}/100`
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
