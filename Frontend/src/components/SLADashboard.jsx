import { useState, useEffect, useCallback } from "react";
import { API_CONFIG } from "../config";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const RISK_LEVELS = [
  { label: "Critical",     min: 0.80, color: "text-red-400",    bg: "bg-red-500/15",    border: "border-red-500/30",    dot: "bg-red-500",    icon: "🔴" },
  { label: "High",         min: 0.60, color: "text-orange-400", bg: "bg-orange-500/15", border: "border-orange-500/30", dot: "bg-orange-500", icon: "🟠" },
  { label: "Medium",       min: 0.40, color: "text-yellow-400", bg: "bg-yellow-500/15", border: "border-yellow-500/30", dot: "bg-yellow-400", icon: "🟡" },
  { label: "Low Risk",     min: 0,    color: "text-emerald-400", bg: "bg-emerald-500/15", border: "border-emerald-500/30", dot: "bg-emerald-500", icon: "🟢" },
];

function getRiskLevel(risk) {
  return RISK_LEVELS.find((l) => risk >= l.min) || RISK_LEVELS[RISK_LEVELS.length - 1];
}

function RiskBadge({ risk }) {
  const level = getRiskLevel(risk);
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${level.bg} ${level.border} ${level.color}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${level.dot}`} />
      {(risk * 100).toFixed(0)}% {level.label}
    </span>
  );
}

function StatCard({ label, value, sub, accent }) {
  const accentMap = {
    red:     "border-red-500/40 bg-red-500/10",
    orange:  "border-orange-500/40 bg-orange-500/10",
    emerald: "border-emerald-500/40 bg-emerald-500/10",
    blue:    "border-blue-500/40 bg-blue-500/10",
  };
  const valMap = {
    red:     "text-red-400",
    orange:  "text-orange-400",
    emerald: "text-emerald-400",
    blue:    "text-blue-400",
  };
  return (
    <div
      className={`rounded-xl border p-5 flex flex-col gap-1 ${accentMap[accent] || "border-slate-700/60 bg-slate-800/50"}`}
    >
      <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">{label}</p>
      <p className={`text-3xl font-bold ${valMap[accent] || "text-white"}`}>{value}</p>
      {sub && <p className="text-slate-500 text-xs">{sub}</p>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function SLADashboard() {
  const [riskQueue,   setRiskQueue]   = useState([]);
  const [analytics,   setAnalytics]   = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [escalating,  setEscalating]  = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const base = API_CONFIG.BACKEND_URL;
      const [queueRes, analyticsRes] = await Promise.all([
        fetch(`${base}/api/admin/sla-risk-queue`),
        fetch(`${base}/api/admin/sla-analytics`),
      ]);

      if (!queueRes.ok || !analyticsRes.ok) {
        throw new Error("Failed to fetch SLA data from backend.");
      }

      const [queue, analytics] = await Promise.all([
        queueRes.json(),
        analyticsRes.json(),
      ]);

      setRiskQueue(queue);
      setAnalytics(analytics);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message || "Unknown error occurred.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    // Refresh every 60 seconds to stay in sync with the hourly prediction loop.
    const interval = setInterval(fetchData, 60_000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleEscalate = async (ticketId) => {
    setEscalating(ticketId);
    try {
      const res = await fetch(
        `${API_CONFIG.BACKEND_URL}/api/sla/escalate/${ticketId}`,
        { method: "POST" }
      );
      if (!res.ok) throw new Error("Escalation request failed.");
      // Re-fetch to reflect the change.
      await fetchData();
    } catch (err) {
      setError(err.message);
    } finally {
      setEscalating(null);
    }
  };

  // ---------------------------------------------------------------------------
  // Derived stats
  // ---------------------------------------------------------------------------
  const criticalCount = riskQueue.filter((t) => (t.risk_probability || 0) > 0.80).length;
  const highCount     = riskQueue.filter((t) => {
    const r = t.risk_probability || 0;
    return r > 0.60 && r <= 0.80;
  }).length;

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#0b1120] text-slate-100 font-sans">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="border-b border-slate-800 bg-[#0d1627]/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⏱️</span>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Predictive SLA Monitor</h1>
              {lastUpdated && (
                <p className="text-slate-500 text-xs">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>
          <button
            id="sla-refresh-btn"
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                       bg-emerald-500/10 border border-emerald-500/30 text-emerald-400
                       hover:bg-emerald-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <svg
              className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* ── Error banner ──────────────────────────────────────────────── */}
        {error && (
          <div
            id="sla-error-banner"
            className="rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-red-400 text-sm flex items-start gap-3"
          >
            <span className="text-lg leading-none">⚠️</span>
            <div>
              <strong className="font-semibold">Backend error</strong>
              <p className="text-red-400/80 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* ── Stat cards ────────────────────────────────────────────────── */}
        <section>
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4">
            Overview
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              label="At-Risk Tickets"
              value={riskQueue.length}
              sub="> 40% breach probability"
              accent="orange"
            />
            <StatCard
              label="Critical Risk"
              value={criticalCount}
              sub="> 80% — immediate action"
              accent="red"
            />
            <StatCard
              label="Total Tickets"
              value={analytics?.total_tickets ?? "—"}
              sub="across all statuses"
              accent="blue"
            />
            <StatCard
              label="Total Breached"
              value={analytics?.breached_count ?? "—"}
              sub={
                analytics
                  ? `${(analytics.breach_rate * 100).toFixed(1)}% breach rate`
                  : "loading…"
              }
              accent="red"
            />
          </div>
        </section>

        {/* ── Risk Queue Table ──────────────────────────────────────────── */}
        <section>
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4">
            SLA Risk Queue — sorted by highest risk
          </h2>

          {loading && riskQueue.length === 0 ? (
            <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-10 text-center text-slate-500">
              <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              Loading risk predictions…
            </div>
          ) : riskQueue.length === 0 ? (
            <div
              id="sla-empty-queue"
              className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-10 text-center"
            >
              <p className="text-2xl mb-2">✅</p>
              <p className="text-emerald-400 font-semibold">All tickets are on track!</p>
              <p className="text-slate-500 text-sm mt-1">No tickets exceed the 40% risk threshold.</p>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-700/50 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-800/70 border-b border-slate-700/50">
                  <tr>
                    <th className="text-left px-5 py-3 text-slate-400 font-medium">Ticket ID</th>
                    <th className="text-left px-5 py-3 text-slate-400 font-medium">Subject</th>
                    <th className="text-left px-5 py-3 text-slate-400 font-medium">Priority</th>
                    <th className="text-left px-5 py-3 text-slate-400 font-medium">Assigned Team</th>
                    <th className="text-left px-5 py-3 text-slate-400 font-medium">Breach Risk</th>
                    <th className="text-left px-5 py-3 text-slate-400 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {riskQueue.map((ticket, idx) => {
                    const risk = ticket.risk_probability || 0;
                    const level = getRiskLevel(risk);
                    const isEscalating = escalating === ticket.id;
                    return (
                      <tr
                        key={ticket.id}
                        className={`border-b border-slate-800/60 transition-colors hover:bg-slate-800/40 ${idx % 2 === 0 ? "bg-slate-900/30" : "bg-transparent"}`}
                      >
                        <td className="px-5 py-3.5 font-mono text-slate-300 text-xs">
                          #{String(ticket.id).slice(0, 8)}
                        </td>
                        <td className="px-5 py-3.5 text-slate-200 max-w-xs truncate">
                          {ticket.subject || "—"}
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`capitalize text-xs font-semibold px-2 py-0.5 rounded ${
                              ticket.priority === "critical" ? "bg-red-500/20 text-red-400" :
                              ticket.priority === "high"     ? "bg-orange-500/20 text-orange-400" :
                              ticket.priority === "medium"   ? "bg-yellow-500/20 text-yellow-400" :
                                                              "bg-slate-700 text-slate-400"
                            }`}
                          >
                            {ticket.priority || "—"}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-slate-400 text-xs">
                          {ticket.assigned_team || <span className="text-red-400 font-medium">Unassigned</span>}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-24 h-1.5 rounded-full bg-slate-700 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${level.dot}`}
                                style={{ width: `${risk * 100}%` }}
                              />
                            </div>
                            <RiskBadge risk={risk} />
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <button
                            id={`escalate-btn-${ticket.id}`}
                            onClick={() => handleEscalate(ticket.id)}
                            disabled={isEscalating}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium
                                       bg-orange-500/10 border border-orange-500/30 text-orange-400
                                       hover:bg-orange-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            {isEscalating ? "…" : "Escalate"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* ── Analytics Breakdown ───────────────────────────────────────── */}
        {analytics && (
          <section className="grid md:grid-cols-2 gap-6">
            {/* By Category */}
            <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-5">
              <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                Breaches by Category
              </h3>
              {Object.entries(analytics.by_category || {}).length === 0 ? (
                <p className="text-slate-500 text-sm">No breaches recorded.</p>
              ) : (
                <ul className="space-y-2.5">
                  {Object.entries(analytics.by_category)
                    .sort((a, b) => b[1] - a[1])
                    .map(([cat, count]) => {
                      const pct = analytics.breached_count
                        ? Math.round((count / analytics.breached_count) * 100)
                        : 0;
                      return (
                        <li key={cat} className="flex items-center gap-3">
                          <span className="text-slate-300 text-xs flex-1 truncate">{cat}</span>
                          <div className="w-24 h-1.5 rounded-full bg-slate-700 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-blue-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-slate-400 text-xs w-8 text-right">{count}</span>
                        </li>
                      );
                    })}
                </ul>
              )}
            </div>

            {/* By Team */}
            <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-5">
              <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-400" />
                Breaches by Team
              </h3>
              {Object.entries(analytics.by_team || {}).length === 0 ? (
                <p className="text-slate-500 text-sm">No breaches recorded.</p>
              ) : (
                <ul className="space-y-2.5">
                  {Object.entries(analytics.by_team)
                    .sort((a, b) => b[1] - a[1])
                    .map(([team, count]) => {
                      const pct = analytics.breached_count
                        ? Math.round((count / analytics.breached_count) * 100)
                        : 0;
                      return (
                        <li key={team} className="flex items-center gap-3">
                          <span className="text-slate-300 text-xs flex-1 truncate">{team}</span>
                          <div className="w-24 h-1.5 rounded-full bg-slate-700 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-purple-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-slate-400 text-xs w-8 text-right">{count}</span>
                        </li>
                      );
                    })}
                </ul>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
