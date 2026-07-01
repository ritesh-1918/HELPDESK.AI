import { create } from 'zustand';

/**
 * Tracks WebSocket/Supabase realtime connection status for the app.
 * Used by the global ConnectionStatusIndicator component and
 * by useWebSocket to broadcast status changes.
 */
const useConnectionStore = create((set) => ({
  /** 'connected' | 'reconnecting' | 'disconnected' */
  status: 'connected',
  /** Human-readable detail message */
  message: '',
  /** Number of consecutive reconnect attempts since last successful connection */
  retryCount: 0,

  setConnected: (message = '') =>
    set({ status: 'connected', message, retryCount: 0 }),

  setReconnecting: (retryCount, message = 'Reconnecting…') =>
    set({ status: 'reconnecting', retryCount, message }),

  setDisconnected: (message = 'Disconnected — updates may be delayed') =>
    set({ status: 'disconnected', message }),

  reset: () =>
    set({ status: 'connected', message: '', retryCount: 0 }),
}));

export default useConnectionStore;
