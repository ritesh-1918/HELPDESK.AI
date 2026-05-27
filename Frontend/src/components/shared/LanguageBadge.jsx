import React from 'react';
import { Globe } from 'lucide-react';

/**
 * Compact badge shown on ticket cards when the ticket was originally
 * submitted in a non-English language and auto-translated.
 *
 * Props:
 *   translation  – ticket.metadata?.translation  (object)
 *   compact      – boolean, renders icon-only variant when true (default false)
 */
const LanguageBadge = ({ translation, compact = false }) => {
    if (!translation?.translated) return null;

    const langName = translation.source_language_name
        || translation.source_language?.toUpperCase()
        || 'Unknown';

    if (compact) {
        return (
            <span
                title={`Translated from ${langName}`}
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold
                           bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400
                           border border-sky-200 dark:border-sky-800/30 whitespace-nowrap"
            >
                <Globe size={10} className="shrink-0" />
                {langName}
            </span>
        );
    }

    return (
        <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold
                       bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400
                       border border-sky-200 dark:border-sky-800/30 whitespace-nowrap"
        >
            <Globe size={12} className="shrink-0" />
            {langName}
        </span>
    );
};

export default LanguageBadge;
