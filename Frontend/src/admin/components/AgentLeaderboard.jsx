import React from 'react';
import { TrendingUp, TrendingDown, Minus, Bot, AlertTriangle, Trophy, Medal, Award } from 'lucide-react';

// ─── Rank badge ───────────────────────────────────────────────────────────────
function RankBadge({ rank }) {
  if (rank === 1) return <Trophy size={16} color="#f59e0b" />;
  if (rank === 2) return <Medal size={16} color="#94a3b8" />;
  if (rank === 3) return <Award size={16} color="#b45309" />;
  return (
    <span style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', minWidth: 16, textAlign: 'center' }}>
      #{rank}
    </span>
  );
}

// ─── Score pill ───────────────────────────────────────────────────────────────
function ScorePill({ score }) {
  if (score >= 75) return (
    <span style={{
      background: '#dcfce7', color: '#15803d', fontSize: 12, fontWeight: 700,
      padding: '3px 10px', borderRadius: 99, letterSpacing: '0.02em'
    }}>{score}</span>
  );
  if (score >= 50) return (
    <span style={{
      background: '#fef3c7', color: '#92400e', fontSize: 12, fontWeight: 700,
      padding: '3px 10px', borderRadius: 99
    }}>{score}</span>
  );
  return (
    <span style={{
      background: '#fee2e2', color: '#991b1b', fontSize: 12, fontWeight: 700,
      padding: '3px 10px', borderRadius: 99
    }}>{score}</span>
  );
}

// ─── Mini progress bar ────────────────────────────────────────────────────────
function MiniBar({ pct, color }) {
  return (
    <div style={{ background: '#f1f5f9', borderRadius: 99, height: 5, width: 60, overflow: 'hidden' }}>
      <div style={{
        width: `${Math.max(0, Math.min(100, pct))}%`, height: '100%',
        background: color, borderRadius: 99,
        transition: 'width 0.6s ease'
      }} />
    </div>
  );
}

// ─── Row color by score ───────────────────────────────────────────────────────
function rowBg(score, index) {
  const base = index % 2 === 0 ? '#ffffff' : '#fafafa';
  if (score >= 75) return base; // green rows — subtle left border only
  if (score >= 50) return base;
  return base;
}

function rowBorder(score) {
  if (score >= 75) return '3px solid #16a34a';
  if (score >= 50) return '3px solid #d97706';
  return '3px solid #dc2626';
}

// ─── AgentLeaderboard ─────────────────────────────────────────────────────────
/**
 * Props:
 *   agents – array of { agent_id, agent_name, score, metrics, coaching_tip, insufficient_data }
 *   loading – bool
 *   onSelectAgent – fn(agent) – called when a row is clicked
 */
