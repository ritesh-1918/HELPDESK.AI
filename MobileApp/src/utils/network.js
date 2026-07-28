/**
 * network.js
 *
 * Network connectivity listener.
 * Reconnects Supabase realtime channels and syncs the offline ticket
 * queue whenever the device comes back online.
 */
import NetInfo from '@react-native-community/netinfo';
import { syncOfflineQueue } from './offlineQueue';

/**
 * Start watching network state.
 * Call this once at app startup (e.g. in App.js).
 *
 * @param {object} supabaseClient - The Supabase client instance.
 * @returns {function} Unsubscribe function — call on unmount.
 */
export const watchNetworkConnection = (supabaseClient) => {
  const unsubscribe = NetInfo.addEventListener(async (state) => {
    if (state.isConnected && state.isInternetReachable !== false) {
      // Reconnect Supabase realtime channels
      supabaseClient.removeAllChannels();

      // Flush any tickets that were queued while offline
      try {
        const { synced, failed } = await syncOfflineQueue(supabaseClient);
        if (synced > 0) {
          console.log(`[OfflineQueue] Synced ${synced} ticket(s) on reconnect. ${failed} remaining.`);
        }
      } catch (err) {
        console.warn('[OfflineQueue] Sync error on reconnect:', err);
      }
    }
  });

  return unsubscribe;
};
