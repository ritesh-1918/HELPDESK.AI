/**
 * Axios instance with automatic Supabase auth token injection.
 *
 * - Attaches the current Supabase access token to every request.
 * - Handles 401 responses with automatic token refresh.
 * - Dispatches a custom event on session expiry so the app can react.
 *
 * Usage:
 *   import apiClient from './apiClient';
 *   const res = await apiClient.get('/ai/analyze_ticket');
 */

import axios from 'axios';
import { supabase } from '../lib/supabaseClient';
import { API_CONFIG } from '../config';

const apiClient = axios.create({
  baseURL: API_CONFIG.BACKEND_URL,
  timeout: 30000,
});

// ---------------------------------------------------------------------------
// Request interceptor — attach Supabase access token
// ---------------------------------------------------------------------------
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
      }
    } catch (err) {
      // Non-fatal: proceed without token; backend will return 401
      console.warn('[apiClient] Failed to get session for auth header:', err);
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ---------------------------------------------------------------------------
// Response interceptor — handle 401 with refresh + session expiry
// ---------------------------------------------------------------------------
let isRefreshing = false;
let refreshSubscribers = [];

function subscribeTokenRefresh(cb) {
  refreshSubscribers.push(cb);
}

function onRefreshed(newToken) {
  refreshSubscribers.forEach((cb) => cb(newToken));
  refreshSubscribers = [];
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and we haven't already retried this request
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        // Queue this request until the refresh completes
        return new Promise((resolve) => {
          subscribeTokenRefresh((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(apiClient(originalRequest));
          });
        });
      }

      isRefreshing = true;

      try {
        const { data: { session }, error: refreshError } =
          await supabase.auth.refreshSession();

        if (refreshError || !session) {
          throw refreshError || new Error('Session refresh returned no session');
        }

        isRefreshing = false;
        onRefreshed(session.access_token);

        originalRequest.headers.Authorization = `Bearer ${session.access_token}`;
        return apiClient(originalRequest);
      } catch (refreshErr) {
        isRefreshing = false;
        refreshSubscribers = [];

        // Dispatch event so the app can redirect to login, show toast, etc.
        window.dispatchEvent(new CustomEvent('auth:session-expired', {
          detail: { reason: refreshErr.message },
        }));

        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
