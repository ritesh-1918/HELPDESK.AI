import { formatTicketId } from './format';

describe('formatTicketId', () => {
  test('returns empty string for null input', () => {
    expect(formatTicketId(null)).toBe('');
  });

  test('returns empty string for undefined input', () => {
    expect(formatTicketId(undefined)).toBe('');
  });

  test('returns empty string for empty string input', () => {
    expect(formatTicketId('')).toBe('');
  });

  test('returns the original string if length <= 8', () => {
    expect(formatTicketId('ABC123')).toBe('ABC123');
    expect(formatTicketId('12345678')).toBe('12345678');
  });

  test('returns the uppercase first segment of a UUID', () => {
    const result = formatTicketId('550e8400-e29b-41d4-a716-446655440000');
    expect(result).toBe('550E8400');
  });

  test('handles numeric UUID-like strings', () => {
    const result = formatTicketId(550e8400e29b41d4);
    expect(result).toBe('550E8400');
  });
});
