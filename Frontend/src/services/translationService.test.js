import { describe, it, expect, vi } from 'vitest';
import { translateText, SUPPORTED_LANGUAGES } from './translationService';

describe('translateText', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('returns same text when empty', async () => {
    expect(await translateText('')).toBe('');
  });

  it('skips API when source and target match', async () => {
    const spy = vi.fn();
    globalThis.fetch = spy;

    const out = await translateText('halo', 'en', 'en');
    expect(out).toBe('halo');
    expect(spy).not.toHaveBeenCalled();
  });

  it('returns translated text on success', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        responseData: { translatedText: 'ciao' },
        responseStatus: 200,
      }),
    });

    expect(await translateText('halo', 'en', 'it')).toBe('ciao');
  });

  it('propagates response failure', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        responseStatus: 500,
        responseDetails: 'API limit reached',
      }),
    });

    expect(await translateText('halo', 'en', 'it')).toBe('halo');
  });

  it('gracefully returns original text on network failure', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('network'));

    expect(await translateText('halo', 'en', 'it')).toBe('halo');
  });

  it('gracefully returns original text on HTTP failure', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
    });

    expect(await translateText('halo', 'en', 'it')).toBe('halo');
  });
});

describe('SUPPORTED_LANGUAGES', () => {
  it('contains at least 10 languages', () => {
    expect(SUPPORTED_LANGUAGES.length).toBeGreaterThanOrEqual(10);
  });

  it('each entry has code and label', () => {
    for (const lang of SUPPORTED_LANGUAGES) {
      expect(typeof lang.code).toBe('string');
      expect(typeof lang.label).toBe('string');
    }
  });
});
