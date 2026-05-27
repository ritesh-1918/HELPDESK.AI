import React, { useState, useEffect } from 'react';
import { Clock, TrendingUp, Database, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { estimateResponseTime, getUrgencyTier } from '../../services/responseTimeEstimator';

/**
 * ResponseTimeEstimate — Displays an AI-powered response time estimation
 * based on ticket category, priority, and historical resolution data.
 *
 * Props:
 *  - category: string — ticket category
 *  - priority: string — ticket priority
 *  - subcategory: string — optional subcategory
 */
const ResponseTimeEstimate = ({ category, priority, subcategory }) => {
    const [estimate, setEstimate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        if (!category || !priority) {
            setLoading(false);
            return;
        }

        let cancelled = false;
        const fetchEstimate = async () => {
            setLoading(true);
            try {
                const result = await estimateResponseTime(category, priority);
                if (!cancelled) {
                    setEstimate(result);
                }
            } catch (err) {
                console.warn('[ResponseTimeEstimate] Failed to estimate:', err);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchEstimate();
        return () => { cancelled = true; };
    }, [category, priority]);

    if (loading) {
        return (
            <div className="rounded-xl border border-gray-100 shadow-sm bg-white p-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center animate-pulse">
                        <Clock className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="space-y-2 flex-1">
                        <div className="h-3 w-32 bg-gray-100 rounded animate-pulse" />
                        <div className="h-5 w-48 bg-gray-100 rounded animate-pulse" />
                    </div>
                </div>
            </div>
        );
    }

    if (!estimate) return null;

    const urgency = getUrgencyTier(priority);
    const urgencyColorMap = {
        red: {
            bg: 'bg-red-50',
            border: 'border-red-100',
            text: 'text-red-700',
            icon: 'text-red-500',
            badge: 'bg-red-100 text-red-700',
            ring: 'ring-red-100',
        },
        orange: {
            bg: 'bg-orange-50',
            border: 'border-orange-100',
            text: 'text-orange-700',
            icon: 'text-orange-500',
            badge: 'bg-orange-100 text-orange-700',
            ring: 'ring-orange-100',
        },
        blue: {
            bg: 'bg-blue-50',
            border: 'border-blue-100',
            text: 'text-blue-700',
            icon: 'text-blue-500',
            badge: 'bg-blue-100 text-blue-700',
            ring: 'ring-blue-100',
        },
        green: {
            bg: 'bg-emerald-50',
            border: 'border-emerald-100',
            text: 'text-emerald-700',
            icon: 'text-emerald-500',
            badge: 'bg-emerald-100 text-emerald-700',
            ring: 'ring-emerald-100',
        },
    };
    const colors = urgencyColorMap[urgency.color] || urgencyColorMap.blue;

    const confidenceBadge = {
        high: { label: 'High confidence', icon: '●' },
        medium: { label: 'Medium confidence', icon: '◐' },
        low: { label: 'Low confidence', icon: '○' },
        estimated: { label: 'Estimate', icon: '◇' },
    }[estimate.confidenceLevel] || { label: 'Estimate', icon: '◇' };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl border ${colors.border} shadow-sm bg-white overflow-hidden`}
        >
            <div className="p-6">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full ${colors.bg} flex items-center justify-center`}>
                            <Clock className={`w-5 h-5 ${colors.icon}`} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                Estimated Response Time
                            </p>
                            <p className={`text-xl font-black ${colors.text} tracking-tight mt-0.5`}>
                                {estimate.formatted}
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${colors.badge}`}>
                            {urgency.label}
                        </span>
                        <span className="text-[10px] font-medium text-gray-400 flex items-center gap-1">
                            {confidenceBadge.icon} {confidenceBadge.label}
                        </span>
                    </div>
                </div>

                {/* Progress bar showing estimated window */}
                <div className="mt-4">
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-bold text-gray-400">Response Window</span>
                        <span className="text-[10px] font-bold text-gray-500">
                            Target: {estimate.formattedShort}
                        </span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: '100%' }}
                            transition={{ duration: 1.2, ease: 'easeOut' }}
                            className={`h-full rounded-full ${
                                urgency.color === 'red' ? 'bg-red-400' :
                                urgency.color === 'orange' ? 'bg-orange-400' :
                                urgency.color === 'blue' ? 'bg-blue-400' :
                                'bg-emerald-400'
                            }`}
                        />
                    </div>
                </div>

                {/* Expandable details */}
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="mt-3 flex items-center gap-1.5 text-[11px] font-bold text-gray-400 hover:text-gray-600 transition-colors"
                >
                    {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    {expanded ? 'Hide details' : 'How is this calculated?'}
                </button>

                <AnimatePresence>
                    {expanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                        >
                            <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                    {estimate.isHistorical ? (
                                        <Database className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                    ) : (
                                        <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                    )}
                                    <span className="font-medium">
                                        {estimate.isHistorical
                                            ? `Based on ${estimate.sampleSize} resolved tickets in "${category}"`
                                            : `Default estimate for ${category} / ${priority} priority`
                                        }
                                    </span>
                                </div>
                                {estimate.isHistorical && estimate.median && (
                                    <div className="flex items-center gap-2 text-xs text-gray-600">
                                        <TrendingUp className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                        <span className="font-medium">
                                            Median resolution: {estimate.median}
                                        </span>
                                    </div>
                                )}
                                {subcategory && (
                                    <div className="text-[10px] text-gray-400 font-medium">
                                        Subcategory: {subcategory}
                                    </div>
                                )}
                                <p className="text-[10px] text-gray-400 leading-relaxed">
                                    {estimate.isHistorical
                                        ? 'Estimate uses the 75th percentile of historical resolution times — 75% of similar tickets were resolved within this window.'
                                        : 'This is a default SLA estimate. As more tickets are resolved, the system will use historical data for more accurate predictions.'
                                    }
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default ResponseTimeEstimate;
