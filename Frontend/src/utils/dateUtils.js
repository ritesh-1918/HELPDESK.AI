/**
 * Unified Date Utility for HELPDESK.AI
 * Fixes timezone shift issues by explicitly forcing local display.
 * Safari-compatible: manually parses ISO-8601 dates instead of relying
 * on `new Date(string)` which behaves inconsistently across browsers.
 */

/**
 * Safely parse a date string into a Date object.
 * - Handles ISO-8601 with/without timezone
 * - Handles "YYYY-MM-DD HH:MM:SS" (no T separator — common from Supabase)
 * - Handles "YYYY-MM-DDTHH:MM:SS" and "YYYY-MM-DDTHH:MM:SSZ"
 * - Returns null for unparseable input (never throws)
 */
const safeParseDate = (dateStr) => {
    if (!dateStr) return null;
    if (dateStr instanceof Date && !isNaN(dateStr.getTime())) return dateStr;

    // Already a Date-like object with toISOString
    if (typeof dateStr === 'object' && dateStr?.toISOString) {
        const d = new Date(dateStr.toISOString());
        if (!isNaN(d.getTime())) return d;
    }

    const str = String(dateStr).trim();
    if (!str) return null;

    // --- Strategy 1: Try native Date.parse first (works for most formats) ---
    let date = new Date(str);
    if (!isNaN(date.getTime())) return date;

    // --- Strategy 2: Try appending Z for timestamp strings without timezone ---
    if (!str.includes('Z') && !str.includes('+') && !str.includes('-') && !str.endsWith('T')) {
        const withZ = str.endsWith(' ') ? str.trim() + 'Z' : str + 'Z';
        date = new Date(withZ);
        if (!isNaN(date.getTime())) return date;
    }

    // --- Strategy 3: Replace space with T (Supabase often returns "YYYY-MM-DD HH:MM:SS") ---
    if (str.includes(' ') && str.length >= 10) {
        // Replace first space with T (ISO-8601 format)
        const isoStr = str.replace(' ', 'T');
        date = new Date(isoStr);
        if (!isNaN(date.getTime())) return date;

        // Try with Z
        const isoZ = isoStr.includes('Z') || isoStr.includes('+') ? isoStr : isoStr + 'Z';
        date = new Date(isoZ);
        if (!isNaN(date.getTime())) return date;

        // --- Strategy 4: Manual parse (most reliable for Safari) ---
        // Parse "YYYY-MM-DD HH:MM:SS" parts directly
        const parts = str.split(/[\sT]/);
        if (parts.length >= 2) {
            const dateParts = parts[0].split('-');
            const timeParts = parts[1].split(':');
            if (dateParts.length === 3) {
                const year = parseInt(dateParts[0], 10);
                const month = parseInt(dateParts[1], 10) - 1; // 0-indexed
                const day = parseInt(dateParts[2], 10);
                const hour = timeParts[0] ? parseInt(timeParts[0], 10) : 0;
                const minute = timeParts[1] ? parseInt(timeParts[1], 10) : 0;
                const second = timeParts[2] ? parseFloat(timeParts[2]) : 0;

                if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
                    date = new Date(year, month, day, hour, minute, second);
                    if (!isNaN(date.getTime())) return date;
                }
            }
        }
    }

    // --- Strategy 5: Try pure Date-only parse (YYYY-MM-DD) for Safari ---
    const match = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (match) {
        date = new Date(
            parseInt(match[1], 10),
            parseInt(match[2], 10) - 1,
            parseInt(match[3], 10)
        );
        if (!isNaN(date.getTime())) return date;
    }

    // Last resort: try native Date constructor one more time
    date = new Date(str);
    return isNaN(date.getTime()) ? null : date;
};

export const formatTimelineDate = (dateStr) => {
    const date = safeParseDate(dateStr);
    if (!date) return 'Invalid Date';

    try {
        return date.toLocaleString(undefined, {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    } catch (_e) {
        // Fallback if toLocaleString fails (extremely old browsers)
        return date.toDateString() + ' ' + date.toLocaleTimeString();
    }
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
    if (formatted === 'Invalid Date') return 'Processing...';
    return `${formatted} (${getTimeZoneAbbr()})`;
};

/**
 * Format a date relative to now (e.g., "2 hours ago", "just now").
 * Fallback: returns formatted date for anything > 7 days.
 */
export const formatRelativeTime = (dateStr) => {
    const date = safeParseDate(dateStr);
    if (!date) return '';

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 0) return formatTimelineDate(dateStr); // Future dates
    if (diffSecs < 60) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatTimelineDate(dateStr);
};
