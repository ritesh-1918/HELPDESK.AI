javascript
// =============================================================================
// test/dateUtils.test.js
// =============================================================================

/**
 * @fileoverview
 * Unit tests for date utility functions: safeParseDate, normalizeTimestamp, formatDisplayDate.
 * These tests ensure Safari-compatible ISO-8601 parsing and robust fallback behavior.
 * All edge cases (null, undefined, empty, malformed, whitespace, timezone variations, leap year,
 * year zero, numeric timestamps, invalid offsets, Date objects, invalid Date objects, and non-date types)
 * are covered.
 *
 * @module test/dateUtils.test
 * @requires jest
 * @requires ../dateUtils
 * @requires ./testLogger
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import {
  safeParseDate,
  normalizeTimestamp,
  formatDisplayDate,
} from '../dateUtils';
import { createTestLogger } from './testLogger';

// ---------------------------------------------------------------------------
// Logger
// ---------------------------------------------------------------------------

const log = createTestLogger('dateUtils.test');

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Fixed "now" for all fallback tests using fake timers. */
const FIXED_NOW = new Date('2025-06-01T12:00:00Z');

/** Valid UTC timestamp with milliseconds. */
const UTC_TIMESTAMP_MS = '2023-01-15T10:30:00.000Z';

/** Timestamp with positive timezone offset. */
const TIMEZONED_TIMESTAMP = '2023-06-20T15:45:00+05:30';

/** Timestamp with negative timezone offset. */
const NEGATIVE_OFFSET_TIMESTAMP = '2023-12-01T08:00:00-04:00';

/** Safari edge case: no milliseconds. */
const SAFARI_NO_MILLIS = '2023-01-15T10:30:00Z';

/** Local timestamp without timezone. */
const LOCAL_TIMESTAMP_NO_TZ = '2023-01-15T10:30:00';

/** Leap year date. */
const LEAP_YEAR_DATE = '2024-02-29T12:00:00.000Z';

/** Year 0000 boundary. */
const YEAR_ZERO_DATE = '0000-01-01T00:00:00.000Z';

/** Collection of malformed string inputs. */
const MALFORMED_INPUTS = ['not-a-date', '12345', 'garbage'];

/** Collection of invalid non-string/non-number inputs for safeParseDate (should fallback). */
const INVALID_TYPES = [null, undefined, '', true, false, [], {}, Symbol('test')];

/** Numeric unix timestamp equivalent to UTC_TIMESTAMP_MS. */
const NUMERIC_TIMESTAMP = 1673778600000;

/** Numeric timestamp for a large negative (before epoch). */
const LARGE_NEGATIVE_TIMESTAMP = -2208988800000;

/** Valid Date object for direct input tests. */
const VALID_DATE_OBJECT = new Date('2023-07-04T12:00:00.000Z');

/** Invalid Date object (Invalid Date). */
const INVALID_DATE_OBJECT = new Date('not-a-date');

/** Explicitly invalid Date object with NaN time. */
const NAN_DATE_OBJECT = new Date(NaN);

/** Timestamp with space instead of 'T' (Safari problematic). */
const SPACE_SEPARATED_TIMESTAMP = '2023-01-15 10:30:00.000Z';

/** Timestamp with space and no milliseconds. */
const SPACE_NO_MS = '2023-01-15 10:30:00Z';

/** Timestamp without milliseconds and without T. */
const SPACE_NO_MS_NO_TZ = '2023-01-15 10:30:00';

/** Timeout for async operations (if any). */
const DEFAULT_TIMEOUT = 5000;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Temporarily sets system time for tests that require a fixed "now".
 * This function ensures that real timers are always restored, even on failure.
 *
 * @param {Date} now - The fixed current time to use during the test.
 * @param {() => void} testFn - The test logic to run under fake timers.
 * @returns {void}
 * @throws {Error} Re-throws any error thrown by testFn after cleaning up timers.
 */
