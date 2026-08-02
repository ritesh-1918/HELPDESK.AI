import { useEffect, useRef, useState, useCallback } from 'react';

const RECONNECT_BASE_MS = 1000;
const RECONNECT_MAX_MS = 30000;
const RECONNECT_BACKOFF_EXP = 6;
const DEFAULT_HEARTBEAT_MS = 25000;

/**
 * useResilientWebSocket — a connection that survives network blips.
 *
 * - Reconnects automatically with exponential backoff (1s -> 30s cap).
 * - Sends a JSON `{"type":"ping"}` heartbeat so idle channels stay alive.
 * - Exposes a `status` of 'idle' | 'connecting' | 'connected' | 'reconnecting'.
 * - `send(payload)` returns true only when the socket is actually open.
 *
 * @param {object}  options
 * @param {string|null} options.url   ws(s) URL; null disables the connection.
 * @param {boolean}     options.enabled  When false the connection is torn down.
 * @param {function}    options.onMessage  Invoked with parsed frames.
 * @param {number}      options.heartbeatMs Heartbeat interval in ms.
 */
export default function useResilientWebSocket({
    url,
    enabled = true,
    onMessage,
    heartbeatMs = DEFAULT_HEARTBEAT_MS,
}) {
    const [status, setStatus] = useState('idle');
    const wsRef = useRef(null);
    const attemptsRef = useRef(0);
    const reconnectTimerRef = useRef(null);
    const heartbeatRef = useRef(null);
    const onMessageRef = useRef(onMessage);
    onMessageRef.current = onMessage;

    const send = useCallback((payload) => {
        const ws = wsRef.current;
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(typeof payload === 'string' ? payload : JSON.stringify(payload));
            return true;
        }
        return false;
    }, []);

    useEffect(() => {
        if (!enabled || !url) {
            setStatus('idle');
            return undefined;
        }

        let cancelled = false;

        const backoff = () =>
            Math.min(
                RECONNECT_BASE_MS * 2 ** Math.min(attemptsRef.current, RECONNECT_BACKOFF_EXP),
                RECONNECT_MAX_MS
            );

        const clearTimers = () => {
            if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
            if (heartbeatRef.current) clearInterval(heartbeatRef.current);
            reconnectTimerRef.current = null;
            heartbeatRef.current = null;
        };

        const connect = () => {
            if (cancelled) return;

            let ws;
            try {
                ws = new WebSocket(url);
            } catch {
                setStatus('reconnecting');
                scheduleReconnect();
                return;
            }

            wsRef.current = ws;
            setStatus('connecting');

            ws.onopen = () => {
                attemptsRef.current = 0;
                setStatus('connected');
                heartbeatRef.current = setInterval(() => {
                    if (ws.readyState === WebSocket.OPEN) {
                        try {
                            ws.send(JSON.stringify({ type: 'ping' }));
                        } catch {
                            /* channel died mid-interval; onclose handles it */
                        }
                    }
                }, heartbeatMs);
            };

            ws.onmessage = (event) => {
                let data = event.data;
                try {
                    data = JSON.parse(event.data);
                } catch {
                    /* keep raw string */
                }
                if (data && data.type === 'pong') return;
                onMessageRef.current?.(data, event);
            };

            ws.onclose = () => {
                clearTimers();
                wsRef.current = null;
                if (cancelled) {
                    setStatus('idle');
                    return;
                }
                attemptsRef.current += 1;
                setStatus('reconnecting');
                scheduleReconnect();
            };

            ws.onerror = () => {
                try {
                    ws.close();
                } catch {
                    /* onclose will still fire */
                }
            };
        };

        const scheduleReconnect = () => {
            if (cancelled) return;
            reconnectTimerRef.current = setTimeout(connect, backoff());
        };

        connect();

        return () => {
            cancelled = true;
            clearTimers();
            const ws = wsRef.current;
            if (ws) {
                ws.onclose = null;
                try {
                    ws.close();
                } catch {
                    /* already closed */
                }
            }
            wsRef.current = null;
        };
    }, [url, enabled, heartbeatMs]);

    return { status, send };
}
