import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import useAuthStore from '../../store/authStore';

/**
 * ProtectedRoute Component
 * Restricts access to routes to only authenticated users.
 * Redirects to the login page if not authenticated.
 */
const ProtectedRoute = () => {
    const { user, profile, loading, getCurrentUser } = useAuthStore();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const checkSession = async () => {
            // Re-verify the session via Supabase as requested
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                // If no session found, ensure our store also knows there's no user
                setIsChecking(false);
                return;
            }

            // If session exists, also sync the store if needed
            if (!user) {
                await getCurrentUser();
            }
            setIsChecking(false);
        };

        checkSession();
    }, [user, getCurrentUser]);

    if (loading || isChecking) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-white">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Redirect specific roles to their dedicated portals if they hit a generic protected route,
    // BUT prevent infinite loops if they are already on those routes.
    const currentPath = window.location.pathname;

    if (profile) {
        if (profile.role === 'master_admin' && !currentPath.startsWith('/master-admin')) {
            return <Navigate to="/master-admin/dashboard" replace />;
        }
        if (profile.role === 'admin' && profile.status === 'active' && !currentPath.startsWith('/admin')) {
            return <Navigate to="/admin/dashboard" replace />;
        }
        if (profile.role === 'user' && profile.status !== 'active' && !currentPath.startsWith('/user-lobby')) {
            return <Navigate to="/user-lobby" replace />;
        }
    }

    return <Outlet />;
};

export default ProtectedRoute;
