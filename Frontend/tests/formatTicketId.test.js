import test from 'node:test';
import assert from 'node:assert/strict';

import { formatTicketId } from '../src/utils/format.js';

// --- Null / undefined / empty input handling ---

test('formatTicketId returns empty string for null', () => {
    assert.equal(formatTicketId(null), '');
});

test('formatTicketId returns empty string for undefined', () => {
    assert.equal(formatTicketId(undefined), '');
});

test('formatTicketId returns empty string for empty string', () => {
    assert.equal(formatTicketId(''), '');
});

test('formatTicketId returns empty string for 0 (falsy number)', () => {
    assert.equal(formatTicketId(0), '');
});

// --- Short string passthrough (length <= 8) ---

test('formatTicketId returns short string as-is (1 char)', () => {
    assert.equal(formatTicketId('A'), 'A');
});

test('formatTicketId returns short string as-is (5 chars)', () => {
    assert.equal(formatTicketId('abc12'), 'abc12');
});

test('formatTicketId returns short string as-is (exactly 8 chars)', () => {
    assert.equal(formatTicketId('abcd1234'), 'abcd1234');
});

test('formatTicketId returns numeric short string as-is', () => {
    assert.equal(formatTicketId('12345'), '12345');
});

// --- UUID-style string extraction (first segment, uppercased) ---

test('formatTicketId extracts first segment of standard UUID', () => {
    const uuid = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
    assert.equal(formatTicketId(uuid), 'A1B2C3D4');
});

test('formatTicketId extracts first segment and uppercases it', () => {
    const uuid = 'abcdef12-3456-7890-abcd-ef1234567890';
    assert.equal(formatTicketId(uuid), 'ABCDEF12');
});

test('formatTicketId works with already-uppercase UUID', () => {
    const uuid = 'A1B2C3D4-E5F6-7890-ABCD-EF1234567890';
    assert.equal(formatTicketId(uuid), 'A1B2C3D4');
});

// --- Edge cases ---

test('formatTicketId handles string longer than 8 chars without hyphens', () => {
    // No hyphen, length > 8, split('-')[0] returns the whole string
    assert.equal(formatTicketId('abcdefghijklmnop'), 'ABCDEFGHIJKLMNOP');
});

test('formatTicketId handles string with single hyphen at position 8', () => {
    assert.equal(formatTicketId('abcd1234-rest'), 'ABCD1234');
});

test('formatTicketId handles numeric input that is a long number', () => {
    // 123456789 has length 9 > 8, split('-')[0] is '123456789'
    assert.equal(formatTicketId(123456789), '123456789');
});

test('formatTicketId handles UUID-like string with extra hyphens', () => {
    const input = 'abc-def-ghi-jkl-mno';
    // split('-')[0] = 'abc', length 3 <= 8 wait no, it's > 8? No, 'abc-def-ghi-jkl-mno' has length 19 > 8
    // So it goes to the UUID branch, split('-')[0] = 'ABC'
    assert.equal(formatTicketId(input), 'ABC');
});
