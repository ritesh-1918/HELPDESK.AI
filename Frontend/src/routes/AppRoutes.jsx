import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

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
        {/* Auth routes */}
        <Route path="/login" element={
            <LazyRoute><Login /></LazyRoute>
        } />
        <Route path="/register" element={
            <LazyRoute><Register /></LazyRoute>
        } />

        {/* Admin routes - all lazy loaded */}
        <Route path="/admin" element={
            <LazyRoute><AdminDashboard /></LazyRoute>
        } />
        <Route path="/admin/tickets" element={
            <LazyRoute fallback={<TableSkeleton />}><AdminTickets /></LazyRoute>
        } />
        <Route path="/admin/ticket/:ticket_id" element={
            <LazyRoute><AdminTicketDetail /></LazyRoute>
        } />
        <Route path="/admin/analytics" element={
            <LazyRoute><AdminAnalytics /></LazyRoute>
        } />
        <Route path="/admin/settings" element={
            <LazyRoute><AdminSettings /></LazyRoute>
        } />
        <Route path="/admin/users" element={
            <LazyRoute fallback={<TableSkeleton />}><AdminUsers /></LazyRoute>
        } />
        <Route path="/admin/knowledge" element={
            <LazyRoute><AdminKnowledge /></LazyRoute>
        } />

        {/* User routes - all lazy loaded */}
        <Route path="/dashboard" element={
            <LazyRoute><UserDashboard /></LazyRoute>
        } />
        <Route path="/tickets" element={
            <LazyRoute fallback={<TableSkeleton />}><UserTickets /></LazyRoute>
        } />
        <Route path="/tickets/:id" element={
            <LazyRoute><UserTicketDetail /></LazyRoute>
        } />
        <Route path="/ticket-tracking" element={
            <LazyRoute><TicketTracking /></LazyRoute>
        } />
        <Route path="/profile" element={
            <LazyRoute><UserProfile /></LazyRoute>
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
