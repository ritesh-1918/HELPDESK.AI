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