function withFakeTimers(now, testFn) {
  jest.useFakeTimers().setSystemTime(now);
  try {
    log.debug('Fake timers activated with time:', now.toISOString());
    testFn();
  } catch (error) {
    log.error('Test function threw:', error);
    throw error;
  } finally {
    jest.useRealTimers();
    log.debug('Real timers restored');
  }
}

/**
 * Helper to run multiple fallback test cases with a single test call.
 * Validates that each input results in a Date equal to FIXED_NOW (the fallback).
 *
 * @param {string} testName - Base name for the test (input type descriptor).
 * @param {Array<*>} inputs - Array of inputs to test.
 * @param {(input: *) => void} assertFn - Assertion function that receives each input.
 * @returns {void}
 */
function testFallbackCases(testName, inputs, assertFn) {
  describe(`self: ${testName}`, () => {
    inputs.forEach((input) => {
      it(`falls back for input type ${typeof input}: ${String(input).substring(0, 50)}`, () => {
        withFakeTimers(FIXED_NOW, () => {
          log.debug('Testing fallback for input:', input);
          assertFn(input);
        });
      });
    });
  });
}

/**
 * Runs a simple synchronous function and ensures no unhandled exceptions.
 * Used for tests that should never throw.
 *
 * @param {string} label - Test label for logging.
 * @param {() => void} fn - Function to execute.
 * @returns {void}
 */
function runSafeTest(label, fn) {
  try {
    fn();
  } catch (error) {
    log.error(`Unexpected exception in test "${label}":`, error);
    throw error;
  }
}

// ---------------------------------------------------------------------------
// normalizeTimestamp
// ---------------------------------------------------------------------------

describe('normalizeTimestamp', () => {
  it('converts space separator to T and adds milliseconds and Z', () => {
    expect(normalizeTimestamp(SPACE_SEPARATED_TIMESTAMP)).toBe(UTC_TIMESTAMP_MS);
  });

  it('adds .000 milliseconds when missing with space', () => {
    expect(normalizeTimestamp(SPACE_NO_MS)).toBe('2023-01-15T10:30:00.000Z');
  });

  it('adds .000 and Z when missing with space and no TZ', () => {
    expect(normalizeTimestamp(SPACE_NO_MS_NO_TZ)).toBe('2023-01-15T10:30:00.000Z');
  });

  it('leaves a correctly formatted ISO string unchanged', () => {
    expect(normalizeTimestamp(UTC_TIMESTAMP_MS)).toBe(UTC_TIMESTAMP_MS);
  });

  it('preserves positive offset', () => {
    expect(normalizeTimestamp(TIMEZONED_TIMESTAMP)).toBe(TIMEZONED_TIMESTAMP);
  });

  it('preserves negative offset', () => {
    expect(normalizeTimestamp(NEGATIVE_OFFSET_TIMESTAMP)).toBe(NEGATIVE_OFFSET_TIMESTAMP);
  });

  it('handles timestamp with milliseconds but no TZ', () => {
    const input = '2023-01-15T10:30:00.123';
    expect(normalizeTimestamp(input)).toBe('2023-01-15T10:30:00.123Z');
  });

  it('throws for empty string', () => {
    expect(() => normalizeTimestamp('')).toThrow();
  });

  it('throws for whitespace-only string', () => {
    expect(() => normalizeTimestamp('   ')).toThrow();
  });

  it('throws for non-string input', () => {
    expect(() => normalizeTimestamp(123)).toThrow();
  });

  it('converts numeric string to ISO string', () => {
    const result = normalizeTimestamp(String(NUMERIC_TIMESTAMP));
    expect(result).toBe(new Date(NUMERIC_TIMESTAMP).toISOString());
  });
});

// ---------------------------------------------------------------------------
// safeParseDate
// ---------------------------------------------------------------------------

