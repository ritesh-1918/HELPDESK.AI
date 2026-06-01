/**
 * TagChip — reusable tag chip component
 * Issue #404 — Smart Ticket Tagging System
 */
export default function TagChip({ tag, onRemove, variant = "default" }) {
  const styles = {
    default:   "bg-indigo-50 text-indigo-700 border-indigo-200",
    suggested: "bg-amber-50 text-amber-700 border-amber-200",
    accepted:  "bg-green-50 text-green-700 border-green-200",
    admin:     "bg-slate-100 text-slate-600 border-slate-200",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full
        text-xs font-medium border transition-colors ${styles[variant] || styles.default}`}
    >
      #{tag}
      {onRemove && (
        <button
          onClick={() => onRemove(tag)}
          className="ml-0.5 hover:opacity-60 transition-opacity leading-none"
          aria-label={`Remove tag ${tag}`}
        >
          ✕
        </button>
      )}
    </span>
  );
}
