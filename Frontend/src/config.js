/**
 * Global Configuration for the AI Helpdesk
 */

const getBackendUrl = () => {
    const envUrl = import.meta.env.VITE_BACKEND_URL;
    if (envUrl) return envUrl.trim().replace(/\/$/, '');

    // Default fallback — override via VITE_BACKEND_URL env var
    return 'https://ritesh19180-ai-helpdesk-api.hf.space';
};

export const API_CONFIG = {
    BACKEND_URL: getBackendUrl(),
    FRONTEND_URL: window.location.origin,
    IS_PROD: import.meta.env.PROD,
    USE_MOCK: import.meta.env.VITE_USE_MOCK !== 'false'  // default true
};
