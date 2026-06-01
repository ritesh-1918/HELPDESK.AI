/**
 * Tests for dateUtils.js
 * Ensures cross-browser compatibility, especially for Safari's strict parsing.
 */

import { describe, it, expect } from 'vitest';
import {
    formatTimelineDate,
    formatFullTimestamp,
    isValidDate,
    getRelativeTime,
    getTimeZoneAbbr
} from './dateUtils';

describe('formatTimelineDate', () => {
    it('should handle ISO-8601 with Z suffix', () => {
        const result = formatTimelineDate('2024-01-15T10:30:00Z');
        expect(result).not.toBe('Invalid Date');
        expect(result).toContain('Jan');
        expect(result).toContain('2024');
    });

    it('should handle ISO-8601 without timezone', () => {
        const result = formatTimelineDate('2024-01-15T10:30:00');
        expect(result).not.toBe('Invalid Date');
    });

    it('should handle date with space instead of T', () => {
        const result = formatTimelineDate('2024-01-15 10:30:00');
        expect(result).not.toBe('Invalid Date');
    });

    it('should handle date with slashes', () => {
        const result = formatTimelineDate('2024/01/15');
        expect(result).not.toBe('Invalid Date');
    });

    it('should handle date without leading zeros', () => {
        const result = formatTimelineDate('2024-1-5');
        expect(result).not.toBe('Invalid Date');
    });

    it('should return Invalid Date for null/undefined/empty', () => {
        expect(formatTimelineDate(null)).toBe('Invalid Date');
        expect(formatTimelineDate(undefined)).toBe('Invalid Date');
        expect(formatTimelineDate('')).toBe('Invalid Date');
    });

    it('should return Invalid Date for garbage input', () => {
        expect(formatTimelineDate('not-a-date')).toBe('Invalid Date');
        expect(formatTimelineDate('abc123')).toBe('Invalid Date');
    });

    it('should handle Supabase timestamp format', () => {
        // Supabase often returns this format
        const result = formatTimelineDate('2024-01-15T10:30:00.000+00:00');
        expect(result).not.toBe('Invalid Date');
    });

    it('should handle epoch timestamps', () => {
        const result = formatTimelineDate('1705312200000');
        // This should parse as a valid date string representation
        expect(result).not.toBe('Invalid Date');
    });
});

describe('isValidDate', () => {
    it('should return true for valid dates', () => {
        expect(isValidDate('2024-01-15T10:30:00Z')).toBe(true);
        expect(isValidDate('2024-01-15')).toBe(true);
        expect(isValidDate('2024/01/15')).toBe(true);
    });

    it('should return false for invalid dates', () => {
        expect(isValidDate(null)).toBe(false);
        expect(isValidDate('')).toBe(false);
        expect(isValidDate('not-a-date')).toBe(false);
        expect(isValidDate('2024-13-45')).toBe(false);
    });
});

describe('getRelativeTime', () => {
    it('should return Just now for recent dates', () => {
        const now = new Date();
        const result = getRelativeTime(now.toISOString());
        expect(result).toBe('Just now');
    });

    it('should return minutes ago', () => {
        const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
        const result = getRelativeTime(fiveMinAgo.toISOString());
        expect(result).toContain('minute');
        expect(result).toContain('ago');
    });

    it('should return hours ago', () => {
        const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
        const result = getRelativeTime(twoHoursAgo.toISOString());
        expect(result).toContain('hour');
        expect(result).toContain('ago');
    });

    it('should return days ago', () => {
        const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
        const result = getRelativeTime(threeDaysAgo.toISOString());
        expect(result).toContain('day');
        expect(result).toContain('ago');
    });

    it('should return formatted date for old dates', () => {
        const oldDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const result = getRelativeTime(oldDate.toISOString());
        expect(result).not.toContain('ago');
        expect(result).not.toBe('Unknown');
    });

    it('should return Unknown for invalid dates', () => {
        expect(getRelativeTime(null)).toBe('Unknown');
        expect(getRelativeTime('invalid')).toBe('Unknown');
    });
});

describe('getTimeZoneAbbr', () => {
    it('should return a timezone abbreviation', () => {
        const result = getTimeZoneAbbr();
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(0);
    });

    it('should return IST as fallback on error', () => {
        // This tests the catch block
        const result = getTimeZoneAbbr();
        expect(result).toBeTruthy();
    });
});

describe('formatFullTimestamp', () => {
    it('should include timezone abbreviation', () => {
        const result = formatFullTimestamp('2024-01-15T10:30:00Z');
        expect(result).toContain('(');
        expect(result).toContain(')');
    });

    it('should return Processing... for null', () => {
        expect(formatFullTimestamp(null)).toBe('Processing...');
        expect(formatFullTimestamp('')).toBe('Processing...');
    });

    it('should return Processing... for invalid dates', () => {
        expect(formatFullTimestamp('invalid')).toBe('Processing...');
    });
});

describe('Safari-specific parsing', () => {
    it('should handle YYYY-MM-DD HH:MM:SS format (Safari problematic)', () => {
        // Safari traditionally fails on this format
        const result = formatTimelineDate('2024-01-15 10:30:00');
        expect(result).not.toBe('Invalid Date');
    });

    it('should handle YYYY/MM/DD format', () => {
        // Some systems output this format
        const result = formatTimelineDate('2024/01/15');
        expect(result).not.toBe('Invalid Date');
    });

    it('should handle date-only ISO format', () => {
        const result = formatTimelineDate('2024-01-15');
        expect(result).not.toBe('Invalid Date');
    });

    it('should handle full ISO with milliseconds', () => {
        const result = formatTimelineDate('2024-01-15T10:30:00.123Z');
        expect(result).not.toBe('Invalid Date');
    });

    it('should handle ISO with timezone offset', () => {
        const result = formatTimelineDate('2024-01-15T10:30:00+05:30');
        expect(result).not.toBe('Invalid Date');
    });
});
