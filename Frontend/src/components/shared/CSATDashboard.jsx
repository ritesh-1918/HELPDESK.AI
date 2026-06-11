import { useState, useEffect, useCallback, useRef } from 'react';
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
  const mountedRef = useRef(true);

  const fetchCSAT = useCallback(async () => {
    if (!mountedRef.current) return;
    if (mountedRef.current) setLoading(true);
    try {
      const res = await api.get('/admin/csat');
      if (mountedRef.current) setData(res.data);
    } catch (err) {
      if (mountedRef.current) setError(err.response?.data?.detail || 'Failed to load CSAT data');
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
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
      <div className="p-8 text-center text-gray-500 dark:text-gray-400">
        No CSAT ratings available yet.
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow border border-gray-100 dark:border-gray-700 text-center">
          <div className="text-3xl font-bold text-emerald-600">{data.average_rating?.toFixed(1) ?? '—'}</div>
          <div className="text-sm text-gray-500 mt-1">Average Rating</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow border border-gray-100 dark:border-gray-700 text-center">
          <div className="text-3xl font-bold text-blue-600">{data.total_ratings ?? 0}</div>
          <div className="text-sm text-gray-500 mt-1">Total Responses</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow border border-gray-100 dark:border-gray-700 text-center">
          <div className="text-3xl font-bold text-purple-600">{data.response_rate ? `${data.response_rate.toFixed(0)}%` : '—'}</div>
          <div className="text-sm text-gray-500 mt-1">Response Rate</div>
        </div>
      </div>

      {data.distribution && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow border border-gray-100 dark:border-gray-700 space-y-2">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Rating Distribution</h3>
          {[5, 4, 3, 2, 1].map((star) => (
            <DistributionBar
              key={star}
              count={data.distribution[star] || 0}
              total={data.total_ratings}
              star={star}
            />
          ))}
        </div>
      )}
    </div>
  );
}
