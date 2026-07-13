/**
 * offlineQueue.js
 *
 * Caches ticket creation payloads in AsyncStorage when the device is offline,
 * then automatically syncs them to Supabase when connectivity is restored.
 *
 * Usage:
 *   import { enqueueTicket, syncOfflineQueue } from '../utils/offlineQueue';
 *
 *   // When creating a ticket (call regardless of connectivity):
 *   await enqueueTicket(supabase, payload);
 *
 *   // In network.js listener, call when connection is restored:
 *   await syncOfflineQueue(supabase);
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

const QUEUE_KEY = 'helpdesk_offline_ticket_queue';

/**
 * Load the current queue from AsyncStorage.
 * @returns {Promise<Array>}
 */
async function loadQueue() {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Persist the queue to AsyncStorage.
 * @param {Array} queue
 */
async function saveQueue(queue) {
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

/**
 * Attempt to submit a single ticket payload to Supabase.
 * @param {object} supabaseClient
 * @param {object} payload - The ticket row to insert.
 * @returns {Promise<boolean>} true on success, false on failure.
 */
async function submitTicket(supabaseClient, payload) {
  try {
    const { error } = await supabaseClient.from('tickets').insert(payload);
    return !error;
  } catch {
    return false;
  }
}

/**
 * Enqueue a ticket payload.
 *
 * If the device is online, attempts immediate submission.
 * On failure or when offline, saves the payload to the local queue.
 *
 * @param {object} supabaseClient - Supabase client instance.
 * @param {object} payload        - Ticket data to create.
 * @returns {Promise<{ queued: boolean, submitted: boolean }>}
 */
export async function enqueueTicket(supabaseClient, payload) {
  const netState = await NetInfo.fetch();
  const isOnline = netState.isConnected && netState.isInternetReachable !== false;

  if (isOnline) {
    const ok = await submitTicket(supabaseClient, payload);
    if (ok) return { queued: false, submitted: true };
  }

  // Offline or submission failed — queue locally with metadata
  const queue = await loadQueue();
  queue.push({
    id: `offline_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    payload,
    queuedAt: new Date().toISOString(),
    retries: 0,
  });
  await saveQueue(queue);
  return { queued: true, submitted: false };
}

/**
 * Sync all queued offline tickets to Supabase.
 * Should be called whenever connectivity is restored.
 *
 * Successfully submitted items are removed from the queue.
 * Failed items remain and will be retried next time.
 *
 * @param {object} supabaseClient - Supabase client instance.
 * @returns {Promise<{ synced: number, failed: number }>}
 */
export async function syncOfflineQueue(supabaseClient) {
  const queue = await loadQueue();
  if (queue.length === 0) return { synced: 0, failed: 0 };

  let synced = 0;
  const remaining = [];

  for (const item of queue) {
    const ok = await submitTicket(supabaseClient, item.payload);
    if (ok) {
      synced++;
    } else {
      remaining.push({ ...item, retries: (item.retries || 0) + 1 });
    }
  }

  await saveQueue(remaining);
  return { synced, failed: remaining.length };
}

/**
 * Return the number of tickets currently waiting in the offline queue.
 * Useful for showing a badge/banner to the user.
 *
 * @returns {Promise<number>}
 */
export async function getQueueCount() {
  const queue = await loadQueue();
  return queue.length;
}

/**
 * Clear the entire offline queue (e.g. on logout).
 */
export async function clearOfflineQueue() {
  await AsyncStorage.removeItem(QUEUE_KEY);
}
