/**
 * Global Configuration for the AI Helpdesk
 */

const getBackendUrl = () => {
    const envUrl = import.meta.env.VITE_BACKEND_URL;
    if (envUrl) return envUrl.trim().replace(/\/$/, '');

    // Default to the live Hugging Face Space for stability
    return 'https://ritesh19180-ai-helpdesk-api.hf.space';
};

export const API_CONFIG = {
    BACKEND_URL: getBackendUrl(),
    FRONTEND_URL: window.location.origin,
    IS_PROD: import.meta.env.PROD
};
