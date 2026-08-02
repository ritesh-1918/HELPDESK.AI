/**
 * Safari-safe date helpers for ticket timeline formatting.
 * Normalizes Supabase-style timestamps, tolerates older Safari parsing quirks,
 * and falls back to the current local time when formatting invalid values.
 */

const SPACE_RE = / /g;
const COMPACT_TZ_RE = /([+-]\d{2})(\d{2})$/;
const MICROSECONDS_RE = /\.(\d{3})\d+/;
const TZ_INDICATOR_RE = /(Z|[+-]\d{2}:\d{2})$/i;

const LOCALE = 'en-US';

function normalizeTimestampString(value) {
  if (typeof value !== 'string') {
    return null;
  }

  let normalized = value.trim();
  if (normalized === '') {
    return null;
  }

  normalized = normalized.replace(SPACE_RE, 'T');
  normalized = normalized.replace(COMPACT_TZ_RE, '$1:$2');
  normalized = normalized.replace(MICROSECONDS_RE, '.$1');

  if (!TZ_INDICATOR_RE.test(normalized)) {
    normalized += 'Z';
  }

  return normalized;
}

export function parseDate(input) {
  if (input instanceof Date) {
    return Number.isNaN(input.getTime()) ? null : input;
  }

  if (typeof input === 'number') {
    if (!Number.isFinite(input)) {
      return null;
    }

    const millis = Math.abs(input) < 1e12 ? input * 1000 : input;
    const parsed = new Date(millis);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  if (typeof input !== 'string') {
    return null;
  }

  const trimmed = input.trim();
  if (trimmed === '') {
    return null;
  }

  if (/^[+-]?\d+$/.test(trimmed)) {
    const numeric = Number(trimmed);
    if (!Number.isFinite(numeric)) {
      return null;
    }

    const millis = Math.abs(numeric) < 1e12 ? numeric * 1000 : numeric;
    const parsed = new Date(millis);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const normalized = normalizeTimestampString(trimmed) ?? trimmed;
  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function isValidDate(value) {
  return parseDate(value) !== null;
}

function formatLocalDate(date) {
  return date.toLocaleString(LOCALE, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: process.env.TZ || undefined,
  });
}

export function getTimeZoneAbbr() {
  try {
    if (typeof Intl === 'undefined' || typeof Intl.DateTimeFormat !== 'function') {
      return 'UTC';
    }

    const parts = new Intl.DateTimeFormat(LOCALE, {
      timeZoneName: 'short',
      timeZone: process.env.TZ || undefined,
    }).formatToParts(new Date());

    const tzPart = parts.find((part) => part.type === 'timeZoneName');
    return tzPart?.value || 'UTC';
  } catch {
    return 'UTC';
  }
}

export function formatTimelineDate(input) {
  const parsed = parseDate(input) ?? new Date();
  return formatLocalDate(parsed);
}

export function formatFullTimestamp(input) {
  const parsed = parseDate(input) ?? new Date();
  return `${formatLocalDate(parsed)} (${getTimeZoneAbbr()})`;
}

export function safeParseDateForSort(input) {
  return parseDate(input) ?? new Date();
}

export default {
  parseDate,
  isValidDate,
  getTimeZoneAbbr,
  formatTimelineDate,
  formatFullTimestamp,
  safeParseDateForSort,
};
