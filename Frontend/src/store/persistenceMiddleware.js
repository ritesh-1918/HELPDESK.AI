/**
 * Centralized Store Sync Middleware for Zustand.
 *
 * Provides:
 *  - A single safe localStorage adapter with error handling and
 *    QuotaExceededError recovery (used by all Zustand persist stores)
 *  - Cross-tab state synchronisation via the storage event
 *  - Consistent key-prefix namespacing (helpdesk-v2-*)
 *  - Utility helpers for full state clear and tab broadcast
 */

import { persist, createJSONStorage } from 'zustand/middleware';

export const STORAGE_PREFIX = 'helpdesk-v2-';

// ---------------------------------------------------------------------------
// Quota recovery
// ---------------------------------------------------------------------------

/**
 * Attempt to free localStorage space by evicting 25% of helpdesk-namespaced
 * keys (oldest first under the assumption keys were inserted in order).
 */
function recoverStorageQuota() {
  try {
    const keys = Object.keys(localStorage).filter((k) =>
      k.startsWith(STORAGE_PREFIX) || k.startsWith('helpdesk-')
    );
    const removeCount = Math.ceil(keys.length * 0.25);
    for (let i = 0; i < removeCount; i++) {
      localStorage.removeItem(keys[i]);
    }
    console.warn(`[Sync] Freed ${removeCount} storage keys to recover quota.`);
  } catch (err) {
    console.error('[Sync] Quota recovery failed:', err);
  }
}

// ---------------------------------------------------------------------------
// Safe localStorage adapter
// ---------------------------------------------------------------------------

/**
 * A localStorage proxy that:
 *  - Catches JSON parse errors on reads (returns null on failure)
 *  - Catches QuotaExceededError on writes, runs recovery, then retries once
 *  - Logs all failures for debugging without throwing
 */
const safeLocalStorage = {
  getItem(name) {
    try {
      const raw = localStorage.getItem(name);
      if (raw === null) return null;
      return JSON.parse(raw);
    } catch (err) {
      console.error(`[Sync] Read failed for key "${name}":`, err);
      return null;
    }
  },

  setItem(name, value) {
    const serialized = (() => {
      try {
        return JSON.stringify(value);
      } catch (err) {
        console.error(`[Sync] Serialization failed for key "${name}":`, err);
        return null;
      }
    })();

    if (serialized === null) return;

    try {
      localStorage.setItem(name, serialized);
    } catch (err) {
      if (err.name === 'QuotaExceededError') {
        console.warn(`[Sync] QuotaExceededError writing "${name}". Recovering…`);
        recoverStorageQuota();
        // Retry once after recovery
        try {
          localStorage.setItem(name, serialized);
        } catch (retryErr) {
          console.error(`[Sync] Write still failed after recovery for "${name}":`, retryErr);
        }
      } else {
        console.error(`[Sync] Write failed for key "${name}":`, err);
      }
    }
  },

  removeItem(name) {
    try {
      localStorage.removeItem(name);
    } catch (err) {
      console.error(`[Sync] Remove failed for key "${name}":`, err);
    }
  },
};

// ---------------------------------------------------------------------------
// Store factory
// ---------------------------------------------------------------------------

/**
 * Create a Zustand store with centralised localStorage persistence.
 *
 * All stores created via this factory:
 *  - Use the helpdesk-v2-{storeName} key
 *  - Share the same safe localStorage adapter
 *  - Log rehydration errors consistently
 *
 * @param {string}   storeName - Unique identifier (becomes the localStorage key suffix)
 * @param {Function} creator   - Zustand state/action creator (set, get) => {}
 * @param {object}   options
 * @param {Function} [options.partialize]   - Selector for state to persist
 * @param {number}   [options.version=1]    - Schema version for migration
 * @param {Function} [options.onRehydrate]  - Called with (state) after rehydration
 * @returns Zustand persist middleware config
 */
export function createPersistedStore(storeName, creator, options = {}) {
  const { partialize, version = 1, onRehydrate } = options;

  return persist(creator, {
    name: `${STORAGE_PREFIX}${storeName}`,
    storage: createJSONStorage(() => safeLocalStorage),
    version,
    partialize,
    onRehydrateStorage: () => (rehydratedState, error) => {
      if (error) {
        console.error(`[Sync] Rehydration error for store "${storeName}":`, error);
      } else if (onRehydrate && rehydratedState) {
        onRehydrate(rehydratedState);
      }
    },
  });
}

// ---------------------------------------------------------------------------
// Cross-tab utilities
// ---------------------------------------------------------------------------

/**
 * Broadcast a sync event so other tabs can rehydrate their stores.
 * Call this after significant state mutations (e.g. logout, admin actions).
 */
export function broadcastStoreSync() {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}sync-trigger`, String(Date.now()));
  } catch (err) {
    console.error('[Sync] broadcastStoreSync failed:', err);
  }
}

/**
 * Clear all helpdesk-namespaced localStorage keys and reload the page.
 * Used on logout or when a fatal state corruption is detected.
 */
export function clearGlobalState() {
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(STORAGE_PREFIX) || k.startsWith('helpdesk-'))
      .forEach((k) => localStorage.removeItem(k));
  } catch (err) {
    console.error('[Sync] clearGlobalState failed:', err);
  }
  window.location.reload();
}
