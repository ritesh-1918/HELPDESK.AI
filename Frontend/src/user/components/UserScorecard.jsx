import React, { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabaseClient';
import useAuthStore from '../../store/authStore';

const UserScorecard = () => {
    const { user } = useAuthStore();
    const mountedRef = useRef(true);

    useEffect(() => {
        return () => {
            mountedRef.current = false;
        };
    }, []);

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const load = useCallback(async () => {
        if (!user?.id) {
            if (mountedRef.current) {
                setLoading(false);
            }
            return;
        }

        setLoading(true);
        if (mountedRef.current) {
            setError(null);
        }

        try {
            const { data: tickets, error: sbError } = await supabase
                .from('tickets')
                .select('id, status, csat_rating, metadata')
                .eq('user_id', user.id);

            if (sbError) throw sbError;

            const total = tickets?.length || 0;
            const resolved = tickets?.filter(t => t.status === 'resolved' || t.status === 'closed').length || 0;
            const rated = tickets?.filter(t => t.csat_rating != null) || [];
            const avgCsat = rated.length > 0
                ? (rated.reduce((sum, t) => sum + t.csat_rating, 0) / rated.length).toFixed(1)
                : null;
            const corrected = tickets?.filter(t => t.metadata?.corrected_at != null).length || 0;
            const aiAccuracy = total > 0 ? Math.round(((total - corrected) / total) * 100) : null;

            if (mountedRef.current) {
                setData({ total, resolved, avgCsat, aiAccuracy, ratedCount: rated.length });
            }
        } catch (err) {
            console.error('Error loading scorecard:', err);
            if (mountedRef.current) {
                setError(err.message);
            }
        } finally {
            if (mountedRef.current) {
                setLoading(false);
            }
        }
    }, [user]);

    useEffect(() => {
        load();
    }, [load]);

    if (loading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-gray-100 rounded-xl p-5 h-24" />
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
                Failed to load scorecard: {error}
            </div>
        );
    }

    if (!data) return null;

    const cards = [
        { label: 'Total Tickets', value: data.total, color: 'text-emerald-600' },
        { label: 'Resolved', value: data.resolved, color: 'text-blue-600' },
        { label: 'CSAT Score', value: data.avgCsat ? `${data.avgCsat}/5` : '—', color: 'text-amber-600' },
        { label: 'AI Accuracy', value: data.aiAccuracy !== null ? `${data.aiAccuracy}%` : '—', color: 'text-violet-600' },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {cards.map((card) => (
                <div
                    key={card.label}
                    className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm"
                >
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
                        {card.label}
                    </p>
                    <p className={`text-2xl font-bold ${card.color}`}>
                        {card.value}
                    </p>
                </div>
            ))}
        </div>
    );
};

export default UserScorecard;
