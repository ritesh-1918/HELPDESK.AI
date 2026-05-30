/**
 * Unified Date Utility for HELPDESK.AI
 * Fixes timezone shift issues by explicitly forcing local display.
 * Compatible with Safari, Firefox, and Chrome across all supported Supabase date formats.
 */

const ISO_DATE_REGEX = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?(Z|[+-]\d{2}:?\d{2})?$/;
const DATE_ONLY_REGEX = /^(\d{4})-(\d{2})-(\d{2})$/;
const DATETIME_SPACE_REGEX = /^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?$/;
const HAS_TIMEZONE = /[Zz]|[+-]\d{2}:?\d{2}$/;

/**
 * Parse a date string into a Date object, with explicit handling for Safari compatibility.
 * Safari is strict about ISO 8601 parsing — it rejects dates without TZ info and
 * dates using space separators instead of 'T'.
 */
const parseDateSafely = (dateStr) => {
    if (!dateStr) return null;

    if (typeof dateStr === 'number') {
        return new Date(dateStr);
    }

    if (typeof dateStr === 'string') {
        const trimmed = dateStr.trim();

        // Handle "YYYY-MM-DD HH:MM:SS" format (space separator — Safari fails on this)
        const spaceMatch = trimmed.match(DATETIME_SPACE_REGEX);
        if (spaceMatch) {
            const [, y, m, d, h, min, s, ms] = spaceMatch;
            const msVal = ms ? parseInt(ms.padEnd(3, '0')) : 0;
            return new Date(Date.UTC(
                parseInt(y), parseInt(m) - 1, parseInt(d),
                parseInt(h), parseInt(min), parseInt(s),
                msVal
            ));
        }

        // Handle "YYYY-MM-DD" date-only format
        const dateOnlyMatch = trimmed.match(DATE_ONLY_REGEX);
        if (dateOnlyMatch) {
            const [, y, m, d] = dateOnlyMatch;
            return new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
        }

        // Handle ISO 8601 with explicit timezone — safe in all browsers
        if (trimmed.includes('T') && HAS_TIMEZONE.test(trimmed)) {
            return new Date(trimmed);
        }

        // Handle full ISO without timezone (e.g. "2024-01-15T10:30:00")
        // Safari interprets this as UTC, Chrome as local time.
        // We normalise to UTC to match Supabase's UTC output convention.
        if (trimmed.includes('T') && !HAS_TIMEZONE.test(trimmed)) {
            return new Date(trimmed + 'Z');
        }

        // If it's a raw string without TZ, assume it was intended as UTC from our backend
        if (!HAS_TIMEZONE.test(trimmed)) {
            return new Date(trimmed + 'Z');
        }
    }

    return new Date(dateStr);
};

export const formatTimelineDate = (dateStr) => {
    if (!dateStr) return null;

    const date = parseDateSafely(dateStr);
    if (!date || isNaN(date.getTime())) return 'Invalid Date';

    // Using the browser's default locale and timeZone (which is the user's local)
    return date.toLocaleString(undefined, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
};

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

export const formatFullTimestamp = (dateStr) => {
    const formatted = formatTimelineDate(dateStr);
    if (!formatted) return 'Processing...';
    return `${formatted} (${getTimeZoneAbbr()})`;
};
