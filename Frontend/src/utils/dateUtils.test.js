import { describe, it, expect } from 'vitest';
import { formatTimelineDate, getTimeZoneAbbr, formatFullTimestamp } from './dateUtils';

describe('formatTimelineDate', () => {
  it('returns null for falsy input', () => {
    expect(formatTimelineDate(null)).toBeNull();
    expect(formatTimelineDate(undefined)).toBeNull();
    expect(formatTimelineDate('')).toBeNull();
  });

  it('returns Invalid Date for garbage string', () => {
    expect(formatTimelineDate('not-a-date')).toBe('Invalid Date');
  });

  it('formats ISO string with Z suffix', () => {
    const result = formatTimelineDate('2025-06-15T10:30:00Z');
    expect(result).toBeTruthy();
    expect(result).not.toBe('Invalid Date');
  });

  it('appends Z to naive datetime string', () => {
    const result = formatTimelineDate('2025-06-15T10:30:00');
    expect(result).toBeTruthy();
    expect(result).not.toBe('Invalid Date');
  });

  it('handles Date object input', () => {
    const date = new Date('2025-01-01T00:00:00Z');
    const result = formatTimelineDate(date);
    expect(result).toBeTruthy();
    expect(result).not.toBe('Invalid Date');
  });

  it('handles timestamp number input', () => {
    const result = formatTimelineDate(1700000000000);
    expect(result).toBeTruthy();
    expect(result).not.toBe('Invalid Date');
  });
});

describe('getTimeZoneAbbr', () => {
  it('returns a non-empty string', () => {
    const tz = getTimeZoneAbbr();
    expect(typeof tz).toBe('string');
    expect(tz.length).toBeGreaterThan(0);
  });

  it('returns a short timezone abbreviation', () => {
    const tz = getTimeZoneAbbr();
    expect(tz.length).toBeLessThanOrEqual(5);
  });
});

describe('formatFullTimestamp', () => {
  it('returns Processing... for falsy input', () => {
    expect(formatFullTimestamp(null)).toBe('Processing...');
    expect(formatFullTimestamp(undefined)).toBe('Processing...');
    expect(formatFullTimestamp('')).toBe('Processing...');
  });

  it('returns formatted string with timezone for valid input', () => {
    const result = formatFullTimestamp('2025-06-15T10:30:00Z');
    expect(result).toContain('(');
    expect(result).toContain(')');
  });

  it('returns Invalid Date in full format for garbage string', () => {
    const result = formatFullTimestamp('not-a-date');
    expect(result).toContain('Invalid Date');
  });
});
