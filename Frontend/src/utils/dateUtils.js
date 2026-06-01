/**
 * Unified Date Utility for HELPDESK.AI
 * Fixes timezone shift issues by explicitly forcing local display.
 * Normalizes ISO-8601 timestamps for cross-browser compatibility (Safari, Chrome, Firefox).
 */

/**
 * Normalize a date string into a Safari-compatible ISO-8601 format.
 * Safari's Date parser is stricter than Chrome/Firefox — it requires
 * the 'T' separator between date and time and explicit timezone designators.
 *
 * Handles common Supabase/Postgres output variants:
 *   - "2024-01-15 10:30:00"        → "2024-01-15T10:30:00Z"
 *   - "2024-01-15T10:30:00"        → "2024-01-15T10:30:00Z"
 *   - "2024-01-15T10:30:00+00:00"  → unchanged (already has TZ)
 *   - "2024-01-15T10:30:00Z"       → unchanged (already has TZ)
 *   - "2024-01-15"                 → "2024-01-15T00:00:00Z"
 */
const normalizeDateString = (dateStr) => {
    if (typeof dateStr !== 'string') return dateStr;

    // Already has a timezone indicator — return as-is
    if (dateStr.endsWith('Z') || /[+-]\d{2}:\d{2}$/.test(dateStr) || /[+-]\d{4}$/.test(dateStr)) {
        return dateStr;
    }

    // Replace space separator with 'T' for Safari compatibility
    let normalized = dateStr.replace(' ', 'T');

    // If it's a date-only string (YYYY-MM-DD), add time component
    if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
        return normalized + 'T00:00:00Z';
    }

    // Has time but no timezone — assume UTC (matches Supabase default)
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(normalized)) {
        return normalized + 'Z';
    }

    return dateStr;
};

export const formatTimelineDate = (dateStr) => {
    if (!dateStr) return null;

    let date;
    if (typeof dateStr === 'string') {
        const normalized = normalizeDateString(dateStr);
        date = new Date(normalized);
    } else {
        date = new Date(dateStr);
    }

    if (isNaN(date.getTime())) return 'Invalid Date';

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
