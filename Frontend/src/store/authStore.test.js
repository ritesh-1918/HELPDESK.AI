import useAuthStore from './authStore';
import { supabase } from '../lib/supabaseClient';

jest.mock('../config', () => ({
    API_CONFIG: {
        BACKEND_URL: 'http://localhost:5000',
    },
}));

jest.mock('./ticketStore', () => ({
    __esModule: true,
    default: {
        getState: jest.fn(() => ({ clearTicket: jest.fn() })),
        setState: jest.fn(),
    },
}));

jest.mock('../lib/supabaseClient', () => ({
    supabase: {
        from: jest.fn(),
        auth: {
            getUser: jest.fn(),
            signOut: jest.fn(),
            signInWithPassword: jest.fn(),
            signInWithOtp: jest.fn(),
            verifyOtp: jest.fn(),
            signUp: jest.fn(),
            onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
        },
    },
}));

const mockProfileQuery = (result) => {
    const single = jest.fn().mockResolvedValue(result);
    const eq = jest.fn(() => ({ single }));
    const select = jest.fn(() => ({ eq }));

    supabase.from.mockReturnValue({ select });

    return { select, eq, single };
};

describe('authStore profile authorization cache handling', () => {
    const user = {
        id: 'user-123',
        email: 'user@example.com',
        user_metadata: {
            full_name: 'Regular User',
            role: 'admin',
            company: 'Acme',
        },
    };

    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
        useAuthStore.setState({
            user: null,
            profile: null,
            loading: false,
            isCheckingSession: true,
            _initialized: false,
        });
    });

    test('does not return a tampered persisted admin profile before the database profile resolves', async () => {
        const dbProfile = {
            id: user.id,
            email: user.email,
            full_name: 'Regular User',
            role: 'user',
            status: 'active',
            company: 'Acme',
        };
        mockProfileQuery({ data: dbProfile, error: null });

        useAuthStore.setState({
            profile: {
                id: user.id,
                email: user.email,
                full_name: 'Regular User',
                role: 'admin',
                status: 'active',
                company: 'Acme',
            },
        });

        const profile = await useAuthStore.getState().getProfile(user);

        expect(profile).toEqual(dbProfile);
        expect(useAuthStore.getState().profile).toEqual(dbProfile);
        expect(supabase.from).toHaveBeenCalledWith('profiles');
    });

    test('clears hydrated profile while the authoritative profile lookup is pending', () => {
        let resolveSingle;
        const pendingLookup = new Promise((resolve) => {
            resolveSingle = resolve;
        });
        const single = jest.fn(() => pendingLookup);
        const eq = jest.fn(() => ({ single }));
        const select = jest.fn(() => ({ eq }));
        supabase.from.mockReturnValue({ select });

        useAuthStore.setState({
            profile: {
                id: user.id,
                role: 'master_admin',
                status: 'active',
            },
        });

        const profilePromise = useAuthStore.getState().getProfile(user);

        expect(useAuthStore.getState().profile).toBeNull();

        resolveSingle({
            data: {
                id: user.id,
                role: 'user',
                status: 'active',
            },
            error: null,
        });

        return expect(profilePromise).resolves.toMatchObject({ role: 'user' });
    });

    test('metadata fallback cannot grant privileged roles when no database profile exists', async () => {
        mockProfileQuery({
            data: null,
            error: { code: 'PGRST116', message: 'No rows found' },
        });

        const profile = await useAuthStore.getState().getProfile(user);

        expect(profile).toMatchObject({
            id: user.id,
            role: 'user',
            status: 'pending_email_verification',
        });
    });
});

