import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, CheckCircle2, Sparkles, X } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { api } from '../../services/api';

const DEBOUNCE_MS = 500;
const MIN_CHARS = 12;

/**
 * Live "you might not need to file a ticket" panel.
 * Debounces the issue text and queries /kb/suggest as the user types.
 * See GitHub issue #3203.
 */
const KBSuggestionPanel = ({ issueText, company = null, onDismiss }) => {
    const [suggestions, setSuggestions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [dismissed, setDismissed] = useState(false);
    const [resolvedArticleId, setResolvedArticleId] = useState(null);
    const debounceRef = useRef(null);
    const requestIdRef = useRef(0);

    useEffect(() => {
        // Reset the "solved it" state whenever the user meaningfully edits the text again
        setResolvedArticleId(null);

        if (!issueText || issueText.trim().length < MIN_CHARS) {
            setSuggestions([]);
            return;
        }

        if (debounceRef.current) clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(async () => {
            const thisRequestId = ++requestIdRef.current;
            setIsLoading(true);
            try {
                const result = await api.getKbSuggestions(issueText, 3);
                // Ignore stale responses if the user kept typing
                if (thisRequestId === requestIdRef.current) {
                    setSuggestions(result.suggestions || []);
                }
            } finally {
                if (thisRequestId === requestIdRef.current) {
                    setIsLoading(false);
                }
            }
        }, DEBOUNCE_MS);

        return () => clearTimeout(debounceRef.current);
    }, [issueText]);

    const handleThisSolvedIt = async (article) => {
        setResolvedArticleId(article.id);
        await api.logSelfServiceResolution({
            articleId: article.id,
            articleTitle: article.title,
            queryText: issueText,
            company,
        });
    };

    if (dismissed || suggestions.length === 0) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="mb-4"
            >
                <Card className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl relative">
                    <button
                        type="button"
                        onClick={() => { setDismissed(true); onDismiss?.(); }}
                        className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 transition-colors"
                        aria-label="Dismiss suggestions"
                    >
                        <X className="w-4 h-4" />
                    </button>

                    <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-4 h-4 text-emerald-600" />
                        <h4 className="text-sm font-bold text-emerald-800">
                            {isLoading ? 'Checking the knowledge base…' : 'This might already have a fix'}
                        </h4>
                    </div>

                    <div className="space-y-2">
                        {suggestions.map((s) => (
                            <div
                                key={s.id}
                                className="bg-white rounded-lg border border-gray-200 p-3 flex items-start justify-between gap-3"
                            >
                                <div className="flex items-start gap-2 min-w-0">
                                    <BookOpen className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 truncate">{s.title}</p>
                                        <p className="text-xs text-slate-500 line-clamp-2">{s.snippet}</p>
                                    </div>
                                </div>

                                {resolvedArticleId === s.id ? (
                                    <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 shrink-0">
                                        <CheckCircle2 className="w-4 h-4" /> Marked as solved
                                    </span>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => handleThisSolvedIt(s)}
                                        className="text-xs font-semibold text-emerald-700 border border-emerald-300 rounded-md px-2.5 py-1.5 hover:bg-emerald-100 transition-colors shrink-0"
                                    >
                                        This solved it
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    <p className="text-[11px] text-slate-400 mt-3">
                        Didn't find your answer? Keep typing below and submit as usual — this doesn't stop you from filing a ticket.
                    </p>
                </Card>
            </motion.div>
        </AnimatePresence>
    );
};

export default KBSuggestionPanel;