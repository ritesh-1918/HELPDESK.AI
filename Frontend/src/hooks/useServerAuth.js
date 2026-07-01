/**
 * useServerAuth — Always verifies role server-side; never trusts localStorage cache alone.
 *
 * Returns { verified: boolean, loading: boolean, role: string | null }
 *
 * Security model:
 *  1. Call supabase.auth.getUser() to get a fresh, cryptographically-verified user object.
 *  2. Fetch the profile row directly from the DB for that user ID.
 *  3. Compare the server role to the cached role in the Zustand store.
 *  4. If they differ (localStorage tampering), clear the store and return verified=false.
 */

import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import useAuthStore from '../store/authStore';

/**
 * @returns {{ verified: boolean, loading: boolean, role: string | null }}
 */
export function useServerAuth() {
    const [verified, setVerified] = useState(false);
    const [loading, setLoading] = useState(true);
    const [role, setRole] = useState(null);
    const hasRun = useRef(false);

    const clearAuth = useAuthStore((s) => {
        const set = s._set ?? (() => {});
        return () => {
            try {
                useAuthStore.setState({ user: null, profile: null });
            } catch (_) { /* noop if store shape differs */ }
        };
    });

    useEffect(() => {
        // Prevent double-verification on StrictMode double-mount
        if (hasRun.current) return;
        hasRun.current = true;

        let cancelled = false;

        const verify = async () => {
            try {
                // Step 1: fresh user from Supabase auth server
                const { data: { user }, error: userError } = await supabase.auth.getUser();
                if (cancelled) return;

                if (userError || !user) {
                    setVerified(false);
                    setRole(null);
                    setLoading(false);
                    return;
                }

                // Step 2: fetch profile fresh from DB (never from Zustand cache)
                const { data: serverProfile, error: profileError } = await supabase
                    .from('profiles')
                    .select('role, status, id')
                    .eq('id', user.id)
                    .single();

                if (cancelled) return;

                if (profileError || !serverProfile) {
                    setVerified(false);
                    setRole(null);
                    setLoading(false);
                    return;
                }

                // Step 3: compare with cached store role
                const cachedProfile = useAuthStore.getState().profile;
                if (
                    cachedProfile &&
                    cachedProfile.role !== serverProfile.role
                ) {
                    // localStorage was tampered — clear the store
                    useAuthStore.setState({ user: null, profile: null });
                    setVerified(false);
                    setRole(null);
                    setLoading(false);
                    return;
                }

                // Step 4: all checks passed
                setVerified(true);
                setRole(serverProfile.role);
                setLoading(false);

                // Sync the store with the authoritative server profile
                useAuthStore.setState({ user, profile: { ...cachedProfile, ...serverProfile } });
            } catch (err) {
                if (!cancelled) {
                    setVerified(false);
                    setRole(null);
                    setLoading(false);
                }
            }
        };

        verify();
        return () => { cancelled = true; };
    }, []);

    return { verified, loading, role };
}

export default useServerAuth;
