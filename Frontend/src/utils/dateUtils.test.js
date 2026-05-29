import {
    formatTimelineDate,
    formatFullTimestamp,
    getTimeZoneAbbr,
    formatRelativeTime
} from './dateUtils';

describe('dateUtils', () => {
    // ─── formatTimelineDate ───

    describe('formatTimelineDate', () => {
        test('returns null for null/undefined input', () => {
            expect(formatTimelineDate(null)).toBe('Invalid Date');
            expect(formatTimelineDate(undefined)).toBe('Invalid Date');
        });

        test('returns null for empty string', () => {
            expect(formatTimelineDate('')).toBe('Invalid Date');
        });

        test('handles standard ISO date with Z (from Supabase)', () => {
            const result = formatTimelineDate('2026-05-29T10:30:00Z');
            expect(result).not.toBe('Invalid Date');
            expect(result).toContain('May');
            expect(result).toContain('2026');
        });

        test('handles ISO date without T separator (Supabase common format)', () => {
            // Safari chokes on this format — our manual parser handles it
            const result = formatTimelineDate('2026-05-29 10:30:00');
            expect(result).not.toBe('Invalid Date');
            expect(result).toContain('May');
            expect(result).toContain('2026');
        });

        test('handles date-only string YYYY-MM-DD', () => {
            const result = formatTimelineDate('2026-05-29');
            expect(result).not.toBe('Invalid Date');
            expect(result).toContain('May');
            expect(result).toContain('2026');
        });

        test('handles ISO string with timezone offset', () => {
            const result = formatTimelineDate('2026-05-29T10:30:00+05:30');
            expect(result).not.toBe('Invalid Date');
            expect(result).toContain('May');
            expect(result).toContain('2026');
        });

        test('handles ISO string without Z but with T separator', () => {
            const result = formatTimelineDate('2026-05-29T10:30:00');
            expect(result).not.toBe('Invalid Date');
            expect(result).toContain('May');
        });

        test('handles timestamp with fractional seconds', () => {
            const result = formatTimelineDate('2026-05-29 10:30:00.123456');
            expect(result).not.toBe('Invalid Date');
            expect(result).toContain('May');
        });

        test('handles Date object input', () => {
            const result = formatTimelineDate(new Date('2026-05-29T10:30:00Z'));
            expect(result).not.toBe('Invalid Date');
            expect(result).toContain('2026');
        });

        test('handles Date-like object with toISOString', () => {
            const result = formatTimelineDate({ toISOString: () => '2026-05-29T10:30:00.000Z' });
            expect(result).not.toBe('Invalid Date');
            expect(result).toContain('2026');
        });

        test('returns Invalid Date for corrupt/garbage input', () => {
            expect(formatTimelineDate('not-a-date')).toBe('Invalid Date');
            expect(formatTimelineDate('abc')).toBe('Invalid Date');
            expect(formatTimelineDate('0000-00-00')).toBe('Invalid Date');
        });

        test('handles numeric timestamps', () => {
            const result = formatTimelineDate(1716957000000);
            expect(result).not.toBe('Invalid Date');
            expect(result).toContain('2026');
        });
    });

    // ─── formatFullTimestamp ───

    describe('formatFullTimestamp', () => {
        test('returns Processing... for null input', () => {
            expect(formatFullTimestamp(null)).toBe('Processing...');
        });

        test('returns Processing... for undefined input', () => {
            expect(formatFullTimestamp(undefined)).toBe('Processing...');
        });

        test('returns Processing... for empty string', () => {
            expect(formatFullTimestamp('')).toBe('Processing...');
        });

        test('returns Processing... for corrupt dates', () => {
            expect(formatFullTimestamp('not-a-date')).toBe('Processing...');
        });

        test('returns formatted string with timezone for valid dates', () => {
            const result = formatFullTimestamp('2026-05-29 10:30:00');
            expect(result).not.toBe('Processing...');
            expect(result).toContain('May');
            expect(result).toContain('2026');
            // Should contain a timezone abbreviation
            const tzAbbr = getTimeZoneAbbr();
            expect(result).toContain(tzAbbr);
        });

        test('always returns a safe string, never crashes', () => {
            const weirdInputs = [
                null,
                undefined,
                '',
                'garbage',
                '0000-00-00',
                'Feb 30 2026', // Invalid date
                NaN,
                {},
                [],
            ];
            for (const input of weirdInputs) {
                const result = formatFullTimestamp(input);
                // Should either be 'Processing...' or a formatted date
                expect(typeof result).toBe('string');
                expect(result.length).toBeGreaterThan(0);
            }
        });
    });

    // ─── getTimeZoneAbbr ───

    describe('getTimeZoneAbbr', () => {
        test('returns a non-empty string', () => {
            const result = getTimeZoneAbbr();
            expect(typeof result).toBe('string');
            expect(result.length).toBeGreaterThan(0);
        });

        test('falls back to IST on error', () => {
            // Mock Intl to throw
            const originalDateTimeFormat = Intl.DateTimeFormat;
            Intl.DateTimeFormat = function () {
                throw new Error('mock error');
            };
            expect(getTimeZoneAbbr()).toBe('IST');
            Intl.DateTimeFormat = originalDateTimeFormat;
        });
    });

    // ─── formatRelativeTime ───

    describe('formatRelativeTime', () => {
        test('returns "just now" for very recent dates', () => {
            const now = new Date();
            const result = formatRelativeTime(now.toISOString());
            expect(result).toBe('just now');
        });

        test('returns "Xm ago" for recent dates', () => {
            const past = new Date(Date.now() - 5 * 60 * 1000); // 5 min ago
            const result = formatRelativeTime(past.toISOString());
            expect(result).toMatch(/^5m ago$/);
        });

        test('returns "Xh ago" for hours ago', () => {
            const past = new Date(Date.now() - 3 * 60 * 60 * 1000); // 3 hours ago
            const result = formatRelativeTime(past.toISOString());
            expect(result).toMatch(/^3h ago$/);
        });

        test('returns "Xd ago" for days ago', () => {
            const past = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000); // 2 days ago
            const result = formatRelativeTime(past.toISOString());
            expect(result).toMatch(/^2d ago$/);
        });

        test('falls back to formatted date for >7 days ago', () => {
            const past = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000); // 10 days ago
            const result = formatRelativeTime(past.toISOString());
            // Should not match a relative format
            expect(result).not.toMatch(/^(just now|\d+[mhd] ago)$/);
            expect(result).not.toBe('');
        });

        test('returns empty string for null/undefined', () => {
            expect(formatRelativeTime(null)).toBe('');
            expect(formatRelativeTime(undefined)).toBe('');
        });

        test('returns formatted date for future dates', () => {
            const future = new Date(Date.now() + 24 * 60 * 60 * 1000); // tomorrow
            const result = formatRelativeTime(future.toISOString());
            expect(result).toBeTruthy();
            expect(typeof result).toBe('string');
        });
    });
});
