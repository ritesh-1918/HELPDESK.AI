/**
 * Unified Date Utility for HELPDESK.AI
 *
 * Safari-compatible date parsing. Older Safari versions (and some other
 * browsers) reject ISO-8601 strings that use a space separator instead of
 * "T", or that omit sub-second precision after the timezone offset. This
 * module normalises every incoming date string into a format that all
 * browsers can parse reliably before handing it to the Date constructor.
 *
 * Key fixes:
 *  - Replace space separator with "T" (e.g. "2026-05-30 14:30:00Z" → "2026-05-30T14:30:00Z")
 *  - Ensure timezone indicator is present (append "Z" for UTC if missing)
 *  - Strip non-standard fractional-second trailing chars Safari chokes on
 *  - Graceful fallback: return current local timestamp for null/empty/corrupt dates
 */

const SAFARI_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?(Z|[+-]\d{2}:?\d{2})?$/;

/**
 * Normalise an ISO-8601-ish date string so Safari can parse it.
 * Returns a parseable string or null if the input is fundamentally broken.
 */
export const normaliseDateString = (dateStr) => {
  if (!dateStr || typeof dateStr !== 'string') return null;

  const trimmed = dateStr.trim();
  if (!trimmed) return null;

  // Fast path: already a standard ISO string Safari likes
  const fastDate = new Date(trimmed);
  if (!isNaN(fastDate.getTime())) return trimmed;

  // Try regex-based normalisation
  const match = trimmed.match(SAFARI_DATE_RE);
  if (match) {
    const [, y, mo, d, h, mi, s, frac, tz] = match;
    const fracNormalised = frac ? `.${frac.slice(0, 3).padEnd(3, '0')}` : '';
    const tzNormalised = tz ? (tz === 'Z' ? 'Z' : tz.length === 5 ? tz : `${tz.slice(0, 3)}:${tz.slice(3)}`) : 'Z';
    return `${y}-${mo}-${d}T${h}:${mi}:${s}${fracNormalised}${tzNormalised}`;
  }

  // Last resort: try replacing space with T and appending Z
  const withT = trimmed.replace(' ', 'T');
  const withZ = (!withT.includes('Z') && !withT.includes('+') && !withT.includes('T') && withT.includes('T'))
    ? withT
    : (!withT.includes('Z') && !withT.includes('+')) ? withT + 'Z' : withT;
  const lastDate = new Date(withZ);
  if (!isNaN(lastDate.getTime())) return withZ;

  return null;
};

/**
 * Safely parse a date string into a Date object across all browsers.
 * Returns null for unparseable input.
 */
export const safeParseDate = (dateStr) => {
  if (!dateStr) return null;

  const normalised = normaliseDateString(dateStr);
  if (normalised === null) return null;

  const date = new Date(normalised);
  return isNaN(date.getTime()) ? null : date;
};

/**
 * Format a date string for display in the ticket timeline.
 * Returns a locale-aware string, or a graceful fallback for bad input.
 */
export const formatTimelineDate = (dateStr) => {
  if (!dateStr) return null;

  const date = safeParseDate(dateStr);

  // Graceful fallback: return current local timestamp for corrupt/empty dates
  if (!date) {
    return new Date().toLocaleString(undefined, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  return date.toLocaleString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

/**
 * Get the user's timezone abbreviation (e.g. "EST", "PST", "IST").
 */
export const getTimeZoneAbbr = () => {
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZoneName: 'short'
    })
      .formatToParts(new Date())
      .find(part => part.type === 'timeZoneName')?.value || 'IST';
  } catch (_e) {
    return 'IST';
  }
};

/**
 * Format a date with full timestamp and timezone abbreviation.
 * Returns "Processing..." for null input, or a graceful fallback for bad dates.
 */
export const formatFullTimestamp = (dateStr) => {
  const formatted = formatTimelineDate(dateStr);
  if (!formatted) return 'Processing...';
  return `${formatted} (${getTimeZoneAbbr()})`;
};
