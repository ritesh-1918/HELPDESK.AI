import { supabase } from '../lib/supabaseClient';

// ─── Default Response Time Estimates (in minutes) ──────────────────────
// Based on industry SLA standards. Used when no historical data is available.
const DEFAULT_ESTIMATES = {
    critical: {
        'Network': 30,
        'Security': 20,
        'Access': 45,
        'Hardware': 60,
        'Software': 45,
        'Email': 30,
        'Database': 40,
        'General': 60,
        _fallback: 45,
    },
    high: {
        'Network': 60,
        'Security': 45,
        'Access': 90,
        'Hardware': 120,
        'Software': 90,
        'Email': 60,
        'Database': 80,
        'General': 120,
        _fallback: 90,
    },
    medium: {
        'Network': 120,
        'Security': 90,
        'Access': 180,
        'Hardware': 240,
        'Software': 180,
        'Email': 120,
        'Database': 160,
        'General': 240,
        _fallback: 180,
    },
    low: {
        'Network': 480,
        'Security': 360,
        'Access': 720,
        'Hardware': 1440,
        'Software': 720,
        'Email': 480,
        'Database': 600,
        'General': 1440,
        _fallback: 720,
    },
};

// ─── Helper: format minutes to human-readable string ───────────────────
function formatMinutes(minutes) {
    if (minutes < 60) return `${Math.round(minutes)} minutes`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    if (hours === 1 && mins === 0) return '1 hour';
    if (hours === 1) return `1 hour ${mins} min`;
    if (mins === 0) return `${hours} hours`;
    return `${hours}h ${mins}m`;
}

// ─── Helper: format minutes to a short label ───────────────────────────
function formatMinutesShort(minutes) {
    if (minutes < 60) return `${Math.round(minutes)}m`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
}

// ─── Estimate from historical data ─────────────────────────────────────
async function getHistoricalEstimate(category, priority) {
    try {
        // Query resolved tickets with the same category and priority
        // Calculate average resolution time from created_at to resolved_at
        const { data: tickets, error } = await supabase
            .from('tickets')
            .select('created_at, resolved_at, status, metadata')
            .eq('category', category)
            .eq('priority', priority)
            .in('status', ['resolved', 'closed', 'auto-resolved'])
            .order('created_at', { ascending: false })
            .limit(50);

        if (error || !tickets || tickets.length < 3) {
            return null; // Not enough data
        }

        // Calculate resolution times
        const resolutionTimes = tickets
            .map(t => {
                const created = new Date(t.created_at).getTime();
                // Try resolved_at field first, then metadata.resolved_at
                const resolvedAt = t.resolved_at || t.metadata?.resolved_at;
                if (!resolvedAt) return null;
                const resolved = new Date(resolvedAt).getTime();
                const diffMinutes = (resolved - created) / (1000 * 60);
                // Filter out unreasonable values (< 1 min or > 7 days)
                if (diffMinutes < 1 || diffMinutes > 10080) return null;
                return diffMinutes;
            })
            .filter(Boolean);

        if (resolutionTimes.length < 3) {
            return null;
        }

        // Use median for more robust estimate (less affected by outliers)
        resolutionTimes.sort((a, b) => a - b);
        const median = resolutionTimes[Math.floor(resolutionTimes.length / 2)];

        // Calculate P75 (75th percentile) as the estimated response time
        // This means 75% of tickets were resolved within this time
        const p75Index = Math.floor(resolutionTimes.length * 0.75);
        const p75 = resolutionTimes[p75Index];

        return {
            minutes: p75,
            sampleSize: resolutionTimes.length,
            median: median,
            isHistorical: true,
        };
    } catch (err) {
        console.warn('[ResponseTimeEstimator] Historical query failed:', err);
        return null;
    }
}

// ─── Get default estimate based on category and priority ───────────────
function getDefaultEstimate(category, priority) {
    const priorityKey = (priority || 'medium').toLowerCase();
    const categoryKey = category || 'General';

    const priorityMap = DEFAULT_ESTIMATES[priorityKey] || DEFAULT_ESTIMATES.medium;
    const minutes = priorityMap[categoryKey] || priorityMap._fallback;

    return {
        minutes,
        sampleSize: 0,
        isHistorical: false,
    };
}

// ─── Main: Estimate response time ──────────────────────────────────────
/**
 * Estimates the response/resolution time for a ticket.
 *
 * @param {string} category - Ticket category (e.g., 'Network', 'Security')
 * @param {string} priority - Ticket priority ('critical', 'high', 'medium', 'low')
 * @returns {Promise<{minutes: number, formatted: string, formattedShort: string, isHistorical: boolean, sampleSize: number, confidenceLevel: string}>}
 */
export async function estimateResponseTime(category, priority) {
    // Try historical data first
    const historical = await getHistoricalEstimate(category, priority);

    let estimate;
    if (historical) {
        estimate = historical;
    } else {
        estimate = getDefaultEstimate(category, priority);
    }

    // Determine confidence level
    let confidenceLevel = 'estimated';
    if (estimate.sampleSize >= 20) confidenceLevel = 'high';
    else if (estimate.sampleSize >= 10) confidenceLevel = 'medium';
    else if (estimate.sampleSize >= 3) confidenceLevel = 'low';

    return {
        minutes: estimate.minutes,
        formatted: formatMinutes(estimate.minutes),
        formattedShort: formatMinutesShort(estimate.minutes),
        isHistorical: estimate.isHistorical || false,
        sampleSize: estimate.sampleSize || 0,
        confidenceLevel,
        median: estimate.median ? formatMinutes(estimate.median) : null,
    };
}

// ─── Get urgency tier for UI styling ───────────────────────────────────
export function getUrgencyTier(priority) {
    const p = (priority || 'medium').toLowerCase();
    if (p === 'critical') return { label: 'Urgent', color: 'red' };
    if (p === 'high') return { label: 'High Priority', color: 'orange' };
    if (p === 'medium') return { label: 'Standard', color: 'blue' };
    return { label: 'Low Priority', color: 'green' };
}
