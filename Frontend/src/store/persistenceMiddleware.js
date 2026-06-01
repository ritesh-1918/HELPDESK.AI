/**
 * Standardized Zustand persistence middleware
 * Handles quota errors, read-write failures, and provides clean error handling.
 */

import { persist } from 'zustand/middleware';

/**
 * Custom storage wrapper with error handling
 */
const createSafeStorage = (storageType = 'localStorage') => {
    const storage = storageType === 'sessionStorage' ? sessionStorage : localStorage;

    return {
        getItem: (name) => {
            try {
                const value = storage.getItem(name);
                if (value === null) return null;
                return JSON.parse(value);
            } catch (error) {
                console.warn(`[Zustand] Failed to read ${name} from ${storageType}:`, error);
                // Clean up corrupted data
                try {
                    storage.removeItem(name);
                } catch (e) {
                    // Ignore cleanup errors
                }
                return null;
            }
        },

        setItem: (name, value) => {
            try {
                const serialized = JSON.stringify(value);
                storage.setItem(name, serialized);
            } catch (error) {
                if (error.name === 'QuotaExceededError') {
                    console.error(`[Zustand] Storage quota exceeded for ${name}. Attempting cleanup...`);
                    // Try to free up space by removing old data
                    try {
                        const keys = Object.keys(storage);
                        const storeKeys = keys.filter(k => k.startsWith('helpdesk-'));
                        // Remove oldest entries (first 25%)
                        const removeCount = Math.ceil(storeKeys.length * 0.25);
                        for (let i = 0; i < removeCount; i++) {
                            storage.removeItem(storeKeys[i]);
                        }
                        // Retry the save
                        storage.setItem(name, serialized);
                    } catch (retryError) {
                        console.error(`[Zustand] Failed to save ${name} even after cleanup:`, retryError);
                    }
                } else {
                    console.error(`[Zustand] Failed to save ${name}:`, error);
                }
            }
        },

        removeItem: (name) => {
            try {
                storage.removeItem(name);
            } catch (error) {
                console.warn(`[Zustand] Failed to remove ${name}:`, error);
            }
        },
    };
};

/**
 * Create a persisted store with standardized error handling
 * @param {string} name - Store name for persistence key
 * @param {Function} stateCreator - Zustand state creator function
 * @param {Object} options - Additional options
 * @param {string} options.storage - 'localStorage' or 'sessionStorage'
 * @param {Array} options.partialize - Array of state keys to persist
 * @returns {Function} - Zustand store hook
 */
export const createPersistedStore = (name, stateCreator, options = {}) => {
    const {
        storage = 'localStorage',
        partialize = null,
        version = 1,
        migrate = null,
    } = options;

    const persistOptions = {
        name: `helpdesk-${name}`,
        version,
        storage: createSafeStorage(storage),
    };

    if (partialize) {
        persistOptions.partialize = (state) => {
            const persisted = {};
            for (const key of partialize) {
                if (key in state) {
                    persisted[key] = state[key];
                }
            }
            return persisted;
        };
    }

    if (migrate) {
        persistOptions.migrate = migrate;
    }

    return persist(stateCreator, persistOptions);
};

/**
 * Utility to clear all Helpdesk stores from storage
 */
export const clearAllStores = () => {
    try {
        const keys = Object.keys(localStorage);
        const storeKeys = keys.filter(k => k.startsWith('helpdesk-'));
        storeKeys.forEach(key => localStorage.removeItem(key));
        console.log(`[Zustand] Cleared ${storeKeys.length} store entries`);
    } catch (error) {
        console.error('[Zustand] Failed to clear stores:', error);
    }
};

/**
 * Utility to get storage usage info
 */
export const getStorageInfo = () => {
    try {
        const keys = Object.keys(localStorage);
        const storeKeys = keys.filter(k => k.startsWith('helpdesk-'));
        let totalSize = 0;

        storeKeys.forEach(key => {
            const value = localStorage.getItem(key);
            totalSize += value ? value.length : 0;
        });

        return {
            storeCount: storeKeys.length,
            totalSize,
            totalSizeKB: Math.round(totalSize / 1024 * 100) / 100,
            keys: storeKeys,
        };
    } catch (error) {
        console.error('[Zustand] Failed to get storage info:', error);
        return { storeCount: 0, totalSize: 0, totalSizeKB: 0, keys: [] };
    }
};
