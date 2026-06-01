/**
 * safePersist — Zustand middleware that wraps the standard `persist` middleware
 * with robust localStorage quota/read/write error handling.
 *
 * Drop-in replacement for `persist` in any store:
 *
 *   import { safePersist } from '../middleware/safePersist';
 *   const useMyStore = create(safePersist((set) => ({ ... }), { name: 'my-store' }));
 *
 * On quota errors the write is silently skipped (data stays in memory).
 * On read errors the store initialises with its default state.
 * All errors are logged to console.warn so they are visible in DevTools.
 */

import { persist, createJSONStorage } from 'zustand/middleware';

// ---------------------------------------------------------------------------
// Safe localStorage adapter
// ---------------------------------------------------------------------------

function makeSafeStorage() {
  return {
    getItem(name) {
      try {
        return localStorage.getItem(name);
      } catch (err) {
        console.warn(`[safePersist] Failed to read '${name}' from localStorage:`, err);
        return null;
      }
    },
    setItem(name, value) {
      try {
        localStorage.setItem(name, value);
      } catch (err) {
        if (err instanceof DOMException && (
          err.code === 22 ||                          // QUOTA_EXCEEDED_ERR
          err.code === 1014 ||                        // NS_ERROR_DOM_QUOTA_REACHED (Firefox)
          err.name === 'QuotaExceededError' ||
          err.name === 'NS_ERROR_DOM_QUOTA_REACHED'
        )) {
          console.warn(
            `[safePersist] localStorage quota exceeded for '${name}'. ` +
            'State will not be persisted this write. Consider clearing stale entries.'
          );
        } else {
          console.warn(`[safePersist] Failed to write '${name}' to localStorage:`, err);
        }
      }
    },
    removeItem(name) {
      try {
        localStorage.removeItem(name);
      } catch (err) {
        console.warn(`[safePersist] Failed to remove '${name}' from localStorage:`, err);
      }
    },
  };
}

// ---------------------------------------------------------------------------
// Exported middleware factory
// ---------------------------------------------------------------------------

/**
 * @param {Function} storeInitializer - the Zustand store creator function
 * @param {import('zustand/middleware').PersistOptions} options - standard persist options
 */
export function safePersist(storeInitializer, options) {
  return persist(storeInitializer, {
    ...options,
    storage: createJSONStorage(makeSafeStorage),
    onRehydrateStorage: (state) => {
      return (hydratedState, error) => {
        if (error) {
          console.warn(
            `[safePersist] Rehydration failed for store '${options.name}':`,
            error
          );
        }
        if (options.onRehydrateStorage) {
          options.onRehydrateStorage(state)?.(hydratedState, error);
        }
      };
    },
  });
}

export default safePersist;
