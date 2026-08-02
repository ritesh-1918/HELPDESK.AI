import { supabase } from '../lib/supabaseClient';
import { API_CONFIG } from '../config';

export const REFRESH_MARGIN_MS = 60 * 1000; // refresh 60s before expiry
export const MIN_REFRESH_DELAY_MS = 15 * 1000;
export const MAX_REFRESH_DELAY_MS = 60 * 60 * 1000;

/**
 * Decodes the `exp` claim of a JWT (in ms since epoch), or null when the
 * token is missing/malformed.
 */
export const decodeJwtExpiry = (token) => {
    if (!token) return null;
    const payload = token.split('.')[1];
    if (!payload) return null;
    try {
        const json = JSON.parse(
            atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
        );
        return typeof json.exp === 'number' ? json.exp * 1000 : null;
    } catch {
        return null;
    }
};

/**
 * Tries to rotate the server-issued HttpOnly session cookies. The refresh
 * cookie is sent automatically by the browser (`credentials: 'include'`); the
 * response re-issues the access/refresh cookies. Fails quietly when the
 * backend does not expose the endpoint yet (e.g. HTTP 404/405).
 */
export const refreshHttpOnlyCookies = async () => {
    const url = `${API_CONFIG.BACKEND_URL}/auth/refresh`;
    const res = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
        cache: 'no-store',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res;
};

/**
 * Silent session refresh:
 *  1. Tries the backend HttpOnly-cookie rotation (best effort).
 *  2. Falls back to the Supabase refresh token rotation so the local session
 *     stays fresh even when the cookie endpoint is unavailable.
 * Throws only when the Supabase refresh itself fails (session truly expired).
 */
export const refreshSessionSilently = async () => {
    try {
        await refreshHttpOnlyCookies();
    } catch {
        // Cookie endpoint missing/unreachable — fall through to Supabase.
    }

    const { data, error } = await supabase.auth.refreshSession();
    if (error) throw error;
    return Boolean(data?.session);
};
