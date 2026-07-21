import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, CheckCircle, Flame } from 'lucide-react';

// SLA rules based on priority (in hours)
const SLA_RULES = {
  critical: { hours: 1, color: '#DC2626' },
  high: { hours: 4, color: '#EA580C' },
  medium: { hours: 24, color: '#CA8A04' },
  low: { hours: 48, color: '#16A34A' },
  normal: { hours: 48, color: '#16A34A' }
};

const SLACountdown = ({ ticketCreatedAt, ticketPriority, ticketStatus }) => {
  const [timeLeft, setTimeLeft] = useState(null);
  const [progress, setProgress] = useState(100);
  const [status, setStatus] = useState('on_track');

  const priority = (ticketPriority || 'normal').toLowerCase();
  const sla = SLA_RULES[priority] || SLA_RULES.normal;
  const slaMs = sla.hours * 60 * 60 * 1000;

  useEffect(() => {
    // Check if ticket is already resolved
    const isResolved = ticketStatus?.toLowerCase().includes('resolv');
    if (isResolved) {
      setStatus('resolved');
      setTimeLeft(0);
      setProgress(100);
      return;
    }

    const calculateTimeLeft = () => {
      const createdAt = new Date(ticketCreatedAt).getTime();
      const now = Date.now();
      const elapsed = now - createdAt;
      const remaining = slaMs - elapsed;

      const pct = Math.max(0, Math.min(100, (remaining / slaMs) * 100));
      setProgress(pct);

      if (remaining <= 0) {
        setStatus('overdue');
        setTimeLeft(0);
      } else if (remaining <= slaMs * 0.25) {
        setStatus('critical');
        setTimeLeft(remaining);
      } else if (remaining <= slaMs * 0.5) {
        setStatus('warning');
        setTimeLeft(remaining);
      } else {
        setStatus('on_track');
        setTimeLeft(remaining);
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [ticketCreatedAt, ticketPriority, ticketStatus]);

  const formatTime = (ms) => {
    if (!ms || ms <= 0) return '00:00:00';
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const getStatusStyle = () => {
    switch (status) {
      case 'resolved':
        return { bg: '#f0fdf4', border: '#bbf7d0', text: '#16a34a', icon: CheckCircle };
      case 'overdue':
        return { bg: '#fef2f2', border: '#fecaca', text: '#dc2626', icon: Flame };
      case 'critical':
        return { bg: '#fff7ed', border: '#fed7aa', text: '#ea580c', icon: AlertTriangle };
      case 'warning':
        return { bg: '#fefce8', border: '#fde68a', text: '#ca8a04', icon: Clock };
      default:
        return { bg: '#f0fdf4', border: '#bbf7d0', text: '#16a34a', icon: Clock };
    }
  };

  const style = getStatusStyle();
  const Icon = style.icon;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Icon size={14} color={style.text} className={status === 'critical' || status === 'overdue' ? 'animate-pulse' : ''} />
        <span style={{
          fontSize: '11px',
          fontWeight: 700,
          color: style.text,
          background: style.bg,
          border: `1px solid ${style.border}`,
          borderRadius: '9999px',
          padding: '2px 10px',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          {status === 'resolved' ? 'Resolved' : status === 'overdue' ? 'OVERDUE' : status === 'critical' ? 'URGENT' : 'SLA'}
        </span>
      </div>

      {status !== 'resolved' && (
        <>
          <span style={{ fontFamily: 'monospace', fontSize: '12px', fontWeight: 700, color: style.text }}>
            {formatTime(timeLeft)}
          </span>

          <div style={{ width: '100%', height: '6px', background: '#e5e7eb', borderRadius: '9999px', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${progress}%`,
                background: status === 'overdue' ? '#DC2626' : status === 'critical' ? '#EA580C' : status === 'warning' ? '#CA8A04' : '#16A34A',
                transition: 'width 0.3s ease',
                borderRadius: '9999px'
              }}
              className={status === 'critical' || status === 'overdue' ? 'animate-pulse' : ''}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default SLACountdown;
