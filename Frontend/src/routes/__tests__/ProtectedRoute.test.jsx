/**
 * @vitest-environment jsdom
 */
import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

// ─── Mock components ────────────────────────────────────────────────────────

const DashboardPage = () => <div data-testid="dashboard">Dashboard</div>;
const AdminPage = () => <div data-testid="admin">Admin Panel</div>;
const LoginPage = () => <div data-testid="login">Login Page</div>;

// ─── Mock useAuthStore ──────────────────────────────────────────────────────

const mockGetState = vi.fn();

vi.mock('../../store/authStore', () => {
    const useAuthStore = (selector) => {
        const state = mockGetState();
        return typeof selector === 'function' ? selector(state) : state;
    };
    return { default: useAuthStore };
});

// Now import the component — the mock is in place
import ProtectedRoute, { AdminRoute } from '../ProtectedRoute';

// ─── Helpers ────────────────────────────────────────────────────────────────

const renderProtected = (initialEntries = ['/protected']) =>
    render(
        <MemoryRouter initialEntries={initialEntries}>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/protected" element={
                    <ProtectedRoute><DashboardPage /></ProtectedRoute>
                } />
                <Route path="/admin" element={
                    <AdminRoute><AdminPage /></AdminRoute>
                } />
            </Routes>
        </MemoryRouter>
    );

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('ProtectedRoute', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockGetState.mockReturnValue({
            user: null,
            profile: null,
            isCheckingSession: false,
            verifyServerRole: vi.fn().mockResolvedValue(false),
        });
    });

    it('shows loading skeleton while checking session', () => {
        mockGetState.mockReturnValue({
            user: null,
            profile: null,
            isCheckingSession: true,
            verifyServerRole: vi.fn(),
        });

        renderProtected(['/protected']);

        expect(screen.getByText(/verifying access/i)).toBeInTheDocument();
        expect(screen.queryByTestId('dashboard')).not.toBeInTheDocument();
    });

    it('redirects to /login when not authenticated', async () => {
        mockGetState.mockReturnValue({
            user: null,
            profile: null,
            isCheckingSession: false,
            verifyServerRole: vi.fn(),
        });

        renderProtected(['/protected']);

        await waitFor(() => {
            expect(screen.getByTestId('login')).toBeInTheDocument();
        });
    });

    it('renders children when authenticated (no role required)', async () => {
        mockGetState.mockReturnValue({
            user: { id: 'user-1', email: 'test@example.com' },
            profile: { id: 'user-1', role: 'user', status: 'active' },
            isCheckingSession: false,
            verifyServerRole: vi.fn(),
        });

        renderProtected(['/protected']);

        await waitFor(() => {
            expect(screen.getByTestId('dashboard')).toBeInTheDocument();
        });
    });

    it('redirects to /login when not authenticated (admin route)', async () => {
        mockGetState.mockReturnValue({
            user: null,
            profile: null,
            isCheckingSession: false,
            verifyServerRole: vi.fn(),
        });

        renderProtected(['/admin']);

        await waitFor(() => {
            expect(screen.getByTestId('login')).toBeInTheDocument();
        });
    });

    it('verifies admin role against database, not local state', async () => {
        const verifyServerRole = vi.fn().mockResolvedValue(true);

        mockGetState.mockReturnValue({
            user: { id: 'admin-1', email: 'admin@example.com' },
            profile: { id: 'admin-1', role: 'admin', status: 'active' },
            isCheckingSession: false,
            verifyServerRole,
        });

        renderProtected(['/admin']);

        await waitFor(() => {
            expect(verifyServerRole).toHaveBeenCalledWith('admin-1');
            expect(screen.getByTestId('admin')).toBeInTheDocument();
        });
    });

    it('redirects non-admin users away from admin routes', async () => {
        const verifyServerRole = vi.fn().mockResolvedValue(false);

        mockGetState.mockReturnValue({
            user: { id: 'user-1', email: 'user@example.com' },
            profile: { id: 'user-1', role: 'user', status: 'active' },
            isCheckingSession: false,
            verifyServerRole,
        });

        renderProtected(['/admin']);

        await waitFor(() => {
            expect(screen.getByTestId('dashboard')).toBeInTheDocument();
            expect(screen.queryByTestId('admin')).not.toBeInTheDocument();
        });
    });

    it('shows loading skeleton while role is being verified', () => {
        const verifyServerRole = vi.fn().mockReturnValue(new Promise(() => {}));

        mockGetState.mockReturnValue({
            user: { id: 'user-1', email: 'user@example.com' },
            profile: { id: 'user-1', role: 'user', status: 'active' },
            isCheckingSession: false,
            verifyServerRole,
        });

        renderProtected(['/admin']);

        expect(screen.getByText(/verifying access/i)).toBeInTheDocument();
        expect(screen.queryByTestId('admin')).not.toBeInTheDocument();
    });
});
