import React from 'react';
import { Bot, TrendingUp, Clock, Shield, Inbox, AlertTriangle } from 'lucide-react';

// ─── Circular Score Ring ──────────────────────────────────────────────────────
function ScoreRing({ score, size = 120 }) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = isNaN(score) ? 0 : Math.max(0, Math.min(100, score));
  const offset = circumference - (progress / 100) * circumference;

  const getColor = (s) => {
    if (s >= 75) return { stroke: '#16a34a', glow: 'rgba(22,163,74,0.3)', label: 'Excellent', bg: '#dcfce7', text: '#15803d' };
    if (s >= 50) return { stroke: '#d97706', glow: 'rgba(217,119,6,0.3)', label: 'Average', bg: '#fef3c7', text: '#92400e' };
    return { stroke: '#dc2626', glow: 'rgba(220,38,38,0.3)', label: 'Needs Work', bg: '#fee2e2', text: '#991b1b' };
  };

  const color = getColor(progress);

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Track */}
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#f1f5f9" strokeWidth={10} />
        {/* Progress */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke={color.stroke}
          strokeWidth={10}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 1s ease-in-out',
            filter: `drop-shadow(0 0 6px ${color.glow})`
          }}
        />
      </svg>
      {/* Center label */}
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 2
      }}>
        <span style={{ fontSize: size < 100 ? 20 : 26, fontWeight: 800, color: color.stroke, lineHeight: 1 }}>
          {progress === 0 ? '—' : Math.round(progress)}
        </span>
        <span style={{ fontSize: 9, fontWeight: 700, color: color.text, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {progress === 0 ? 'No data' : color.label}
        </span>
      </div>
    </div>
  );
}

// ─── Metric Bar ───────────────────────────────────────────────────────────────
function MetricBar({ label, value, max = 100, unit = '%', icon: Icon, color = '#6366f1' }) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: '#374151' }}>
          {Icon && <Icon size={13} color={color} />}
          {label}
        </span>
        <span style={{ fontSize: 12, fontWeight: 700, color }}>
          {value == null ? '—' : `${typeof value === 'number' ? value.toFixed(unit === '%' ? 1 : 1) : value}${unit}`}
        </span>
      </div>
      <div style={{ background: '#f1f5f9', borderRadius: 99, height: 7, overflow: 'hidden' }}>
        <div style={{
          width: `${pct}%`, height: '100%', borderRadius: 99,
          background: `linear-gradient(90deg, ${color}88, ${color})`,
          transition: 'width 0.9s ease-in-out'
        }} />
      </div>
    </div>
  );
}

