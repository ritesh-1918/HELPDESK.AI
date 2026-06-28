import { renderHook, waitFor } from '@testing-library/react';
import { useServerAuth } from './useServerAuth';
import { supabase } from '../lib/supabaseClient';
import useAuthStore from '../store/authStore';

jest.mock('../lib/supabaseClient', () => ({
    supabase: {
        auth: {
            getUser: jest.fn(),
        },
        from: jest.fn(),
    },
}));

jest.mock('../store/authStore', () => {
    const state = {
        user: null,
        profile: null,
    };

    const store = {
        getState: jest.fn(() => state),
        setState: jest.fn((patch) => Object.assign(state, patch)),
    };

    return {
        __esModule: true,
        default: store,
    };
});

describe('useServerAuth', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useAuthStore.setState({
            user: null,
            profile: null,
        });
    });

    test('clears stale auth state when the Supabase user lookup is expired', async () => {
        useAuthStore.setState({
            user: {
                id: 'user-1',
                email: 'expired@example.com',
            },
            profile: {
                id: 'user-1',
                role: 'admin',
            },
        });

        supabase.auth.getUser.mockResolvedValue({
            data: { user: null },
            error: { message: 'JWT expired' },
        });

        const { result } = renderHook(() => useServerAuth());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.verified).toBe(false);
        expect(result.current.role).toBeNull();
        expect(useAuthStore.setState).toHaveBeenCalledWith({
            user: null,
            profile: null,
        });
    });

    test('verifies and synchronizes the store when the server profile matches', async () => {
        const user = {
            id: 'user-2',
            email: 'user@example.com',
        };

        const serverProfile = {
            id: 'user-2',
            role: 'support_agent',
            status: 'active',
        };

        supabase.auth.getUser.mockResolvedValue({
            data: { user },
            error: null,
        });

        supabase.from.mockReturnValue({
            select: jest.fn(() => ({
                eq: jest.fn(() => ({
                    single: jest.fn().mockResolvedValue({
                        data: serverProfile,
                        error: null,
                    }),
                })),
            })),
        });

        const { result } = renderHook(() => useServerAuth());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.verified).toBe(true);
        expect(result.current.role).toBe('support_agent');
        expect(useAuthStore.setState).toHaveBeenCalledWith({
            user,
            profile: {
                id: 'user-2',
                role: 'support_agent',
                status: 'active',
            },
        });
    });
});
