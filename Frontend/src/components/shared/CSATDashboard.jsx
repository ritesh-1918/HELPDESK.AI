import { useState, useEffect, useCallback } from 'react';
import { Star, TrendingUp, Users, MessageSquare } from 'lucide-react';
import api from '../../services/api';

function StarDisplay({ rating, size = 16 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={
            star <= Math.round(rating)
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-gray-300 dark:text-gray-600'
          }
        />
      ))}
    </div>
  );
}

function DistributionBar({ count, total, star }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-8 text-right text-gray-500 dark:text-gray-400 dark:text-gray-400">{star}★</span>
      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
        <div
          className="bg-yellow-400 h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-8 text-gray-500 dark:text-gray-400 dark:text-gray-400">{count}</span>
    </div>
  );
}

export default function CSATDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCSAT = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/csat');
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load CSAT data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCSAT();
  }, [fetchCSAT]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4 p-6">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-600 dark:text-red-400">{error}</div>
    );
  }

  if (!data || data.total_ratings === 0) {
    return (
      <div className="p-6 text-center text-gray-500 dark:text-gray-400 dark:text-gray-400">
        <MessageSquare size={40} className="mx-auto mb-2 opacity-50" />
        <p>No ratings submitted yet.</p>
        <p className="text-sm mt-1">Ratings will appear here once users rate resolved tickets.</p>
      </div>
    );
  }

  const overallAvg =
    data.agents.reduce((sum, a) => sum + a.avg_rating * a.total_ratings, 0) /
    data.total_ratings;

  return (
    <div className="space-y-6 p-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
        <TrendingUp size={24} />
        Customer Satisfaction (CSAT)
      </h2>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
          <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-400">Overall CSAT</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-3xl font-bold text-gray-900 dark:text-white">
              {overallAvg.toFixed(1)}
            </span>
            <StarDisplay rating={overallAvg} size={20} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-400">Total Ratings</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
            {data.total_ratings}
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
          <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-400">Agents Rated</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
            {data.agents.length}
          </p>
        </div>
      </div>

      {/* Rating distribution (overall) */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Overall Distribution</h3>
        <div className="space-y-1.5">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = data.agents.reduce(
              (sum, a) => sum + (a.ratings_distribution[star] || 0),
              0
            );
            return (
              <DistributionBar key={star} star={star} count={count} total={data.total_ratings} />
            );
          })}
        </div>
      </div>

      {/* Per-agent breakdown */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <Users size={18} />
          Per-Agent Scores
        </h3>
        <div className="space-y-4">
          {data.agents.map((agent) => (
            <div
              key={agent.agent_id}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
            >
              <div>
                <p className="font-medium text-gray-900 dark:text-white text-sm">
                  {agent.agent_id === 'unassigned' ? 'Unassigned' : agent.agent_id}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-400">
                  {agent.total_ratings} rating{agent.total_ratings !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {agent.avg_rating.toFixed(1)}
                </span>
                <StarDisplay rating={agent.avg_rating} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
