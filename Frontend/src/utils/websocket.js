/**
 * WebSocket URL helpers for the live support channels.
 */

/**
 * Converts an http(s) backend base URL into a ws(s) origin and appends `path`.
 * Returns null when the base URL is missing or malformed so callers can
 * degrade gracefully (e.g. keep using Supabase realtime).
 */
export const buildWebSocketUrl = (baseUrl, path) => {
    const normalized = String(baseUrl || '').trim().replace(/\/+$/, '');
    if (!normalized) return null;
    let url;
    try {
        url = new URL(normalized);
    } catch {
        return null;
    }
    url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
    const origin = url.toString().replace(/\/+$/, '');
    return `${origin}${String(path || '').startsWith('/') ? '' : '/'}${path || ''}`;
};