const AgentLeaderboard = ({ agents = [], loading = false, onSelectAgent }) => {

  if (loading) {
    return (
      <div style={{
        background: '#ffffff', borderRadius: 20, border: '1px solid #f0fdf4',
        boxShadow: '0 2px 16px rgba(0,0,0,0.06)', padding: 32,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
        fontFamily: 'Inter, sans-serif'
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%', border: '3px solid #16a34a',
          borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite'
        }} />
        <p style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Generating scorecards…
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!agents.length) {
    return (
      <div style={{
        background: '#ffffff', borderRadius: 20, border: '1px solid #f0fdf4',
        boxShadow: '0 2px 16px rgba(0,0,0,0.06)', padding: 40,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
        fontFamily: 'Inter, sans-serif'
      }}>
        <Trophy size={32} color="#e5e7eb" />
        <p style={{ fontSize: 13, color: '#9ca3af', fontWeight: 600 }}>No agent data found</p>
        <p style={{ fontSize: 11, color: '#d1d5db' }}>Agents will appear here once tickets are assigned.</p>
      </div>
    );
  }

  // Summary stats
  const avg = agents.length ? (agents.reduce((s, a) => s + a.score, 0) / agents.length).toFixed(1) : 0;
  const topAgents = agents.filter(a => a.score >= 75).length;
  const atRisk = agents.filter(a => a.score < 50 && !a.insufficient_data).length;

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Summary banner */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20
      }}>
        {[
          { label: 'Team Avg Score', value: avg, color: '#6366f1', bg: '#eef2ff' },
          { label: 'High Performers', value: `${topAgents} agents`, color: '#16a34a', bg: '#dcfce7' },
          { label: 'Needs Attention', value: `${atRisk} agents`, color: '#dc2626', bg: '#fee2e2' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} style={{
            background: bg, borderRadius: 12, padding: '12px 16px', textAlign: 'center'
          }}>
            <p style={{ fontSize: 18, fontWeight: 800, color, margin: 0 }}>{value}</p>
            <p style={{ fontSize: 10, color, opacity: 0.7, margin: '2px 0 0', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{
        background: '#ffffff', borderRadius: 20, border: '1px solid #f0fdf4',
        boxShadow: '0 2px 16px rgba(0,0,0,0.06)', overflow: 'hidden'
      }}>
        {/* Table header */}
        <div style={{
          background: '#0f1f12', padding: '14px 20px',
          display: 'grid',
          gridTemplateColumns: '40px 1fr 80px 100px 100px 100px 80px',
          gap: 12, alignItems: 'center'
        }}>
          {['Rank', 'Agent', 'Score', 'Resolution', 'SLA', 'Avg Time', 'Tickets'].map(h => (
            <span key={h} style={{
              fontSize: 10, fontWeight: 700, color: '#9ca3af',
              textTransform: 'uppercase', letterSpacing: '0.1em'
            }}>{h}</span>
          ))}
        </div>

        {/* Rows */}
        {agents.map((agent, idx) => {
          const m = agent.metrics || {};
          const avgHr = m.avg_resolution_hours;
          const avgHrStr = avgHr != null
            ? avgHr < 1 ? `${Math.round(avgHr * 60)}m` : `${avgHr.toFixed(1)}h`
            : '—';

          return (
            <div
              key={agent.agent_id}
              id={`scorecard-row-${agent.agent_id}`}
              onClick={() => onSelectAgent && onSelectAgent(agent)}
              style={{
                background: rowBg(agent.score, idx),
                borderLeft: rowBorder(agent.score),
                display: 'grid',
                gridTemplateColumns: '40px 1fr 80px 100px 100px 100px 80px',
                gap: 12,
                alignItems: 'center',
                padding: '14px 20px',
                borderBottom: '1px solid #f9fafb',
                cursor: onSelectAgent ? 'pointer' : 'default',
                transition: 'background 0.15s ease',
              }}
              onMouseEnter={e => { if (onSelectAgent) e.currentTarget.style.background = '#f0fdf4'; }}
              onMouseLeave={e => { e.currentTarget.style.background = rowBg(agent.score, idx); }}
            >
              {/* Rank */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <RankBadge rank={idx + 1} />
              </div>

              {/* Agent name + coaching snippet */}
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {agent.agent_name}
                </p>
                {agent.insufficient_data ? (
                  <span style={{ fontSize: 10, color: '#d97706', display: 'flex', alignItems: 'center', gap: 3 }}>
                    <AlertTriangle size={10} /> Insufficient data
                  </span>
                ) : agent.coaching_tip ? (
                  <p style={{ fontSize: 10, color: '#6b7280', margin: '2px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    <Bot size={9} style={{ display: 'inline', marginRight: 3 }} />
                    {agent.coaching_tip.split('.')[0]}.
                  </p>
                ) : null}
              </div>

              {/* Score */}
              <div><ScorePill score={Math.round(agent.score)} /></div>

              {/* Resolution rate */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#374151' }}>
                  {agent.insufficient_data ? '—' : `${((m.resolution_rate || 0) * 100).toFixed(0)}%`}
                </span>
                {!agent.insufficient_data && <MiniBar pct={(m.resolution_rate || 0) * 100} color="#16a34a" />}
              </div>

              {/* SLA compliance */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#374151' }}>
                  {agent.insufficient_data ? '—' : `${((m.sla_compliance_rate || 0) * 100).toFixed(0)}%`}
                </span>
                {!agent.insufficient_data && <MiniBar pct={(m.sla_compliance_rate || 0) * 100} color="#6366f1" />}
              </div>

              {/* Avg resolution time */}
              <div>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#374151' }}>{avgHrStr}</span>
              </div>

              {/* Ticket count */}
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#374151' }}>{m.total_tickets ?? '—'}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, marginTop: 12, paddingLeft: 4 }}>
        {[
          { color: '#16a34a', label: 'High Performer (≥75)' },
          { color: '#d97706', label: 'Average (50–74)' },
          { color: '#dc2626', label: 'Needs Support (<50)' },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: color }} />
            <span style={{ fontSize: 10, color: '#6b7280', fontWeight: 500 }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AgentLeaderboard;
