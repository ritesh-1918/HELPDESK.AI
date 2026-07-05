import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

/**
 * AdminProtectedRoute Component
 * Restricts access to routes to only users with the 'admin' role.
 */
const AdminProtectedRoute = () => {
    const { user, profile, loading } = useAuthStore();

    if (loading) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-white">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
            </div>
        );
    }

    // Check if the user is authenticated from Supabase
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // If we have a user but no profile yet, wait for the database fetch
    if (!profile) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-[#050508]">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
            </div>
        );
    }

    // Check if the user's profile role is 'admin' or 'super_admin'
    // Enforce role
    if (profile.role !== "admin" && profile.role !== "super_admin") {
        // Basic redirect for non-admins if they try to access admin routes
        return <Navigate to="/" replace />;
    }

    // Enforce active status for admins (Master Admin approval)
    if (profile.status === "rejected") {
        return <Navigate to="/not-approved" replace />;
    } else if (profile.status !== "active") {
        return <Navigate to="/admin-lobby" replace />;
    }

    // Authorised and active: render the protected layout
    return <Outlet />;
};

export default AdminProtectedRoute;
