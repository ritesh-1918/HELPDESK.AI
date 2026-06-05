/**
 * @fileoverview Date utility module for Safari-safe ISO-8601 parsing and formatting.
 * Provides robust fallbacks for invalid or empty dates, and full type annotations
 * for IDE support and static analysis.
 *
 * Fixes #1411: adds `safeParseDate`, `normalizeTimestamp`, and `formatDisplayDate`
 * so that the Ticket Timeline never displays blank or "Invalid Date" text on Safari.
 *
 * @module dateUtils
 */

/**
 * @typedef {Object} DateFormatOptions
 * @property {boolean} [showTime=true] - Whether to include time in the formatted output.
 * @property {boolean} [use24Hour=false] - Whether to use 24-hour time format (vs 12-hour with AM/PM).
 * @property {'short'|'long'} [dateStyle='short'] - Style for date part (short: 'Jan 15, 2023', long: 'January 15, 2023').
 */

// ---------------------------------------------------------------------------
// Constants & Regex (cached for performance)
// ---------------------------------------------------------------------------

/** @private @type {RegExp} Space separated date/time */
const RE_SPACE = / /g;

/** @private @type {RegExp} Compact timezone offset like +0530 or -0530 */
const RE_TZ_COMPACT = /[+-]\d{4}$/;

/** @private @type {RegExp} Any timezone indicator (Z, +, -) at the end */
const RE_TZ_INDICATOR = /[Z+-]\d{2}:\d{2}$/i;

/** @private @type {RegExp} Comma as decimal separator in milliseconds */
const RE_COMMA_MILLIS = /,(\d{3})(?=\.\d+|Z|[+-]|$)/g;

// ---------------------------------------------------------------------------
// Logging infrastructure
// ---------------------------------------------------------------------------

/**
 * Default logger that writes to console. Used when no custom logger is set.
 * @private
 * @type {Console}
 */
const defaultLogger = {
  debug:   (...args) => console.debug('[dateUtils]', ...args),
  info:    (...args) => console.info('[dateUtils]', ...args),
  warn:    (...args) => console.warn('[dateUtils]', ...args),
  error:   (...args) => console.error('[dateUtils]', ...args),
};

/** @private @type {import('./logger')|Console} Logger instance */
let logger = defaultLogger;

/**
 * Replace the default logger with a custom one.
 * @param {{ debug: Function, info: Function, warn: Function, error: Function }} customLogger
 * @returns {void}
 * @throws {TypeError} If customLogger is missing required methods.
 */
export function setLogger(customLogger) {
  const required = /** @type {const} */ ['debug', 'info', 'warn', 'error'];
  for (const method of required) {
    if (typeof customLogger[method] !== 'function') {
      throw new TypeError(
        `[dateUtils] Logger must implement '${method}' as a function. Got: ${typeof customLogger[method]}`
      );
    }
  }
  logger = customLogger;
}

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

/**
 * Checks whether a value represents a parsable date (string, number, Date).
 * Returns true only for valid, finite dates.
 * @param {*} value - Any value to test.
 * @returns {boolean} `true` if the value represents a valid, parsable date.
 * @example
 * isValidDate('2023-01-15') // true
 * isValidDate(null)         // false
 */
export function isValidDate(value) {
  // Numeric timestamps are valid if finite
  if (typeof value === 'number') {
    return Number.isFinite(value);
  }

  if (value instanceof Date) {
    return value instanceof Date && !isNaN(value.getTime());
  }

  if (typeof value !== 'string') {
    return false;
  }

  const trimmed = value.trim();
  if (trimmed === '') {
    return false;
  }

  try {
    const normalized = normalizeISODate(trimmed);
    return !isNaN(Date.parse(normalized));
  } catch (err) {
    logger.warn('[dateUtils] isValidDate exception: %s', err.message);
    return false;
  }
}

/**
 * Return true if the input is a Date object that represents a valid date.
 * @param {*} date - Input to test.
 * @returns {boolean}
 */
