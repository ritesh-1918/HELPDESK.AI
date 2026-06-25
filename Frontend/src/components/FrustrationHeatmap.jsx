import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { API_CONFIG } from "../../config";

/**
 * FrustrationHeatmap — admin widget showing frustration distribution
 * Issue #775
 */
export default function FrustrationHeatmap({ companyId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const BACKEND = API_CONFIG.BACKEND_URL;

  useEffect(() => {
    if (!companyId) return;

    (async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData?.session?.access_token || "";
        const res = await fetch(`${BACKEND}/api/sentiment/heatmap/${companyId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await res.json();
        if (result.success) {
          setData(result);
        }
      } catch (error) {
        console.error("[FrustrationHeatmap]", error);
      }
      setLoading(false);
    })();
  }, [companyId]);

  const levels = [
    { key: "neutral", label: "Neutral", emoji: "😊", color: "bg-gray-400", light: "bg-gray-50" },
    { key: "mild", label: "Mild", emoji: "😐", color: "bg-blue-400", light: "bg-blue-50" },
    { key: "moderate", label: "Frustrated", emoji: "😤", color: "bg-amber-400", light: "bg-amber-50" },
    { key: "high", label: "Very Upset", emoji: "😡", color: "bg-orange-500", light: "bg-orange-50" },
    { key: "critical", label: "Critical", emoji: "🔴", color: "bg-red-600", light: "bg-red-50" },
  ];

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
        <div className="h-4 bg-gray-100 rounded w-48 mb-4" />
        {[1, 2, 3, 4, 5].map((index) => (
          <div key={index} className="h-8 bg-gray-100 rounded mb-2" />
        ))}
      </div>
    );
  }

  if (!data) return null;

  const total = data.total || 1;
  const criticalCount = data.critical || 0;
  const highCount = data.high || 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-800">😤 Frustration Heatmap</h3>
          <p className="text-xs text-gray-400 mt-0.5">{total} open tickets analyzed</p>
        </div>
        {(criticalCount + highCount) > 0 && (
          <span className="text-xs bg-red-100 text-red-700 border border-red-200 px-2.5 py-1 rounded-full font-medium animate-pulse">
            🔴 {criticalCount + highCount} need attention
          </span>
        )}
      </div>

      <div className="p-5 space-y-3">
        {levels.map(({ key, label, emoji, color, light }) => {
          const count = data[key] || 0;
          const percentage = Math.round((count / total) * 100);

          return (
            <div key={key} className={`rounded-lg p-2.5 ${light}`}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-gray-700 flex items-center gap-1.5">
                  <span>{emoji}</span>
                  {label}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  {count} <span className="text-gray-300">({percentage}%)</span>
                </span>
              </div>
              <div className="w-full bg-white bg-opacity-60 rounded-full h-2">
                <div className={`${color} h-2 rounded-full transition-all duration-700`} style={{ width: `${percentage}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      {(criticalCount + highCount) > 0 && (
        <div className="px-5 py-3 bg-red-50 border-t border-red-100">
          <p className="text-xs text-red-600">
            ⚠️ <strong>{criticalCount + highCount} tickets</strong> have high/critical frustration — consider immediate agent assignment.
          </p>
        </div>
      )}
    </div>
  );
}