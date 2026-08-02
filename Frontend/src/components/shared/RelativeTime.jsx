/**
 * RelativeTime — dynamic, self-refreshing timestamp (issue #3885).
 *
 * Renders a value like "3 hours ago" using date-fns formatDistanceToNow and
 * re-computes it every 60s so ticket lists always show fresh relative values.
 * The full absolute timestamp is available on hover (title tooltip) and as a
 * fallback when the value cannot be parsed.
 */
import React, { useEffect, useState } from 'react';
import { formatRelativeTime, formatTimelineDate } from '../../utils/dateUtils';

const RelativeTime = ({ value, style }) => {
    const [now, setNow] = useState(Date.now());

    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 60_000);
        return () => clearInterval(interval);
    }, []);

    const relative = formatRelativeTime(value);
    if (!relative) {
        return <span style={style}>{formatTimelineDate(value) || '—'}</span>;
    }

    return (
        <span style={style} title={formatTimelineDate(value) || undefined}>
            {relative}
        </span>
    );
};

export default RelativeTime;