export function isValidDateInstance(date) {
  return date instanceof Date && !isNaN(date.getTime());
}

// ---------------------------------------------------------------------------
// Core normalization (internal)
// ---------------------------------------------------------------------------

/**
 * Normalises an ISO-8601-like string into a Safari-safe, strict ISO-8601 string.
 *
 * Handles the following edge cases:
 * - Space instead of 'T' between date and time.
 * - Comma as decimal point for milliseconds.
 * - Timezone offset without colon (e.g., `+0530` -> `+05:30`).
 * - Missing timezone indicator (assumes UTC, appends `Z`).
 *
 * @private
 * @param {string} input - Raw timestamp string (e.g., from Supabase).
 * @returns {string} Normalised ISO-8601 string guaranteed to parse in all modern browsers.
 */
function normalizeISODate(input) {
  if (typeof input !== 'string') {
    logger.warn(
      '[dateUtils] normalizeISODate received non-string input: %s. Converting to string.',
      typeof input
    );
    input = (input === null || input === undefined) ? '' : String(input);
  }

  let normalized = input.trim();

  // Replace space separator with 'T' (Supabase sometimes returns "2022-01-01 00:00:00")
  normalized = normalized.replace(RE_SPACE, 'T');

  // Insert colon in compact timezone offset: +0530 -> +05:30
  const compactTz = RE_TZ_COMPACT.exec(normalized);
  if (compactTz) {
    const offsetStr = compactTz[0];
    normalized = normalized.replace(offsetStr, offsetStr.slice(0, 3) + ':' + offsetStr.slice(3));
  }

  // Assume UTC if no timezone indicator
  if (!RE_TZ_INDICATOR.test(normalized)) {
    normalized += 'Z';
  }

  // Replace comma with dot for milliseconds (Safari may misinterpret comma)
  normalized = normalized.replace(RE_COMMA_MILLIS, '.$1$2');

  // Validate after normalisation
  const parsed = Date.parse(normalized);
  if (isNaN(parsed)) {
    logger.warn('[dateUtils] Normalised date is still invalid: "%s" (original: "%s")', normalized, input);
  }

  return normalized;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Parses a date value into a validated `Date` object.
 *
 * - Accepts strings, numbers (timestamps), `Date` instances, `null`, `undefined`.
 * - Returns current date/time for any invalid or empty input by default.
 * - Every fallback is logged at `warn` level.
 *
 * @param {string|number|Date|null|undefined} input - The date value to parse.
 * @param {Object} [options] - Parsing options.
 * @param {boolean} [options.fallbackToNow=true] - Whether to fall back to current date on invalid input.
 * @returns {Date} A valid `Date` object (never invalid Date).
 * @throws {Error} If `fallbackToNow` is false and input is invalid.
 * @example
 * parseDate('2023-01-15T10:30:00Z')          // Date representing Jan 15, 2023 10:30 UTC
 * parseDate(null)                            // current date (fallback)
 * parseDate('invalid', { fallbackToNow: false }) // throws Error
 */
export function parseDate(input, options = {}) {
  const { fallbackToNow = true } = options;

  // Handle Date objects directly
  if (input instanceof Date) {
    return isValidDateInstance(input) ? new Date(input.getTime()) : fallbackDate(fallbackToNow);
  }

  // Handle numeric timestamps (milliseconds)
  if (typeof input === 'number') {
    if (Number.isFinite(input)) {
      const d = new Date(input);
      return isValidDateInstance(d) ? d : fallbackDate(fallbackToNow);
    }
    return fallbackDate(fallbackToNow);
  }

  // Handle strings
  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (trimmed === '') {
      return fallbackDate(fallbackToNow);
    }

    try {
      const normalized = normalizeISODate(trimmed);
      const parsed = Date.parse(normalized);
      if (!isNaN(parsed)) {
        return new Date(parsed);
      }
    } catch (err) {
      logger.warn('[dateUtils] parseDate error for input "%s": %s', input, err.message);
    }
  }

  // Null, undefined, or any other falsy/primitive
  return fallbackDate(fallbackToNow);
}

