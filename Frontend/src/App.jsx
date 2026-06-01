/**
 * App.jsx — React Router v6 routes with lazy-loaded page components.
 *
 * All admin and user page modules are loaded dynamically via React.lazy()
 * so the initial bundle only ships auth + landing pages.  Each route group
 * is wrapped in its own Suspense boundary with an appropriate skeleton.
 */

import React, { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { PageSkeleton, MinimalSkeleton } from './components/ui/page-skeleton';
import { NotFound } from './components/ui/not-found-2';
import useTicketStore from './store/ticketStore';
import Toaster from './components/shared/Toaster';
import BugReportWidget from './components/shared/BugReportWidget';
import useRealtimeNotifications from './hooks/useRealtimeNotifications';
import useAuthStore from './store/authStore';

// ---------------------------------------------------------------------------
// Eagerly-loaded auth pages — critical path, must be instant
// ---------------------------------------------------------------------------
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Signup from './pages/Signup';
import AdminSignup from './pages/AdminSignup';
import LandingPage from './pages/LandingPage';

// Route guards (tiny, keep eager)
import AdminProtectedRoute from './components/shared/AdminProtectedRoute';
import MasterAdminProtectedRoute from './components/shared/MasterAdminProtectedRoute';
import ProtectedRoute from './components/shared/ProtectedRoute';

// ---------------------------------------------------------------------------
// Lazily-loaded lobby / shell pages
// ---------------------------------------------------------------------------
const AdminLobby = lazy(() => import('./pages/AdminLobby'));
const UserLobby  = lazy(() => import('./pages/UserLobby'));

// ---------------------------------------------------------------------------
// Lazily-loaded layouts
// ---------------------------------------------------------------------------
const UserLayout  = lazy(() => import('./user/UserLayout'));
const AdminLayout = lazy(() => import('./admin/layout/AdminLayout'));

// ---------------------------------------------------------------------------
// User Pages
// ---------------------------------------------------------------------------
const Dashboard          = lazy(() => import('./user/pages/Dashboard'));
const CreateTicket       = lazy(() => import('./user/pages/CreateTicket'));
const MyTickets          = lazy(() => import('./user/pages/MyTickets'));
const TicketResult       = lazy(() => import('./user/pages/TicketResult'));
const Profile            = lazy(() => import('./user/pages/Profile'));
const TicketDetail       = lazy(() => import('./user/pages/TicketDetail'));
const AIProcessing       = lazy(() => import('./user/pages/AIProcessing'));
const AIUnderstanding    = lazy(() => import('./user/pages/AIUnderstanding'));
const Notifications      = lazy(() => import('./user/pages/Notifications'));
const Help               = lazy(() => import('./user/pages/Help'));
const DuplicateDetection = lazy(() => import('./user/pages/DuplicateDetection'));
const AutoResolveChat    = lazy(() => import('./user/pages/AutoResolveChat'));
const Resolved           = lazy(() => import('./user/pages/Resolved'));
const TicketTracking     = lazy(() => import('./user/pages/TicketTracking'));

// ---------------------------------------------------------------------------
// Admin Pages
// ---------------------------------------------------------------------------
const AdminDashboard    = lazy(() => import('./admin/pages/AdminDashboard'));
const AdminTickets      = lazy(() => import('./admin/pages/AdminTickets'));
const AdminTicketDetail = lazy(() => import('./admin/pages/AdminTicketDetail'));
const AdminUsers        = lazy(() => import('./admin/pages/AdminUsers'));
const AdminAnalytics    = lazy(() => import('./admin/pages/AdminAnalytics'));
const AdminProfile      = lazy(() => import('./admin/pages/AdminProfile'));
const AdminSettings     = lazy(() => import('./admin/pages/AdminSettings'));

// ---------------------------------------------------------------------------
// Master-admin Pages
// ---------------------------------------------------------------------------
const MasterAdminLayout    = lazy(() => import('./master-admin/layout/MasterAdminLayout'));
const MasterAdminDashboard = lazy(() => import('./master-admin/pages/MasterAdminDashboard'));
const AllAdmins            = lazy(() => import('./master-admin/pages/AllAdmins'));
const AllCompanies         = lazy(() => import('./master-admin/pages/AllCompanies'));
const PendingAdminRequests = lazy(() => import('./master-admin/pages/PendingAdminRequests'));
const MasterBugReports     = lazy(() => import('./master-admin/pages/MasterBugReports'));

// ---------------------------------------------------------------------------
// Showcase / marketing pages (defer aggressively)
// ---------------------------------------------------------------------------
const ContactSales    = lazy(() => import('./pages/ContactSales'));
const ApiReference    = lazy(() => import('./pages/ApiReference'));
const Changelog       = lazy(() => import('./pages/Changelog'));
const StatusPage      = lazy(() => import('./pages/StatusPage'));
const AboutUs         = lazy(() => import('./pages/AboutUs'));
const Careers         = lazy(() => import('./pages/Careers'));
const DocsPortal      = lazy(() => import('./docs/pages/DocsPortal'));

// Feature pages
const AutoCategorizationFeature = lazy(() => import('./pages/features/AutoCategorizationFeature'));
const PriorityDetectionFeature  = lazy(() => import('./pages/features/PriorityDetectionFeature'));
const SmartResolutionFeature    = lazy(() => import('./pages/features/SmartResolutionFeature'));

// Legal pages
const TermsOfService = lazy(() => import('./pages/legal/TermsOfService'));
const PrivacyPolicy  = lazy(() => import('./pages/legal/PrivacyPolicy'));
const Security       = lazy(() => import('./pages/legal/Security'));
const CookiePolicy   = lazy(() => import('./pages/legal/CookiePolicy'));

// ---------------------------------------------------------------------------
// Inner component that consumes router context
// ---------------------------------------------------------------------------
function AppRoutes() {
  const location = useLocation();
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation
} from "react-router-dom";
import React, { Suspense, useEffect, lazy } from "react";
import ErrorBoundary from "./components/shared/ErrorBoundary";
import useTicketStore from "./store/ticketStore";
import useRealtimeNotifications from "./hooks/useRealtimeNotifications";
import AdminProtectedRoute from "./components/shared/AdminProtectedRoute";
import MasterAdminProtectedRoute from "./components/shared/MasterAdminProtectedRoute";
import ProtectedRoute from "./components/shared/ProtectedRoute";
import useAuthStore from "./store/authStore";
import NotApproved from "./pages/NotApproved";
const Login = lazy(() => import("./pages/Login"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Signup = lazy(() => import("./pages/Signup"));
const AdminSignup = lazy(() => import("./pages/AdminSignup"));
const AdminLobby = lazy(() => import("./pages/AdminLobby"));
const UserLobby = lazy(() => import("./pages/UserLobby"));
const LandingPage = lazy(() => import("./pages/LandingPage"));
const ContactSales = lazy(() => import("./pages/ContactSales"));

const DuplicateDetection = lazy(() => import("./user/pages/DuplicateDetection"));
const AutoResolveChat = lazy(() => import("./user/pages/AutoResolveChat"));
const Resolved = lazy(() => import("./user/pages/Resolved"));
const TicketTracking = lazy(() => import("./user/pages/TicketTracking"));

const UserLayout = lazy(() => import("./user/UserLayout"));
const AdminLayout = lazy(() => import("./admin/layout/AdminLayout"));

const Dashboard = lazy(() => import("./user/pages/Dashboard"));
const CreateTicket = lazy(() => import("./user/pages/CreateTicket"));
const MyTickets = lazy(() => import("./user/pages/MyTickets"));
const TicketResult = lazy(() => import("./user/pages/TicketResult"));
const Profile = lazy(() => import("./user/pages/Profile"));
const TicketDetail = lazy(() => import("./user/pages/TicketDetail"));
const AIProcessing = lazy(() => import("./user/pages/AIProcessing"));
const AIUnderstanding = lazy(() => import("./user/pages/AIUnderstanding"));
const Notifications = lazy(() => import("./user/pages/Notifications"));
const Help = lazy(() => import("./user/pages/Help"));

const AdminDashboard = lazy(() => import("./admin/pages/AdminDashboard"));
const AdminTickets = lazy(() => import("./admin/pages/AdminTickets"));
const AdminTicketDetail = lazy(() => import("./admin/pages/AdminTicketDetail"));
const AdminUsers = lazy(() => import("./admin/pages/AdminUsers"));
const AdminAnalytics = lazy(() => import("./admin/pages/AdminAnalytics"));
const AdminProfile = lazy(() => import("./admin/pages/AdminProfile"));
const AdminSettings = lazy(() => import("./admin/pages/AdminSettings"));
const SLAPage = lazy(() => import("./admin/pages/SLAPage"));
const MasterBugReports = lazy(() => import("./master-admin/pages/MasterBugReports"));

const AutoCategorizationFeature = lazy(() => import("./pages/features/AutoCategorizationFeature"));
const PriorityDetectionFeature = lazy(() => import("./pages/features/PriorityDetectionFeature"));
const SmartResolutionFeature = lazy(() => import("./pages/features/SmartResolutionFeature"));

const TermsOfService = lazy(() => import("./pages/legal/TermsOfService"));
const PrivacyPolicy = lazy(() => import("./pages/legal/PrivacyPolicy"));
const Security = lazy(() => import("./pages/legal/Security"));

const MasterAdminLogin = lazy(() => import("./pages/MasterAdminLogin"));
const MasterAdminLayout = lazy(() => import("./master-admin/layout/MasterAdminLayout"));
const MasterAdminDashboard = lazy(() => import("./master-admin/pages/MasterAdminDashboard"));
const PendingAdminRequests = lazy(() => import("./master-admin/pages/PendingAdminRequests"));
const AllCompanies = lazy(() => import("./master-admin/pages/AllCompanies"));
const AllAdmins = lazy(() => import("./master-admin/pages/AllAdmins"));
const Changelog = lazy(() => import("./pages/Changelog"));
const AboutUs = lazy(() => import("./pages/AboutUs"));
const NotFoundPage = lazy(() => import("./components/ui/not-found-2").then((module) => ({ default: module.NotFound })));
const Toaster = lazy(() => import("./components/shared/Toaster"));
const BugReportWidget = lazy(() => import("./components/shared/BugReportWidget"));
const ScrollToTopButton = lazy(() => import("./components/ScrollToTopButton"));

function RouteFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center px-6 py-16">
      <div className="rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm font-semibold text-slate-500 shadow-sm">
        Loading...
      </div>
    </div>
  );
}


class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("React ErrorBoundary caught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[40vh] items-center justify-center px-6 py-16">
          <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-4 text-sm font-semibold text-red-600 shadow-sm">
            Something went wrong. Please refresh the page.
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}


function TitleUpdater() {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    let title = 'HELPDESK.AI';

    // Admin Routes
    if (path.startsWith('/admin/ticket/')) title = 'Ticket Detail | Admin';
    else if (path.startsWith('/admin/dashboard')) title = 'Admin Dashboard';
    else if (path.startsWith('/admin/tickets')) title = 'Admin Tickets';
    else if (path.startsWith('/admin/users')) title = 'Manage Users | Admin';
    else if (path.startsWith('/admin/analytics')) title = 'Analytics | Admin';
    else if (path.startsWith('/admin/scorecard')) title = 'Agent Scorecard | Admin';
    else if (path.startsWith('/admin/profile')) title = 'Admin Profile';
    else if (path.startsWith('/admin/settings')) title = 'Settings | Admin';
    else if (path.startsWith('/admin/sla')) title = 'SLA Monitor | Admin';
    // Master Admin Routes
    else if (path.startsWith('/master-admin/dashboard')) title = 'Master Dashboard';
    else if (path.startsWith('/master-admin/admin-requests')) title = 'Pending Requests | Master Admin';
    else if (path.startsWith('/master-admin/companies')) title = 'Companies | Master Admin';
    else if (path.startsWith('/master-admin/all-admins')) title = 'All Admins | Master Admin';
    else if (path.startsWith('/master-admin/bug-reports')) title = 'System Bug Radar | Master Admin';
    // User Routes
    else if (path.startsWith('/ticket/')) title = 'Ticket Detail';
    else if (path.startsWith('/ai-understanding')) title = 'AI Understanding';
    else if (path.startsWith('/ai-processing')) title = 'AI Processing';
    else if (path === '/dashboard') title = 'User Dashboard';
    else if (path === '/create-ticket') title = 'Create Ticket';
    else if (path === '/my-tickets') title = 'My Tickets';
    else if (path === '/profile') title = 'User Profile';
    else if (path === '/notifications') title = 'Notifications';
    else if (path === '/docs') title = 'Documentation';
    else if (path === '/api-reference') title = 'API Reference';
    else if (path === '/changelog') title = 'Changelog';
    else if (path === '/status') title = 'Status';
    else if (path === '/about') title = 'About Us';
    else if (path === '/careers') title = 'Careers';
    else if (path === '/cookie-policy') title = 'Cookie Policy';
    // Public / Lobby Routes
    else if (path === '/login') title = 'Login';
    else if (path === '/signup') title = 'Create Account';
    else if (path === '/admin-signup') title = 'Admin Signup';
    else if (path === '/user-lobby') title = 'User Lobby';
    else if (path === '/admin-lobby') title = 'Admin Lobby';
    else if (path === '/about-us') title = 'About Us';
    else if (path === '/') title = 'Welcome';

    document.title = title === 'HELPDESK.AI' ? title : `${title} | HELPDESK.AI`;
  }, [location]);

  return null;
}

