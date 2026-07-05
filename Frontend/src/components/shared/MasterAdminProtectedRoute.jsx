import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

/**
 * MasterAdminProtectedRoute
 * Restricts access to /master-admin/* routes exclusively to
 * users with role === 'master_admin'. All other users (including
 * regular admins) are redirected back to the hidden login page.
 */
const MasterAdminProtectedRoute = () => {
    const { user, profile, loading } = useAuthStore();

    if (loading) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-[#0a0a0f]">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
            </div>
        );
    }

    // Not authenticated at all
    if (!user) {
        return <Navigate to="/master-admin-login" replace />;
    }

    // Authenticated but not a master_admin — redirect to hidden login
    // (intentionally NOT to /dashboard to avoid leaking portal existence)
    if (profile?.role !== 'master_admin') {
        console.warn(
            `[MasterAdminPortal] Unauthorized access attempt by ${user.email} (role: ${profile?.role})`
        );
        return <Navigate to="/master-admin-login" replace />;
    }

    return <Outlet />;
};

export default MasterAdminProtectedRoute;