// ─── Sparkline (30-day trend) ─────────────────────────────────────────────────
function Sparkline({ data = [], color = '#16a34a' }) {
  if (!data || data.length < 2) return (
    <div style={{ height: 36, display: 'flex', alignItems: 'center', paddingLeft: 4 }}>
      <span style={{ fontSize: 10, color: '#9ca3af', fontStyle: 'italic' }}>Trend unavailable</span>
    </div>
  );

  const max = Math.max(...data, 1);
  const min = Math.min(...data);
  const range = max - min || 1;
  const W = 120, H = 36, PAD = 2;
  const pts = data.map((v, i) => {
    const x = PAD + (i / (data.length - 1)) * (W - PAD * 2);
    const y = PAD + ((max - v) / range) * (H - PAD * 2);
    return `${x},${y}`;
  });

  return (
    <svg width={W} height={H} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={`sg-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <polyline
        points={pts.join(' ')}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── Main AgentScorecard ──────────────────────────────────────────────────────
/**
 * Props:
 *   agentName   – string
 *   score       – number 0–100
 *   metrics     – { total_tickets, resolved_tickets, sla_breached_count, avg_resolution_hours,
 *                   resolution_rate, sla_compliance_rate }
 *   coachingTip – string (AI generated)
 *   sparklineData – optional number[] (daily ticket counts)
 *   compact     – bool – smaller card for leaderboard embed
 *   insufficientData – bool
 */
const AgentScorecard = ({
  agentName,
  score = 0,
  metrics = {},
  coachingTip = '',
  sparklineData = [],
  compact = false,
  insufficientData = false,
}) => {
  const {
    total_tickets = 0,
    resolved_tickets = 0,
    sla_breached_count = 0,
    avg_resolution_hours = null,
    resolution_rate = 0,
    sla_compliance_rate = 0,
  } = metrics;

  const avgHoursDisplay = avg_resolution_hours != null
    ? avg_resolution_hours < 1
      ? `${Math.round(avg_resolution_hours * 60)} min`
      : `${avg_resolution_hours.toFixed(1)} h`
    : null;

  const cardStyle = {
    background: '#ffffff',
    borderRadius: compact ? 16 : 20,
    border: '1px solid #f0fdf4',
    boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
    padding: compact ? '20px' : '28px',
    fontFamily: 'Inter, sans-serif',
    transition: 'box-shadow 0.2s ease',
  };

  if (insufficientData) {
    return (
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10, background: '#fef9c3',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <AlertTriangle size={20} color="#d97706" />
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: 0 }}>{agentName}</p>
            <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>Performance Scorecard</p>
          </div>
        </div>
        <div style={{
          background: '#fefce8', border: '1px solid #fef08a', borderRadius: 10,
          padding: '12px 16px', display: 'flex', alignItems: 'flex-start', gap: 8
        }}>
          <AlertTriangle size={14} color="#ca8a04" style={{ marginTop: 1, flexShrink: 0 }} />
          <p style={{ fontSize: 12, color: '#92400e', margin: 0, lineHeight: 1.5 }}>
            Insufficient data — fewer than 1 ticket in the last 30 days.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={cardStyle}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 24 }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 4px' }}>
            Performance Scorecard
          </p>
          <h3 style={{ fontSize: compact ? 16 : 18, fontWeight: 800, color: '#0f1f12', margin: 0 }}>
            {agentName}
          </h3>
          <p style={{ fontSize: 11, color: '#6b7280', margin: '4px 0 0' }}>
            Last 30 days · {total_tickets} ticket{total_tickets !== 1 ? 's' : ''}
          </p>
        </div>
        <ScoreRing score={score} size={compact ? 90 : 110} />
      </div>

      {/* Metric bars */}
      <div style={{ marginBottom: 20 }}>
        <MetricBar
          label="Resolution Rate"
          value={resolution_rate * 100}
          max={100}
          unit="%"
          icon={TrendingUp}
          color="#16a34a"
        />
        <MetricBar
          label="SLA Compliance"
          value={sla_compliance_rate * 100}
          max={100}
          unit="%"
          icon={Shield}
          color="#6366f1"
        />
        <MetricBar
          label="Avg Resolution Speed"
          value={avg_resolution_hours != null ? Math.max(0, 100 - (avg_resolution_hours / 24) * 100) : null}
          max={100}
          unit="%"
          icon={Clock}
          color="#f59e0b"
        />
        <MetricBar
          label="Ticket Volume"
          value={total_tickets}
          max={20}
          unit=" tickets"
          icon={Inbox}
          color="#8b5cf6"
        />
        <MetricBar
          label="Resolved Tickets"
          value={resolved_tickets}
          max={Math.max(total_tickets, 1)}
          unit={` / ${total_tickets}`}
          icon={Shield}
          color="#06b6d4"
        />
      </div>

      {/* 30-day sparkline */}
      {!compact && (
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
            30-Day Trend
          </p>
          <Sparkline data={sparklineData} color="#16a34a" />
        </div>
      )}

      {/* AI Coaching Tip */}
      {coachingTip && (
        <div style={{
          background: 'linear-gradient(135deg, #f0fdf4, #f8fafc)',
          border: '1px solid #bbf7d0',
          borderRadius: 12,
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 10,
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8, background: '#dcfce7',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            <Bot size={14} color="#16a34a" />
          </div>
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, color: '#16a34a', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              AI Coaching Insight
            </p>
            <p style={{ fontSize: 12, color: '#374151', margin: 0, lineHeight: 1.6 }}>
              {coachingTip}
            </p>
          </div>
        </div>
      )}

      {/* Bottom stats row */}
      {!compact && (
        <div style={{
          display: 'flex', gap: 12, marginTop: 16,
          paddingTop: 16, borderTop: '1px solid #f1f5f9'
        }}>
          {[
            { label: 'Total', value: total_tickets },
            { label: 'Resolved', value: resolved_tickets },
            { label: 'SLA Breached', value: sla_breached_count },
            { label: 'Avg Time', value: avgHoursDisplay || '—' },
          ].map(({ label, value }) => (
            <div key={label} style={{ flex: 1, textAlign: 'center' }}>
              <p style={{ fontSize: 16, fontWeight: 800, color: '#111827', margin: 0 }}>{value}</p>
              <p style={{ fontSize: 9, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '2px 0 0' }}>
                {label}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AgentScorecard;
