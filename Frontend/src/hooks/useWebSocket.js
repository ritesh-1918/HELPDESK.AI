import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import useConnectionStore from '../store/connectionStore';

/**
 * Configuration for Supabase reconnection behavior.
 * Supabase JS client v2.x has built-in reconnect but doesn't surface
 * connection state changes to the UI. This hook wraps Supabase channels
 * with explicit reconnection tracking, exponential backoff, and a
 * fallback that surfaces the connection status to the global store.
 */
const RECONNECT_CONFIG = {
  INITIAL_DELAY: 1000,      // 1 second
  MAX_DELAY: 30000,         // 30 seconds
  MAX_RETRIES: 10,          // max consecutive reconnect attempts
  JITTER: 0.3,              // ±30% jitter factor
};

/**
 * Calculate exponential backoff with jitter.
 * Returns delay in milliseconds.
 */
const getBackoffDelay = (attempt) => {
  const exponential = Math.min(
    RECONNECT_CONFIG.INITIAL_DELAY * Math.pow(2, attempt),
    RECONNECT_CONFIG.MAX_DELAY
  );
  const jitter = 1 + (Math.random() - 0.5) * 2 * RECONNECT_CONFIG.JITTER;
  return Math.round(exponential * jitter);
};

/**
 * Custom hook that subscribes to a Supabase channel with automatic
 * reconnection, exponential backoff, and connection status reporting.
 *
 * @param {string} channelName - Unique name for this channel
 * @param {Array<{event: string, schema: string, table: string, filter?: string, handler: Function}>} subscriptions
 * @param {Object} options
 * @param {boolean} options.enabled - Whether to subscribe (default: true)
 * @param {Function} options.onPollFallback - Fallback HTTP poll when disconnected
 * @param {number} options.pollInterval - Poll interval in ms (default: 30000)
 */
