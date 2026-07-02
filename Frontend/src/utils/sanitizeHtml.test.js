/**
 * Tests for sanitizeHtml utility.
 * Verifies that XSS vectors are stripped from ticket log HTML.
 */
import { sanitizeHtml, escapeHtml } from '../sanitizeHtml';

// ── sanitizeHtml ──────────────────────────────────────────────────────────────

describe('sanitizeHtml', () => {
  test('returns empty string for falsy input', () => {
    expect(sanitizeHtml('')).toBe('');
    expect(sanitizeHtml(null)).toBe('');
    expect(sanitizeHtml(undefined)).toBe('');
  });

  test('passes safe paragraph text through', () => {
    const input = '<p>Hello, world!</p>';
    expect(sanitizeHtml(input)).toContain('Hello, world!');
  });

  test('strips <script> tags and their content', () => {
    const input = '<p>Safe</p><script>alert("xss")</script>';
    const result = sanitizeHtml(input);
    expect(result).not.toContain('<script');
    expect(result).not.toContain('alert');
    expect(result).toContain('Safe');
  });

  test('strips onclick and other event handler attributes', () => {
    const input = '<div onclick="alert(1)">Click me</div>';
    const result = sanitizeHtml(input);
    expect(result).not.toContain('onclick');
    expect(result).toContain('Click me');
  });

  test('strips onerror attribute from img tags', () => {
    const input = '<img src="x" onerror="alert(1)">';
    const result = sanitizeHtml(input);
    expect(result).not.toContain('onerror');
  });

  test('strips javascript: href links', () => {
    const input = '<a href="javascript:alert(1)">click</a>';
    const result = sanitizeHtml(input);
    expect(result).not.toContain('javascript:');
    expect(result).toContain('click');
  });

  test('strips data: URLs from href', () => {
    const input = '<a href="data:text/html,<script>alert(1)</script>">x</a>';
    const result = sanitizeHtml(input);
    expect(result).not.toContain('data:');
  });

  test('strips <iframe> tags', () => {
    const input = '<iframe src="https://evil.com"></iframe>';
    const result = sanitizeHtml(input);
    expect(result).not.toContain('<iframe');
  });

  test('strips <style> tags', () => {
    const input = '<style>body{display:none}</style><p>visible</p>';
    const result = sanitizeHtml(input);
    expect(result).not.toContain('<style');
    expect(result).toContain('visible');
  });

  test('allows safe formatting tags', () => {
    const input = '<p><strong>Bold</strong> and <em>italic</em></p>';
    const result = sanitizeHtml(input);
    expect(result).toContain('<strong>Bold</strong>');
    expect(result).toContain('<em>italic</em>');
  });

  test('adds rel="noopener noreferrer" to external links', () => {
    const input = '<a href="https://example.com">Link</a>';
    const result = sanitizeHtml(input);
    expect(result).toContain('noopener');
    expect(result).toContain('noreferrer');
  });

  test('strips unknown tags but keeps text', () => {
    const input = '<custom-tag>text</custom-tag>';
    const result = sanitizeHtml(input);
    expect(result).not.toContain('<custom-tag');
    expect(result).toContain('text');
  });
});

// ── escapeHtml ────────────────────────────────────────────────────────────────

describe('escapeHtml', () => {
  test('returns empty string for falsy input', () => {
    expect(escapeHtml('')).toBe('');
    expect(escapeHtml(null)).toBe('');
  });

  test('escapes < and >', () => {
    expect(escapeHtml('<b>test</b>')).toBe('&lt;b&gt;test&lt;/b&gt;');
  });

  test('escapes &', () => {
    expect(escapeHtml('a & b')).toBe('a &amp; b');
  });

  test('escapes double quotes', () => {
    expect(escapeHtml('"quoted"')).toBe('&quot;quoted&quot;');
  });

  test('escapes single quotes', () => {
    expect(escapeHtml("it's")).toBe('it&#x27;s');
  });

  test('handles plain text without special chars', () => {
    expect(escapeHtml('Hello World')).toBe('Hello World');
  });
});
