/**
 * Centralized Zustand Persistence Configuration
 * 
 * Single source of truth for all localStorage keys and persistence options.
 * All stores should import from here instead of configuring persist() inline.
 */
const PERSISTENCE_KEYS = {
    auth: 'auth-storage',
    admin: 'admin-storage',
    'admin-settings': 'admin-storage-settings',
    ticket: 'ticket-storage',
    toast: 'toast-storage',
};

/**
 * Creates a standardized persist config for zustand stores.
 * Handles quota errors, migration, and key collisions in one place.
 * 
 * @param {string} storeName - Key from PERSISTENCE_KEYS map
 * @param {object} [overrides] - Optional overrides for specific stores
 * @returns {object} Persist config object for zustand's persist() middleware
 */
export function createPersistConfig(storeName, overrides = {}) {
    const storageKey = PERSISTENCE_KEYS[storeName];
    if (!storageKey) {
        console.warn(`[Persistence] Unknown store name "${storeName}", falling back to key directly.`);
    }

    return {
        name: storageKey || storeName,
        version: 1,
        // Graceful degradation: if localStorage is full or unavailable,
        // the store still works in-memory — the user just loses state on refresh.
        partialize: (state) => {
            // Only persist serializable data (exclude functions like actions)
            const serializable = {};
            for (const [key, value] of Object.entries(state)) {
                if (typeof value !== 'function') {
                    serializable[key] = value;
                }
            }
            return serializable;
        },
        merge: (persisted, current) => ({
            ...current,
            ...persisted,
        }),
        onRehydrateStorage: () => (state) => {
            if (state) {
                console.log(`[Persistence] Store "${storeName}" rehydrated successfully.`);
            }
        },
        ...overrides,
        // Always wrap storage with error handling
        storage: {
            getItem: (name) => {
                try {
                    const value = localStorage.getItem(name);
                    return value ? JSON.parse(value) : null;
                } catch (e) {
                    console.warn(`[Persistence] Failed to read "${name}":`, e.message);
                    return null;
                }
            },
            setItem: (name, value) => {
                try {
                    localStorage.setItem(name, JSON.stringify(value));
                } catch (e) {
                    if (e instanceof DOMException && e.name === 'QuotaExceededError') {
                        console.warn(`[Persistence] localStorage quota exceeded for "${name}". Clearing oldest entries.`);
                        // Fallback: clear non-critical keys to free space
                        const critical = Object.values(PERSISTENCE_KEYS);
                        for (let i = 0; i < localStorage.length; i++) {
                            const key = localStorage.key(i);
                            if (!critical.includes(key)) {
                                localStorage.removeItem(key);
                            }
                        }
                        // Retry once
                        try {
                            localStorage.setItem(name, JSON.stringify(value));
                        } catch (_) {
                            console.error('[Persistence] Still cannot write after cleanup.');
                        }
                    } else {
                        console.warn(`[Persistence] Failed to write "${name}":`, e.message);
                    }
                }
            },
            removeItem: (name) => {
                try {
                    localStorage.removeItem(name);
                } catch (e) {
                    console.warn(`[Persistence] Failed to remove "${name}":`, e.message);
                }
            },
        },
    };
}

/**
 * Clears all non-critical localStorage entries.
 * Useful for manual cleanup in admin panels or error recovery.
 */
export function clearNonCriticalStorage() {
    const critical = Object.values(PERSISTENCE_KEYS);
    for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (!critical.includes(key)) {
            localStorage.removeItem(key);
        }
    }
}

export default PERSISTENCE_KEYS;
