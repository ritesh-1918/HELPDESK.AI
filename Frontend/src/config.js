/**
 * Global Configuration for the AI Helpdesk
 */

const getBackendUrl = () => {
    const envUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL;
    if (envUrl) return envUrl.trim().replace(/\/$/, '');

    // Dynamically deduce backend URL if running locally or on custom domain
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:8000';
    }
    // Default to the live Hugging Face Space for stability in production deployment
    return 'https://ritesh19180-ai-helpdesk-api.hf.space';
};

export const API_CONFIG = {
    BACKEND_URL: getBackendUrl(),
    FRONTEND_URL: window.location.origin,
    IS_PROD: import.meta.env.PROD,
    USE_MOCK: import.meta.env.VITE_USE_MOCK !== 'false'  // default true
};
