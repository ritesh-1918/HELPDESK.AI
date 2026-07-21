import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';

/**
 * ProtectedRoute — Client-side routing guard that prevents
 * unauthenticated users and wrong-role users from accessing
 * private routes.
 *
 * Security model:
 *   1. Auth state (Supabase session) is checked client-side first.
 *   2. Role is ALWAYS verified against the database via verifyServerRole(),
 *      never read from localStorage or Zustand persisted state.
 *   3. While the session check is in-flight, a loading skeleton is shown
 *      (no flash of redirect).
 *
 * Usage:
 *   <ProtectedRoute><AdminDashboard /></ProtectedRoute>
 *   <ProtectedRoute requiredRole="admin"><AdminSettings /></ProtectedRoute>
 */

const ADMIN_ROLES = ['admin', 'super_admin', 'master_admin'];

const GuardSkeleton = () => (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-pulse text-gray-400 text-sm">Verifying access…</div>
    </div>
);

const ProtectedRoute = ({ children, requiredRole }) => {
    const location = useLocation();
    const user = useAuthStore((s) => s.user);
    const profile = useAuthStore((s) => s.profile);
    const isCheckingSession = useAuthStore((s) => s.isCheckingSession);
    const verifyServerRole = useAuthStore((s) => s.verifyServerRole);

    const [roleVerified, setRoleVerified] = useState(!requiredRole);
    const [roleAllowed, setRoleAllowed] = useState(true);

    // Verify role against the database whenever the user changes
    useEffect(() => {
        if (!requiredRole || !user) {
            setRoleVerified(true);
            setRoleAllowed(true);
            return;
        }

        let cancelled = false;

        const check = async () => {
            const allowed = await verifyServerRole(user.id);
            if (!cancelled) {
                setRoleVerified(true);
                setRoleAllowed(allowed);
            }
        };

        check();

        return () => { cancelled = true; };
    }, [user, requiredRole, verifyServerRole]);

    // Still checking session — show skeleton (no redirect flash)
    if (isCheckingSession) {
        return <GuardSkeleton />;
    }

    // Not authenticated — redirect to login, preserve intended destination
    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Role required but not yet verified — keep skeleton
    if (requiredRole && !roleVerified) {
        return <GuardSkeleton />;
    }

    // Authenticated but wrong role — redirect to their dashboard
    if (requiredRole && !roleAllowed) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

/**
 * AdminRoute — Convenience wrapper for admin-only routes.
 * Checks that the user has an admin role in the database.
 */
export const AdminRoute = ({ children }) => (
    <ProtectedRoute requiredRole="admin">
        {children}
    </ProtectedRoute>
);

export default ProtectedRoute;
