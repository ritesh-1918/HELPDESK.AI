/**
 * DuplicateWarningBanner — Animated warning card shown when a potential
 * duplicate ticket is detected during ticket creation.
 *
 * Features:
 *   - Animated slide-in warning with similarity score
 *   - Link to parent ticket
 *   - "Subscribe to existing" vs "Create anyway" actions
 *   - Matches the HELPDESK.AI design system (glass morphism, gradient)
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Copy,
  Eye,
  Bell,
  X,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Users,
  Clock,
  ArrowRight,
  Send,
} from 'lucide-react';

/**
 * Format similarity as percentage with color.
 */
function formatSimilarity(score) {
  if (score == null) return '—';
  const pct = Math.round(score * 100);
  if (pct >= 95) return { value: `${pct}%`, color: '#DC2626' };
  if (pct >= 85) return { value: `${pct}%`, color: '#EA580C' };
  if (pct >= 75) return { value: `${pct}%`, color: '#CA8A04' };
  return { value: `${pct}%`, color: '#16A34A' };
}

/**
 * Format an ISO date string to a relative time.
 */
function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now - d;
  const diffHr = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHr < 1) return 'just now';
  if (diffHr < 24) return `${diffHr}h ago`;
  return `${Math.floor(diffHr / 24)}d ago`;
}

/**
 * DuplicateWarningBanner
 *
 * Props:
 *   - duplicate: { is_duplicate, duplicate_ticket_id, parent_subject, similarity, candidates }
 *   - onSubscribe: () => void — User wants to subscribe to existing ticket
 *   - onCreateAnyway: () => void — User wants to create ticket regardless
 *   - onDismiss: () => void — Dismiss warning
 *   - ticketId: string — ID of the current ticket being created
 */
export default function DuplicateWarningBanner({
  duplicate,
  onSubscribe,
  onCreateAnyway,
  onDismiss,
  ticketId,
}) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [visible, setVisible] = useState(false);

  // Animate in on mount
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (!duplicate || !duplicate.is_duplicate) return null;

  const { similarity, parent_subject, duplicate_ticket_id, candidates } = duplicate;
  const sim = formatSimilarity(similarity);
  const extraCandidates = (candidates || []).filter(
    c => c.id !== duplicate_ticket_id
  );

  return (
    <div
      className={`transition-all duration-500 ease-out ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <div
        className="rounded-2xl border-2 overflow-hidden"
        style={{
          borderColor: '#FECACA',
          background: 'linear-gradient(135deg, #FFF5F5 0%, #FFFBEB 100%)',
          boxShadow: '0 8px 32px rgba(239, 68, 68, 0.1)',
        }}
      >
        {/* Warning Header */}
        <div className="p-5 flex items-start gap-4">
          {/* Icon */}
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 animate-pulse"
            style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}
          >
            <AlertTriangle size={22} className="text-red-500" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Copy size={16} className="text-amber-500" />
                  Potential Duplicate Detected
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  A similar issue was recently reported by your teammate.
                </p>
              </div>
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors flex-shrink-0"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Match Info Card */}
            <div
              className="mt-4 rounded-xl p-4 border"
              style={{ background: '#FFFFFF', borderColor: '#FEE2E2' }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Similarity Badge */}
                  <div
                    className="flex flex-col items-center px-3 py-2 rounded-lg"
                    style={{ background: similarity >= 0.85 ? '#FEF2F2' : '#FFFBEB' }}
                  >
                    <span
                      className="text-lg font-extrabold"
                      style={{ color: sim.color }}
                    >
                      {sim.value}
                    </span>
                    <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider">
                      Match
                    </span>
                  </div>

                  {/* Parent Ticket Info */}
                  <div className="min-w-0 flex-1">
                    {parent_subject && (
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {parent_subject}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-0.5">
                      Ticket #{((duplicate_ticket_id || '') + '').slice(0, 8).toUpperCase()}
                    </p>
                  </div>
                </div>

                {/* View Parent Ticket */}
                <a
                  href={`/admin/ticket/${duplicate_ticket_id}`}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors flex-shrink-0"
                >
                  <Eye size={14} />
                  View
                </a>
              </div>

              {/* Extra candidates */}
              {extraCandidates.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => setExpanded(!expanded)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    {extraCandidates.length} more similar ticket{extraCandidates.length > 1 ? 's' : ''}
                  </button>

                  {expanded && (
                    <div className="mt-2 space-y-1.5">
                      {extraCandidates.map((c, idx) => (
                        <div
                          key={c.id || idx}
                          className="flex items-center justify-between p-2 rounded-lg bg-gray-50"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                              style={{
                                background: c.similarity >= 0.85 ? '#FEF2F2' : '#FEFCE8',
                                color: c.similarity >= 0.85 ? '#DC2626' : '#CA8A04',
                              }}
                            >
                              {Math.round(c.similarity * 100)}%
                            </span>
                            <span className="text-xs text-gray-700 truncate">
                              {c.subject || `#${((c.id || '') + '').slice(0, 8)}`}
                            </span>
                          </div>
                          <span className="text-[10px] text-gray-400 flex-shrink-0">
                            {c.assigned_team || ''}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 mt-4">
              {onSubscribe && (
                <button
                  onClick={onSubscribe}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white rounded-xl transition-all hover:shadow-lg active:scale-[0.98]"
                  style={{ background: 'linear-gradient(135deg, #16A34A, #15803D)' }}
                >
                  <Bell size={16} />
                  Subscribe to Existing Ticket
                  <ArrowRight size={16} />
                </button>
              )}
              {onCreateAnyway && (
                <button
                  onClick={onCreateAnyway}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all"
                >
                  <Send size={14} />
                  Create Anyway
                </button>
              )}
              <p className="text-[10px] text-gray-400 ml-auto">
                AI-powered semantic match · all-MiniLM-L6-v2
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
