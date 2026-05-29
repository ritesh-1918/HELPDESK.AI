import { useState, useEffect } from "react";

const SLA_RULES = {
  critical: 4 * 60 * 60 * 1000,
  high: 8 * 60 * 60 * 1000,
  medium: 24 * 60 * 60 * 1000,
  low: 72 * 60 * 60 * 1000,
};

const SLACountdownTimer = ({ createdAt, priority = "medium" }) => {
  const [timeLeft, setTimeLeft] = useState(null);
  const [status, setStatus] = useState("green");

  useEffect(() => {
    const calculate = () => {
      const created = new Date(createdAt).getTime();
      const deadline = created + (SLA_RULES[priority.toLowerCase()] || SLA_RULES.medium);
      const now = Date.now();
      const remaining = deadline - now;
      const total = SLA_RULES[priority.toLowerCase()] || SLA_RULES.medium;

      if (remaining <= 0) {
        setStatus("red");
        setTimeLeft("Breached");
        return;
      }

      const pct = remaining / total;
      if (pct > 0.25) setStatus("green");
      else if (pct > 0) setStatus("yellow");
      else setStatus("red");

      const h = Math.floor(remaining / 3600000);
      const m = Math.floor((remaining % 3600000) / 60000);
      const s = Math.floor((remaining % 60000) / 1000);
      setTimeLeft(`${h}h ${m}m ${s}s`);
    };

    calculate();
    const timer = setInterval(calculate, 1000);
    return () => clearInterval(timer);
  }, [createdAt, priority]);

  const colors = {
    green: "bg-green-500/20 text-green-400 border-green-500",
    yellow: "bg-yellow-500/20 text-yellow-400 border-yellow-500",
    red: "bg-red-500/20 text-red-400 border-red-500 animate-pulse",
  };

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-mono font-semibold ${colors[status]}`}>
      <span className={`w-2 h-2 rounded-full ${status === "green" ? "bg-green-400" : status === "yellow" ? "bg-yellow-400" : "bg-red-400"}`} />
      SLA: {timeLeft || "Calculating..."}
    </div>
  );
};

export default SLACountdownTimer;
