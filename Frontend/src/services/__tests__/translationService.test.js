/**
 * Unit tests for translationService.js
 * Tests translateText API calls, language config, error handling, and edge cases.
 * 
 * Kelthos was here — testing in 12 languages. 🦞
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { translateText, SUPPORTED_LANGUAGES } from '../translationService';

describe('translationService', () => {
    let originalFetch;

    beforeEach(() => {
        originalFetch = globalThis.fetch;
        globalThis.fetch = vi.fn();
    });

    afterEach(() => {
        globalThis.fetch = originalFetch;
    });

    // ── Language Configuration ─────────────────────────────────

    describe('SUPPORTED_LANGUAGES', () => {
        it('should include at least 10 languages', () => {
            expect(SUPPORTED_LANGUAGES.length).toBeGreaterThanOrEqual(10);
        });

        it('should include English', () => {
            const en = SUPPORTED_LANGUAGES.find(l => l.code === 'en');
            expect(en).toBeDefined();
            expect(en.label).toContain('English');
        });

        it('should include major Indian languages', () => {
            const codes = SUPPORTED_LANGUAGES.map(l => l.code);
            expect(codes).toContain('hi');  // Hindi
            expect(codes).toContain('te');  // Telugu
            expect(codes).toContain('ta');  // Tamil
            expect(codes).toContain('kn');  // Kannada
            expect(codes).toContain('ml');  // Malayalam
            expect(codes).toContain('mr');  // Marathi
            expect(codes).toContain('bn');  // Bengali
        });

        it('should include European languages', () => {
            const codes = SUPPORTED_LANGUAGES.map(l => l.code);
            expect(codes).toContain('fr');  // French
            expect(codes).toContain('de');  // German
            expect(codes).toContain('es');  // Spanish
        });

        it('each language should have code, label, and nativeName', () => {
            for (const lang of SUPPORTED_LANGUAGES) {
                expect(lang.code).toBeTruthy();
                expect(lang.label).toBeTruthy();
                expect(lang.nativeName).toBeTruthy();
            }
        });

        it('language codes should be unique', () => {
            const codes = SUPPORTED_LANGUAGES.map(l => l.code);
            expect(new Set(codes).size).toBe(codes.length);
        });
    });

    // ── translateText — Happy Path ─────────────────────────────

    it('should translate text and return translated result', async () => {
        globalThis.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                responseStatus: 200,
                responseData: { translatedText: 'नमस्ते दुनिया' }
            })
        });

        const result = await translateText('Hello world', 'en', 'hi');
        expect(result).toBe('नमस्ते दुनिया');
    });

    it('should call MyMemory API with correct params', async () => {
        globalThis.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                responseStatus: 200,
                responseData: { translatedText: 'Bonjour' }
            })
        });

        await translateText('Hello', 'en', 'fr');

        expect(globalThis.fetch).toHaveBeenCalledTimes(1);
        const callUrl = globalThis.fetch.mock.calls[0][0];
        expect(callUrl).toContain('api.mymemory.translated.net');
        expect(callUrl).toContain('q=Hello');
        expect(callUrl).toContain('langpair=en%7Cfr');
    });

    it('should URL-encode special characters in text', async () => {
        globalThis.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                responseStatus: 200,
                responseData: { translatedText: 'test' }
            })
        });

        await translateText('Hello & goodbye', 'en', 'es');

        const callUrl = globalThis.fetch.mock.calls[0][0];
        expect(callUrl).toContain('Hello%20%26%20goodbye');
    });

    // ── Edge Cases ──────────────────────────────────────────────

    it('should return original text when fromLang equals toLang', async () => {
        const result = await translateText('Hello', 'en', 'en');
        expect(result).toBe('Hello');
        expect(globalThis.fetch).not.toHaveBeenCalled();
    });

    it('should return original text for empty string', async () => {
        const result = await translateText('', 'en', 'fr');
        expect(result).toBe('');
        expect(globalThis.fetch).not.toHaveBeenCalled();
    });

    it('should return original text for whitespace-only string', async () => {
        const result = await translateText('   ', 'en', 'fr');
        expect(result).toBe('   ');
        expect(globalThis.fetch).not.toHaveBeenCalled();
    });

    it('should return original text for null/undefined input', async () => {
        const result1 = await translateText(null, 'en', 'fr');
        const result2 = await translateText(undefined, 'en', 'fr');
        expect(result1).toBe(null);
        expect(result2).toBe(undefined);
        expect(globalThis.fetch).not.toHaveBeenCalled();
    });

    // ── Error Handling / Graceful Degradation ───────────────────

    it('should return original text on API HTTP error', async () => {
        globalThis.fetch.mockResolvedValueOnce({
            ok: false,
            status: 500,
        });

        const result = await translateText('Hello', 'en', 'fr');
        expect(result).toBe('Hello');  // Graceful degradation
    });

    it('should return original text on API response error', async () => {
        globalThis.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                responseStatus: 403,
                responseDetails: 'Rate limit exceeded'
            })
        });

        const result = await translateText('Hello', 'en', 'fr');
        expect(result).toBe('Hello');  // Graceful degradation
    });

    it('should return original text on network failure', async () => {
        globalThis.fetch.mockRejectedValueOnce(new Error('Network error'));

        const result = await translateText('Hello', 'en', 'fr');
        expect(result).toBe('Hello');  // Never throws
    });

    it('should never throw, even for unexpected errors', async () => {
        globalThis.fetch.mockImplementationOnce(() => {
            throw new Error('Unexpected');
        });

        // Should not throw
        const result = await translateText('Hello', 'en', 'fr');
        expect(result).toBe('Hello');
    });

    // ── Long Text ───────────────────────────────────────────────

    it('should handle long text input', async () => {
        const longText = 'A'.repeat(1000);
        globalThis.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                responseStatus: 200,
                responseData: { translatedText: 'B'.repeat(1000) }
            })
        });

        const result = await translateText(longText, 'en', 'fr');
        expect(result).toBe('B'.repeat(1000));
    });

    // ── Special Characters ──────────────────────────────────────

    it('should handle text with emojis', async () => {
        globalThis.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                responseStatus: 200,
                responseData: { translatedText: 'Hello 😊' }
            })
        });

        const result = await translateText('Hello 😊', 'en', 'es');
        expect(result).toBe('Hello 😊');
    });
});
