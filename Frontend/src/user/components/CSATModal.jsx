import React, { useState } from 'react';
import { Star, CheckCircle2, X, Loader2, MessageSquare } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

/**
 * CSATModal — shown when a ticket is resolved and no rating has been given yet.
 * 
 * Props:
 *  - ticketId: string
 *  - onSubmit: () => void — called after a rating is saved successfully
 *  - onDismiss: () => void — called if the user closes without rating
 */
export default function CSATModal({ ticketId, onSubmit, onDismiss }) {
    const [hovered, setHovered] = useState(0);
    const [selected, setSelected] = useState(0);
    const [comment, setComment] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const ratingLabels = {
        1: 'Very Dissatisfied',
        2: 'Dissatisfied',
        3: 'Neutral',
        4: 'Satisfied',
        5: 'Very Satisfied',
    };

    const handleSubmit = async () => {
        if (!selected) { setError('Please select a rating.'); return; }
        setLoading(true);
        setError('');
        try {
            const { error: upError } = await supabase
                .from('tickets')
                .update({
                    csat_rating: selected,
                    csat_comment: comment.trim() || null,
                })
                .eq('id', ticketId);

            if (upError) throw upError;
            setSubmitted(true);
            setTimeout(() => { onSubmit?.(selected); }, 1800);
        } catch (err) {
            setError('Failed to submit. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
                <div className="bg-white rounded-3xl shadow-2xl p-10 text-center w-full max-w-sm border border-gray-100">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Thank you!</h3>
                    <p className="text-gray-500 text-sm">Your feedback helps us improve.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md border border-gray-100 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-br from-emerald-900 to-emerald-700 p-6 text-white relative">
                    <button
                        onClick={onDismiss}
                        className="absolute top-4 right-4 p-1.5 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-3 backdrop-blur-sm border border-white/20">
                        <Star className="w-6 h-6 text-yellow-300 fill-yellow-300" />
                    </div>
                    <h3 className="text-lg font-bold mb-1">How was your resolution?</h3>
                    <p className="text-emerald-100/80 text-sm">Your ticket has been resolved. Please rate our support.</p>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    {/* Star Rating */}
                    <div className="flex flex-col items-center gap-3">
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onMouseEnter={() => setHovered(star)}
                                    onMouseLeave={() => setHovered(0)}
                                    onClick={() => { setSelected(star); setError(''); }}
                                    className="transition-all duration-200"
                                    style={{ transform: hovered === star ? 'scale(1.2)' : 'scale(1)' }}
                                >
                                    <Star
                                        className={`w-9 h-9 transition-all duration-300 ${star <= (hovered || selected)
                                                ? 'text-yellow-400 fill-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]'
                                                : 'text-gray-200 fill-gray-200'
                                            }`}
                                    />
                                </button>
                            ))}
                        </div>
                        {(hovered || selected) > 0 && (
                            <p className="text-sm font-semibold text-gray-700 transition-all">
                                {ratingLabels[hovered || selected]}
                            </p>
                        )}
                    </div>

                    {/* Optional Comment */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                            <MessageSquare className="w-4 h-4" />
                            Leave a comment <span className="text-gray-400 font-normal">(optional)</span>
                        </label>
                        <textarea
                            rows={3}
                            placeholder="What went well? What could be better?"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none text-gray-800 placeholder:text-gray-400 transition-all"
                        />
                    </div>

                    {error && (
                        <p className="text-red-500 text-sm font-medium">{error}</p>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            onClick={onDismiss}
                            className="flex-1 py-3 border border-gray-200 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                        >
                            Skip for now
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="flex-2 flex-grow py-3 bg-emerald-900 text-white text-sm font-bold rounded-xl hover:bg-emerald-800 transition-colors shadow-lg shadow-emerald-900/20 disabled:opacity-70 flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                            Submit Feedback
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
