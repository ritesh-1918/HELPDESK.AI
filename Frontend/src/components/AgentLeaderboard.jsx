import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { API_CONFIG } from "../../config";

/**
 * AgentLeaderboard — admin ranked view of all agents
 * Issue #774
 */
export default function AgentLeaderboard({ companyId, onSelectAgent }) {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const BACKEND = API_CONFIG.BACKEND_URL;

  useEffect(() => {
    if (!companyId) {
      setLoading(false);
      return;
    }

    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData?.session?.access_token || "";
        const response = await fetch(
          `${BACKEND}/api/scorecard/company/${encodeURIComponent(companyId)}?days=30`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const result = await response.json();
        if (mounted && result.success) setAgents(result.agents || []);
      } catch (error) {
        console.error("[Leaderboard]", error);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [companyId]);

  function rowColor(score) {
    if (score >= 75) return "bg-green-50 border-green-100";
    if (score >= 50) return "bg-amber-50 border-amber-100";
    return "bg-red-50 border-red-100";
  }

  function scoreBadge(score) {
    if (score >= 75) return "bg-green-100 text-green-700";
    if (score >= 50) return "bg-amber-100 text-amber-700";
    return "bg-red-100 text-red-700";
  }

  function rankEmoji(index) {
    return index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`;
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
        <div className="h-4 bg-gray-100 rounded w-40 mb-4" />
        {[1, 2, 3].map((i) => <div key={i} className="h-10 bg-gray-100 rounded mb-2" />)}
      </div>
    );
  }

  if (agents.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
        <p className="text-gray-400 text-sm">No agent scorecards yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-800">🏆 Agent Performance Leaderboard</h3>
        <p className="text-xs text-gray-400 mt-0.5">Last 30 days · {agents.length} agents</p>
      </div>

      <div className="divide-y divide-gray-100">
        {agents.map((agent, index) => {
          const score = agent.performance_score || 0;
          const name = agent.profiles?.full_name || agent.profiles?.email || "Agent";

          return (
            <div
              key={agent.agent_id}
              onClick={onSelectAgent ? () => onSelectAgent(agent) : undefined}
              className={`flex items-center gap-4 px-5 py-3 border-l-4 ${rowColor(score)} ${onSelectAgent ? "cursor-pointer" : ""}`}
            >
              <span className="text-lg w-8 text-center flex-shrink-0">{rankEmoji(index)}</span>

              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {agent.profiles?.avatar_url ? (
                  <img src={agent.profiles.avatar_url} className="w-8 h-8 rounded-full object-cover" alt={name} loading="lazy" />
                ) : (
                  <span className="text-xs font-bold text-indigo-600">{name[0]?.toUpperCase() || "A"}</span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{name}</p>
                <p className="text-xs text-gray-400">
                  {agent.resolution_rate}% resolved · {agent.ticket_volume} tickets · {agent.avg_resolution_hours}h avg
                </p>
              </div>

              <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex-shrink-0 ${scoreBadge(score)}`}>
                {score}
              </span>
            </div>
          );
        })}
      </div>

      <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex gap-4 text-xs text-gray-400">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" />≥75 Excellent</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />50–74 Good</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" />&lt;50 Needs Improvement</span>
      </div>
    </div>
  );
}
