/**
 * Global configuration for the AI Helpdesk frontend.
 * All values are derived from environment variables at build time.
 */

const getBackendUrl = (): string => {
    const envUrl = import.meta.env.VITE_BACKEND_URL as string | undefined;
    if (envUrl) return envUrl.trim().replace(/\/$/, '');

    if (
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1'
    ) {
        return 'http://localhost:8000';
    }

    return 'https://ritesh19180-ai-helpdesk-api.hf.space';
};

export const API_CONFIG = {
    BACKEND_URL: getBackendUrl(),
    FRONTEND_URL: window.location.origin,
    IS_PROD: import.meta.env.PROD,
    /**
     * Set VITE_USE_MOCK_API=true in .env to enable local mock mode.
     * Defaults to false — production always uses real persistence.
     */
    USE_MOCK: import.meta.env.VITE_USE_MOCK_API === 'true',
};
