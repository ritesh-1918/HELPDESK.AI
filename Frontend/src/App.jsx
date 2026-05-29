import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation
} from "react-router-dom";
import React, { Suspense, useEffect, lazy } from "react";
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

function AppLayout() {
  const { user, profile } = useAuthStore();

  // Initialize Global Realtime Notifications Listener
  useRealtimeNotifications();

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
      <Routes>
        <Route path="/knowledge-check" element={<DuplicateDetection />} />
        <Route path="/auto-resolve" element={<AutoResolveChat />} />
        <Route path="/resolved" element={<Resolved />} />

        {/* --- User Portal --- */}
        <Route element={
          profile?.role === 'master_admin' ? <Navigate to="/master-admin/dashboard" replace /> :
            (profile?.role === 'admin' || profile?.role === 'super_admin') ? <Navigate to="/admin/dashboard" replace /> :
              profile?.status === 'pending_approval' ? <Navigate to="/user-lobby" replace /> :
                profile?.status === 'rejected' ? <Navigate to="/not-approved" replace /> :
                  <UserLayout />
        }>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create-ticket" element={<CreateTicket />} />
          <Route path="/my-tickets" element={<MyTickets />} />
          <Route path="/ticket/:ticket_id" element={<TicketDetail />} />
          <Route path="/ai-processing" element={<AIProcessing />} />
          <Route path="/ai-understanding" element={<AIUnderstanding />} />
          <Route path="/ticket-tracking" element={<TicketTracking />} />
          <Route path="/ticket-result" element={<TicketResult />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/help" element={<Help />} />
          <Route path="/notifications" element={<Notifications />} />
        </Route>

        {/* --- Admin Portal (Protected) --- */}
        <Route element={<AdminProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/tickets" element={<AdminTickets />} />
            <Route path="/admin/ticket/:ticket_id" element={<AdminTicketDetail />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
            <Route path="/admin/profile" element={<AdminProfile />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
            <Route path="/admin/sla" element={<SLAPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}


function App() {
  const { initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <BrowserRouter>
      <TitleUpdater />
      <ScrollToTop />
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
            <Route path="/*" element={<AppLayout />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;

