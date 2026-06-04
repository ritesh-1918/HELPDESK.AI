/**
 * useWebSocket — auto-reconnecting WebSocket hook.
 *
 * Connects to the backend WebSocket endpoint for real-time ticket updates.
 * Automatically re-establishes the connection on drop with exponential backoff.
 *
 * Heartbeat protocol (server-managed):
 *   - Server sends {"type": "ping"} every 30 s.
 *   - This hook responds immediately with {"type": "pong"}.
 *   - Server disconnects clients that miss a pong within 10 s (HEARTBEAT_TIMEOUT).
 *   - No client-side ping timer is needed; the server owns the keepalive cycle.
 *
 * Usage:
 *   import useWebSocket from "../../hooks/useWebSocket";
 *
 *   const { isConnected, sendMessage, lastMessage } = useWebSocket(companyId);
 *
 *   // lastMessage updates on every incoming message — use in a useEffect
 *   useEffect(() => {
 *     if (lastMessage?.type === "ticket_update") {
 *       store.addTicket(lastMessage.ticket);
 *     }
 *   }, [lastMessage]);
 */

import { useEffect, useRef, useState, useCallback } from "react";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const WS_BASE_URL = import.meta.env.VITE_WS_URL || "ws://localhost:7860";
const MAX_RECONNECT_DELAY_MS = 30_000;
const INITIAL_RECONNECT_DELAY_MS = 1_000;

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export default function useWebSocket(companyId) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const [connectionError, setConnectionError] = useState(null);

  const wsRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const reconnectAttemptRef = useRef(0);
  const mountedRef = useRef(true);
  const companyIdRef = useRef(companyId);

  // Keep a ref to latest companyId so the effect closure always has it

  // ---- Cleanup helpers ---------------------------------------------------

  const clearTimers = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  }, []);

  const cleanup = useCallback(() => {
    clearTimers();
    if (wsRef.current) {
      wsRef.current.onopen = null;
      wsRef.current.onclose = null;
      wsRef.current.onmessage = null;
      wsRef.current.onerror = null;
      wsRef.current.close();
      wsRef.current = null;
    }
  }, [clearTimers]);

  // ---- WebSocket lifecycle & Reconnection ---------------------------------

  const connectRef = useRef(null);

  const scheduleReconnect = useCallback(() => {
    if (!mountedRef.current || !companyIdRef.current) return;

    const attempt = reconnectAttemptRef.current;
    const delay = Math.min(
      INITIAL_RECONNECT_DELAY_MS * Math.pow(2, attempt),
      MAX_RECONNECT_DELAY_MS
    );
    reconnectAttemptRef.current = attempt + 1;

    setConnectionError(`Reconnecting in ${Math.round(delay / 1000)}s...`);

    reconnectTimerRef.current = setTimeout(() => {
      if (mountedRef.current && connectRef.current) connectRef.current();
    }, delay);
  }, []);

  const connect = useCallback(() => {
    cleanup();

    const cid = companyIdRef.current;
    if (!cid) return;

    const url = `${WS_BASE_URL}/ws/${encodeURIComponent(cid)}`;
    setConnectionError(null);

    let socket;
    try {
      socket = new WebSocket(url);
    } catch (err) {
      setConnectionError(err.message || "Failed to create WebSocket");
      scheduleReconnect();
      return;
    }
    wsRef.current = socket;

    socket.onopen = () => {
      if (!mountedRef.current) return;
      setIsConnected(true);
      setConnectionError(null);
      reconnectAttemptRef.current = 0;
    };

    socket.onmessage = (event) => {
      if (!mountedRef.current) return;
      try {
        const data = JSON.parse(event.data);

        // Respond to server-initiated pings immediately (keepalive protocol)
        if (data.type === "ping") {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: "pong" }));
          }
          return;
        }

        setLastMessage(data);
      } catch {
        // ignore malformed frames
      }
    };

    socket.onclose = (event) => {
      if (!mountedRef.current) return;
      setIsConnected(false);
      clearTimers();

      // Don't reconnect on clean closes (1000 = normal, 400x = intentional)
      if (event.code === 1000 || (event.code >= 4000 && event.code < 5000)) {
        return;
      }

      scheduleReconnect();
    };

    socket.onerror = () => {
      // onclose fires immediately after onerror, so reconnect is handled there
    };
  }, [cleanup, clearTimers, scheduleReconnect]);

  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  // ---- Send helper -------------------------------------------------------

  const sendMessage = useCallback(
    (msg) => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          typeof msg === "string" ? msg : JSON.stringify(msg)
        );
      }
    },
    []
  );

  // ---- Main effect -------------------------------------------------------

  useEffect(() => {
    mountedRef.current = true;
    companyIdRef.current = companyId;

    if (companyId) {
      connect();
    }

    return () => {
      mountedRef.current = false;
      cleanup();
    };
  }, [companyId, connect, cleanup]);

  return { isConnected, lastMessage, connectionError, sendMessage };
}
