import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Copy,
  BarChart2,
  Layers,
  RefreshCw,
  SlidersHorizontal,
  ThumbsUp,
  ThumbsDown,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  Lightbulb,
  Search,
  ChevronDown,
} from 'lucide-react';
import DuplicateGroupViewer from '../../components/DuplicateGroupViewer';
import useAuthStore from '../../store/authStore';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const AdminDuplicates = () => {
  const { profile } = useAuthStore();
  const navigate = useNavigate();
  const companyId = profile?.company_id;

  // ── State ──────────────────────────────────────────────────────────────
  const [clusters, setClusters] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [threshold, setThreshold] = useState(0.85);
  const [pendingThreshold, setPendingThreshold] = useState(0.85);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [searchQ, setSearchQ] = useState('');
  const [sortBy, setSortBy] = useState('size'); // size | confidence
  const [activeTab, setActiveTab] = useState('clusters'); // clusters | analytics | threshold

  // ── Data fetching ──────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const [clustersRes, analyticsRes, thresholdRes] = await Promise.all([
        fetch(`${API_BASE}/ai/duplicate-clusters?company_id=${companyId}`),
        fetch(`${API_BASE}/ai/duplicate-analytics?company_id=${companyId}`),
        fetch(`${API_BASE}/ai/duplicate-threshold?company_id=${companyId}`),
      ]);
      const [clustersData, analyticsData, thresholdData] = await Promise.all([
        clustersRes.json(),
        analyticsRes.json(),
        thresholdRes.json(),
      ]);
      setClusters(clustersData.clusters || []);
      setAnalytics(analyticsData);
      setThreshold(thresholdData.threshold ?? 0.85);
      setPendingThreshold(thresholdData.threshold ?? 0.85);
    } catch (err) {
      console.error('[AdminDuplicates] Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Threshold save ─────────────────────────────────────────────────────
  const handleSaveThreshold = async () => {
    if (!companyId) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/ai/duplicate-threshold`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company_id: companyId, threshold: pendingThreshold }),
      });
      const data = await res.json();
      setThreshold(data.threshold);
      setPendingThreshold(data.threshold);
      setFeedbackMsg('Threshold saved successfully.');
    } catch (err) {
      setFeedbackMsg('Failed to save threshold.');
    } finally {
      setSaving(false);
      setTimeout(() => setFeedbackMsg(''), 3000);
    }
  };

  // ── Admin feedback ─────────────────────────────────────────────────────
  const handleFeedback = async (feedbackType) => {
    if (!companyId) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/ai/duplicate-feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company_id: companyId, feedback_type: feedbackType }),
      });
      const data = await res.json();
      setThreshold(data.new_threshold);
      setPendingThreshold(data.new_threshold);
      setFeedbackMsg(
        feedbackType === 'false_positive'
          ? `Threshold increased → ${(data.new_threshold * 100).toFixed(0)}% (stricter)`
          : `Threshold decreased → ${(data.new_threshold * 100).toFixed(0)}% (looser)`,
      );
    } catch (err) {
      setFeedbackMsg('Feedback processing failed.');
    } finally {
      setSaving(false);
      setTimeout(() => setFeedbackMsg(''), 4000);
    }
  };

  // ── Set primary ────────────────────────────────────────────────────────
  const handleSetPrimary = async (clusterId, ticketId) => {
    try {
      await fetch(`${API_BASE}/ai/duplicate-clusters/set-primary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cluster_id: clusterId, ticket_id: ticketId }),
      });
      fetchAll();
    } catch (err) {
      console.error('[SetPrimary] error:', err);
    }
  };

  // ── Filter + sort clusters ─────────────────────────────────────────────
  const filteredClusters = clusters
    .filter((g) =>
      searchQ
        ? g.category?.toLowerCase().includes(searchQ.toLowerCase()) ||
          g.cluster_id?.includes(searchQ) ||
          g.primary_ticket?.includes(searchQ)
        : true,
    )
    .sort((a, b) =>
      sortBy === 'confidence' ? b.confidence - a.confidence : b.size - a.size,
    );

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase flex items-center gap-3">
            <Copy size={28} className="text-indigo-600" />
            Duplicate Detection
          </h1>
          <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-[0.2em]">
            Real-Time Clustering · Hybrid Similarity · Threshold Tuning
          </p>
        </div>
        <button
          id="refresh-duplicates"
          onClick={fetchAll}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-700 transition-colors"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard
          icon={<Layers size={20} className="text-indigo-500" />}
          label="Total Clusters"
          value={analytics?.total_clusters ?? clusters.length}
          bg="bg-indigo-50"
        />
        <KpiCard
          icon={<Copy size={20} className="text-rose-500" />}
          label="Total Duplicates"
          value={analytics?.db_total_duplicates ?? analytics?.total_duplicates ?? 0}
          bg="bg-rose-50"
        />
        <KpiCard
          icon={<BarChart2 size={20} className="text-emerald-500" />}
          label="Avg Confidence"
          value={analytics ? `${((analytics.avg_confidence || 0) * 100).toFixed(0)}%` : '—'}
          bg="bg-emerald-50"
        />
        <KpiCard
          icon={<SlidersHorizontal size={20} className="text-amber-500" />}
          label="Active Threshold"
          value={`${(threshold * 100).toFixed(0)}%`}
          bg="bg-amber-50"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-2xl w-fit">
        {['clusters', 'analytics', 'threshold'].map((tab) => (
          <button
            key={tab}
            id={`tab-${tab}`}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-200 ${
              activeTab === tab
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Tab: Clusters ── */}
      {activeTab === 'clusters' && (
        <div className="space-y-5">
          {/* Search + Sort */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                id="cluster-search"
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                placeholder="Search clusters by category or ticket ID…"
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
            <div className="relative">
              <select
                id="cluster-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none pl-4 pr-10 py-2.5 text-sm font-bold border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white text-slate-700"
              >
                <option value="size">Sort by Size</option>
                <option value="confidence">Sort by Confidence</option>
              </select>
              <ChevronDown
                size={14}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
            </div>
          </div>

          {loading ? (
            <SkeletonList count={3} />
          ) : filteredClusters.length === 0 ? (
            <EmptyState message="No duplicate clusters detected yet." />
          ) : (
            <div className="space-y-4">
              {filteredClusters.map((g) => (
                <DuplicateGroupViewer
                  key={g.cluster_id}
                  group={g}
                  onSetPrimary={handleSetPrimary}
                  onViewTicket={(tid) => navigate(`/admin/ticket/${tid}`)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Analytics ── */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Top Categories Table */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight italic flex items-center gap-2">
                <TrendingUp size={16} className="text-indigo-500" />
                Top Duplicate Categories
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-50">
                    <th className="px-6 py-3 text-left text-xs font-black text-slate-400 uppercase tracking-widest">
                      Category
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-black text-slate-400 uppercase tracking-widest">
                      Duplicates / Week
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-black text-slate-400 uppercase tracking-widest">
                      Share
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <tr>
                      <td colSpan={3} className="py-8 text-center text-slate-400">
                        Loading…
                      </td>
                    </tr>
                  ) : (
                    (
                      analytics?.db_duplicate_by_category ||
                      analytics?.top_categories ||
                      []
                    ).map((row, i) => {
                      const total = analytics?.db_total_duplicates || analytics?.total_duplicates || 1;
                      const count = row.count ?? row.duplicate_count ?? 0;
                      const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                      return (
                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-3 font-semibold text-slate-700">
                            {row.category}
                          </td>
                          <td className="px-4 py-3 text-right font-black text-slate-900">
                            {count}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-indigo-500 rounded-full"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span className="text-xs font-bold text-slate-500 tabular-nums w-8 text-right">
                                {pct}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
              {!loading && !(analytics?.db_duplicate_by_category || analytics?.top_categories)?.length && (
                <EmptyState message="No analytics data available yet." />
              )}
            </div>
          </div>

          {/* KB Suggestions */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight italic flex items-center gap-2">
                <Lightbulb size={16} className="text-amber-500" />
                Knowledge Base Recommendations
              </h3>
            </div>
            <div className="p-6 space-y-3">
              {filteredClusters
                .filter((g) => g.kb_suggestion)
                .map((g) => (
                  <div
                    key={g.cluster_id}
                    className="flex items-start gap-3 p-3 rounded-xl bg-amber-50 border border-amber-100"
                  >
                    <Lightbulb size={16} className="text-amber-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-black text-amber-800 uppercase tracking-wide">
                        {g.category} · {g.size} tickets
                      </p>
                      <p className="text-sm font-semibold text-amber-700 mt-0.5">
                        {g.kb_suggestion}
                      </p>
                    </div>
                  </div>
                ))}
              {!filteredClusters.some((g) => g.kb_suggestion) && (
                <EmptyState message="No KB recommendations yet. Clusters grow as duplicates accumulate." />
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Threshold Tuning ── */}
      {activeTab === 'threshold' && (
        <div className="max-w-2xl space-y-6">
          {/* Current threshold slider */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-md overflow-hidden">
            <div className="px-8 py-5 bg-slate-900 text-white border-b border-slate-800">
              <h3 className="text-sm font-black uppercase italic tracking-tight flex items-center gap-3">
                <SlidersHorizontal size={18} className="text-indigo-400" />
                Similarity Threshold
              </h3>
            </div>
            <div className="p-8 space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label
                    htmlFor="threshold-slider"
                    className="text-xs font-black text-slate-700 uppercase tracking-widest"
                  >
                    Duplicate Sensitivity (
                    <span className="text-indigo-600">
                      {(pendingThreshold * 100).toFixed(0)}%
                    </span>
                    )
                  </label>
                  <span className="text-xs font-bold text-slate-400 uppercase">
                    Range: 70% – 95%
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  Higher = stricter matching (fewer false positives). Lower = catches more duplicates.
                </p>
                <input
                  id="threshold-slider"
                  type="range"
                  min={0.70}
                  max={0.95}
                  step={0.01}
                  value={pendingThreshold}
                  onChange={(e) => setPendingThreshold(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase">
                  <span>70% (Loose)</span>
                  <span>85% (Default)</span>
                  <span>95% (Strict)</span>
                </div>
              </div>

              {feedbackMsg && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                  <CheckCircle2 size={15} className="text-emerald-600" />
                  <p className="text-xs font-bold text-emerald-700">{feedbackMsg}</p>
                </div>
              )}

              <button
                id="save-threshold"
                onClick={handleSaveThreshold}
                disabled={saving || pendingThreshold === threshold}
                className="w-full py-3 bg-slate-900 text-white text-sm font-black uppercase tracking-widest rounded-xl hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving…' : 'Save Threshold'}
              </button>
            </div>
          </div>

          {/* Feedback-based auto-tuning */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-md overflow-hidden">
            <div className="px-8 py-5 bg-slate-50 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-900 uppercase italic tracking-tight flex items-center gap-3">
                <AlertCircle size={18} className="text-amber-500" />
                Auto-Tune via Feedback
              </h3>
            </div>
            <div className="p-8 space-y-4">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                Click to let the system auto-adjust the threshold by ±1% based on your review.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <button
                  id="feedback-false-positive"
                  onClick={() => handleFeedback('false_positive')}
                  disabled={saving}
                  className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-700 font-black text-sm hover:bg-rose-100 transition-colors disabled:opacity-50"
                >
                  <TrendingUp size={18} />
                  <div className="text-left">
                    <p className="text-xs font-black uppercase">Too Many</p>
                    <p className="text-[10px] font-bold text-rose-500">False Positives → Stricter</p>
                  </div>
                </button>
                <button
                  id="feedback-missed-duplicate"
                  onClick={() => handleFeedback('missed_duplicate')}
                  disabled={saving}
                  className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-700 font-black text-sm hover:bg-indigo-100 transition-colors disabled:opacity-50"
                >
                  <TrendingDown size={18} />
                  <div className="text-left">
                    <p className="text-xs font-black uppercase">Missing</p>
                    <p className="text-[10px] font-bold text-indigo-500">Duplicates → Looser</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Helpers ──────────────────────────────────────────────────────────────

const KpiCard = ({ icon, label, value, bg }) => (
  <div className={`${bg} rounded-2xl p-5 flex items-center gap-4`}>
    <div className="shrink-0">{icon}</div>
    <div className="min-w-0">
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest truncate">
        {label}
      </p>
      <p className="text-2xl font-black text-slate-900 tabular-nums">{value}</p>
    </div>
  </div>
);

const EmptyState = ({ message }) => (
  <div className="py-16 text-center text-slate-400">
    <Copy size={36} className="mx-auto mb-3 text-slate-200" />
    <p className="text-sm font-semibold">{message}</p>
  </div>
);

const SkeletonList = ({ count = 3 }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="h-24 rounded-2xl bg-slate-100 animate-pulse" />
    ))}
  </div>
);

export default AdminDuplicates;
