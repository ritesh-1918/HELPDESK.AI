import test from 'node:test';
import assert from 'node:assert/strict';

import { parseDate, formatTimelineDate, getTimeZoneAbbr, formatFullTimestamp, isValidDate, safeParseDateForSort } from '../src/utils/dateUtils.js';

// ---------------------------------------------------------------------------
// Safari-specific parsing (Issue #912 / #1174)
// ---------------------------------------------------------------------------

test('parseDate accepts Supabase timestamps with microseconds', () => {
    const parsed = parseDate('2026-06-01T12:34:56.123456+00:00');
    assert.ok(parsed instanceof Date);
    assert.equal(parsed.toISOString(), '2026-06-01T12:34:56.123Z');
});

test('parseDate normalizes timestamps with a space separator', () => {
    const parsed = parseDate('2026-06-01 12:34:56');
    assert.ok(parsed instanceof Date);
    assert.equal(parsed.toISOString(), '2026-06-01T12:34:56.000Z');
});

test('parseDate handles compact timezone offset (+0530)', () => {
    const parsed = parseDate('2024-01-15T10:30:00+0530');
    assert.ok(parsed instanceof Date);
    assert.ok(!isNaN(parsed.getTime()));
});

test('parseDate handles slash-separated date format', () => {
    const parsed = parseDate('2024/01/15');
    assert.ok(parsed instanceof Date);
    assert.ok(!isNaN(parsed.getTime()));
});

test('parseDate handles numeric epoch in milliseconds', () => {
    const parsed = parseDate('1705312200000');
    assert.ok(parsed instanceof Date);
    assert.ok(!isNaN(parsed.getTime()));
});

test('parseDate handles numeric epoch in seconds', () => {
    const parsed = parseDate('1705312200');
    assert.ok(parsed instanceof Date);
    assert.ok(!isNaN(parsed.getTime()));
});

// ---------------------------------------------------------------------------
// Robust fallbacks (Issue #1174)
// ---------------------------------------------------------------------------

test('formatTimelineDate returns Invalid Date for unparsable values', () => {
    assert.equal(formatTimelineDate('not-a-date'), 'Invalid Date');
});

test('formatTimelineDate returns Invalid Date for null', () => {
    assert.equal(formatTimelineDate(null), 'Invalid Date');
});

test('formatTimelineDate returns Invalid Date for undefined', () => {
    assert.equal(formatTimelineDate(undefined), 'Invalid Date');
});

test('formatTimelineDate returns Invalid Date for empty string', () => {
    assert.equal(formatTimelineDate(''), 'Invalid Date');
});

test('formatTimelineDate returns Invalid Date for whitespace-only string', () => {
    assert.equal(formatTimelineDate('   '), 'Invalid Date');
});

test('formatTimelineDate does not throw on HTML injection attempt', () => {
    assert.doesNotThrow(() => formatTimelineDate('<script>alert(1)</script>'));
    assert.equal(formatTimelineDate('<script>alert(1)</script>'), 'Invalid Date');
});

// ---------------------------------------------------------------------------
// Timezone configuration (Issue #1174)
// ---------------------------------------------------------------------------

test('getTimeZoneAbbr returns a non-empty string', () => {
    const tz = getTimeZoneAbbr();
    assert.ok(typeof tz === 'string');
    assert.ok(tz.length > 0);
});

test('formatFullTimestamp includes timezone parentheses for valid dates', () => {
    const result = formatFullTimestamp('2024-06-15T12:00:00Z');
    assert.ok(result.includes('('));
    assert.ok(result.includes(')'));
});

test('formatFullTimestamp returns Processing... for null', () => {
    assert.equal(formatFullTimestamp(null), 'Processing...');
});

test('formatFullTimestamp returns Processing... for invalid string', () => {
    assert.equal(formatFullTimestamp('invalid'), 'Processing...');
});

// ---------------------------------------------------------------------------
// isValidDate (Issue #1174)
// ---------------------------------------------------------------------------

test('isValidDate returns true for valid ISO-8601 string', () => {
    assert.equal(isValidDate('2024-01-15T10:30:00Z'), true);
});

test('isValidDate returns true for space-separated Supabase timestamp', () => {
    assert.equal(isValidDate('2024-01-15 10:30:00'), true);
});

test('isValidDate returns false for null', () => {
    assert.equal(isValidDate(null), false);
});

test('isValidDate returns false for empty string', () => {
    assert.equal(isValidDate(''), false);
});

test('isValidDate returns false for non-date string', () => {
    assert.equal(isValidDate('not-a-date'), false);
});

// ---------------------------------------------------------------------------
// safeParseDateForSort (Issue #1174)
// ---------------------------------------------------------------------------

test('safeParseDateForSort returns epoch for null', () => {
    const result = safeParseDateForSort(null);
    assert.ok(result instanceof Date);
    assert.equal(result.getTime(), 0);
});

test('safeParseDateForSort returns valid Date for Supabase timestamp', () => {
    const result = safeParseDateForSort('2024-01-15 10:30:00');
    assert.ok(result instanceof Date);
    assert.ok(!isNaN(result.getTime()));
});

test('safeParseDateForSort can be used in sort comparator without throwing', () => {
    const items = [
        { created_at: '2024-03-01 08:00:00' },
        { created_at: '2024-01-15T10:30:00Z' },
        { created_at: null },
    ];
    assert.doesNotThrow(() => {
        items.sort((a, b) => safeParseDateForSort(a.created_at) - safeParseDateForSort(b.created_at));
    });
    assert.equal(items[0].created_at, null);
});