/**
 * Helper to return fallback date or throw.
 * @private
 * @param {boolean} fallbackToNow
 * @returns {Date}
 * @throws {Error} If fallbackToNow is false.
 */
function fallbackDate(fallbackToNow) {
  if (!fallbackToNow) {
    throw new Error('[dateUtils] Invalid date value. fallbackToNow is disabled.');
  }
  logger.warn('[dateUtils] Invalid date input; falling back to current time.');
  return new Date();
}

/**
 * Parses a date value safely, always returning a valid Date instance.
 *
 * Unlike `parseDate`, this function never throws â€” invalid or empty inputs
 * silently fall back to the current local timestamp.
 * Used by the Ticket Timeline component to avoid blank date rendering on Safari.
 *
 * @param {string|number|Date|null|undefined} input - Raw date value (e.g., from Supabase).
 * @returns {Date} A valid `Date` object; `new Date()` (current time) if input cannot be parsed.
 * @example
 * safeParseDate(null)                         // new Date()  (current time)
 * safeParseDate('2023-01-15 10:30:00')        // Safari-safe parsed Date
 * safeParseDate('2023-01-15T10:30:00+0530')   // Parsed with tz colon normalised
 */
export function safeParseDate(input) {
  return parseDate(input, { fallbackToNow: true });
}

/**
 * Normalises a raw timestamp string into a strict ISO-8601 string that
 * Safari's `Date` constructor can parse without errors.
 *
 * This is the public surface for the internal `normalizeISODate` helper.
 * Falls back to the current UTC timestamp (`new Date().toISOString()`) for
 * falsy or non-parseable inputs so callers always receive a valid string.
 *
 * @param {string|null|undefined} input - Raw timestamp from the database.
 * @returns {string} Safari-safe ISO-8601 string.
 * @example
 * normalizeTimestamp('2022-01-01 00:00:00')          // '2022-01-01T00:00:00Z'
 * normalizeTimestamp('2022-01-15T10:30:00.123456+0530') // '2022-01-15T10:30:00.123456+05:30'
 * normalizeTimestamp(null)                            // current ISO timestamp
 * normalizeTimestamp('')                              // current ISO timestamp
 */
export function normalizeTimestamp(input) {
  if (input === null || input === undefined || input === '') {
    logger.warn('[dateUtils] normalizeTimestamp received empty input; returning current ISO timestamp.');
    return new Date().toISOString();
  }
  try {
    return normalizeISODate(String(input));
  } catch (err) {
    logger.warn('[dateUtils] normalizeTimestamp error for "%s": %s', input, err.message);
    return new Date().toISOString();
  }
}

/**
 * Formats a date value for display in the Ticket Timeline.
 *
 * Unlike `formatDate`, this function never returns a blank or 'â€”' string.
 * Invalid or empty inputs fall back to the current local timestamp formatted
 * in the same style, ensuring the UI always shows a meaningful date rather
 * than a blank or error placeholder.
 *
 * @param {string|number|Date|null|undefined} input - Raw date value.
 * @param {DateFormatOptions} [formatOptions] - Format options (same as `formatDate`).
 * @returns {string} Formatted date string; never 'â€”' or empty.
 * @example
 * formatDisplayDate('2023-01-15T10:30:00Z')  // "Jan 15, 2023, 10:30 AM"
 * formatDisplayDate(null)                    // formatted current timestamp
 * formatDisplayDate('corrupted')             // formatted current timestamp
 */
export function formatDisplayDate(input, formatOptions = {}) {
  const formatted = formatDate(input, formatOptions);
  if (!formatted || formatted === 'â€”') {
    logger.warn('[dateUtils] formatDisplayDate: invalid date "%s"; falling back to current timestamp.', input);
    return formatDate(new Date(), formatOptions);
  }
  return formatted;
}

