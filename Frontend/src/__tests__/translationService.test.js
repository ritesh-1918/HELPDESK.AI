/**
 * Unit tests for translationService.js
 *
 * Tests cover:
 * - Same language short-circuit
 * - Empty text handling
 * - API error graceful degradation
 * - Supported language codes
 */

import { translateText, SUPPORTED_LANGUAGES } from '../services/translationService';

// Mock global fetch
global.fetch = jest.fn();

describe('translationService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('SUPPORTED_LANGUAGES', () => {
        it('should contain at least 10 languages', () => {
            expect(SUPPORTED_LANGUAGES.length).toBeGreaterThanOrEqual(10);
        });

        it('should include English', () => {
            const english = SUPPORTED_LANGUAGES.find(lang => lang.code === 'en');
            expect(english).toBeDefined();
            expect(english.label).toContain('English');
        });

        it('should include Hindi', () => {
            const hindi = SUPPORTED_LANGUAGES.find(lang => lang.code === 'hi');
            expect(hindi).toBeDefined();
        });

        it('each language should have code, label, and nativeName', () => {
            SUPPORTED_LANGUAGES.forEach(lang => {
                expect(lang).toHaveProperty('code');
                expect(lang).toHaveProperty('label');
                expect(lang).toHaveProperty('nativeName');
                expect(typeof lang.code).toBe('string');
                expect(lang.code.length).toBe(2);
            });
        });
    });

    describe('translateText - short-circuit behavior', () => {
        it('should return original text when fromLang equals toLang', async () => {
            const result = await translateText('Hello world', 'en', 'en');
            expect(result).toBe('Hello world');
            expect(fetch).not.toHaveBeenCalled();
        });

        it('should return original text when text is empty string', async () => {
            const result = await translateText('', 'en', 'hi');
            expect(result).toBe('');
            expect(fetch).not.toHaveBeenCalled();
        });

        it('should return original text when text is null', async () => {
            const result = await translateText(null, 'en', 'hi');
            expect(result).toBeNull();
            expect(fetch).not.toHaveBeenCalled();
        });

        it('should return original text when text is undefined', async () => {
            const result = await translateText(undefined, 'en', 'hi');
            expect(result).toBeUndefined();
            expect(fetch).not.toHaveBeenCalled();
        });

        it('should return original text when text is whitespace only', async () => {
            const result = await translateText('   ', 'en', 'hi');
            expect(result).toBe('   ');
            expect(fetch).not.toHaveBeenCalled();
        });
    });

    describe('translateText - successful translation', () => {
        it('should return translated text on successful API response', async () => {
            const mockTranslation = 'नमस्ते दुनिया';
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    responseStatus: 200,
                    responseData: {
                        translatedText: mockTranslation
                    }
                })
            });

            const result = await translateText('Hello world', 'en', 'hi');
            expect(result).toBe(mockTranslation);
        });

        it('should call the correct API URL with encoded parameters', async () => {
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    responseStatus: 200,
                    responseData: { translatedText: 'Bonjour' }
                })
            });

            await translateText('Hello', 'en', 'fr');

            const calledUrl = fetch.mock.calls[0][0];
            expect(calledUrl).toContain('api.mymemory.translated.net');
            expect(calledUrl).toContain('langpair=en%7Cfr');
            expect(calledUrl).toContain('q=Hello');
        });
    });

    describe('translateText - graceful degradation on errors', () => {
        it('should return original text when API returns non-ok status', async () => {
            fetch.mockResolvedValueOnce({
                ok: false,
                status: 500
            });

            const result = await translateText('Hello', 'en', 'hi');
            expect(result).toBe('Hello');
        });

        it('should return original text when API responseStatus is not 200', async () => {
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    responseStatus: 403,
                    responseDetails: 'Forbidden'
                })
            });

            const result = await translateText('Hello', 'en', 'hi');
            expect(result).toBe('Hello');
        });

        it('should return original text when fetch throws a network error', async () => {
            fetch.mockRejectedValueOnce(new Error('Network error'));

            const result = await translateText('Hello', 'en', 'hi');
            expect(result).toBe('Hello');
        });

        it('should return original text when fetch times out', async () => {
            fetch.mockRejectedValueOnce(new DOMException('The operation was aborted', 'AbortError'));

            const result = await translateText('Hello', 'en', 'hi');
            expect(result).toBe('Hello');
        });
    });
});
