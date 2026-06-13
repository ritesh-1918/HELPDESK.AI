import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import useAuthStore from '../store/authStore';

export const useAuth = () => {
    const { session, profile, setSession, fetchProfile } = useAuthStore();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkSession = async () => {
            setLoading(true);
            const { data: { session: activeSession } } = await supabase.auth.getSession();
            setSession(activeSession);
            if (activeSession?.user?.id) {
                await fetchProfile(activeSession.user.id);
            }
            setLoading(false);
        };
        checkSession();

        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, newSession) => {
            setSession(newSession);
            if (newSession?.user?.id && event === 'SIGNED_IN') {
                await fetchProfile(newSession.user.id);
            }
        });

        return () => {
            authListener?.subscription?.unsubscribe();
        };
    }, [setSession, fetchProfile]);

    const logout = async () => {
        await supabase.auth.signOut();
        useAuthStore.getState().logout();
    };

    return { session, user: session?.user, profile, loading, logout };
};
