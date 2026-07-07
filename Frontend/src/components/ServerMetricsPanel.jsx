import { useEffect, useState, useRef } from "react";
import { Activity, Cpu, HardDrive, Wifi, Server, Info } from "lucide-react";

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

function Tooltip({ icon, text }) {
  return (
    <div className="group relative inline-block ml-1">
      <span className="text-slate-400 cursor-help">{icon}</span>
      <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 
                      opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50">
        <div className="bg-slate-900 text-white text-[10px] font-medium rounded-lg px-3 py-2 
                        whitespace-nowrap shadow-xl border border-slate-700">
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
            <div className="w-2 h-2 bg-slate-900 border-r border-b border-slate-700 rotate-45 -translate-y-1/2"></div>
          </div>
        </div>
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
      ws.onclose = () => { setConnected(false); setTimeout(connect, 3000); };
    };
    connect();
    return () => wsRef.current?.close();
  }, []);

  const statusColor = metrics?.status === "healthy" ? "text-emerald-500" : "text-red-500";

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Server className="w-5 h-5 text-emerald-500" />
          <h2 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Server Metrics</h2>
          <Tooltip icon={<Info className="w-3 h-3" />} text="Real-time server resource monitoring via WebSocket" />
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${connected ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} />
          <span className="text-xs font-semibold text-slate-400">{connected ? "Live" : "Reconnecting..."}</span>
        </div>
      </div>

      {error && (<p className="text-xs text-red-500 font-medium">{error}</p>)}

      {!metrics ? (
        <div className="flex items-center justify-center py-8 text-slate-400 text-sm">Connecting...</div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-slate-400" />
            <span className={`text-xs font-bold uppercase tracking-widest ${statusColor}`}>{metrics.status}</span>
            <Tooltip icon={<Info className="w-3 h-3 text-slate-400" />} text={`Last checked: ${new Date(metrics.timestamp).toLocaleString()}`} />
            <span className="text-xs text-slate-400 ml-auto">{new Date(metrics.timestamp).toLocaleTimeString()}</span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1 mb-1">
              <Cpu className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs font-bold text-slate-500">CPU ({metrics.cpu.count} cores)</span>
              <Tooltip icon={<Info className="w-3 h-3 text-slate-400" />} text={`CPU: ${metrics.cpu.percent}% usage on ${metrics.cpu.count} cores`} />
            </div>
            <MetricBar label="Usage" percent={metrics.cpu.percent} color={metrics.cpu.percent > 80 ? "bg-red-500" : "bg-emerald-500"} />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1 mb-1">
              <Server className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs font-bold text-slate-500">Memory ({metrics.memory.used_mb}/{metrics.memory.total_mb} MB)</span>
              <Tooltip icon={<Info className="w-3 h-3 text-slate-400" />} text={`RAM: ${metrics.memory.used_mb}MB of ${metrics.memory.total_mb}MB (${metrics.memory.percent}% used)`} />
            </div>
            <MetricBar label="Usage" percent={metrics.memory.percent} color={metrics.memory.percent > 85 ? "bg-red-500" : "bg-blue-500"} />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1 mb-1">
              <HardDrive className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs font-bold text-slate-500">Disk ({metrics.disk.used_gb}/{metrics.disk.total_gb} GB)</span>
              <Tooltip icon={<Info className="w-3 h-3 text-slate-400" />} text={`Storage: ${metrics.disk.used_gb}GB of ${metrics.disk.total_gb}GB (${metrics.disk.percent}% full)`} />
            </div>
            <MetricBar label="Usage" percent={metrics.disk.percent} color={metrics.disk.percent > 90 ? "bg-red-500" : "bg-purple-500"} />
          </div>

          <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
            <Wifi className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs text-slate-500">Up: {metrics.network.bytes_sent_mb}MB Down: {metrics.network.bytes_recv_mb}MB</span>
            <Tooltip icon={<Info className="w-3 h-3 text-slate-400" />} text={`Network: Sent ${metrics.network.bytes_sent_mb}MB, Received ${metrics.network.bytes_recv_mb}MB`} />
          </div>
        </div>
      )}
    </div>
  );
}
