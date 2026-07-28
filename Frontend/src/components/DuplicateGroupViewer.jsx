import React, { useState } from 'react';
import {
  Copy,
  Crown,
  ChevronDown,
  ChevronUp,
  BarChart2,
  Layers,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

/**
 * DuplicateGroupViewer
 * Renders a single duplicate cluster with its member tickets,
 * similarity scores, primary ticket badge, and admin actions.
 *
 * Props:
 *  group          — cluster object from /ai/duplicate-clusters
 *  onSetPrimary   — (clusterId, ticketId) => void
 *  onViewTicket   — (ticketId) => void
 */
const DuplicateGroupViewer = ({ group, onSetPrimary, onViewTicket }) => {
  const [expanded, setExpanded] = useState(false);

  if (!group) return null;

  const confidenceColor =
    group.confidence >= 0.9
      ? 'text-emerald-600 bg-emerald-50'
      : group.confidence >= 0.75
      ? 'text-amber-600 bg-amber-50'
      : 'text-rose-600 bg-rose-50';

  const confidenceLabel =
    group.confidence >= 0.9 ? 'High' : group.confidence >= 0.75 ? 'Medium' : 'Low';

  return (
    <div
      className="bg-white rounded-2xl border border-slate-100 shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden"
      id={`cluster-${group.cluster_id}`}
    >
      {/* ─── Cluster Header ─── */}
      <div className="px-6 py-4 flex items-center justify-between gap-4 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2 rounded-xl bg-indigo-50 shrink-0">
            <Layers size={18} className="text-indigo-500" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-0.5">
              Cluster
            </p>
            <p className="text-sm font-bold text-slate-800 truncate font-mono">
              {group.cluster_id.slice(0, 12)}…
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Category badge */}
          <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 uppercase tracking-wider">
            {group.category}
          </span>

          {/* Confidence badge */}
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${confidenceColor}`}
          >
            <BarChart2 size={12} />
            {confidenceLabel} · {(group.confidence * 100).toFixed(0)}%
          </span>

          {/* Size badge */}
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-indigo-100 text-indigo-700 uppercase tracking-wider">
            <Copy size={12} />
            {group.size} tickets
          </span>

          {/* Expand toggle */}
          <button
            onClick={() => setExpanded((p) => !p)}
            className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-500"
            aria-label="Toggle cluster details"
            id={`expand-cluster-${group.cluster_id}`}
          >
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {/* ─── KB Suggestion ─── */}
      {group.kb_suggestion && (
        <div className="px-6 py-3 bg-amber-50 border-b border-amber-100 flex items-start gap-2">
          <AlertTriangle size={15} className="text-amber-500 mt-0.5 shrink-0" />
          <p className="text-xs font-bold text-amber-700">
            Suggested KB Article: <span className="italic">{group.kb_suggestion}</span>
          </p>
        </div>
      )}

      {/* ─── Members Table ─── */}
      {expanded && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-3 text-left text-xs font-black text-slate-500 uppercase tracking-widest">
                  Ticket ID
                </th>
                <th className="px-4 py-3 text-center text-xs font-black text-slate-500 uppercase tracking-widest">
                  Role
                </th>
                <th className="px-4 py-3 text-center text-xs font-black text-slate-500 uppercase tracking-widest">
                  Hybrid Score
                </th>
                <th className="px-4 py-3 text-center text-xs font-black text-slate-500 uppercase tracking-widest">
                  Semantic
                </th>
                <th className="px-4 py-3 text-center text-xs font-black text-slate-500 uppercase tracking-widest">
                  Keyword
                </th>
                <th className="px-4 py-3 text-center text-xs font-black text-slate-500 uppercase tracking-widest">
                  Structural
                </th>
                <th className="px-4 py-3 text-right text-xs font-black text-slate-500 uppercase tracking-widest">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {(group.members || []).map((m) => (
                <tr
                  key={m.ticket_id}
                  className={`hover:bg-slate-50 transition-colors ${
                    m.is_primary ? 'bg-emerald-50/40' : ''
                  }`}
                >
                  {/* Ticket ID */}
                  <td className="px-6 py-3 font-mono text-sm text-slate-700 font-semibold">
                    {m.ticket_id.slice(0, 12)}…
                  </td>

                  {/* Role */}
                  <td className="px-4 py-3 text-center">
                    {m.is_primary ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-700 uppercase tracking-wide">
                        <Crown size={11} />
                        Primary
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500 uppercase tracking-wide">
                        <Copy size={11} />
                        Duplicate
                      </span>
                    )}
                  </td>

                  {/* Scores */}
                  <td className="px-4 py-3 text-center">
                    <ScoreBadge value={m.similarity} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <ScoreBadge value={m.semantic_score} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <ScoreBadge value={m.keyword_score} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <ScoreBadge value={m.structural_score} />
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {!m.is_primary && onSetPrimary && (
                        <button
                          id={`set-primary-${m.ticket_id}`}
                          onClick={() => onSetPrimary(group.cluster_id, m.ticket_id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
                          title="Set as primary ticket"
                        >
                          <Crown size={11} />
                          Set Primary
                        </button>
                      )}
                      {onViewTicket && (
                        <button
                          id={`view-ticket-${m.ticket_id}`}
                          onClick={() => onViewTicket(m.ticket_id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                          title="View ticket"
                        >
                          <ExternalLink size={11} />
                          View
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {(!group.members || group.members.length === 0) && (
            <div className="px-6 py-8 text-center text-slate-400">
              <CheckCircle2 size={28} className="mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-semibold">No member tickets in this cluster.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/** Small inline score badge with color coding */
const ScoreBadge = ({ value }) => {
  const pct = Math.round((value || 0) * 100);
  const color =
    pct >= 85
      ? 'text-emerald-700 bg-emerald-50'
      : pct >= 70
      ? 'text-amber-700 bg-amber-50'
      : 'text-slate-500 bg-slate-50';
  return (
    <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-bold tabular-nums ${color}`}>
      {pct}%
    </span>
  );
};

export default DuplicateGroupViewer;
