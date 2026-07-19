/**
 * WebSocket Context Provider
 * 
 * Manages WebSocket connections for real-time ticket updates and live chat.
 * Provides hooks for subscribing to ticket updates and sending/receiving messages.
 */

import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';

const WebSocketContext = createContext(null);

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

export const WebSocketProvider = ({ children, token, enabled = true }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const listeners = useRef(new Map());

  const getWebSocketUrl = () => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = process.env.REACT_APP_API_URL 
      ? process.env.REACT_APP_API_URL.replace(/^https?:\/\//, '')
      : window.location.host;
    return `${protocol}//${host}/ws/tickets?token=${encodeURIComponent(token)}`;
  };

  const connect = useCallback(() => {
    if (!enabled || !token || wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const wsUrl = getWebSocketUrl();
      console.log('[WebSocket] Connecting to:', wsUrl);
      
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('[WebSocket] Connected');
        setIsConnected(true);
        setConnectionError(null);
        reconnectAttempts.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('[WebSocket] Message received:', message.type);
          
          // Notify all listeners
          listeners.current.forEach((callback) => {
            try {
              callback(message);
            } catch (err) {
              console.error('[WebSocket] Listener error:', err);
            }
          });
        } catch (err) {
          console.error('[WebSocket] Parse error:', err);
        }
      };

      ws.onerror = (error) => {
        console.error('[WebSocket] Error:', error);
        setConnectionError('Connection error occurred');
      };

      ws.onclose = (event) => {
        console.log('[WebSocket] Disconnected:', event.code, event.reason);
        setIsConnected(false);
        wsRef.current = null;

        // Attempt reconnection with exponential backoff
        if (enabled && reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          console.log(`[WebSocket] Reconnecting in ${delay}ms (attempt ${reconnectAttempts.current + 1})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current += 1;
            connect();
          }, delay);
        } else if (reconnectAttempts.current >= maxReconnectAttempts) {
          setConnectionError('Max reconnection attempts reached');
        }
      };

      wsRef.current = ws;
    } catch (err) {
      console.error('[WebSocket] Connection error:', err);
      setConnectionError(err.message);
    }
  }, [enabled, token]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      console.log('[WebSocket] Disconnecting');
      wsRef.current.close();
      wsRef.current = null;
    }

    setIsConnected(false);
  }, []);

  const send = useCallback((message) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      return true;
    }
    console.warn('[WebSocket] Cannot send message - not connected');
    return false;
  }, []);

  const subscribeToTicket = useCallback((ticketId) => {
    return send({ action: 'subscribe', ticket_id: ticketId });
  }, [send]);

  const unsubscribeFromTicket = useCallback((ticketId) => {
    return send({ action: 'unsubscribe', ticket_id: ticketId });
  }, [send]);

  const addListener = useCallback((id, callback) => {
    listeners.current.set(id, callback);
    return () => listeners.current.delete(id);
  }, []);

  const ping = useCallback(() => {
    return send({ action: 'ping', timestamp: Date.now() });
  }, [send]);

  // Connect on mount, disconnect on unmount
  useEffect(() => {
    if (enabled && token) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [enabled, token, connect, disconnect]);

  // Ping server every 30 seconds to keep connection alive
  useEffect(() => {
    if (!isConnected) return;

    const pingInterval = setInterval(() => {
      ping();
    }, 30000);

    return () => clearInterval(pingInterval);
  }, [isConnected, ping]);

  const value = {
    isConnected,
    connectionError,
    send,
    subscribeToTicket,
    unsubscribeFromTicket,
    addListener,
    connect,
    disconnect,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

/**
 * Hook for subscribing to ticket updates
 */
export const useTicketUpdates = (ticketId, onUpdate) => {
  const { isConnected, subscribeToTicket, unsubscribeFromTicket, addListener } = useWebSocket();

  useEffect(() => {
    if (!isConnected || !ticketId) return;

    // Subscribe to ticket
    subscribeToTicket(ticketId);

    // Add listener for updates
    const removeListener = addListener(`ticket-${ticketId}`, (message) => {
      if (message.type === 'ticket_update' && message.ticket_id === ticketId) {
        onUpdate?.(message);
      }
    });

    // Cleanup
    return () => {
      unsubscribeFromTicket(ticketId);
      removeListener();
    };
  }, [isConnected, ticketId, onUpdate, subscribeToTicket, unsubscribeFromTicket, addListener]);
};

/**
 * Hook for connection status
 */
export const useConnectionStatus = () => {
  const { isConnected, connectionError } = useWebSocket();
  return { isConnected, connectionError };
};
