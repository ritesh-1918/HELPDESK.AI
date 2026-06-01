import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import TagChip from "./TagChip";

/**
 * TicketTagManager — full tag UI for ticket detail view
 * Issue #404 — Smart Ticket Tagging System
 * Features: AI suggestions, accept/dismiss, custom input, autocomplete, save
 */
export default function TicketTagManager({
  ticketId,
  ticketTitle = "",
  ticketBody = "",
  category = "",
  companyId = "",
  readOnly = false,
}) {
  const [suggestedTags, setSuggestedTags]   = useState([]);
  const [acceptedTags, setAcceptedTags]     = useState([]);
  const [dismissedTags, setDismissedTags]   = useState([]);
  const [popularTags, setPopularTags]       = useState([]);
  const [inputValue, setInputValue]         = useState("");
  const [showDropdown, setShowDropdown]     = useState(false);
  const [loadingSuggest, setLoadingSuggest] = useState(false);
  const [saving, setSaving]                 = useState(false);
  const [saveStatus, setSaveStatus]         = useState(null); // null | "saved" | "error"

  const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

  // ── Auth token ──────────────────────────────────────────────────────────────
  const getToken = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    return data?.session?.access_token || "";
  }, []);

  // ── Load existing tags on mount ─────────────────────────────────────────────
  useEffect(() => {
    if (!ticketId) return;
    (async () => {
      try {
        const token = await getToken();
        const res = await fetch(`${BACKEND}/api/tags/${ticketId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) setAcceptedTags(data.tags || []);
      } catch (e) {
        console.error("[TagManager] load tags:", e);
      }
    })();
  }, [ticketId]);

  // ── Fetch AI suggestions on mount ──────────────────────────────────────────
  useEffect(() => {
    if (!ticketTitle && !ticketBody) return;
    (async () => {
      setLoadingSuggest(true);
      try {
        const token = await getToken();
        const res = await fetch(`${BACKEND}/api/tags/suggest`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ticket_title: ticketTitle,
            ticket_body: ticketBody,
            category,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setSuggestedTags(data.suggested_tags || []);
        }
      } catch (e) {
        console.error("[TagManager] suggest tags:", e);
      }
      setLoadingSuggest(false);
    })();
  }, []);

  // ── Load popular tags for autocomplete when companyId provided ─────────────
  useEffect(() => {
    if (!companyId) return;
    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const token = data?.session?.access_token || "";
        const res = await fetch(`${BACKEND}/api/tags/popular/${companyId}?limit=50`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await res.json();
        if (result.success) setPopularTags(result.popular_tags || []);
      } catch (e) {
        console.error("[TagManager] fetch popular tags:", e);
      }
    })();
  }, [companyId]);

  // ── Accept / Dismiss suggestions ───────────────────────────────────────────
  function acceptTag(tag) {
    if (!acceptedTags.includes(tag)) setAcceptedTags((p) => [...p, tag]);
    setSuggestedTags((p) => p.filter((t) => t !== tag));
  }

  function dismissTag(tag) {
    setDismissedTags((p) => [...p, tag]);
    setSuggestedTags((p) => p.filter((t) => t !== tag));
  }

  function removeAccepted(tag) {
    setAcceptedTags((p) => p.filter((t) => t !== tag));
  }

  // ── Custom tag input ────────────────────────────────────────────────────────
  function handleKeyDown(e) {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      const tag = inputValue.trim().toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
      if (!acceptedTags.includes(tag)) setAcceptedTags((p) => [...p, tag]);
      setInputValue("");
      setShowDropdown(false);
    }
    if (e.key === "Escape") {
      setShowDropdown(false);
      setInputValue("");
    }
  }

  const autocompleteOptions = popularTags
    .map((p) => p.tag)
    .filter(
      (t) => inputValue.length > 0 &&
             t.includes(inputValue.toLowerCase()) &&
             !acceptedTags.includes(t)
    )
    .slice(0, 5);

  // ── Save tags ───────────────────────────────────────────────────────────────
  async function handleSave() {
    if (!ticketId) return;
    setSaving(true);
    setSaveStatus(null);
    try {
      const token = await getToken();
      const res = await fetch(`${BACKEND}/api/tags/${ticketId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tags: acceptedTags }),
      });
      const data = await res.json();
      setSaveStatus(data.success ? "saved" : "error");
      if (data.success) setTimeout(() => setSaveStatus(null), 3000);
    } catch (e) {
      console.error("[TagManager] save tags:", e);
      setSaveStatus("error");
    }
    setSaving(false);
  }

  // ── Read-only mode (for ticket cards) ──────────────────────────────────────
  if (readOnly) {
    return (
      <div className="flex flex-wrap gap-1.5">
        {acceptedTags.length > 0
          ? acceptedTags.map((tag) => <TagChip key={tag} tag={tag} variant="admin" />)
          : <span className="text-xs text-gray-400 italic">No tags</span>}
      </div>
    );
  }

  return (
    <div className="space-y-4">

      {/* ── AI Suggested Tags ───────────────────────────────────────────────── */}
      {(loadingSuggest || suggestedTags.length > 0) && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-xs font-semibold text-amber-700 mb-2 flex items-center gap-1.5">
            🤖 AI Suggested Tags
            {loadingSuggest && (
              <span className="w-3 h-3 border-2 border-amber-500 border-t-transparent rounded-full animate-spin inline-block" />
            )}
          </p>
          {suggestedTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {suggestedTags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full
                    text-xs font-medium border bg-white text-amber-700 border-amber-300"
                >
                  #{tag}
                  <button
                    onClick={() => acceptTag(tag)}
                    className="text-green-600 hover:text-green-800 font-bold ml-0.5"
                    title="Accept"
                    aria-label={`Accept tag ${tag}`}
                  >
                    ✓
                  </button>
                  <button
                    onClick={() => dismissTag(tag)}
                    className="text-red-400 hover:text-red-600"
                    title="Dismiss"
                    aria-label={`Dismiss tag ${tag}`}
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          )}
          {loadingSuggest && suggestedTags.length === 0 && (
            <p className="text-xs text-amber-600">Generating suggestions...</p>
          )}
        </div>
      )}

      {/* ── Accepted Tags ───────────────────────────────────────────────────── */}
      <div>
        <p className="text-xs font-semibold text-gray-600 mb-2">✅ Applied Tags</p>
        <div className="flex flex-wrap gap-2 min-h-[28px]">
          {acceptedTags.length > 0
            ? acceptedTags.map((tag) => (
                <TagChip key={tag} tag={tag} variant="accepted" onRemove={removeAccepted} />
              ))
            : <span className="text-xs text-gray-400 italic">No tags yet</span>
          }
        </div>
      </div>

      {/* ── Custom Input with Autocomplete ──────────────────────────────────── */}
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => { setInputValue(e.target.value); setShowDropdown(true); }}
          onKeyDown={handleKeyDown}
          onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
          placeholder="Type a tag and press Enter..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm
            focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
          aria-label="Add custom tag"
        />
        {showDropdown && autocompleteOptions.length > 0 && (
          <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white
            border border-gray-200 rounded-lg shadow-lg overflow-hidden">
            {autocompleteOptions.map((tag) => (
              <button
                key={tag}
                onMouseDown={(e) => {
                  e.preventDefault();
                  if (!acceptedTags.includes(tag)) setAcceptedTags((p) => [...p, tag]);
                  setInputValue("");
                  setShowDropdown(false);
                }}
                className="w-full text-left px-3 py-2 text-sm text-gray-700
                  hover:bg-indigo-50 transition-colors"
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
        <p className="text-xs text-gray-400 mt-1">
          Spaces become hyphens automatically. Press Enter to add.
        </p>
      </div>

      {/* ── Save Button ─────────────────────────────────────────────────────── */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50
          text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
      >
        {saving
          ? "Saving..."
          : saveStatus === "saved"
          ? "✅ Tags Saved!"
          : saveStatus === "error"
          ? "❌ Save Failed — Try Again"
          : "Save Tags"}
      </button>
    </div>
  );
}