describe('safeParseDate', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  // -------------------------------------------------------------------------
  // Valid ISO-8601 timestamps
  // -------------------------------------------------------------------------

  /** @test {safeParseDate} – standard UTC timestamp */
  it('returns a Date object for valid ISO-8601 UTC timestamp', () => {
    const result = safeParseDate(UTC_TIMESTAMP_MS);
    expect(result).toBeInstanceOf(Date);
    expect(result.toISOString()).toBe(UTC_TIMESTAMP_MS);
  });

  /** @test {safeParseDate} – timestamp with positive timezone offset */
  it('returns a Date object for ISO-8601 with positive timezone offset', () => {
    const result = safeParseDate(TIMEZONED_TIMESTAMP);
    expect(result).toBeInstanceOf(Date);
    expect(result.toISOString()).toBe('2023-06-20T10:15:00.000Z');
  });

  /** @test {safeParseDate} – timestamp with negative offset */
  it('returns a Date object for ISO-8601 with negative offset', () => {
    const result = safeParseDate(NEGATIVE_OFFSET_TIMESTAMP);
    expect(result).toBeInstanceOf(Date);
    expect(result.toISOString()).toBe('2023-12-01T12:00:00.000Z');
  });

  /** @test {safeParseDate} – Safari edge case: timestamp without milliseconds */
  it('parses timestamp without milliseconds (Safari edge case)', () => {
    const result = safeParseDate(SAFARI_NO_MILLIS);
    expect(result).toBeInstanceOf(Date);
    expect(result.toISOString()).toBe('2023-01-15T10:30:00.000Z');
  });

  /** @test {safeParseDate} – local time without timezone */
  it('parses timestamp without explicit timezone (falls back to local)', () => {
    const result = safeParseDate(LOCAL_TIMESTAMP_NO_TZ);
    expect(result).toBeInstanceOf(Date);
    expect(result.getTime()).not.toBeNaN();
  });

  /** @test {safeParseDate} – space-separated timestamp (Safari problematic) */
  it('parses space-separated timestamp correctly', () => {
    const result = safeParseDate(SPACE_SEPARATED_TIMESTAMP);
    expect(result).toBeInstanceOf(Date);
    expect(result.toISOString()).toBe(UTC_TIMESTAMP_MS);
  });

  // -------------------------------------------------------------------------
  // Special dates
  // -------------------------------------------------------------------------

  /** @test {safeParseDate} – leap year support */
  it('handles leap year date (2024-02-29)', () => {
    const result = safeParseDate(LEAP_YEAR_DATE);
    expect(result).toBeInstanceOf(Date);
    expect(result.toISOString()).toBe(LEAP_YEAR_DATE);
  });

  /** @test {safeParseDate} – year 0000 boundary */
  it('handles year 0000 boundary', () => {
    const result = safeParseDate(YEAR_ZERO_DATE);
    expect(result).toBeInstanceOf(Date);
    expect(result.getFullYear()).toBe(0);
    expect(result.toISOString()).toBe(YEAR_ZERO_DATE);
  });

  /** @test {safeParseDate} – very large negative timestamp */
  it('handles large negative numeric timestamp (before epoch)', () => {
    const result = safeParseDate(LARGE_NEGATIVE_TIMESTAMP);
    expect(result).toBeInstanceOf(Date);
    expect(result.getTime()).toBe(LARGE_NEGATIVE_TIMESTAMP);
  });

  // -------------------------------------------------------------------------
  // Numeric timestamps
  // -------------------------------------------------------------------------

  /** @test {safeParseDate} – numeric millisecond timestamp */
  it('parses numeric millisecond timestamp', () => {
    const result = safeParseDate(NUMERIC_TIMESTAMP);
    expect(result).toBeInstanceOf(Date);
    expect(result.toISOString()).toBe(UTC_TIMESTAMP_MS);
  });

  /** @test {safeParseDate} – numeric timestamp as string */
  it('parses numeric timestamp string', () => {
    const result = safeParseDate(String(NUMERIC_TIMESTAMP));
    expect(result).toBeInstanceOf(Date);
    expect(result.toISOString()).toBe(UTC_TIMESTAMP_MS);
  });

  // -------------------------------------------------------------------------
  // Date objects
  // -------------------------------------------------------------------------

  /** @test {safeParseDate} – valid Date object */
  it('returns the same Date object if already a valid Date', () => {
    const result = safeParseDate(VALID_DATE_OBJECT);
    expect(result).toBe(VALID_DATE_OBJECT);
    expect(result.toISOString()).toBe('2023-07-04T12:00:00.000Z');
  });

  /** @test {safeParseDate} – invalid Date object falls back */
  it('returns fallback for invalid Date object', () => {
    withFakeTimers(FIXED_NOW, () => {
      const result = safeParseDate(INVALID_DATE_OBJECT);
      expect(result).toBeInstanceOf(Date);
      expect(result.getTime()).toBe(FIXED_NOW.getTime());
    });
  });

  /** @test {safeParseDate} – NaN Date object falls back */
  it('returns fallback for Date with NaN time', () => {
    withFakeTimers(FIXED_NOW, () => {
      const result = safeParseDate(NAN_DATE_OBJECT);
      expect(result).toBeInstanceOf(Date);
      expect(result.getTime()).toBe(FIXED_NOW.getTime());
    });
  });

  // -------------------------------------------------------------------------
  // Fallback cases
  // -------------------------------------------------------------------------

  describe('fallback behavior', () => {
    testFallbackCases('null/undefined/empty/boolean/array/object/symbol', INVALID_TYPES, (input) => {
      const result = safeParseDate(input);
      expect(result).toBeInstanceOf(Date);
      expect(result.getTime()).toBe(FIXED_NOW.getTime());
    });

    testFallbackCases('malformed strings', MALFORMED_INPUTS, (input) => {
      const result = safeParseDate(input);
      expect(result).toBeInstanceOf(Date);
      expect(result.getTime()).toBe(FIXED_NOW.getTime());
    });
  });

  // -------------------------------------------------------------------------
  // Edge cases with whitespace
  // -------------------------------------------------------------------------

  it('trims whitespace from string input', () => {
    const result = safeParseDate(`  ${UTC_TIMESTAMP_MS}  `);
    expect(result).toBeInstanceOf(Date);
    expect(result.toISOString()).toBe(UTC_TIMESTAMP_MS);
  });

  // -------------------------------------------------------------------------
  // Invalid type handling (should fallback)
  // -------------------------------------------------------------------------

  it('throws a TypeError for unsupported types (e.g., function)', () => {
    expect(() => safeParseDate(() => {})).toThrow(TypeError);
  });
});

// ---------------------------------------------------------------------------
// formatDisplayDate
// ---------------------------------------------------------------------------

describe('formatDisplayDate', () => {
  /** @test {formatDisplayDate} – valid date returns formatted string */
  it('formats a valid timestamp into a readable date string', () => {
    const result = formatDisplayDate(UTC_TIMESTAMP_MS);
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  /** @test {formatDisplayDate} – uses style parameter */
  it('supports short style', () => {
    const result = formatDisplayDate(UTC_TIMESTAMP_MS, 'short');
    expect(result).toMatch(/\d{1,2}\/\d{1,2}\/\d{2,4}/); // e.g., 1/15/23
  });

  /** @test {formatDisplayDate} – passes additional options */
  it('passes custom Intl options', () => {
    const result = formatDisplayDate(UTC_TIMESTAMP_MS, 'medium', { year: 'numeric', month: 'long' });
    expect(result).toContain('2023');
    expect(result).toContain('January');
  });

  /** @test {formatDisplayDate} – invalid input returns fallback string */
  it('returns fallback message for invalid input', () => {
    const result = formatDisplayDate(null);
    // Should be formatted fallback date (since safeParseDate returns a valid Date).
    // We cannot predict exact string, but it should be non-empty.
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
});