import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import {
    decodeJwtExpiry, refreshSessionSilently,
    REFRESH_MARGIN_MS, MIN_REFRESH_DELAY_MS, MAX_REFRESH_DELAY_MS,
} from '../utils/sessionRefresh';

/**
 * useSilentSessionRefresh — keeps the JWT fresh without user interaction.
 *
 * Decodes the current access token's `exp`, schedules a silent refresh just
 * before it expires, and re-arms the timer after every successful rotation.
 * Also refreshes immediately when the tab becomes visible again or the browser
 * regains connectivity, so stale tokens never leak into API calls.
 *
 * @param {object}   options
 * @param {boolean}  options.enabled   Active only while a user is signed in.
 * @param {function} options.onRefresh Called after every successful rotation.
 * @param {function} options.onError   Called when the Supabase refresh fails.
 */
export default function useSilentSessionRefresh({
    enabled = true,
    onRefresh,
    onError,
} = {}) {
    const [lastRefreshedAt, setLastRefreshedAt] = useState(null);
    const [nextRefreshAt, setNextRefreshAt] = useState(null);
    const timerRef = useRef(null);
    const runningRef = useRef(false);
    const onRefreshRef = useRef(onRefresh);
    const onErrorRef = useRef(onError);
    onRefreshRef.current = onRefresh;
    onErrorRef.current = onError;

    const computeDelay = useCallback(async () => {
        const { data } = await supabase.auth.getSession();
        const exp = decodeJwtExpiry(data?.session?.access_token);
        if (exp === null) {
            return { delay: MIN_REFRESH_DELAY_MS, due: Date.now() + MIN_REFRESH_DELAY_MS };
        }
        const delay = Math.max(
            MIN_REFRESH_DELAY_MS,
            Math.min(exp - Date.now() - REFRESH_MARGIN_MS, MAX_REFRESH_DELAY_MS)
        );
        return { delay, due: Date.now() + delay };
    }, []);

    const refresh = useCallback(async () => {
        if (runningRef.current) return;
        runningRef.current = true;
        try {
            await refreshSessionSilently();
            const stamp = new Date().toISOString();
            setLastRefreshedAt(stamp);
            onRefreshRef.current?.(stamp);
        } catch (err) {
            onErrorRef.current?.(err);
        } finally {
            runningRef.current = false;
            const { delay, due } = await computeDelay();
            setNextRefreshAt(new Date(due).toISOString());
            if (timerRef.current) clearTimeout(timerRef.current);
            timerRef.current = setTimeout(refresh, delay);
        }
    }, [computeDelay]);

    useEffect(() => {
        if (!enabled) return undefined;

        let mounted = true;
        const schedule = (delay) => {
            if (!mounted) return;
            if (timerRef.current) clearTimeout(timerRef.current);
            timerRef.current = setTimeout(refresh, delay);
        };

        const onVisibility = () => {
            if (document.visibilityState === 'visible') refresh();
        };

        const onOnline = () => refresh();

        (async () => {
            const { delay, due } = await computeDelay();
            if (!mounted) return;
            setNextRefreshAt(new Date(due).toISOString());
            schedule(delay);
        })();

        document.addEventListener('visibilitychange', onVisibility);
        window.addEventListener('online', onOnline);

        return () => {
            mounted = false;
            if (timerRef.current) clearTimeout(timerRef.current);
            timerRef.current = null;
            document.removeEventListener('visibilitychange', onVisibility);
            window.removeEventListener('online', onOnline);
        };
    }, [enabled, computeDelay, refresh]);

    return { lastRefreshedAt, nextRefreshAt };
}
