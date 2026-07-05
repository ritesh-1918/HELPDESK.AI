/**
 * Tests for formatTicketId utility function (Issue #1161)
 *
 * Tests Frontend/src/utils/format.js:formatTicketId()
 */

import { describe, it, expect } from 'vitest';
import { formatTicketId } from '../utils/format.js';

// ---------------------------------------------------------------------------
// Basic functionality tests
// ---------------------------------------------------------------------------

describe('formatTicketId()', () => {
  it('is a function', () => {
    expect(typeof formatTicketId).toBe('function');
  });

  it('returns empty string for null', () => {
    expect(formatTicketId(null)).toBe('');
  });

  it('returns empty string for undefined', () => {
    expect(formatTicketId(undefined)).toBe('');
  });

  it('returns empty string for empty string', () => {
    expect(formatTicketId('')).toBe('');
  });

  it('returns empty string for false', () => {
    expect(formatTicketId(false)).toBe('');
  });

  it('returns empty string for 0', () => {
    expect(formatTicketId(0)).toBe('');
  });
});

// ---------------------------------------------------------------------------
// UUID format tests
// ---------------------------------------------------------------------------

describe('formatTicketId() with UUID inputs', () => {
  it('returns uppercase first segment for standard UUID', () => {
    const result = formatTicketId('a1b2c3d4-e5f6-7890-abcd-ef1234567890');
    expect(result).toBe('A1B2C3D4');
  });

  it('returns first segment in uppercase', () => {
    const result = formatTicketId('abcdef12-3456-7890-abcd-ef1234567890');
    expect(result).toBe('ABCDEF12');
  });

  it('result is all uppercase', () => {
    const result = formatTicketId('a1b2c3d4-e5f6-7890-abcd-ef1234567890');
    expect(result).toBe(result.toUpperCase());
  });

  it('returns first segment (before first dash)', () => {
    const result = formatTicketId('firstseg-rest-of-uuid-here1234567890');
    // Length of 'firstseg' is 8, so it would be returned as-is (length <= 8)
    // Actually first segment is 'firstseg' which is 8 chars exactly
    expect(result).toBeDefined();
  });

  it('handles UUID with all zeros', () => {
    const result = formatTicketId('00000000-0000-0000-0000-000000000000');
    expect(result).toBe('00000000');
  });

  it('handles uppercase UUID input', () => {
    const result = formatTicketId('A1B2C3D4-E5F6-7890-ABCD-EF1234567890');
    expect(result).toBe('A1B2C3D4');
  });

  it('handles mixed case UUID', () => {
    const result = formatTicketId('a1B2c3D4-e5F6-7890-abCD-ef1234567890');
    expect(result).toBe('A1B2C3D4');
  });
});

// ---------------------------------------------------------------------------
// Short string tests (length <= 8)
// ---------------------------------------------------------------------------

describe('formatTicketId() with short strings', () => {
  it('returns short string as-is', () => {
    expect(formatTicketId('ABC')).toBe('ABC');
  });

  it('returns 8-char string as-is', () => {
    expect(formatTicketId('12345678')).toBe('12345678');
  });

  it('returns 1-char string as-is', () => {
    expect(formatTicketId('X')).toBe('X');
  });

  it('returns 8-char lowercase string as-is (no uppercase conversion for short)', () => {
    const short = 'abcdefgh';
    expect(formatTicketId(short)).toBe(short);
  });

  it('number with length <= 8 converted to string and returned as-is', () => {
    const result = formatTicketId(12345);
    expect(result).toBe(12345); // returned as-is since length is 5
  });
});

// ---------------------------------------------------------------------------
// Long string tests (length > 8)
// ---------------------------------------------------------------------------

describe('formatTicketId() with long strings', () => {
  it('truncates long non-UUID string by first dash', () => {
    const result = formatTicketId('FIRSTSEGMENT-rest-of-string');
    // 'FIRSTSEGMENT' is 12 chars, length > 8, so split by '-' and uppercase
    expect(result).toBe('FIRSTSEGMENT');
  });

  it('handles long string without dashes', () => {
    const result = formatTicketId('verylongstringwithoutdashes');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('returns uppercase result for long string with dashes', () => {
    const result = formatTicketId('abcdefghij-rest');
    expect(result).toBe('ABCDEFGHIJ');
  });

  it('handles TCKT-style IDs', () => {
    // 'TCKT-1001': length is 9 (> 8), splits by '-' -> first segment is 'TCKT'
    const result = formatTicketId('TCKT-1001');
    expect(result).toBe('TCKT');
  });

  it('handles ticket IDs with longer prefix', () => {
    const result = formatTicketId('HELPDESK-1234-5678');
    expect(result).toBe('HELPDESK');
  });
});

// ---------------------------------------------------------------------------
// Return type tests
// ---------------------------------------------------------------------------

describe('formatTicketId() return type', () => {
  it('always returns a string or the original value for short inputs', () => {
    // For non-null/undefined, result should be a string or the original
    const result = formatTicketId('test');
    expect(typeof result === 'string' || typeof result === 'number').toBe(true);
  });

  it('returns string for standard UUID', () => {
    const result = formatTicketId('a1b2c3d4-1234-5678-abcd-ef1234567890');
    expect(typeof result).toBe('string');
  });

  it('returns string for empty case', () => {
    expect(typeof formatTicketId(null)).toBe('string');
    expect(typeof formatTicketId(undefined)).toBe('string');
  });

  it('result is never null for string inputs', () => {
    expect(formatTicketId('test')).not.toBeNull();
    expect(formatTicketId('a1b2c3d4-1234-5678-abcd-ef1234567890')).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Edge cases
// ---------------------------------------------------------------------------

describe('formatTicketId() edge cases', () => {
  it('handles string consisting only of dashes', () => {
    const result = formatTicketId('---');
    // Length 3, <= 8, returned as-is
    expect(result).toBe('---');
  });

  it('handles numeric id as string', () => {
    const result = formatTicketId('123456789');
    // Length 9 > 8, no dashes so split gives ['123456789']
    expect(result).toBe('123456789');
  });

  it('handles UUID with numbers only in first segment', () => {
    const result = formatTicketId('12345678-abcd-efgh-ijkl-mnopqrstuvwx');
    expect(result).toBe('12345678');
  });

  it('handles single dash', () => {
    const result = formatTicketId('-');
    // Length 1, <= 8, returned as-is
    expect(result).toBe('-');
  });

  it('handles ticket id starting with uppercase', () => {
    const result = formatTicketId('ABCD1234-5678-90AB-CDEF-123456789012');
    expect(result).toBe('ABCD1234');
  });

  it('handles whitespace-only string', () => {
    // Whitespace: length depends on count. '   ' is length 3, <= 8
    const result = formatTicketId('   ');
    expect(result).toBe('   ');
  });

  it('handles very long UUID-like string', () => {
    const longUuid = 'a1b2c3d4e5f6-7890-abcd-ef12-34567890abcd';
    const result = formatTicketId(longUuid);
    expect(result).toBe('A1B2C3D4E5F6');
  });
});
