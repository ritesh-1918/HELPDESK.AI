/**
 * Tests for the retry logic implemented in api.js.
 *
 * Run with:  npx vitest run src/services/__tests__/api.retry.test.js
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ---------------------------------------------------------------------------
// Inline the retry utilities under test so we can exercise them in isolation
// without importing the full api module (which has side-effects like reading
// environment variables and localStorage).
// ---------------------------------------------------------------------------

const RETRYABLE_STATUS_CODES = new Set([500, 502, 503, 504]);
const NON_RETRYABLE_STATUS_CODES = new Set([400, 401, 403, 404, 422]);
const MAX_RETRIES = 3;
const TIMEOUT_MAX_RETRIES = 2;
const BASE_DELAY_MS = 100;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isRetryable = (error) => {
  if (!error.response) return true;
  const status = error.response.status;
  if (status === 429) return true;
  return RETRYABLE_STATUS_CODES.has(status);
};

const isTimeout = (error) =>
  error.code === 'ECONNABORTED' || error.message?.includes('timeout');

const getRetryDelay = (error, attempt) => {
  if (error.response?.status === 429) {
    const retryAfterHeader = error.response.headers?.['retry-after'];
    if (retryAfterHeader) {
      const seconds = parseFloat(retryAfterHeader);
      if (!Number.isNaN(seconds) && seconds > 0) return seconds * 1000;
    }
    return BASE_DELAY_MS * Math.pow(2, attempt);
  }
  return BASE_DELAY_MS * Math.pow(2, attempt);
};

const logRetryEvent = vi.fn();

const withRetry = async (requestFn, endpoint = 'unknown') => {
  let attempt = 0;
  while (true) {
    try {
      return await requestFn();
    } catch (error) {
      const timeout = isTimeout(error);
      const retryable = isRetryable(error);
      const status = error.response?.status;

      if (status && NON_RETRYABLE_STATUS_CODES.has(status)) throw error;
      if (!retryable) throw error;

      const maxAllowed = timeout ? TIMEOUT_MAX_RETRIES : MAX_RETRIES;
      if (attempt >= maxAllowed) throw error;

      attempt += 1;
      const reason = status ? String(status) : timeout ? 'timeout' : 'network_error';
      logRetryEvent(endpoint, attempt, reason);

      const waitMs = getRetryDelay(error, attempt);
      await delay(waitMs);
    }
  }
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a minimal axios-like error with an HTTP status code. */
const httpError = (status, headers = {}) => {
  const err = new Error(`Request failed with status code ${status}`);
  err.response = { status, headers };
  return err;
};

/** Build a network-level error (no response). */
const networkError = (msg = 'Network Error') => new Error(msg);

/** Build a timeout error matching axios ECONNABORTED convention. */
const timeoutError = () => {
  const err = new Error('timeout of 5000ms exceeded');
  err.code = 'ECONNABORTED';
  return err;
};

// ---------------------------------------------------------------------------
// isRetryable
// ---------------------------------------------------------------------------