const useSupabaseRealtime = (
  channelName,
  subscriptions = [],
  options = {}
) => {
  const {
    enabled = true,
    onPollFallback = null,
    pollInterval = 30000,
  } = options;

  const channelRef = useRef(null);
  const retryCountRef = useRef(0);
  const backoffTimerRef = useRef(null);
  const pollTimerRef = useRef(null);
  const mountedRef = useRef(true);
  const lastPongRef = useRef(Date.now());
  const pingTimerRef = useRef(null);

  const { setConnected, setReconnecting, setDisconnected } = useConnectionStore.getState();

  /**
   * Polling fallback when WebSocket is down after all retries.
   */
  const startPollFallback = useCallback(() => {
    if (!onPollFallback || pollTimerRef.current) return;

    setDisconnected(`Fell back to HTTP polling (every ${pollInterval / 1000}s)`);

    pollTimerRef.current = setInterval(async () => {
      if (!mountedRef.current) return;
      try {
        await onPollFallback();
      } catch (err) {
        // Poll errors are expected when network is down; swallow silently.
      }
    }, pollInterval);
  }, [onPollFallback, pollInterval, setDisconnected]);

  const stopPollFallback = useCallback(() => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  /**
   * Heartbeat check: if we haven't received anything from Supabase
   * in a while, consider the connection dead.
   */
  const startHeartbeat = useCallback(() => {
    const check = () => {
      if (!mountedRef.current) return;
      const elapsed = Date.now() - lastPongRef.current;
      // If no pong/message for 30 seconds, assume disconnect
      if (elapsed > 30000) {
        scheduleReconnect();
      }
    };
    pingTimerRef.current = setInterval(check, 15000);
  }, []);

  const stopHeartbeat = useCallback(() => {
    if (pingTimerRef.current) {
      clearInterval(pingTimerRef.current);
      pingTimerRef.current = null;
    }
  }, []);

  /**
   * Schedule a reconnect attempt with exponential backoff.
   */
  const scheduleReconnect = useCallback(() => {
    if (!mountedRef.current) return;

    retryCountRef.current += 1;

    if (retryCountRef.current > RECONNECT_CONFIG.MAX_RETRIES) {
      // Max retries exceeded — fall back to HTTP polling
      setDisconnected(
        `Disconnected — fell back to HTTP polling (every ${pollInterval / 1000}s)`
      );
      stopHeartbeat();
      startPollFallback();
      return;
    }

    const delay = getBackoffDelay(retryCountRef.current);
    setReconnecting(
      retryCountRef.current,
      `Reconnecting (attempt ${retryCountRef.current}/${RECONNECT_CONFIG.MAX_RETRIES})…`
    );

    backoffTimerRef.current = setTimeout(() => {
      if (!mountedRef.current) return;
      subscribe();
    }, delay);
  }, [pollInterval, setDisconnected, setReconnecting, startPollFallback, stopHeartbeat]);

  /**
   * Subscribe (or resubscribe) to the Supabase channel.
   */
  const subscribe = useCallback(() => {
    if (!mountedRef.current) return;

    // Clean up existing channel
    if (channelRef.current) {
      try {
        supabase.removeChannel(channelRef.current);
      } catch {
        // Channel might already be in a bad state
      }
      channelRef.current = null;
    }

    stopHeartbeat();
    stopPollFallback();

    if (!enabled || subscriptions.length === 0) return;

    lastPongRef.current = Date.now();

    let channel = supabase.channel(channelName);

    for (const sub of subscriptions) {
      channel = channel.on(
        'postgres_changes',
        {
          event: sub.event,
          schema: sub.schema || 'public',
          table: sub.table,
          ...(sub.filter ? { filter: sub.filter } : {}),
        },
        (payload) => {
          try {
            if (!payload || typeof payload !== 'object') {
              throw new Error('Invalid socket payload format: expected object');
            }
            
            // Reset pong timestamp on any message
            lastPongRef.current = Date.now();

            // If we were reconnecting, we're now connected
            if (retryCountRef.current > 0) {
              retryCountRef.current = 0;
              setConnected();
            }

            sub.handler(payload);
          } catch (err) {
            console.error('Error handling realtime socket payload:', err);
          }
        }
      );
    }

    channel.subscribe((status) => {
      if (!mountedRef.current) return;

      switch (status) {
        case 'SUBSCRIBED':
          retryCountRef.current = 0;
          setConnected();
          stopPollFallback();
          startHeartbeat();
          break;
        case 'CHANNEL_ERROR':
        case 'TIMED_OUT':
          scheduleReconnect();
          break;
        case 'CLOSED':
          // Only try to reconnect if we didn't intentionally close
          if (mountedRef.current && channelRef.current) {
            scheduleReconnect();
          }
          break;
        default:
          break;
      }
    });

    channelRef.current = channel;
  }, [
    channelName,
    subscriptions,
    enabled,
    setConnected,
    setReconnecting,
    setDisconnected,
    scheduleReconnect,
    startHeartbeat,
    stopHeartbeat,
    stopPollFallback,
    startPollFallback,
  ]);

  /**
   * Manual reconnect trigger (for the "Reconnect" button).
   */
  const manualReconnect = useCallback(() => {
    retryCountRef.current = 0;
    stopPollFallback();
    subscribe();
  }, [subscribe, stopPollFallback]);

  useEffect(() => {
    mountedRef.current = true;

    if (enabled && subscriptions.length > 0) {
      subscribe();
    }

    return () => {
      mountedRef.current = false;

      if (backoffTimerRef.current) {
        clearTimeout(backoffTimerRef.current);
        backoffTimerRef.current = null;
      }

      stopHeartbeat();
      stopPollFallback();

      if (channelRef.current) {
        try {
          supabase.removeChannel(channelRef.current);
        } catch {
          // Ignore cleanup errors
        }
        channelRef.current = null;
      }

      useConnectionStore.getState().reset();
    };
  }, [enabled, subscribe, stopHeartbeat, stopPollFallback]);

  return { manualReconnect, retryCount: retryCountRef.current };
};

export default useSupabaseRealtime;
