import { useEffect, useState, useRef } from "react";
import { Activity, Cpu, HardDrive, Wifi, Server } from "lucide-react";

const BACKEND_WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8000/ws/metrics";

function MetricBar({ label, percent, color }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
        <span>{label}</span>
        <span>{percent}%</span>
      </div>
      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>
    </div>
  );
}

export default function ServerMetricsPanel() {
  const [metrics, setMetrics] = useState(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const wsRef = useRef(null);

  useEffect(() => {
    const connect = () => {
      const ws = new WebSocket(BACKEND_WS_URL);
      wsRef.current = ws;

      ws.onopen = () => { setConnected(true); setError(null); };
      ws.onmessage = (e) => setMetrics(JSON.parse(e.data));
      ws.onerror = () => setError("WebSocket connection failed");
      ws.onclose = () => {
        setConnected(false);
        setTimeout(connect, 3000); // auto-reconnect after 3s
      };
    };

    connect();
    return () => wsRef.current?.close();
  }, []);

  const statusColor = metrics?.status === "healthy"
    ? "text-emerald-500"
    : "text-red-500";

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Server className="w-5 h-5 text-emerald-500" />
          <h2 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Server Metrics</h2>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${connected ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} />
          <span className="text-xs font-semibold text-slate-400">
            {connected ? "Live" : "Reconnecting..."}
          </span>
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-500 font-medium">{error}</p>
      )}

      {!metrics ? (
        <div className="flex items-center justify-center py-8 text-slate-400 text-sm">
          Connecting to server...
        </div>
      ) : (
        <div className="space-y-4">
          {/* Status */}
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-slate-400" />
            <span className={`text-xs font-bold uppercase tracking-widest ${statusColor}`}>
              {metrics.status}
            </span>
            <span className="text-xs text-slate-400 ml-auto">
              {new Date(metrics.timestamp).toLocaleTimeString()}
            </span>
          </div>

          {/* CPU */}
          <div className="space-y-1">
            <div className="flex items-center gap-1 mb-1">
              <Cpu className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs font-bold text-slate-500">CPU ({metrics.cpu.count} cores)</span>
            </div>
            <MetricBar
              label="Usage"
              percent={metrics.cpu.percent}
              color={metrics.cpu.percent > 80 ? "bg-red-500" : "bg-emerald-500"}
            />
          </div>

          {/* Memory */}
          <div className="space-y-1">
            <div className="flex items-center gap-1 mb-1">
              <Server className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs font-bold text-slate-500">
                Memory ({metrics.memory.used_mb} / {metrics.memory.total_mb} MB)
              </span>
            </div>
            <MetricBar
              label="Usage"
              percent={metrics.memory.percent}
              color={metrics.memory.percent > 85 ? "bg-red-500" : "bg-blue-500"}
            />
          </div>

          {/* Disk */}
          <div className="space-y-1">
            <div className="flex items-center gap-1 mb-1">
              <HardDrive className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs font-bold text-slate-500">
                Disk ({metrics.disk.used_gb} / {metrics.disk.total_gb} GB)
              </span>
            </div>
            <MetricBar
              label="Usage"
              percent={metrics.disk.percent}
              color={metrics.disk.percent > 90 ? "bg-red-500" : "bg-purple-500"}
            />
          </div>

          {/* Network */}
          <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
            <Wifi className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs text-slate-500">
              ↑ {metrics.network.bytes_sent_mb} MB &nbsp;
              ↓ {metrics.network.bytes_recv_mb} MB
            </span>
          </div>
        </div>
      )}
    </div>
  );
}