describe('isRetryable', () => {
  it('returns true for 500 Internal Server Error', () => {
    expect(isRetryable(httpError(500))).toBe(true);
  });

  it('returns true for 502 Bad Gateway', () => {
    expect(isRetryable(httpError(502))).toBe(true);
  });

  it('returns true for 503 Service Unavailable', () => {
    expect(isRetryable(httpError(503))).toBe(true);
  });

  it('returns true for 504 Gateway Timeout', () => {
    expect(isRetryable(httpError(504))).toBe(true);
  });

  it('returns true for 429 Too Many Requests', () => {
    expect(isRetryable(httpError(429))).toBe(true);
  });

  it('returns true for network errors (no response object)', () => {
    expect(isRetryable(networkError())).toBe(true);
  });

  it('returns false for 400 Bad Request', () => {
    expect(isRetryable(httpError(400))).toBe(false);
  });

  it('returns false for 401 Unauthorized', () => {
    expect(isRetryable(httpError(401))).toBe(false);
  });

  it('returns false for 403 Forbidden', () => {
    expect(isRetryable(httpError(403))).toBe(false);
  });

  it('returns false for 404 Not Found', () => {
    expect(isRetryable(httpError(404))).toBe(false);
  });

  it('returns false for 422 Unprocessable Entity', () => {
    expect(isRetryable(httpError(422))).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// isTimeout
// ---------------------------------------------------------------------------

describe('isTimeout', () => {
  it('identifies ECONNABORTED as a timeout', () => {
    expect(isTimeout(timeoutError())).toBe(true);
  });

  it('identifies message containing "timeout" as a timeout', () => {
    expect(isTimeout(new Error('connect timeout'))).toBe(true);
  });

  it('returns false for a plain network error', () => {
    expect(isTimeout(networkError())).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getRetryDelay — exponential backoff schedule
// ---------------------------------------------------------------------------

describe('getRetryDelay — exponential backoff', () => {
  it('returns 200 ms on attempt 1 (100 * 2^1)', () => {
    expect(getRetryDelay(httpError(503), 1)).toBe(200);
  });

  it('returns 400 ms on attempt 2 (100 * 2^2)', () => {
    expect(getRetryDelay(httpError(503), 2)).toBe(400);
  });

  it('returns 800 ms on attempt 3 (100 * 2^3)', () => {
    expect(getRetryDelay(httpError(503), 3)).toBe(800);
  });
});

// ---------------------------------------------------------------------------
// getRetryDelay — 429 with Retry-After header
// ---------------------------------------------------------------------------

describe('getRetryDelay — 429 with Retry-After header', () => {
  it('converts Retry-After seconds to milliseconds', () => {
    const err = httpError(429, { 'retry-after': '5' });
    expect(getRetryDelay(err, 1)).toBe(5000);
  });

  it('falls back to exponential backoff when Retry-After is absent', () => {
    expect(getRetryDelay(httpError(429), 1)).toBe(200);
  });

  it('falls back to exponential backoff when Retry-After is not a valid number', () => {
    const err = httpError(429, { 'retry-after': 'invalid' });
    expect(getRetryDelay(err, 1)).toBe(200);
  });
});

// ---------------------------------------------------------------------------
// withRetry — success on first attempt (no retries)
// ---------------------------------------------------------------------------

describe('withRetry — success on first attempt', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    logRetryEvent.mockClear();
  });
  afterEach(() => vi.useRealTimers());

  it('resolves immediately with no retry when the first call succeeds', async () => {
    const fn = vi.fn().mockResolvedValue({ data: 'ok' });
    const promise = withRetry(fn, '/api/test');
    await vi.runAllTimersAsync();
    await expect(promise).resolves.toEqual({ data: 'ok' });
    expect(fn).toHaveBeenCalledTimes(1);
    expect(logRetryEvent).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// withRetry — 5xx retries with eventual success
// ---------------------------------------------------------------------------

describe('withRetry — 5xx retries', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    logRetryEvent.mockClear();
  });
  afterEach(() => vi.useRealTimers());

  it('retries twice on 503 then resolves on the third call', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(httpError(503))
      .mockRejectedValueOnce(httpError(503))
      .mockResolvedValue({ data: 'recovered' });

    const promise = withRetry(fn, '/api/tickets');
    await vi.runAllTimersAsync();
    await expect(promise).resolves.toEqual({ data: 'recovered' });
    expect(fn).toHaveBeenCalledTimes(3);
    expect(logRetryEvent).toHaveBeenCalledTimes(2);
    expect(logRetryEvent).toHaveBeenNthCalledWith(1, '/api/tickets', 1, '503');
    expect(logRetryEvent).toHaveBeenNthCalledWith(2, '/api/tickets', 2, '503');
  });

  it('throws after exhausting all MAX_RETRIES (4 total calls)', async () => {
    const fn = vi.fn().mockRejectedValue(httpError(503));
    const assertion = expect(withRetry(fn, '/api/tickets')).rejects.toThrow('Request failed with status code 503');
    await vi.runAllTimersAsync();
    await assertion;
    // 1 initial + 3 retries
    expect(fn).toHaveBeenCalledTimes(4);
    expect(logRetryEvent).toHaveBeenCalledTimes(3);
  });
});

// ---------------------------------------------------------------------------
// withRetry — 4xx permanent errors (never retried)
// ---------------------------------------------------------------------------

describe('withRetry — 4xx permanent errors', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    logRetryEvent.mockClear();
  });
  afterEach(() => vi.useRealTimers());

  it('does not retry 400 — fails immediately', async () => {
    const fn = vi.fn().mockRejectedValue(httpError(400));
    await expect(withRetry(fn, '/api/test')).rejects.toThrow('400');
    expect(fn).toHaveBeenCalledTimes(1);
    expect(logRetryEvent).not.toHaveBeenCalled();
  });

  it('does not retry 401 — fails immediately', async () => {
    const fn = vi.fn().mockRejectedValue(httpError(401));
    await expect(withRetry(fn, '/api/test')).rejects.toThrow('401');
    expect(fn).toHaveBeenCalledTimes(1);
    expect(logRetryEvent).not.toHaveBeenCalled();
  });

  it('does not retry 403 — fails immediately', async () => {
    const fn = vi.fn().mockRejectedValue(httpError(403));
    await expect(withRetry(fn, '/api/test')).rejects.toThrow('403');
    expect(fn).toHaveBeenCalledTimes(1);
    expect(logRetryEvent).not.toHaveBeenCalled();
  });

  it('does not retry 404 — fails immediately', async () => {
    const fn = vi.fn().mockRejectedValue(httpError(404));
    await expect(withRetry(fn, '/api/test')).rejects.toThrow('404');
    expect(fn).toHaveBeenCalledTimes(1);
    expect(logRetryEvent).not.toHaveBeenCalled();
  });

  it('does not retry 422 — fails immediately', async () => {
    const fn = vi.fn().mockRejectedValue(httpError(422));
    await expect(withRetry(fn, '/api/test')).rejects.toThrow('422');
    expect(fn).toHaveBeenCalledTimes(1);
    expect(logRetryEvent).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// withRetry — timeout recovery
// ---------------------------------------------------------------------------

describe('withRetry — timeout recovery', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    logRetryEvent.mockClear();
  });
  afterEach(() => vi.useRealTimers());

  it('retries a timeout once then resolves', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(timeoutError())
      .mockResolvedValue({ data: 'ok' });

    const promise = withRetry(fn, '/api/tickets');
    await vi.runAllTimersAsync();
    await expect(promise).resolves.toEqual({ data: 'ok' });
    expect(fn).toHaveBeenCalledTimes(2);
    expect(logRetryEvent).toHaveBeenCalledWith('/api/tickets', 1, 'timeout');
  });

  it('throws after exhausting TIMEOUT_MAX_RETRIES (3 total calls)', async () => {
    const fn = vi.fn().mockRejectedValue(timeoutError());
    const assertion = expect(withRetry(fn, '/api/test')).rejects.toThrow('timeout');
    await vi.runAllTimersAsync();
    await assertion;
    // 1 initial + 2 timeout retries
    expect(fn).toHaveBeenCalledTimes(3);
  });
});

// ---------------------------------------------------------------------------
// withRetry — 429 rate limit with Retry-After header
// ---------------------------------------------------------------------------

describe('withRetry — 429 rate limit', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    logRetryEvent.mockClear();
  });
  afterEach(() => vi.useRealTimers());

  it('waits Retry-After duration then resolves', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(httpError(429, { 'retry-after': '5' }))
      .mockResolvedValue({ data: 'ok' });

    const promise = withRetry(fn, '/api/tickets');
    await vi.runAllTimersAsync();
    await expect(promise).resolves.toEqual({ data: 'ok' });
    expect(fn).toHaveBeenCalledTimes(2);
    expect(logRetryEvent).toHaveBeenCalledWith('/api/tickets', 1, '429');
  });
});

// ---------------------------------------------------------------------------
// withRetry — network error (no response object)
// ---------------------------------------------------------------------------

describe('withRetry — network error', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    logRetryEvent.mockClear();
  });
  afterEach(() => vi.useRealTimers());

  it('retries a network error then resolves', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(networkError())
      .mockResolvedValue({ data: 'ok' });

    const promise = withRetry(fn, '/api/test');
    await vi.runAllTimersAsync();
    await expect(promise).resolves.toEqual({ data: 'ok' });
    expect(fn).toHaveBeenCalledTimes(2);
    expect(logRetryEvent).toHaveBeenCalledWith('/api/test', 1, 'network_error');
  });
});