// Scrolls to top on every route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("React ErrorBoundary caught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[40vh] items-center justify-center px-6 py-16">
          <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-4 text-sm font-semibold text-red-600 shadow-sm">
            Something went wrong. Please refresh the page.
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function AppLayout() {
  const { user, profile } = useAuthStore();
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Initialize Global Realtime Notifications Listener
  useRealtimeNotifications();

  // Initialize keyboard shortcuts
  const { shortcuts } = useKeyboardShortcuts(
    // Add role-specific shortcuts
    profile?.role === 'admin' || profile?.role === 'super_admin'
      ? { 'g,a': '/admin/dashboard', 'g,k': '/admin/tickets', 'g,u': '/admin/users', 'g,s': '/admin/settings' }
      : profile?.role === 'master_admin'
        ? { 'g,a': '/master-admin/dashboard', 'g,k': '/master-admin/admin-requests', 'g,u': '/master-admin/all-admins' }
        : {},
    {
      onShortcutsHelp: () => setShowShortcuts(true),
    }
  );

  useEffect(() => {
    if (!user) return;
    const handleFocus = () => {
      useTicketStore.persist.rehydrate();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user]);

  // ProtectedRoute handles the redirect to /login if user is not present
  // but we still need to handle role-based navigation here
  return (
    <>
      <ShortcutsHelp
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
        shortcuts={shortcuts}
      />
      <Routes>
        <Route path="/knowledge-check" element={<DuplicateDetection />} />
        <Route path="/auto-resolve" element={<AutoResolveChat />} />
        <Route path="/resolved" element={<Resolved />} />

        {/* ── Public / Auth routes ─────────────────────────────────────── */}
        <Route path="/"               element={<LandingPage />} />
        <Route path="/login"          element={<Login />} />
        <Route path="/signup"         element={<Signup />} />
        <Route path="/admin-signup"   element={<AdminSignup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password"  element={<ResetPassword />} />

        {/* ── Lobby routes ─────────────────────────────────────────────── */}
        <Route path="/admin-lobby" element={<Suspense fallback={<MinimalSkeleton />}><AdminLobby /></Suspense>} />
        <Route path="/user-lobby"  element={<Suspense fallback={<MinimalSkeleton />}><UserLobby /></Suspense>} />

        {/* ── Marketing routes ─────────────────────────────────────────── */}
        <Route path="/contact-sales" element={<Suspense fallback={<MinimalSkeleton />}><ContactSales /></Suspense>} />
        <Route path="/docs"          element={<Suspense fallback={<PageSkeleton />}><DocsPortal /></Suspense>} />
        <Route path="/api-reference" element={<Suspense fallback={<PageSkeleton />}><ApiReference /></Suspense>} />
        <Route path="/changelog"     element={<Suspense fallback={<PageSkeleton />}><Changelog /></Suspense>} />
        <Route path="/status"        element={<Suspense fallback={<MinimalSkeleton />}><StatusPage /></Suspense>} />
        <Route path="/about"         element={<Suspense fallback={<PageSkeleton />}><AboutUs /></Suspense>} />
        <Route path="/careers"       element={<Suspense fallback={<PageSkeleton />}><Careers /></Suspense>} />

        {/* Feature pages */}
        <Route path="/features/auto-categorization" element={<Suspense fallback={<PageSkeleton />}><AutoCategorizationFeature /></Suspense>} />
        <Route path="/features/priority-detection"  element={<Suspense fallback={<PageSkeleton />}><PriorityDetectionFeature /></Suspense>} />
        <Route path="/features/smart-resolution"    element={<Suspense fallback={<PageSkeleton />}><SmartResolutionFeature /></Suspense>} />

        {/* Legal pages */}
        <Route path="/terms"    element={<Suspense fallback={<MinimalSkeleton />}><TermsOfService /></Suspense>} />
        <Route path="/privacy"  element={<Suspense fallback={<MinimalSkeleton />}><PrivacyPolicy /></Suspense>} />
        <Route path="/security" element={<Suspense fallback={<MinimalSkeleton />}><Security /></Suspense>} />
        <Route path="/cookies"  element={<Suspense fallback={<MinimalSkeleton />}><CookiePolicy /></Suspense>} />

        {/* ── Protected user routes ────────────────────────────────────── */}
        <Route element={<ProtectedRoute />}>
          <Route path="/user" element={<Suspense fallback={<PageSkeleton />}><UserLayout /></Suspense>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard"           element={<Suspense fallback={<PageSkeleton />}><Dashboard /></Suspense>} />
            <Route path="create-ticket"       element={<Suspense fallback={<PageSkeleton />}><CreateTicket /></Suspense>} />
            <Route path="my-tickets"          element={<Suspense fallback={<PageSkeleton />}><MyTickets /></Suspense>} />
            <Route path="ticket-result"       element={<Suspense fallback={<PageSkeleton />}><TicketResult /></Suspense>} />
            <Route path="ticket/:id"          element={<Suspense fallback={<PageSkeleton />}><TicketDetail /></Suspense>} />
            <Route path="ai-processing"       element={<Suspense fallback={<PageSkeleton />}><AIProcessing /></Suspense>} />
            <Route path="ai-understanding"    element={<Suspense fallback={<PageSkeleton />}><AIUnderstanding /></Suspense>} />
            <Route path="notifications"       element={<Suspense fallback={<PageSkeleton />}><Notifications /></Suspense>} />
            <Route path="help"                element={<Suspense fallback={<PageSkeleton />}><Help /></Suspense>} />
            <Route path="duplicate-detection" element={<Suspense fallback={<PageSkeleton />}><DuplicateDetection /></Suspense>} />
            <Route path="auto-resolve"        element={<Suspense fallback={<PageSkeleton />}><AutoResolveChat /></Suspense>} />
            <Route path="resolved"            element={<Suspense fallback={<PageSkeleton />}><Resolved /></Suspense>} />
            <Route path="ticket-tracking"     element={<Suspense fallback={<PageSkeleton />}><TicketTracking /></Suspense>} />
            <Route path="profile"             element={<Suspense fallback={<PageSkeleton />}><Profile /></Suspense>} />
          </Route>
        </Route>

        {/* ── Protected admin routes ───────────────────────────────────── */}
        <Route element={<AdminProtectedRoute />}>
          <Route path="/admin" element={<Suspense fallback={<PageSkeleton />}><AdminLayout /></Suspense>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Suspense fallback={<PageSkeleton />}><AdminDashboard /></Suspense>} />
            <Route path="tickets"   element={<Suspense fallback={<PageSkeleton />}><AdminTickets /></Suspense>} />
            <Route path="tickets/:id" element={<Suspense fallback={<PageSkeleton />}><AdminTicketDetail /></Suspense>} />
            <Route path="users"     element={<Suspense fallback={<PageSkeleton />}><AdminUsers /></Suspense>} />
            <Route path="analytics" element={<Suspense fallback={<PageSkeleton />}><AdminAnalytics /></Suspense>} />
            <Route path="settings"  element={<Suspense fallback={<PageSkeleton />}><AdminSettings /></Suspense>} />
            <Route path="profile"   element={<Suspense fallback={<PageSkeleton />}><AdminProfile /></Suspense>} />
          </Route>
        </Route>

        {/* ── Master admin routes ──────────────────────────────────────── */}
        <Route element={<MasterAdminProtectedRoute />}>
          <Route path="/master-admin" element={<Suspense fallback={<PageSkeleton />}><MasterAdminLayout /></Suspense>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard"        element={<Suspense fallback={<PageSkeleton />}><MasterAdminDashboard /></Suspense>} />
            <Route path="admins"           element={<Suspense fallback={<PageSkeleton />}><AllAdmins /></Suspense>} />
            <Route path="companies"        element={<Suspense fallback={<PageSkeleton />}><AllCompanies /></Suspense>} />
            <Route path="pending-requests" element={<Suspense fallback={<PageSkeleton />}><PendingAdminRequests /></Suspense>} />
            <Route path="bug-reports"      element={<Suspense fallback={<PageSkeleton />}><MasterBugReports /></Suspense>} />
          </Route>
        </Route>

        {/* ── 404 ─────────────────────────────────────────────────────── */}
        <Route path="*" element={<NotFound />} />
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/tickets" element={<AdminTickets />} />
            <Route path="/admin/ticket/:ticket_id" element={<AdminTicketDetail />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
            <Route path="/admin/scorecard" element={<AdminScorecard />} />
            <Route path="/admin/profile" element={<AdminProfile />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
            <Route path="/admin/sla" element={<SLAPage />} />
          </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </ErrorBoundary>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
      <Toaster />
      <BugReportWidget />

function App() {
  const { initialize } = useAuthStore();

  useEffect(() => {
    initialize().catch((err) => {
      console.error('Auth initialize failed:', err);
    });
  }, [initialize]);

  const isDocsSubdomain = window.location.hostname.startsWith('docs.');

  if (isDocsSubdomain) {
    return (
      <BrowserRouter>
        <TitleUpdater />
        <ScrollToTop />
        <ScrollToTopButton />
        <Toaster />
        <BugReportWidget />
        <BackToTop />
        <Routes>
          <Route path="/" element={<DocsPortal />} />
          <Route path="/docs" element={<Navigate to="/" replace />} />
          <Route path="/api-reference" element={<ApiReference />} />
          <Route path="/changelog" element={<Changelog />} />
          <Route path="/status" element={<StatusPage />} />
          <Route path="*" element={<DocsPortal />} />
        </Routes>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <TitleUpdater />
      <ScrollToTop />
      <ErrorBoundary>
        <Suspense fallback={<RouteFallback />}>
          <Toaster />
          <BugReportWidget />
          <ScrollToTopButton />
          <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/admin-signup" element={<AdminSignup />} />
          <Route path="/admin-lobby" element={<AdminLobby />} />
          <Route path="/user-lobby" element={<UserLobby />} />
          <Route path="/not-approved" element={<NotApproved />} />
          <Route path="/contact-sales" element={<ContactSales />} />

          {/* Feature Pages */}
          <Route path="/features/categorization" element={<AutoCategorizationFeature />} />
          <Route path="/features/priority" element={<PriorityDetectionFeature />} />
          <Route path="/features/resolution" element={<SmartResolutionFeature />} />

            {/* Resources Pages */}
            <Route path="/changelog" element={<Changelog />} />
            <Route path="/about-us" element={<AboutUs />} />

            {/* Legal Pages */}
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/security" element={<Security />} />

          {/* Master Admin Portal */}
          <Route path="/master-admin-login" element={<MasterAdminLogin />} />

          <Route element={<MasterAdminProtectedRoute />}>
            <Route element={<MasterAdminLayout />}>
              <Route path="/master-admin/dashboard" element={<MasterAdminDashboard />} />
              <Route path="/master-admin/admin-requests" element={<PendingAdminRequests />} />
              <Route path="/master-admin/companies" element={<AllCompanies />} />
              <Route path="/master-admin/all-admins" element={<AllAdmins />} />
              <Route path="/master-admin/bug-reports" element={<MasterBugReports />} />
            </Route>
          </Route>

          {/* Protected */}
          <Route element={<ProtectedRoute />}>
            <Route path="/*" element={
              <ErrorBoundary>
                <AppLayout />
              </ErrorBoundary>
            } />
          </Route>
        </Routes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
