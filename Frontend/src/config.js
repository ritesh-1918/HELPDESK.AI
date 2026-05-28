/**
 * Global Configuration for the AI Helpdesk
 *
 * Environment variables (in order of precedence):
 *   VITE_API_URL       — Primary backend URL (used by .env.local)
 *   VITE_BACKEND_URL   — Legacy backend URL (still supported for backward compat)
 *
 * See .env.example for the full list of expected variables.
 */

const getBackendUrl = () => {
    // Accept both variable names; prefer VITE_API_URL
    const envUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL;
    if (envUrl) return envUrl.trim().replace(/\/$/, '');

    // Default fallback — override via env var
    return 'https://ritesh19180-ai-helpdesk-api.hf.space';
};

export const API_CONFIG = {
    BACKEND_URL: getBackendUrl(),
    FRONTEND_URL: window.location.origin,
    IS_PROD: import.meta.env.PROD,
    USE_MOCK: import.meta.env.VITE_USE_MOCK !== 'false'  // default true
};
