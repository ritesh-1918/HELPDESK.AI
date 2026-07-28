import { useEffect, useRef } from 'react';
import useAuthStore from '../store/authStore';

const CHANNEL_NAME = 'helpdesk_auth_sync';

export const TAB_SYNC_EVENTS = {
  LOGGED_IN: 'LOGGED_IN',
  LOGGED_OUT: 'LOGGED_OUT',
  PROFILE_UPDATED: 'PROFILE_UPDATED',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
};

// Singleton channel instance shared across hook calls
let _channel = null;

const getChannel = () => {
  if (!_channel && typeof BroadcastChannel !== 'undefined') {
    _channel = new BroadcastChannel(CHANNEL_NAME);
  }
  return _channel;
};

/**
 * Broadcast an event to all other tabs.
 * Safe to call even if BroadcastChannel is unsupported.
 */
export const broadcastAuthEvent = (type, payload = {}) => {
  const channel = getChannel();
  if (!channel) return;
  try {
    channel.postMessage({ type, payload, timestamp: Date.now() });
  } catch (e) {
    console.warn('[useTabSync] Failed to broadcast:', e);
  }
};

/**
 * useTabSync — React hook that listens for cross-tab auth events
 * and updates the local Zustand auth store accordingly.
 *
 * Mount this once at the app root (e.g. App.jsx).
 */
const useTabSync = () => {
  const channelRef = useRef(null);

  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') {
      console.warn('[useTabSync] BroadcastChannel not supported in this browser.');
      return;
    }

    const channel = getChannel();
    channelRef.current = channel;

    const handleMessage = (event) => {
      const { type, payload } = event.data || {};
      const { user, profile } = useAuthStore.getState();

      switch (type) {
        case TAB_SYNC_EVENTS.LOGGED_IN:
          // Another tab logged in — sync user and profile
          if (payload?.user) {
            useAuthStore.setState({
              user: payload.user,
              profile: payload.profile || profile,
              isCheckingSession: false,
              loading: false,
            });
          }
          break;

        case TAB_SYNC_EVENTS.LOGGED_OUT:
          // Another tab logged out — clear state in this tab
          useAuthStore.setState({
            user: null,
            profile: null,
            loading: false,
            isCheckingSession: false,
          });
          break;

        case TAB_SYNC_EVENTS.PROFILE_UPDATED:
          // Another tab updated the profile — sync it here
          if (payload?.profile && user?.id === payload?.userId) {
            useAuthStore.setState({ profile: payload.profile });
          }
          break;

        case TAB_SYNC_EVENTS.SESSION_EXPIRED:
          // Session expired in another tab — clear state
          useAuthStore.setState({
            user: null,
            profile: null,
            loading: false,
            isCheckingSession: false,
          });
          break;

        default:
          break;
      }
    };

    channel.addEventListener('message', handleMessage);

    return () => {
      channel.removeEventListener('message', handleMessage);
    };
  }, []);
};

export default useTabSync;