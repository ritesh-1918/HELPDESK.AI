import {
  normaliseDateString,
  safeParseDate,
  formatTimelineDate,
  getTimeZoneAbbr,
  formatFullTimestamp
} from '../utils/dateUtils';

describe('normaliseDateString', () => {
  it('handles standard ISO strings unchanged', () => {
    const input = '2026-05-30T14:30:00Z';
    const result = normaliseDateString(input);
    expect(result).toBe(input);
  });

  it('replaces space separator with T for Safari compatibility', () => {
    const input = '2026-05-30 14:30:00';
    const result = normaliseDateString(input);
    expect(result).toContain('T');
  });

  it('appends Z when no timezone is present', () => {
    const input = '2026-05-30T14:30:00';
    const result = normaliseDateString(input);
    expect(result).toMatch(/Z$/);
  });

  it('handles space-separated dates without timezone', () => {
    const input = '2026-05-30 14:30:00';
    const result = normaliseDateString(input);
    expect(result).not.toBeNull();
    const date = new Date(result);
    expect(date.getTime()).not.toBeNaN();
  });

  it('preserves timezone offsets', () => {
    const input = '2026-05-30T14:30:00+05:30';
    const result = normaliseDateString(input);
    expect(result).toContain('+05:30');
  });

  it('handles fractional seconds', () => {
    const input = '2026-05-30T14:30:00.123Z';
    const result = normaliseDateString(input);
    expect(result).not.toBeNull();
    const date = new Date(result);
    expect(date.getTime()).not.toBeNaN();
  });

  it('returns null for empty string', () => {
    expect(normaliseDateString('')).toBeNull();
  });

  it('returns null for null input', () => {
    expect(normaliseDateString(null)).toBeNull();
  });

  it('returns null for non-string input', () => {
    expect(normaliseDateString(12345)).toBeNull();
  });
});

describe('safeParseDate', () => {
  it('parses standard ISO date', () => {
    const date = safeParseDate('2026-05-30T14:30:00Z');
    expect(date).not.toBeNull();
    expect(date.getFullYear()).toBe(2026);
  });

  it('parses space-separated date (Safari fix)', () => {
    const date = safeParseDate('2026-05-30 14:30:00Z');
    expect(date).not.toBeNull();
    expect(date.getFullYear()).toBe(2026);
  });

  it('parses date without timezone (assumes UTC)', () => {
    const date = safeParseDate('2026-05-30 14:30:00');
    expect(date).not.toBeNull();
    expect(date.getFullYear()).toBe(2026);
  });

  it('returns null for null input', () => {
    expect(safeParseDate(null)).toBeNull();
  });

  it('returns null for unparseable date', () => {
    expect(safeParseDate('not-a-date')).toBeNull();
  });
});

describe('formatTimelineDate', () => {
  it('returns null for null input', () => {
    expect(formatTimelineDate(null)).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(formatTimelineDate('')).toBeNull();
  });

  it('returns current date for unparseable input instead of Invalid Date', () => {
    const result = formatTimelineDate('garbage');
    expect(result).not.toBe('Invalid Date');
    expect(result).not.toBeNull();
  });

  it('formats a valid ISO date', () => {
    const result = formatTimelineDate('2026-05-30T14:30:00Z');
    expect(result).not.toBe('Invalid Date');
    expect(result).toBeTruthy();
  });

  it('formats space-separated ISO date (Safari fix)', () => {
    const result = formatTimelineDate('2026-05-30 14:30:00Z');
    expect(result).not.toBe('Invalid Date');
    expect(result).toBeTruthy();
  });

  it('formats dates without Z suffix', () => {
    const result = formatTimelineDate('2026-05-30T14:30:00');
    expect(result).not.toBe('Invalid Date');
    expect(result).toBeTruthy();
  });
});

describe('formatFullTimestamp', () => {
  it('returns Processing... for null input', () => {
    expect(formatFullTimestamp(null)).toBe('Processing...');
  });

  it('includes timezone abbreviation', () => {
    const result = formatFullTimestamp('2026-05-30T14:30:00Z');
    expect(result).toMatch(/\([A-Z]{2,5}\)$/);
  });
});

describe('getTimeZoneAbbr', () => {
  it('returns a non-empty string', () => {
    const abbr = getTimeZoneAbbr();
    expect(abbr).toBeTruthy();
    expect(typeof abbr).toBe('string');
  });
});
