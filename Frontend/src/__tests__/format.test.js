/**
 * Unit tests for formatTicketId utility function.
 *
 * Tests cover:
 * - Basic UUID extraction (takes first segment, uppercases)
 * - Short string passthrough
 * - Null/undefined/empty handling
 * - Edge cases
 */

import { describe, it, expect } from 'vitest';
import { formatTicketId } from '../utils/format';

describe('formatTicketId', () => {
    describe('UUID input', () => {
        it('should extract and uppercase the first segment of a UUID', () => {
            expect(formatTicketId('abc12345-1234-5678-9abc-def012345678')).toBe('ABC12345');
        });

        it('should handle UUID with lowercase letters', () => {
            expect(formatTicketId('a1b2c3d4-5678-90ab-cdef-1234567890ab')).toBe('A1B2C3D4');
        });

        it('should handle UUID with mixed case', () => {
            expect(formatTicketId('AbCdEf12-3456-7890-abcd-ef1234567890')).toBe('ABCDEF12');
        });

        it('should handle full-length UUIDs', () => {
            const uuid = '550e8400-e29b-41d4-a716-446655440000';
            expect(formatTicketId(uuid)).toBe('550E8400');
        });
    });

    describe('short string passthrough', () => {
        it('should return short strings as-is', () => {
            expect(formatTicketId('TKT-001')).toBe('TKT-001');
        });

        it('should return 8-character strings unchanged', () => {
            expect(formatTicketId('TICKET01')).toBe('TICKET01');
        });

        it('should return single-character strings', () => {
            expect(formatTicketId('A')).toBe('A');
        });

        it('should not uppercase short alphanumeric strings', () => {
            expect(formatTicketId('abc')).toBe('abc');
        });
    });

    describe('null/undefined/empty input', () => {
        it('should return empty string for null', () => {
            expect(formatTicketId(null)).toBe('');
        });

        it('should return empty string for undefined', () => {
            expect(formatTicketId(undefined)).toBe('');
        });

        it('should return empty string for empty string', () => {
            expect(formatTicketId('')).toBe('');
        });
    });

    describe('edge cases', () => {
        it('should handle UUID with only numbers', () => {
            expect(formatTicketId('12345678-1234-5678-1234-567812345678')).toBe('12345678');
        });

        it('should handle non-UUID strings longer than 8 chars with hyphens', () => {
            expect(formatTicketId('hello-world-123')).toBe('HELLO');
        });

        it('should handle numeric input', () => {
            expect(formatTicketId(12345678)).toBe('12345678');
        });

        it('should handle very long strings without hyphens', () => {
            // Strings longer than 8 without hyphens → still just returns since split('-') gives the whole thing
            const longStr = 'abcdefghijklmnop';
            expect(formatTicketId(longStr)).toBe(longStr);
        });
    });
});