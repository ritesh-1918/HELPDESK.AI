/**
 * Backend auth bridge — issue #130.
 *
 * Mirrors Supabase auth actions to the FastAPI gateway so the backend can
 * issue HttpOnly Secure SameSite=Strict cookies for the Supabase JWTs and
 * provide cookie/header-aware session verification for the mobile app.
 *
 * On React Native, `fetch` uses the platform's native cookie store
 * (Set-Cookie headers are honored automatically), so simply including
 * `credentials: 'include'` keeps subsequent backend calls authenticated
 * without any JS-readable token storage.
 */

import { supabase } from './supabase';

export const BACKEND_URL = 'https://ritesh19180-ai-helpdesk-api.hf.space';

const safeFetch = async (path, init = {}) => {
  try {
    return await fetch(`${BACKEND_URL}${path}`, {
      credentials: 'include',
      ...init,
      headers: { 'Content-Type': 'application/json', ...(init.headers || {}) },
    });
  } catch (e) {
    console.warn(`[authBackend] ${path} failed:`, e?.message || e);
    return null;
  }
};

export const backendLogin = (email, password) =>
  safeFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });

export const backendLogout = () => safeFetch('/auth/logout', { method: 'POST' });

/**
 * Returns the Authorization header backed by the current Supabase session,
 * so backend endpoints that read either the HttpOnly cookie or the
 * Authorization header (see backend.auth_cookie.get_current_user) stay
 * usable from mobile without exposing the JWT to JS storage longer than
 * needed.
 */
export const getAuthHeaders = async () => {
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
};
