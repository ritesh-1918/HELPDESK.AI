import React, { useState, useEffect, useCallback } from 'react';
import { Activity, RefreshCw, AlertTriangle } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { API_CONFIG } from '../../config';
import AgentScorecard from '../../admin/components/AgentScorecard';

const BACKEND = API_CONFIG.BACKEND_URL;

/**
 * UserScorecard — shown on an agent/user's own profile/dashboard.
 * Only fetches data for the currently logged-in user (auth-scoped).
 */
const UserScorecard = () => {
  const { profile, user } = useAuthStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!user?.id || !profile?.company_id) return;
    setLoading(true);
    setError(null);
    try {
      const url = `${BACKEND}/api/scorecard/agent/${encodeURIComponent(user.id)}?company_id=${encodeURIComponent(profile.company_id)}&days=30`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`API error ${res.status}`);
      setData(await res.json());
    } catch (err) {
      setError(err.message || 'Failed to load scorecard');
    } finally {
      setLoading(false);
    }
  }, [user?.id, profile?.company_id]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div style={{
        background: '#ffffff', borderRadius: 20, border: '1px solid #f0fdf4',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)', padding: 32,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
        fontFamily: 'Inter, sans-serif'
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%', border: '3px solid #16a34a',
          borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite'
        }} />
        <p style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Loading your scorecard…
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 16,
        padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 10,
        fontFamily: 'Inter, sans-serif'
      }}>
        <AlertTriangle size={16} color="#d97706" />
        <p style={{ fontSize: 13, color: '#92400e', margin: 0 }}>
          Could not load scorecard: {error}
        </p>
        <button
          onClick={load}
          style={{
            marginLeft: 'auto', background: '#ffffff', border: '1px solid #fcd34d',
            borderRadius: 8, padding: '4px 10px', fontSize: 11, fontWeight: 600,
            color: '#92400e', cursor: 'pointer'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Section heading */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0f1f12', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Activity size={16} color="#16a34a" />
            My Performance
          </h2>
          <p style={{ fontSize: 11, color: '#9ca3af', margin: '4px 0 0', fontWeight: 500 }}>
            Last 30 days · auto-refreshed
          </p>
        </div>
        <button
          id="user-scorecard-refresh-btn"
          onClick={load}
          style={{
            background: 'transparent', border: '1px solid #e5e7eb', borderRadius: 8,
            padding: '5px 10px', display: 'flex', alignItems: 'center', gap: 5,
            fontSize: 11, fontWeight: 600, color: '#6b7280', cursor: 'pointer'
          }}
        >
          <RefreshCw size={11} /> Refresh
        </button>
      </div>

      <AgentScorecard
        agentName={data.agent_name || profile?.full_name || 'You'}
        score={data.score}
        metrics={data.metrics || {}}
        coachingTip={data.coaching_tip}
        sparklineData={data.sparkline_data || []}
        insufficientData={data.insufficient_data}
      />
    </div>
  );
};

export default UserScorecard;