// The following tests cover the Supabase auth integration in authStore, including login, signup, logout, and OTP verification flows.
describe('authStore Supabase auth integration', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        useAuthStore.setState({
            user: null,
            profile: null,
            loading: false,
            isCheckingSession: false,
        });
    });

    test('logs in successfully with valid credentials', async () => {
        const mockUser = {
            id: 'user-123',
            email: 'user@example.com',
            user_metadata: {},
        };

        supabase.auth.signInWithPassword.mockResolvedValue({
            data: { user: mockUser },
            error: null,
        });

        mockProfileQuery({
            data: {
                id: 'user-123',
                role: 'user',
                status: 'active',
                email: 'user@example.com',
            },
            error: null,
        });

        const result = await useAuthStore
            .getState()
            .login('user@example.com', 'Password123');

        expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
            email: 'user@example.com',
            password: 'Password123',
        });

        expect(result.user).toEqual(mockUser);
        expect(result.profile.role).toBe('user');
    });

    test('throws error for invalid login credentials', async () => {
        const mockError = new Error('Invalid login credentials');

        supabase.auth.signInWithPassword.mockResolvedValue({
            data: { user: null },
            error: mockError,
        });

        await expect(
            useAuthStore
                .getState()
                .login('wrong@example.com', 'WrongPassword')
        ).rejects.toThrow('Invalid login credentials');

        expect(supabase.auth.signInWithPassword).toHaveBeenCalled();
    });

    test('signs up successfully with valid data', async () => {
        const mockUser = {
            id: 'new-user-123',
            email: 'newuser@example.com',
            user_metadata: {
                full_name: 'New User',
            },
        };

        supabase.auth.signUp.mockResolvedValue({
            data: { user: mockUser },
            error: null,
        });

        mockProfileQuery({
            data: {
                id: 'new-user-123',
                role: 'user',
                status: 'pending_email_verification',
                email: 'newuser@example.com',
            },
            error: null,
        });

        const result = await useAuthStore.getState().signup(
            'newuser@example.com',
            'Password123',
            'New User'
        );

        expect(supabase.auth.signUp).toHaveBeenCalled();

        expect(result).toEqual(mockUser);
    });

    test('rejects weak passwords during signup', async () => {
        await expect(
            useAuthStore.getState().signup(
                'weak@example.com',
                'weak',
                'Weak User'
            )
        ).rejects.toThrow('Password must be at least 8 characters.');

        expect(supabase.auth.signUp).not.toHaveBeenCalled();
    });

    test('logs out successfully and clears auth state', async () => {
        supabase.auth.signOut.mockResolvedValue({
            error: null,
        });

        useAuthStore.setState({
            user: {
                id: 'user-123',
                email: 'user@example.com',
            },
            profile: {
                id: 'user-123',
                role: 'user',
            },
        });

        await useAuthStore.getState().logout();

        expect(supabase.auth.signOut).toHaveBeenCalled();

        expect(useAuthStore.getState().user).toBeNull();
        expect(useAuthStore.getState().profile).toBeNull();
    });

    test('verifies OTP and logs in successfully', async () => {
        const mockUser = {
            id: 'otp-user',
            email: 'otp@example.com',
            user_metadata: {},
        };

        supabase.auth.verifyOtp.mockResolvedValue({
            data: { user: mockUser },
            error: null,
        });

        mockProfileQuery({
            data: {
                id: 'otp-user',
                role: 'user',
                status: 'active',
                email: 'otp@example.com',
            },
            error: null,
        });

        const result = await useAuthStore
            .getState()
            .verifyOtpAndLogin(
                'otp@example.com',
                '123456'
            );

        expect(supabase.auth.verifyOtp).toHaveBeenCalledWith({
            email: 'otp@example.com',
            token: '123456',
            type: 'magiclink',
        });

        expect(result.user).toEqual(mockUser);
        expect(result.profile.role).toBe('user');
    });

    test('handles OTP verification failure correctly', async () => {
        const mockError = new Error('Invalid OTP');

        supabase.auth.verifyOtp.mockResolvedValue({
            data: { user: null },
            error: mockError,
        });

        await expect(
            useAuthStore
                .getState()
                .verifyOtpAndLogin(
                    'otp@example.com',
                    'wrongotp'
                )
        ).rejects.toThrow('Invalid OTP');
    });
});
