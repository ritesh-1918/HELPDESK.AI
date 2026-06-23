// initializers.js - Optimized to prevent redundant API calls during rehydration

let initialized = false;
let initializing = false;
let pendingPromise = null;

/**
 * Initializes the app with necessary data from the server.
 * Uses a singleton pattern to ensure only one fetch call is made.
 * @returns {Promise<void>}
 */
export async function initializeApp() {
    if (initialized) {
        return Promise.resolve();
    }

    if (initializing) {
        return pendingPromise;
    }

    initializing = true;
    pendingPromise = (async () => {
        try {
            const response = await fetch('/api/init', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Initialization failed with status ${response.status}`);
            }

            const data = await response.json();
            // Process and store initialization data
            window.__INITIAL_DATA__ = data;
            initialized = true;
        } catch (error) {
            console.error('App initialization error:', error);
            throw error;
        } finally {
            initializing = false;
            pendingPromise = null;
        }
    })();

    return pendingPromise;
}

/**
 * Resets the initialization state (useful for testing or forced re-init).
 */
export function resetInitialization() {
    initialized = false;
    initializing = false;
    pendingPromise = null;
}

/**
 * Checks if the app has been initialized.
 * @returns {boolean}
 */
export function isInitialized() {
    return initialized;
}
