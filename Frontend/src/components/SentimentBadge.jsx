/**
 * SentimentBadge — emoji + label chip showing ticket frustration level
 * Issue #775
 */
export default function SentimentBadge({ ticket, showSignals = false }) {
  const level = ticket?.frustration_level || "neutral";

  const config = {
    neutral: { emoji: "😊", label: "Neutral", bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-600 dark:text-gray-400", ring: "" },
    mild: { emoji: "😐", label: "Mild", bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-600 dark:text-blue-400", ring: "" },
    moderate: { emoji: "😤", label: "Frustrated", bg: "bg-amber-50", border: "border-amber-300", text: "text-amber-700", ring: "" },
    high: { emoji: "😡", label: "Very Upset", bg: "bg-orange-50", border: "border-orange-400", text: "text-orange-700", ring: "ring-1 ring-orange-300" },
    critical: { emoji: "🔴", label: "Critical", bg: "bg-red-50", border: "border-red-400", text: "text-red-700", ring: "ring-2 ring-red-400 ring-offset-1 animate-pulse" },
  };

  const cfg = config[level] || config.neutral;

  return (
    <div className={`inline-flex flex-col gap-1 rounded-lg border px-2.5 py-1.5 ${cfg.bg} ${cfg.border} ${cfg.ring}`}>
      <div className="flex items-center gap-1.5">
        <span className="text-sm">{cfg.emoji}</span>
        <span className={`text-xs font-medium ${cfg.text}`}>{cfg.label}</span>
        {ticket?.auto_escalated && (
          <span className="ml-1 text-xs bg-purple-100 text-purple-700 border border-purple-200 px-1.5 py-0.5 rounded-full font-medium">
            ⚡ Auto-escalated
          </span>
        )}
      </div>

      {showSignals && ticket?.sentiment_signals?.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-0.5">
          {ticket.sentiment_signals.map((signal, index) => (
            <span key={index} className={`text-xs ${cfg.text} opacity-70`}>
              · {signal}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}