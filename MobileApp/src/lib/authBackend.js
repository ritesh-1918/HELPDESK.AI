/**
 * Backend auth bridge — mirrors Supabase auth to HttpOnly cookies (issue #130).
 */

import { supabase } from './supabase';

export const BACKEND_URL =
  process.env.EXPO_PUBLIC_BACKEND_URL || 'https://ritesh19180-ai-helpdesk-api.hf.space';

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
  safeFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

export const backendLogout = () => safeFetch('/auth/logout', { method: 'POST' });

/** Bearer fallback when native cookie jar is unavailable. */
export const getAuthHeaders = async () => {
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
};
