import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabaseClient';
import { API_CONFIG } from '../config';
import useTicketStore from './ticketStore';

const BACKEND_URL = API_CONFIG.BACKEND_URL;

const verifyServerCookieSession = async () => {
   try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        const res = await fetch(`${BACKEND_URL}/auth/me`, {
            method: 'GET',
            credentials: 'include',
            headers: { Accept: 'application/json' },
            signal: controller.signal,
        });
        clearTimeout(timeout);
        if (!res.ok) return null;
        const body = await res.json();
        return body?.user || null;
    } catch (e) {
        console.warn('Server cookie session check failed:', e?.message || e);
        return null;
    }
};

const mirrorBackendAuth = async (path, payload) => {
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        await fetch(`${BACKEND_URL}${path}`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            signal: controller.signal,
        });
        clearTimeout(timeout);
    } catch (e) {
        console.warn(`Backend auth ${path} failed:`, e?.message || e);
    }
};

let currentUserPromise = null;

const getProfileCache = (profile) => {
    if (!profile?.id) return null;

    return {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        company: profile.company,
        company_id: profile.company_id,
        profile_picture: profile.profile_picture,
    };
};

const useAuthStore = create(
    persist(
        (set, get) => ({
            // --- AUTH STATE ---
            user: null,
            profile: null,
            loading: false,
            isCheckingSession: true,

            // --- SUPABASE AUTH METHODS ---

            // Helper to fetch profile linked to auth user
            getProfile: async (user) => {
                if (!user) return null;

                const metadata = user.user_metadata || {};
                set({ profile: null });

                // Always resolve authorization fields from the database. Local storage and
                // user_metadata are client-controlled surfaces and must not grant roles.
                const dbProfile = await get()._syncProfile(user.id);
                if (dbProfile) {
                    return dbProfile;
                }

                const instantProfile = {
                    id: user.id,
                    email: user.email,
                    full_name: metadata.full_name || 'User',
                    role: 'user',
                    status: 'pending_email_verification',
                    company: metadata.company || ''
                };

                console.log("Falling back to non-authoritative profile:", instantProfile.role);
                set({ profile: instantProfile });
                return instantProfile;
            },

            // Helper for DB-side profile syncing
            _syncProfile: async (userId) => {
                try {
                    const { data, error } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', userId)
                        .single();

                    if (data) {
                        console.log("Database profile found, upgrading state.");
                        set({ profile: data });
                        return data;
                    }

                    if (error && error.code !== 'PGRST116') {
                        console.warn("DB Profile fetch error:", error.message);
                    }
                } catch (e) {
                    console.error("Background profile fetch error:", e);
                }
                return null;
            },

            getCurrentUser: async () => {
                if (currentUserPromise) {
                    return currentUserPromise;
                }

                currentUserPromise = (async () => {
                    try {
                        set({ isCheckingSession: true });
                        const cookieUser = await verifyServerCookieSession();
                        if (cookieUser) {
                            set({ user: cookieUser });
                            await get().getProfile(cookieUser);
                            return cookieUser;
                        }

                        const { data: { user }, error } = await supabase.auth.getUser();
                        if (error) throw error;

                        if (user) {
                            set({ user });
                            await get().getProfile(user);
                        } else {
                            set({ user: null, profile: null });
                        }
                        return user;
                        // eslint-disable-next-line no-unused-vars
                    } catch (error) {
                        set({ user: null, profile: null });
                        return null;
                    } finally {
                        set({ loading: false, isCheckingSession: false });
                        currentUserPromise = null;
                    }
                })();

                return currentUserPromise;
            },

            login: async (email, password) => {
                set({ loading: true });
                console.log("Attempting login for:", email);
                try {
                    await mirrorBackendAuth('/auth/login', { email, password });

                    const { data, error } = await supabase.auth.signInWithPassword({
                        email,
                        password,
                    });

                    if (error) throw error;

                    const user = data.user;
                    set({ user });

                    console.log("Login successful, resolving profile...");
                    // This will resolve instantly from metadata AND try to update from DB
                    const profile = await get().getProfile(user);

                    // Block login entirely if email is unverified (for both users and admins)
                    if (profile?.status === 'pending_email_verification') {
                        await supabase.auth.signOut();
                        set({ user: null, profile: null });
                        throw new Error("Please verify your email address before continuing. Check your inbox.");
                    }

                    return { user, profile };
                } catch (error) {
                    console.error("Login operation failed:", error.message);
                    throw error;
                } finally {
                    set({ loading: false });
                }
            },

            loginWithGoogle: async () => {
                const { error } =
                    await supabase.auth.signInWithOAuth({
                        provider: 'google',
                        options: {
                            redirectTo:
                                `${window.location.origin}/auth/callback`
                        }
                    });

                if (error) {
                    console.error(
                        "Google OAuth error:",
                        error.message
                    );

                    throw error;
                }
            },

            signInWithMagicLink: async (email) => {
                set({ loading: true });
                console.log("Attempting magic link / OTP login for:", email);
                try {
                    const { error } = await supabase.auth.signInWithOtp({
                        email,
                        options: {
                            shouldCreateUser: false, // Only existing users
                        }
                    });

                    if (error) throw error;
                    return true;
                } catch (error) {
                    console.error("Magic link operation failed:", error.message);
                    throw error;
                } finally {
                    set({ loading: false });
                }
            },

            verifyOtpAndLogin: async (email, token, type = 'magiclink') => {
                set({ loading: true });
                console.log("Attempting OTP verification for:", email);
                try {
                    const { data, error } = await supabase.auth.verifyOtp({
                        email,
                        token,
                        type,
                    });

                    if (error) throw error;

                    const user = data.user;
                    set({ user });

                    console.log("OTP Login successful, resolving profile...");
                    const profile = await get().getProfile(user);

                    if (profile?.status === 'pending_email_verification') {
                        await supabase.auth.signOut();
                        set({ user: null, profile: null });
                        throw new Error("Please verify your email address before continuing.");
                    }
                    return { user, profile };
                } catch (error) {
                    console.error("OTP verification failed:", error.message);
                    throw error;
                } finally {
                    set({ loading: false });
                }
            },

            signup: async (email, password, fullName, role = 'user', company = '', extraMetadata = {}, emailRedirectTo = undefined) => {
                set({ loading: true });
                console.log("Starting signup for:", email);

                try {
                    await mirrorBackendAuth('/auth/signup', {
                        email,
                        password,
                        full_name: fullName,
                        role,
                        company,
                    });

                    // 1. Auth Signup with Metadata
                    console.log("Step 1: Auth.signUp...");
                    const { data, error } = await supabase.auth.signUp({
                        email,
                        password,
                        options: {
                            data: {
                                full_name: fullName,
                                role: role,
                                company: company,
                                ...extraMetadata
                            },
                            ...(emailRedirectTo && { emailRedirectTo })
                        }
                    });

                    if (error) {
                        console.error("Auth.signUp error:", error.message);
                        throw error;
                    }

                    if (data.user) {
                        console.log("Step 2: User created, resolving profile...");
                        set({ user: data.user });
                        await get().getProfile(data.user);
                    }

                    console.log("Signup complete!");
                    return data.user;
                } catch (error) {
                    console.error("Signup operation failed:", error.message);
                    throw error;
                } finally {
                    set({ loading: false });
                }
            },

            logout: async () => {
                set({ loading: true });
                try {
                    try {
                        await fetch(`${BACKEND_URL}/auth/logout`, {
                            method: 'POST',
                            credentials: 'include',
                        });
                    } catch (e) {
                        console.warn('Backend cookie logout failed:', e?.message || e);
                    }

                    const { error } = await supabase.auth.signOut();
                    if (error) throw error;
                    set({ user: null, profile: null });
                    // clear persisted ticket state to prevent cross-user data leakage
                    useTicketStore.getState().clearTicket();
                    useTicketStore.setState({ notifications: [], tickets: [] });
                } finally {
                    set({ loading: false });
                }
            },


            updateProfile: async (updates) => {
                const { profile } = get();
                if (!profile?.id) return;

                set({ loading: true });
                try {
                    const { data, error } = await supabase
                        .from('profiles')
                        .update(updates)
                        .eq('id', profile.id)
                        .select()
                        .single();

                    if (error) throw error;
                    if (data) {
                        set({ profile: data });
                        return data;
                    }
                } catch (err) {
                    console.error("Profile update failed:", err);
                    throw err;
                } finally {
                    set({ loading: false });
                }
            },

            _initialized: false,
            initialize: () => {
                if (get()._initialized) return;
                set({ _initialized: true });

                get().getCurrentUser();

                supabase.auth.onAuthStateChange(async (event, session) => {
                    console.log("Auth state change:", event);
                    try {
                        if (session?.user) {
                            set({ user: session.user, loading: true, isCheckingSession: true });
                            await get().getProfile(session.user);
                        } else {
                            set({ user: null, profile: null });
                        }
                    } catch (e) {
                        console.warn("Auth state change error:", e?.message || e);
                        set({ user: null, profile: null });
                    } finally {
                        set({ loading: false, isCheckingSession: false });
                    }
                });
            }
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                // Cache display-only profile fields. Role/status must come from the DB.
                profile: getProfileCache(state.profile)
            }),
        }
    )
);

export default useAuthStore;

