import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { API_CONFIG } from "../../config";

/**
 * AgentScorecard — individual agent performance card
 * Issue #774
 */
export default function AgentScorecard({ agentId, companyId, agentName }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const BACKEND = API_CONFIG.BACKEND_URL;

  useEffect(() => {
    if (!agentId || !companyId) {
      setLoading(false);
      return;
    }

    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData?.session?.access_token || "";
        const response = await fetch(
          `${BACKEND}/api/scorecard/agent/${encodeURIComponent(agentId)}?company_id=${encodeURIComponent(companyId)}&days=30`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const result = await response.json();
        if (mounted) setData(result);
      } catch (fetchError) {
        if (mounted) setError("Failed to load scorecard");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [agentId, companyId]);

  if (loading) return <ScorecardSkeleton />;
  if (error) return <div className="text-red-500 text-sm">{error}</div>;
  if (!data?.has_data) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 text-center">
        <p className="text-gray-400 text-sm">📊 Insufficient data — resolve more tickets to see your scorecard.</p>
      </div>
    );
  }

  const score = data.performance_score || 0;
  const scoreColor = score >= 75 ? "#16a34a" : score >= 50 ? "#d97706" : "#dc2626";
  const circumference = 2 * Math.PI * 36;
  const strokeDash = (score / 100) * circumference;

  const metrics = [
    { label: "Resolution Rate", value: data.resolution_rate, unit: "%", color: "bg-green-500" },
    { label: "SLA Compliance", value: data.sla_compliance, unit: "%", color: "bg-blue-500" },
    { label: "Avg Speed", value: Math.max(0, 100 - (data.avg_resolution_hours || 0) * 4), unit: "%", color: "bg-purple-500" },
    { label: "Ticket Volume", value: Math.min((data.ticket_volume || 0) / 50 * 100, 100), unit: "%", color: "bg-amber-500" },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
      <h3 className="text-sm font-semibold text-gray-700">🏆 {agentName || data.agent_name || "My"} Performance Scorecard</h3>

      <div className="flex items-center gap-6">
        <div className="flex-shrink-0 relative w-24 h-24">
          <svg width="96" height="96" viewBox="0 0 96 96">
            <circle cx="48" cy="48" r="36" fill="none" stroke="#f3f4f6" strokeWidth="8" />
            <circle
              cx="48" cy="48" r="36" fill="none"
              stroke={scoreColor} strokeWidth="8"
              strokeDasharray={`${strokeDash} ${circumference}`}
              strokeLinecap="round"
              transform="rotate(-90 48 48)"
              style={{ transition: "stroke-dasharray 1s ease" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold" style={{ color: scoreColor }}>{score}</span>
            <span className="text-xs text-gray-400">/ 100</span>
          </div>
        </div>

        <div className="flex-1 space-y-2">
          {metrics.map(({ label, value, color }) => (
            <div key={label}>
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-0.5">
                <span>{label}</span>
                <span>{Math.round(value)}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div
                  className={`${color} h-1.5 rounded-full transition-all duration-700`}
                  style={{ width: `${Math.min(value, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        {[
          { label: "Tickets", value: data.ticket_volume || 0 },
          { label: "Resolved", value: data.resolved_tickets || 0 },
          { label: "Avg Time", value: `${data.avg_resolution_hours || 0}h` },
        ].map(({ label, value }) => (
          <div key={label} className="bg-gray-50 rounded-lg p-2">
            <p className="text-base font-bold text-gray-800">{value}</p>
            <p className="text-xs text-gray-400">{label}</p>
          </div>
        ))}
      </div>

      {data.ai_coaching_tip && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3">
          <p className="text-xs font-semibold text-indigo-600 mb-1">🤖 AI Coaching Tip</p>
          <p className="text-xs text-indigo-700 leading-relaxed italic">
            "{data.ai_coaching_tip}"
          </p>
        </div>
      )}
    </div>
  );
}

function ScorecardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse space-y-4">
      <div className="h-4 bg-gray-100 rounded w-40" />
      <div className="flex items-center gap-6">
        <div className="w-24 h-24 rounded-full bg-gray-100" />
        <div className="flex-1 space-y-2">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-3 bg-gray-100 rounded" />)}
        </div>
      </div>
      <div className="h-12 bg-gray-100 rounded-lg" />
    </div>
  );
}
