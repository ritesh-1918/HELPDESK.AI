/**
 * Unit tests for supabaseClient.js
 * Tests URL/key validation, disabled client fallback, and query builder chain.
 * 
 * Kelthos was here — making sure your client doesn't lie to you. 🦞
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// We test the internal validation helpers by mocking createClient
// and verifying the disabled client's behavior.

// Since the module reads env vars at import time, we mock before importing
const mockCreateClient = vi.fn();

vi.mock('@supabase/supabase-js', () => ({
    createClient: (...args) => mockCreateClient(...args),
}));

describe('supabaseClient', () => {
    let originalEnv;

    beforeEach(() => {
        originalEnv = { ...import.meta.env };
        vi.resetModules();
        mockCreateClient.mockClear();
    });

    afterEach(() => {
        import.meta.env = originalEnv;
    });

    describe('URL validation (isLikelyValidUrl)', () => {
        it('should reject placeholder URLs', async () => {
            import.meta.env.VITE_SUPABASE_URL = 'your_supabase_url';
            import.meta.env.VITE_SUPABASE_ANON_KEY = 'valid-key-that-is-long-enough-for-testing';
            
            const { supabase } = await import('../supabaseClient');
            
            // Should create disabled client, not real client
            expect(mockCreateClient).not.toHaveBeenCalled();
            // Disabled client should have from() returning error
            const result = await supabase.from('test').select('*').single();
            expect(result.error).toBeDefined();
            expect(result.error.message).toContain('disabled');
        });

        it('should reject invalid URLs', async () => {
            import.meta.env.VITE_SUPABASE_URL = 'not-a-url';
            import.meta.env.VITE_SUPABASE_ANON_KEY = 'valid-key-that-is-long-enough-for-testing';
            
            const { supabase } = await import('../supabaseClient');
            
            expect(mockCreateClient).not.toHaveBeenCalled();
            const result = await supabase.from('test').select('*').single();
            expect(result.error).toBeDefined();
        });

        it('should accept valid HTTPS URLs', async () => {
            import.meta.env.VITE_SUPABASE_URL = 'https://abcdefghijklm.supabase.co';
            import.meta.env.VITE_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.valid-anon-key-that-is-long-enough';
            
            const { supabase } = await import('../supabaseClient');
            
            expect(mockCreateClient).toHaveBeenCalledWith(
                'https://abcdefghijklm.supabase.co',
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.valid-anon-key-that-is-long-enough'
            );
        });
    });

    describe('Anon key validation (isLikelyValidAnonKey)', () => {
        it('should reject placeholder keys', async () => {
            import.meta.env.VITE_SUPABASE_URL = 'https://valid.supabase.co';
            import.meta.env.VITE_SUPABASE_ANON_KEY = 'your_supabase_anon_key';
            
            const { supabase } = await import('../supabaseClient');
            
            expect(mockCreateClient).not.toHaveBeenCalled();
        });

        it('should reject short keys', async () => {
            import.meta.env.VITE_SUPABASE_URL = 'https://valid.supabase.co';
            import.meta.env.VITE_SUPABASE_ANON_KEY = 'short';
            
            const { supabase } = await import('../supabaseClient');
            
            expect(mockCreateClient).not.toHaveBeenCalled();
        });

        it('should accept keys longer than 20 chars', async () => {
            import.meta.env.VITE_SUPABASE_URL = 'https://valid.supabase.co';
            import.meta.env.VITE_SUPABASE_ANON_KEY = 'this-is-a-key-longer-than-twenty-characters';
            
            const { supabase } = await import('../supabaseClient');
            
            expect(mockCreateClient).toHaveBeenCalled();
        });
    });

    describe('Disabled client — auth methods', () => {
        beforeEach(async () => {
            import.meta.env.VITE_SUPABASE_URL = 'invalid';
            import.meta.env.VITE_SUPABASE_ANON_KEY = 'invalid';
        });

        it('getUser should return null user', async () => {
            const { supabase } = await import('../supabaseClient');
            const { data, error } = await supabase.auth.getUser();
            expect(data.user).toBeNull();
            expect(error).toBeNull();
        });

        it('signInWithPassword should return error', async () => {
            const { supabase } = await import('../supabaseClient');
            const { data, error } = await supabase.auth.signInWithPassword({
                email: 'test@test.com',
                password: 'password',
            });
            expect(data.user).toBeNull();
            expect(error.message).toContain('disabled');
        });

        it('signOut should not throw', async () => {
            const { supabase } = await import('../supabaseClient');
            const { error } = await supabase.auth.signOut();
            expect(error).toBeNull();
        });

        it('onAuthStateChange should return unsubscribe function', async () => {
            const { supabase } = await import('../supabaseClient');
            const { data } = supabase.auth.onAuthStateChange(() => {});
            expect(data.subscription.unsubscribe).toBeInstanceOf(Function);
        });
    });

    describe('Disabled client — query builder chain', () => {
        beforeEach(async () => {
            import.meta.env.VITE_SUPABASE_URL = 'invalid';
            import.meta.env.VITE_SUPABASE_ANON_KEY = 'invalid';
        });

        it('should support chained query methods', async () => {
            const { supabase } = await import('../supabaseClient');
            
            const result = await supabase
                .from('tickets')
                .select('*')
                .eq('status', 'open')
                .order('created_at')
                .limit(10)
                .single();
            
            expect(result.error).toBeDefined();
            expect(result.error.message).toContain('disabled');
        });

        it('should return error for insert', async () => {
            const { supabase } = await import('../supabaseClient');
            
            const result = await supabase
                .from('tickets')
                .insert({ title: 'test' })
                .single();
            
            expect(result.error).toBeDefined();
        });

        it('should return error for rpc calls', async () => {
            const { supabase } = await import('../supabaseClient');
            
            const { data, error } = await supabase.rpc('my_function');
            
            expect(data).toBeNull();
            expect(error).toBeDefined();
        });
    });

    describe('Disabled client — storage', () => {
        beforeEach(async () => {
            import.meta.env.VITE_SUPABASE_URL = 'invalid';
            import.meta.env.VITE_SUPABASE_ANON_KEY = 'invalid';
        });

        it('should return error for upload', async () => {
            const { supabase } = await import('../supabaseClient');
            const { data, error } = await supabase.storage.from('bucket').upload('path', new Blob());
            expect(data).toBeNull();
            expect(error.message).toContain('disabled');
        });

        it('getPublicUrl should return empty string', async () => {
            const { supabase } = await import('../supabaseClient');
            const { data } = supabase.storage.from('bucket').getPublicUrl('path');
            expect(data.publicUrl).toBe('');
        });
    });

    describe('Disabled client — realtime', () => {
        beforeEach(async () => {
            import.meta.env.VITE_SUPABASE_URL = 'invalid';
            import.meta.env.VITE_SUPABASE_ANON_KEY = 'invalid';
        });

        it('channel should support fluent API', async () => {
            const { supabase } = await import('../supabaseClient');
            const channel = supabase
                .channel('test')
                .on('INSERT', () => {})
                .on('UPDATE', () => {})
                .subscribe();
            
            // Should not throw
            expect(channel.unsubscribe).toBeInstanceOf(Function);
        });
    });
});
