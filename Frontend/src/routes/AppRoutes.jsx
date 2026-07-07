import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute, { AdminRoute } from './ProtectedRoute';

// ─── Skeleton Loaders ───────────────────────────────────────────────────────

const PageSkeleton = () => (
    <div className="min-h-screen bg-gray-900 p-6 animate-pulse">
        {/* Header skeleton */}
        <div className="h-16 bg-gray-800 rounded-lg mb-6 w-full" />
        
        {/* Content skeleton */}
        <div className="space-y-4">
            <div className="h-8 bg-gray-800 rounded w-1/3" />
            <div className="h-4 bg-gray-800 rounded w-2/3" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-32 bg-gray-800 rounded-lg" />
                ))}
            </div>
            <div className="h-64 bg-gray-800 rounded-lg mt-4" />
        </div>
    </div>
);

const TableSkeleton = () => (
    <div className="min-h-screen bg-gray-900 p-6 animate-pulse">
        <div className="h-16 bg-gray-800 rounded-lg mb-6 w-full" />
        <div className="space-y-3">
            <div className="h-10 bg-gray-800 rounded w-full" />
            {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-800 rounded w-full" />
            ))}
        </div>
    </div>
);

// ─── Lazy-loaded Admin Pages ────────────────────────────────────────────────

const AdminDashboard = lazy(() => import('../admin/pages/Dashboard'));
const AdminTickets = lazy(() => import('../admin/pages/Tickets'));
const AdminTicketDetail = lazy(() => import('../admin/pages/AdminTicketDetail'));
const AdminAnalytics = lazy(() => import('../admin/pages/Analytics'));
const AdminSettings = lazy(() => import('../admin/pages/Settings'));
const AdminUsers = lazy(() => import('../admin/pages/Users'));
const AdminKnowledge = lazy(() => import('../admin/pages/KnowledgeBase'));

// ─── Lazy-loaded User Pages ─────────────────────────────────────────────────

const UserDashboard = lazy(() => import('../user/pages/Dashboard'));
const UserTickets = lazy(() => import('../user/pages/Tickets'));
const UserTicketDetail = lazy(() => import('../user/pages/TicketDetail'));
const UserProfile = lazy(() => import('../user/pages/Profile'));
const TicketTracking = lazy(() => import('../user/pages/TicketTracking'));

// ─── Lazy-loaded Auth Pages ─────────────────────────────────────────────────

const Login = lazy(() => import('../auth/Login'));
const Register = lazy(() => import('../auth/Register'));

// ─── Lazy-loaded Landing Pages ──────────────────────────────────────────────

const AboutUs = lazy(() => import('../pages/AboutUs'));

// ─── Route Wrapper with Suspense ────────────────────────────────────────────

const LazyRoute = ({ children, fallback = <PageSkeleton /> }) => (
    <Suspense fallback={fallback}>
        {children}
    </Suspense>
);

// ─── App Routes ─────────────────────────────────────────────────────────────

import AIAssistant from '../components/shared/AIAssistant';

const AppRoutes = () => (
    <>
        <AIAssistant />
        <Routes>
        {/* Auth routes — public */}
        <Route path="/login" element={
            <LazyRoute><Login /></LazyRoute>
        } />
        <Route path="/register" element={
            <LazyRoute><Register /></LazyRoute>
        } />

        {/* Admin routes — protected, require admin role */}
        <Route path="/admin" element={
            <AdminRoute><LazyRoute><AdminDashboard /></LazyRoute></AdminRoute>
        } />
        <Route path="/admin/tickets" element={
            <AdminRoute><LazyRoute fallback={<TableSkeleton />}><AdminTickets /></LazyRoute></AdminRoute>
        } />
        <Route path="/admin/ticket/:ticket_id" element={
            <AdminRoute><LazyRoute><AdminTicketDetail /></LazyRoute></AdminRoute>
        } />
        <Route path="/admin/analytics" element={
            <AdminRoute><LazyRoute><AdminAnalytics /></LazyRoute></AdminRoute>
        } />
        <Route path="/admin/settings" element={
            <AdminRoute><LazyRoute><AdminSettings /></LazyRoute></AdminRoute>
        } />
        <Route path="/admin/users" element={
            <AdminRoute><LazyRoute fallback={<TableSkeleton />}><AdminUsers /></LazyRoute></AdminRoute>
        } />
        <Route path="/admin/knowledge" element={
            <AdminRoute><LazyRoute><AdminKnowledge /></LazyRoute></AdminRoute>
        } />

        {/* User routes — protected, any authenticated user */}
        <Route path="/dashboard" element={
            <ProtectedRoute><LazyRoute><UserDashboard /></LazyRoute></ProtectedRoute>
        } />
        <Route path="/tickets" element={
            <ProtectedRoute><LazyRoute fallback={<TableSkeleton />}><UserTickets /></LazyRoute></ProtectedRoute>
        } />
        <Route path="/tickets/:id" element={
            <ProtectedRoute><LazyRoute><UserTicketDetail /></LazyRoute></ProtectedRoute>
        } />
        <Route path="/ticket-tracking" element={
            <ProtectedRoute><LazyRoute><TicketTracking /></LazyRoute></ProtectedRoute>
        } />
        <Route path="/profile" element={
            <ProtectedRoute><LazyRoute><UserProfile /></LazyRoute></ProtectedRoute>
        } />
        <Route path="/about" element={
            <LazyRoute><AboutUs /></LazyRoute>
        } />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
    </>
);

export default AppRoutes;
export { PageSkeleton, TableSkeleton, LazyRoute };
