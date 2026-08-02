import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import useServerAuth from './useServerAuth';

// ── Mock Dependencies ──────────────────────────────────────────────────────

vi.mock('../lib/supabaseClient', () => {
    return {
        supabase: {
            auth: {
                getUser: vi.fn(),
            },
            from: vi.fn(() => ({
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                single: vi.fn(),
            })),
        },
    };
});

let mockStoreState = { user: null, profile: null };
const mockSetState = vi.fn((newState) => {
    mockStoreState = { ...mockStoreState, ...newState };
});

vi.mock('../store/authStore', () => {
    const useAuthStore = vi.fn((selector) => {
        if (selector) return selector({ _set: mockSetState });
        return mockStoreState;
    });
    useAuthStore.getState = vi.fn(() => mockStoreState);
    useAuthStore.setState = mockSetState;
    return { default: useAuthStore };
});

import { supabase } from '../lib/supabaseClient';
import useAuthStore from '../store/authStore';

// ── Test Suites ────────────────────────────────────────────────────────────

describe('useServerAuth', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockStoreState = { user: null, profile: null };
    });

    it('returns verified: false when token is expired or invalid (getUser returns error)', async () => {
        // Arrange
        supabase.auth.getUser.mockResolvedValueOnce({
            data: { user: null },
            error: new Error('Token expired'),
        });

        // Act
        const { result } = renderHook(() => useServerAuth());

        // Assert initial state
        expect(result.current.loading).toBe(true);
        expect(result.current.verified).toBe(false);

        // Wait for async operations to complete
        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.verified).toBe(false);
        expect(result.current.role).toBeNull();
    });

    it('returns verified: false when profile fetch fails', async () => {
        // Arrange
        supabase.auth.getUser.mockResolvedValueOnce({
            data: { user: { id: 'user-123' } },
            error: null,
        });

        const singleMock = vi.fn().mockResolvedValueOnce({
            data: null,
            error: new Error('Profile not found'),
        });
        
        supabase.from.mockReturnValueOnce({
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: singleMock,
        });

        // Act
        const { result } = renderHook(() => useServerAuth());

        // Wait for async operations to complete
        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.verified).toBe(false);
        expect(result.current.role).toBeNull();
    });

    it('detects tampering and clears store if cached role differs from server role', async () => {
        // Arrange
        mockStoreState = {
            user: { id: 'user-123' },
            profile: { role: 'admin' }, // Tampered in localStorage to be admin
        };

        supabase.auth.getUser.mockResolvedValueOnce({
            data: { user: { id: 'user-123' } },
            error: null,
        });

        const singleMock = vi.fn().mockResolvedValueOnce({
            data: { id: 'user-123', role: 'user', status: 'active' }, // Server says user
            error: null,
        });
        
        supabase.from.mockReturnValueOnce({
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: singleMock,
        });

        // Act
        const { result } = renderHook(() => useServerAuth());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.verified).toBe(false);
        expect(result.current.role).toBeNull();
        expect(useAuthStore.setState).toHaveBeenCalledWith({ user: null, profile: null });
    });

    it('returns verified: true and syncs store on successful validation', async () => {
        // Arrange
        mockStoreState = {
            user: { id: 'user-123' },
            profile: { role: 'admin' },
        };

        const mockUser = { id: 'user-123', email: 'test@example.com' };
        supabase.auth.getUser.mockResolvedValueOnce({
            data: { user: mockUser },
            error: null,
        });

        const mockServerProfile = { id: 'user-123', role: 'admin', status: 'active' };
        const singleMock = vi.fn().mockResolvedValueOnce({
            data: mockServerProfile,
            error: null,
        });
        
        supabase.from.mockReturnValueOnce({
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: singleMock,
        });

        // Act
        const { result } = renderHook(() => useServerAuth());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.verified).toBe(true);
        expect(result.current.role).toBe('admin');
        
        // Assert store sync
        expect(useAuthStore.setState).toHaveBeenCalledWith({
            user: mockUser,
            profile: { ...mockStoreState.profile, ...mockServerProfile },
        });
    });
});