/**
 * Formats a date value into a human-readable string.
 *
 * @param {string|number|Date|null|undefined} input - The date to format.
 * @param {DateFormatOptions} [formatOptions] - Format options.
 * @param {boolean} [formatOptions.showTime=true] - Include time part.
 * @param {boolean} [formatOptions.use24Hour=false] - 24-hour format.
 * @param {'short'|'long'} [formatOptions.dateStyle='short'] - Date style.
 * @returns {string} Formatted date string. If input is invalid, returns 'â€”' (em dash).
 * @example
 * formatDate('2023-01-15T10:30:00Z')                  // "Jan 15, 2023, 10:30 AM"
 * formatDate('2023-01-15', { showTime: false })       // "Jan 15, 2023"
 * formatDate('invalid')                               // "â€”"
 */
export function formatDate(input, formatOptions = {}) {
  const {
    showTime = true,
    use24Hour = false,
    dateStyle = 'short',
  } = formatOptions;

  try {
    const date = parseDate(input, { fallbackToNow: false });
    if (!isValidDateInstance(date)) {
      return 'â€”';
    }

    const locale = 'en-US';

    /** @type {Intl.DateTimeFormatOptions} */
    const options = {};

    if (dateStyle === 'long') {
      options.year = 'numeric';
      options.month = 'long';
      options.day = 'numeric';
    } else {
      // short: 'Jan 15, 2023'
      options.year = 'numeric';
      options.month = 'short';
      options.day = 'numeric';
    }

    if (showTime) {
      options.hour = use24Hour ? '2-digit' : 'numeric';
      options.minute = '2-digit';
      if (use24Hour) {
        options.hourCycle = 'h23';
      } else {
        options.hour12 = true;
      }
    }

    const formatter = new Intl.DateTimeFormat(locale, options);
    return formatter.format(date);
  } catch (err) {
    logger.error('[dateUtils] formatDate unexpected error: %s', err.message);
    return 'â€”';
  }
}

/**
 * Returns the current timestamp in ISO-8601 format (UTC).
 * Useful for logging timestamps.
 * @returns {string} Current date in ISO string.
 */
export function nowISO() {
  return new Date().toISOString();
}

/**
 * Gets the age of a date from now in human-readable format (e.g., "2h ago", "3d ago").
 * @param {string|number|Date|null|undefined} input - The date to compare.
 * @returns {string} Human readable time difference or "â€”" if invalid.
 */
export function timeAgo(input) {
  const date = parseDate(input, { fallbackToNow: false });
  if (!isValidDateInstance(date)) {
    return 'â€”';
  }

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr  = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);
  const diffWk  = Math.floor(diffDay / 7);

  if (diffSec < 0) {
    return 'in the future';
  }
  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24)  return `${diffHr}h ago`;
  if (diffDay < 7)  return `${diffDay}d ago`;
  if (diffWk < 5)   return `${diffWk}w ago`;
  return 'long ago';
}

// ---------------------------------------------------------------------------
// Default export (named module)
// ---------------------------------------------------------------------------

/**
 * @typedef {Object} DateUtilsAPI
 * @property {Function} setLogger
 * @property {Function} isValidDate
 * @property {Function} isValidDateInstance
 * @property {Function} parseDate
 * @property {Function} safeParseDate
 * @property {Function} normalizeTimestamp
 * @property {Function} formatDate
 * @property {Function} formatDisplayDate
 * @property {Function} nowISO
 * @property {Function} timeAgo
 */

/** @type {DateUtilsAPI} */
const dateUtils = {
  setLogger,
  isValidDate,
  isValidDateInstance,
  parseDate,
  safeParseDate,
  normalizeTimestamp,
  formatDate,
  formatDisplayDate,
  nowISO,
  timeAgo,
};

export default dateUtils;
