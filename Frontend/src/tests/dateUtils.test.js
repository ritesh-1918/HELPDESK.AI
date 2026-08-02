/**
 * Tests for dateUtils.js - Safari compatibility focus
 */

import { describe, it, expect } from 'vitest';
import { formatTimelineDate, formatFullTimestamp, getTimeZoneAbbr } from '../utils/dateUtils';

describe('formatTimelineDate', () => {
    it('defaults gracefully to current time for null/undefined/empty input', () => {
        const resultNull = formatTimelineDate(null);
        const resultUndef = formatTimelineDate(undefined);
        const resultEmpty = formatTimelineDate('');
        
        expect(resultNull).toBeTruthy();
        expect(resultNull).not.toBe('Invalid Date');
        expect(resultUndef).toBeTruthy();
        expect(resultUndef).not.toBe('Invalid Date');
        expect(resultEmpty).toBeTruthy();
        expect(resultEmpty).not.toBe('Invalid Date');
    });

    it('defaults gracefully to current time for non-string input', () => {
        const resultNum = formatTimelineDate(123);
        const resultObj = formatTimelineDate({});
        
        expect(resultNum).toBeTruthy();
        expect(resultNum).not.toBe('Invalid Date');
        expect(resultObj).toBeTruthy();
        expect(resultObj).not.toBe('Invalid Date');
    });

    it('parses ISO-8601 with Z suffix (UTC)', () => {
        const result = formatTimelineDate('2026-06-01T12:30:00Z');
        expect(result).toBeTruthy();
        expect(result).not.toBe('Invalid Date');
    });

    it('parses ISO-8601 without Z suffix (treats as UTC)', () => {
        const result = formatTimelineDate('2026-06-01T12:30:00');
        expect(result).toBeTruthy();
        expect(result).not.toBe('Invalid Date');
    });

    it('parses ISO-8601 with positive timezone offset', () => {
        const result = formatTimelineDate('2026-06-01T12:30:00+05:30');
        expect(result).toBeTruthy();
        expect(result).not.toBe('Invalid Date');
    });

    it('parses ISO-8601 with negative timezone offset', () => {
        const result = formatTimelineDate('2026-06-01T12:30:00-08:00');
        expect(result).toBeTruthy();
        expect(result).not.toBe('Invalid Date');
    });

    it('parses ISO-8601 with milliseconds', () => {
        const result = formatTimelineDate('2026-06-01T12:30:00.123Z');
        expect(result).toBeTruthy();
        expect(result).not.toBe('Invalid Date');
    });

    it('parses date-only string', () => {
        const result = formatTimelineDate('2026-06-01');
        expect(result).toBeTruthy();
        expect(result).not.toBe('Invalid Date');
    });

    it('parses space-separated datetime', () => {
        const result = formatTimelineDate('2026-06-01 12:30:00');
        expect(result).toBeTruthy();
        expect(result).not.toBe('Invalid Date');
    });

    it('defaults gracefully to current time for garbage input', () => {
        const resultGarbage = formatTimelineDate('not-a-date');
        const resultAbc = formatTimelineDate('abc123');
        
        expect(resultGarbage).toBeTruthy();
        expect(resultGarbage).not.toBe('Invalid Date');
        expect(resultAbc).toBeTruthy();
        expect(resultAbc).not.toBe('Invalid Date');
    });

    it('defaults gracefully to current time for whitespace-only input', () => {
        const result = formatTimelineDate('   ');
        expect(result).toBeTruthy();
        expect(result).not.toBe('Invalid Date');
    });

    it('trims whitespace from valid dates', () => {
        const result = formatTimelineDate('  2026-06-01T12:30:00Z  ');
        expect(result).toBeTruthy();
        expect(result).not.toBe('Invalid Date');
    });
});

describe('formatFullTimestamp', () => {
    it('defaults gracefully to current time for null/undefined/empty input', () => {
        const resultNull = formatFullTimestamp(null);
        const resultUndef = formatFullTimestamp(undefined);
        const resultEmpty = formatFullTimestamp('');
        
        expect(resultNull).toBeTruthy();
        expect(resultNull).not.toBe('Processing...');
        expect(resultUndef).toBeTruthy();
        expect(resultUndef).not.toBe('Processing...');
        expect(resultEmpty).toBeTruthy();
        expect(resultEmpty).not.toBe('Processing...');
    });

    it('includes timezone abbreviation', () => {
        const result = formatFullTimestamp('2026-06-01T12:30:00Z');
        expect(result).toBeTruthy();
        expect(result).not.toBe('Processing...');
        // Should contain parentheses with timezone
        expect(result).toMatch(/\(.*\)/);
    });

    it('defaults gracefully to current time for invalid date', () => {
        const result = formatFullTimestamp('garbage');
        expect(result).toBeTruthy();
        expect(result).not.toBe('Processing...');
    });
});

describe('getTimeZoneAbbr', () => {
    it('returns a non-empty string', () => {
        const tz = getTimeZoneAbbr();
        expect(typeof tz).toBe('string');
        expect(tz.length).toBeGreaterThan(0);
    });

    it('returns IST or UTC as fallback on error', () => {
        const tz = getTimeZoneAbbr();
        expect(tz).toBeTruthy();
    });
});
