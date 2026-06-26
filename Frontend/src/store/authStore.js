import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabaseClient';
import useTicketStore from './ticketStore';

const useAuthStore = create(
    persist(
        (set, get) => ({
            // --- AUTH STATE ---
            user: null,
            profile: null,
            loading: false,

            // --- SUPABASE AUTH METHODS ---

            // Helper to fetch profile linked to auth user
            getProfile: async (user) => {
                if (!user) return null;

                const metadata = user.user_metadata || {};
                const currentProfile = get().profile;

                // 1. Resolve FROM METADATA or PERSISTED state
                // Priority 1: If we have a persisted session for THIS user and it's active, keep it 
                // to prevent temporary lobbies during refresh/tab switching.
                if (currentProfile && currentProfile.id === user.id && currentProfile.status === 'active') {
                    console.log("Active profile retained from state.");
                    // Background fetch to ensure session is still valid/synced
                    get()._syncProfile(user.id);
                    return currentProfile;
                }

                // Priority 2: Use Auth Metadata (Instant fallback)
                const isMasterAdmin = user.email === 'masteradmin@helpdesk.ai';

                const instantProfile = {
                    id: user.id,
                    email: user.email,
                    full_name: isMasterAdmin ? 'Master Admin' : (metadata.full_name || 'User'),
                    role: isMasterAdmin ? 'master_admin' : (metadata.role || 'user'),
                    status: isMasterAdmin ? 'active' : 'pending_email_verification',
                    company: metadata.company || ''
                };

                // 2. Sync with Database First before setting a fallback
                // This prevents flashes of 'pending_email_verification' when returning from magic links
                const dbProfile = await get()._syncProfile(user.id);
                if (dbProfile) {
                    return dbProfile;
                }

                console.log("Falling back to instant profile resolved from metadata:", instantProfile.role);
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
                try {
                    const { data: { user }, error } = await supabase.auth.getUser();
                    if (error) throw error;

                    if (user) {
                        set({ user });
                        // Don't 'await' here because we want 'loading: false' ASAP
                        get().getProfile(user);
                    } else {
                        set({ user: null, profile: null });
                    }
                    return user;
                    // eslint-disable-next-line no-unused-vars
                } catch (error) {
                    set({ user: null, profile: null });
                    return null;
                } finally {
                    set({ loading: false });
                }
            },

            login: async (email, password) => {
                set({ loading: true });
                console.log("Attempting login for:", email);
                try {
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
                    if (session?.user) {
                        set({ user: session.user });
                        get().getProfile(session.user);
                    } else {
                        set({ user: null, profile: null });
                    }
                    set({ loading: false });
                });
            }
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                // We keep profile persisted for quick UI transitions, 
                // but session is handled by Supabase cookie/localStorage
                profile: state.profile
            }),
        }
    )
);

export default useAuthStore;
