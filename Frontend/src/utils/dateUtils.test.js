import { describe, it, expect } from 'vitest';
import { formatTimelineDate, formatFullTimestamp } from './dateUtils';

describe('dateUtils', () => {
    describe('formatTimelineDate', () => {
        it('returns null for falsy input', () => {
            expect(formatTimelineDate(null)).toBeNull();
            expect(formatTimelineDate(undefined)).toBeNull();
            expect(formatTimelineDate('')).toBeNull();
        });

        it('parses ISO-8601 with Z suffix', () => {
            const result = formatTimelineDate('2024-01-15T10:30:00Z');
            expect(result).not.toBe('Invalid Date');
            expect(result).toContain('Jan');
            expect(result).toContain('2024');
        });

        it('parses ISO-8601 without Z (space separator)', () => {
            // Supabase sometimes returns "2024-01-15 10:30:00" without timezone
            const result = formatTimelineDate('2024-01-15 10:30:00');
            expect(result).not.toBe('Invalid Date');
            expect(result).toContain('Jan');
            expect(result).toContain('2024');
        });

        it('parses ISO-8601 with T separator but no timezone', () => {
            const result = formatTimelineDate('2024-01-15T10:30:00');
            expect(result).not.toBe('Invalid Date');
            expect(result).toContain('Jan');
        });

        it('parses ISO-8601 with explicit offset', () => {
            const result = formatTimelineDate('2024-01-15T10:30:00+05:30');
            expect(result).not.toBe('Invalid Date');
            expect(result).toContain('Jan');
        });

        it('parses date-only strings', () => {
            const result = formatTimelineDate('2024-01-15');
            expect(result).not.toBe('Invalid Date');
            expect(result).toContain('Jan');
            expect(result).toContain('2024');
        });

        it('returns Invalid Date for garbage input', () => {
            expect(formatTimelineDate('not-a-date')).toBe('Invalid Date');
        });
    });

    describe('formatFullTimestamp', () => {
        it('returns Processing... for null input', () => {
            expect(formatFullTimestamp(null)).toBe('Processing...');
        });

        it('appends timezone abbreviation', () => {
            const result = formatFullTimestamp('2024-01-15T10:30:00Z');
            expect(result).toContain('(');
            expect(result).toContain(')');
        });
    });
});
