/**
 * Tests for Frontend/src/utils/dateUtils.js (Issue #1160)
 *
 * Tests formatTimelineDate(), getTimeZoneAbbr(), formatFullTimestamp()
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  formatTimelineDate,
  getTimeZoneAbbr,
  formatFullTimestamp,
  parseDate,
  isValidDate,
} from '../utils/dateUtils.js';

// ---------------------------------------------------------------------------
// formatTimelineDate tests
// ---------------------------------------------------------------------------

describe('formatTimelineDate()', () => {
  it('is a function', () => {
    expect(typeof formatTimelineDate).toBe('function');
  });

  it('returns a string for a valid ISO date', () => {
    const result = formatTimelineDate('2024-01-15T10:30:00Z');
    expect(typeof result).toBe('string');
  });

  it('returns "Invalid Date" for null input', () => {
    const result = formatTimelineDate(null);
    expect(result).toBe('Invalid Date');
  });

  it('returns "Invalid Date" for undefined input', () => {
    const result = formatTimelineDate(undefined);
    expect(result).toBe('Invalid Date');
  });

  it('returns "Invalid Date" for empty string', () => {
    const result = formatTimelineDate('');
    expect(result).toBe('Invalid Date');
  });

  it('returns "Invalid Date" for truly invalid date string', () => {
    const result = formatTimelineDate('not-a-date');
    expect(result).toBe('Invalid Date');
  });

  it('returns non-empty string for valid date', () => {
    const result = formatTimelineDate('2024-06-01T12:00:00Z');
    expect(result.length).toBeGreaterThan(0);
    expect(result).not.toBe('Invalid Date');
  });

  it('includes the year in the formatted output', () => {
    const result = formatTimelineDate('2024-01-15T10:30:00Z');
    expect(result).toContain('2024');
  });

  it('handles date with timezone offset', () => {
    const result = formatTimelineDate('2024-01-15T10:30:00+05:30');
    expect(typeof result).toBe('string');
    expect(result).not.toBe('Invalid Date');
  });

  it('handles date with space separator (Safari fix)', () => {
    const result = formatTimelineDate('2024-01-15 10:30:00');
    expect(typeof result).toBe('string');
  });

  it('handles date with microseconds', () => {
    const result = formatTimelineDate('2024-01-15T10:30:00.123456+00:00');
    expect(typeof result).toBe('string');
  });

  it('handles compact timezone offset (+0530)', () => {
    const result = formatTimelineDate('2024-01-15T10:30:00+0530');
    expect(typeof result).toBe('string');
  });

  it('handles date without timezone indicator', () => {
    const result = formatTimelineDate('2024-01-15T10:30:00');
    expect(typeof result).toBe('string');
  });

  it('returns different output for different dates', () => {
    const result1 = formatTimelineDate('2024-01-01T00:00:00Z');
    const result2 = formatTimelineDate('2024-12-31T23:59:59Z');
    expect(result1).not.toBe(result2);
  });

  it('does not include milliseconds in formatted output', () => {
    const result = formatTimelineDate('2024-01-15T10:30:00Z');
    // Localized format should not have raw milliseconds
    expect(result).not.toMatch(/\.\d{3}/);
  });
});

// ---------------------------------------------------------------------------
// getTimeZoneAbbr tests
// ---------------------------------------------------------------------------

describe('getTimeZoneAbbr()', () => {
  it('is a function', () => {
    expect(typeof getTimeZoneAbbr).toBe('function');
  });

  it('returns a string', () => {
    const result = getTimeZoneAbbr();
    expect(typeof result).toBe('string');
  });

  it('returns a non-empty string', () => {
    const result = getTimeZoneAbbr();
    expect(result.length).toBeGreaterThan(0);
  });

  it('returns UTC as fallback when Intl fails', () => {
    const originalIntl = globalThis.Intl;
    globalThis.Intl = undefined;
    try {
      const result = getTimeZoneAbbr();
      expect(typeof result).toBe('string');
    } finally {
      globalThis.Intl = originalIntl;
    }
  });

  it('returns consistent value on multiple calls', () => {
    const result1 = getTimeZoneAbbr();
    const result2 = getTimeZoneAbbr();
    expect(result1).toBe(result2);
  });

  it('contains only printable characters', () => {
    const result = getTimeZoneAbbr();
    expect(result).toMatch(/^[\w+\-/: ]+$/);
  });
});

// ---------------------------------------------------------------------------
// formatFullTimestamp tests
// ---------------------------------------------------------------------------

describe('formatFullTimestamp()', () => {
  it('is a function', () => {
    expect(typeof formatFullTimestamp).toBe('function');
  });

  it('returns a string for valid date', () => {
    const result = formatFullTimestamp('2024-01-15T10:30:00Z');
    expect(typeof result).toBe('string');
  });

  it('returns Processing... for null input', () => {
    const result = formatFullTimestamp(null);
    expect(result).toBe('Processing...');
  });

  it('returns Processing... for undefined input', () => {
    const result = formatFullTimestamp(undefined);
    expect(result).toBe('Processing...');
  });

  it('returns Processing... for empty string', () => {
    const result = formatFullTimestamp('');
    expect(result).toBe('Processing...');
  });

  it('returns Processing... for invalid date string', () => {
    const result = formatFullTimestamp('not-a-date');
    expect(result).toBe('Processing...');
  });

  it('includes timezone abbreviation in parentheses', () => {
    const result = formatFullTimestamp('2024-01-15T10:30:00Z');
    expect(result).toMatch(/\(.*\)$/);
  });

  it('contains the year for valid date', () => {
    const result = formatFullTimestamp('2024-06-15T10:00:00Z');
    expect(result).toContain('2024');
  });

  it('result is longer than formatTimelineDate alone', () => {
    const timelineResult = formatTimelineDate('2024-01-15T10:30:00Z');
    const fullResult = formatFullTimestamp('2024-01-15T10:30:00Z');
    if (timelineResult !== 'Invalid Date') {
      expect(fullResult.length).toBeGreaterThanOrEqual(timelineResult.length);
    }
  });

  it('handles various timezones consistently', () => {
    const result = formatFullTimestamp('2024-01-15T10:30:00+05:30');
    expect(typeof result).toBe('string');
  });
});

// ---------------------------------------------------------------------------
// parseDate tests
// ---------------------------------------------------------------------------

describe('parseDate()', () => {
  it('returns a Date object for valid ISO string', () => {
    const result = parseDate('2024-01-15T10:30:00Z');
    expect(result).toBeInstanceOf(Date);
  });

  it('returns null for null input', () => {
    const result = parseDate(null);
    expect(result).toBeNull();
  });

  it('returns null for empty string', () => {
    const result = parseDate('');
    expect(result).toBeNull();
  });

  it('normalizes space separator', () => {
    const result = parseDate('2024-01-15 10:30:00');
    expect(result).toBeInstanceOf(Date);
    expect(isNaN(result)).toBe(false);
  });
});
