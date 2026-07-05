/**
 * Tests for supabaseClient.js
 * Covers URL/key validation, query builder chain, and disabled client fallback.
 */

import { describe, it, expect, vi } from 'vitest';
import {
    isLikelyValidUrl,
    isLikelyValidAnonKey,
    makeQueryBuilder,
    createDisabledSupabaseClient,
    INVALID_MARKERS,
    disabledMessage,
} from './supabaseClient';

describe('isLikelyValidUrl', () => {
    it('returns true for valid https URL', () => {
        expect(isLikelyValidUrl('https://example.supabase.co')).toBe(true);
    });

    it('returns true for valid http URL', () => {
        expect(isLikelyValidUrl('http://localhost:54321')).toBe(true);
    });

    it('returns false for empty string', () => {
        expect(isLikelyValidUrl('')).toBe(false);
    });

    it('returns false for null', () => {
        expect(isLikelyValidUrl(null)).toBe(false);
    });

    it('returns false for undefined', () => {
        expect(isLikelyValidUrl(undefined)).toBe(false);
    });

    it('returns false for invalid marker values', () => {
        for (const marker of INVALID_MARKERS) {
            expect(isLikelyValidUrl(marker)).toBe(false);
        }
    });

    it('returns false for non-URL strings', () => {
        expect(isLikelyValidUrl('not-a-url')).toBe(false);
    });

    it('returns false for ftp protocol', () => {
        expect(isLikelyValidUrl('ftp://files.example.com')).toBe(false);
    });
});

describe('isLikelyValidAnonKey', () => {
    it('returns true for long non-marker string', () => {
        expect(isLikelyValidAnonKey('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9abcdef')).toBe(true);
    });

    it('returns false for empty string', () => {
        expect(isLikelyValidAnonKey('')).toBe(false);
    });

    it('returns false for null', () => {
        expect(isLikelyValidAnonKey(null)).toBe(false);
    });

    it('returns false for undefined', () => {
        expect(isLikelyValidAnonKey(undefined)).toBe(false);
    });

    it('returns false for short strings', () => {
        expect(isLikelyValidAnonKey('short')).toBe(false);
    });

    it('returns false for invalid marker values', () => {
        for (const marker of INVALID_MARKERS) {
            expect(isLikelyValidAnonKey(marker)).toBe(false);
        }
    });

    it('returns true for exactly 21 character string', () => {
        expect(isLikelyValidAnonKey('a'.repeat(21))).toBe(true);
    });

    it('returns false for exactly 20 character string', () => {
        expect(isLikelyValidAnonKey('a'.repeat(20))).toBe(false);
    });
});

describe('makeQueryBuilder', () => {
    it('returns a builder with all chainable methods', () => {
        const builder = makeQueryBuilder();
        const chainableMethods = [
            'select', 'insert', 'update', 'upsert', 'delete',
            'eq', 'neq', 'gt', 'gte', 'lt', 'lte',
            'like', 'ilike', 'in', 'is',
            'order', 'limit', 'range',
        ];
        for (const method of chainableMethods) {
            expect(typeof builder[method]).toBe('function');
            // Each chainable method should return the builder itself
            expect(builder[method]()).toBe(builder);
        }
    });

    it('single() returns a promise with disabled error', async () => {
        const builder = makeQueryBuilder();
        const result = await builder.single();
        expect(result.data).toBeNull();
        expect(result.error).toEqual({ message: disabledMessage });
        expect(result.count).toBe(0);
    });

    it('maybeSingle() returns a promise with disabled error', async () => {
        const builder = makeQueryBuilder();
        const result = await builder.maybeSingle();
        expect(result.data).toBeNull();
        expect(result.error).toEqual({ message: disabledMessage });
        expect(result.count).toBe(0);
    });

    it('supports full chain pattern', async () => {
        const builder = makeQueryBuilder();
        const result = await builder
            .select('*')
            .eq('company_id', 'test')
            .order('created_at', { ascending: false })
            .limit(10)
            .range(0, 9);
        expect(result.data).toBeNull();
        expect(result.error).toEqual({ message: disabledMessage });
    });
});

