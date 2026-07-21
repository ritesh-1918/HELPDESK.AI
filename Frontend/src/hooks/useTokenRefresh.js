/**
 * useTokenRefresh — Silent JWT refresh loop hook (#3896)
 *
 * Proactively refreshes the backend HttpOnly session cookies (~2 minutes
 * before the access_token expires) to prevent mid-session 401 Unauthorized
 * errors on authenticated API calls.
 *
 * Flow:
 *   1. On mount (and whenever `user` changes), reads the Supabase session
 *      `expires_at` timestamp.
 *   2. Calculates the delay: (expires_at - now - REFRESH_BUFFER_MS).
 *   3. Schedules a `setTimeout` for that delay.
 *   4. On fire, calls `POST /auth/refresh` — the backend reads the HttpOnly
 *      `refresh_token` cookie and rotates both cookies, returning the new
 *      `expires_at` for the next cycle.
 *   5. Reschedules itself with the new expiry to keep the loop alive.
 *   6. On a 401 from the refresh endpoint (refresh token itself expired),
 *      logs the user out cleanly.
 */

import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { API_CONFIG } from '../config';
import useAuthStore from '../store/authStore';

/** Trigger refresh this many ms before the token actually expires (2 minutes). */
const REFRESH_BUFFER_MS = 2 * 60 * 1000;

/** Minimum delay to avoid a tight spin loop on malformed expiry values. */
const MIN_DELAY_MS = 5_000;

export default function useTokenRefresh() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const setSessionExpiresAt = useAuthStore((s) => s.setSessionExpiresAt);
  const timerRef = useRef(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  /**
   * Perform the actual silent refresh against the FastAPI backend.
   * Returns the new `expires_at` Unix timestamp (seconds), or null on failure.
   */
  const doRefresh = useCallback(async () => {
    try {
      const res = await fetch(`${API_CONFIG.BACKEND_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include', // sends HttpOnly cookies automatically
      });

      if (res.status === 401) {
        // Refresh token itself has expired — force logout
        console.warn('[useTokenRefresh] Refresh token expired, logging out.');
        await logout();
        return null;
      }

      if (!res.ok) {
        console.error('[useTokenRefresh] Refresh request failed:', res.status);
        return null;
      }

      const data = await res.json();
      if (data?.expires_at) {
        setSessionExpiresAt(data.expires_at);
      }
      return data?.expires_at ?? null;
    } catch (err) {
      console.error('[useTokenRefresh] Network error during refresh:', err);
      return null;
    }
  }, [logout, setSessionExpiresAt]);

  const scheduleNextRef = useRef(null);

  scheduleNextRef.current = (expiresAtSeconds) => {
    clearTimer();
    if (!expiresAtSeconds) return;

    const nowMs = Date.now();
    const expiresAtMs = expiresAtSeconds * 1000;
    const delay = Math.max(expiresAtMs - nowMs - REFRESH_BUFFER_MS, MIN_DELAY_MS);

    console.log(`[useTokenRefresh] Next silent refresh in ${Math.round(delay / 1000)}s`);

    timerRef.current = setTimeout(async () => {
      const newExpiresAt = await doRefresh();
      if (newExpiresAt && scheduleNextRef.current) {
        scheduleNextRef.current(newExpiresAt);
      }
    }, delay);
  };

  useEffect(() => {
    if (!user) {
      clearTimer();
      return;
    }

    // Bootstrap: read the current session expiry from Supabase client state
    supabase.auth.getSession().then(({ data }) => {
      const expiresAt = data?.session?.expires_at;
      if (expiresAt && scheduleNextRef.current) {
        setSessionExpiresAt(expiresAt);
        scheduleNextRef.current(expiresAt);
      }
    });

    return () => clearTimer();
  }, [user, clearTimer, setSessionExpiresAt]);
}
