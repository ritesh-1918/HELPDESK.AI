import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

/**
 * TagFilter — admin ticket list filter by tag
 * Issue #404 — Smart Ticket Tagging System
 */
export default function TagFilter({ companyId, onFilterChange }) {
  const [popularTags, setPopularTags] = useState([]);
  const [selected, setSelected]       = useState([]);
  const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

  useEffect(() => {
    if (!companyId) return;
    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const token = data?.session?.access_token || "";
        const res = await fetch(`${BACKEND}/api/tags/popular/${companyId}?limit=20`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await res.json();
        if (result.success) setPopularTags(result.popular_tags || []);
      } catch (e) {
        console.error("[TagFilter] fetch popular tags:", e);
      }
    })();
  }, [companyId]);

  function toggle(tag) {
    const updated = selected.includes(tag)
      ? selected.filter((t) => t !== tag)
      : [...selected, tag];
    setSelected(updated);
    onFilterChange?.(updated);
  }

  function clearAll() {
    setSelected([]);
    onFilterChange?.([]);
  }

  if (popularTags.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-gray-700">🏷️ Filter by Tag</span>
        {selected.length > 0 && (
          <button
            onClick={clearAll}
            className="text-xs text-indigo-500 hover:underline"
          >
            Clear all ({selected.length})
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {popularTags.map(({ tag, count }) => (
          <button
            key={tag}
            onClick={() => toggle(tag)}
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full
              text-xs font-medium border transition-colors ${
              selected.includes(tag)
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-gray-50 text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600"
            }`}
            aria-pressed={selected.includes(tag)}
          >
            #{tag}
            <span className="opacity-60">({count})</span>
          </button>
        ))}
      </div>
    </div>
  );
}
