/**
 * SentimentFilter — filter ticket list by frustration level
 * Issue #775
 */
export default function SentimentFilter({ selected, onChange }) {
  const levels = [
    { key: "critical", emoji: "🔴", label: "Critical" },
    { key: "high", emoji: "😡", label: "Very Upset" },
    { key: "moderate", emoji: "😤", label: "Frustrated" },
    { key: "mild", emoji: "😐", label: "Mild" },
    { key: "neutral", emoji: "😊", label: "Neutral" },
  ];

  function toggle(key) {
    const updated = selected.includes(key)
      ? selected.filter((item) => item !== key)
      : [...selected, key];
    onChange(updated);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Sentiment:</span>
      {levels.map(({ key, emoji, label }) => (
        <button
          key={key}
          onClick={() => toggle(key)}
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
            selected.includes(key)
              ? "bg-gray-800 text-white border-gray-800"
              : "bg-white text-gray-600 dark:text-gray-400 border-gray-200 hover:border-gray-400"
          }`}
          aria-pressed={selected.includes(key)}
        >
          {emoji} {label}
        </button>
      ))}
      {selected.length > 0 && (
        <button onClick={() => onChange([])} className="text-xs text-indigo-500 hover:underline ml-1">
          Clear
        </button>
      )}
    </div>
  );
}