describe('createDisabledSupabaseClient', () => {
    let client;

    beforeEach(() => {
        client = createDisabledSupabaseClient();
    });

    describe('auth', () => {
        it('getUser returns null user', async () => {
            const result = await client.auth.getUser();
            expect(result.data.user).toBeNull();
            expect(result.error).toBeNull();
        });

        it('getSession returns null session', async () => {
            const result = await client.auth.getSession();
            expect(result.data.session).toBeNull();
            expect(result.error).toBeNull();
        });

        it('onAuthStateChange returns subscription with unsubscribe', () => {
            const result = client.auth.onAuthStateChange(() => {});
            expect(typeof result.data.subscription.unsubscribe).toBe('function');
        });

        it('signInWithOAuth returns disabled error', async () => {
            const result = await client.auth.signInWithOAuth({ provider: 'google' });
            expect(result.data).toBeNull();
            expect(result.error).toEqual({ message: disabledMessage });
        });

        it('signInWithPassword returns disabled error', async () => {
            const result = await client.auth.signInWithPassword({ email: 'test@test.com', password: 'pass' });
            expect(result.data.user).toBeNull();
            expect(result.error).toEqual({ message: disabledMessage });
        });

        it('signUp returns disabled error', async () => {
            const result = await client.auth.signUp({ email: 'test@test.com', password: 'pass' });
            expect(result.data.user).toBeNull();
            expect(result.error).toEqual({ message: disabledMessage });
        });

        it('signOut returns no error', async () => {
            const result = await client.auth.signOut();
            expect(result.error).toBeNull();
        });

        it('resetPasswordForEmail returns disabled error', async () => {
            const result = await client.auth.resetPasswordForEmail('test@test.com');
            expect(result.data).toBeNull();
            expect(result.error).toEqual({ message: disabledMessage });
        });

        it('updateUser returns disabled error', async () => {
            const result = await client.auth.updateUser({ email: 'new@test.com' });
            expect(result.data).toBeNull();
            expect(result.error).toEqual({ message: disabledMessage });
        });
    });

    describe('from()', () => {
        it('returns a query builder', () => {
            const builder = client.from('tickets');
            expect(builder).toBeDefined();
            expect(typeof builder.select).toBe('function');
        });

        it('query builder returns disabled error on execute', async () => {
            const result = await client.from('tickets').select('*');
            expect(result.data).toBeNull();
            expect(result.error).toEqual({ message: disabledMessage });
        });
    });

    describe('rpc()', () => {
        it('returns disabled error', async () => {
            const result = await client.rpc('some_function');
            expect(result.data).toBeNull();
            expect(result.error).toEqual({ message: disabledMessage });
        });
    });

    describe('channel()', () => {
        it('returns a channel with on/subscribe/unsubscribe', () => {
            const channel = client.channel('test');
            expect(typeof channel.on).toBe('function');
            expect(typeof channel.subscribe).toBe('function');
            expect(typeof channel.unsubscribe).toBe('function');
            // on and subscribe should return the channel for chaining
            expect(channel.on()).toBe(channel);
            expect(channel.subscribe()).toBe(channel);
        });
    });

    describe('storage', () => {
        it('from() returns upload/download/remove methods', async () => {
            const bucket = client.storage.from('avatars');
            expect(typeof bucket.upload).toBe('function');
            expect(typeof bucket.download).toBe('function');
            expect(typeof bucket.remove).toBe('function');
            expect(typeof bucket.getPublicUrl).toBe('function');

            const uploadResult = await bucket.upload('path', 'data');
            expect(uploadResult.error).toEqual({ message: disabledMessage });

            const downloadResult = await bucket.download('path');
            expect(downloadResult.error).toEqual({ message: disabledMessage });

            const removeResult = await bucket.remove(['path']);
            expect(removeResult.error).toEqual({ message: disabledMessage });

            const urlResult = bucket.getPublicUrl('path');
            expect(urlResult.data.publicUrl).toBe('');
        });
    });

    describe('functions', () => {
        it('invoke returns disabled error', async () => {
            const result = await client.functions.invoke('my-function');
            expect(result.data).toBeNull();
            expect(result.error).toEqual({ message: disabledMessage });
        });
    });
});

describe('INVALID_MARKERS', () => {
    it('contains expected marker values', () => {
        expect(INVALID_MARKERS.has('your_supabase_url')).toBe(true);
        expect(INVALID_MARKERS.has('your_project_url')).toBe(true);
        expect(INVALID_MARKERS.has('your_supabase_anon_key')).toBe(true);
        expect(INVALID_MARKERS.has('your_key')).toBe(true);
    });

    it('has exactly 4 entries', () => {
        expect(INVALID_MARKERS.size).toBe(4);
    });
});
