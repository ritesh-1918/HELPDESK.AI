import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, ChevronRight, Inbox, Loader2, AlertCircle } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { supabase } from '../../lib/supabaseClient';
import { formatTimelineDate } from '../../utils/dateUtils';

const RecentTickets = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchRecentTickets = async () => {
        if (!user?.id) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const { data, error: sbError } = await supabase
                .from('tickets')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(5);

            if (sbError) throw sbError;
            setTickets(data || []);
        } catch (err) {
            console.error("Error fetching recent tickets:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecentTickets();
    }, []);

    const getStatusBadge = (status) => {
        const s = String(status || '').toLowerCase();
        switch (s) {
            case 'resolved':
            case 'resolved by human support':
                return (
                    <span className="inline-block rounded-full px-2.5 py-[3px] text-[11px] font-semibold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800/40">
                        Resolved
                    </span>
                );
            case 'pending':
            case 'pending human support':
            case 'pending_human':
                return (
                    <span className="inline-block rounded-full px-2.5 py-[3px] text-[11px] font-semibold bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800/40">
                        Pending
                    </span>
                );
            case 'in progress':
                return (
                    <span className="inline-block rounded-full px-2.5 py-[3px] text-[11px] font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/40">
                        In Progress
                    </span>
                );
            case 'open':
            default:
                return (
                    <span className="inline-block rounded-full px-2.5 py-[3px] text-[11px] font-semibold bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/40">
                        {status || 'Open'}
                    </span>
                );
        }
    };

    return (
        <div className="bg-white dark:bg-[var(--dash-surface)] rounded-[20px] border border-emerald-50 dark:border-[var(--dash-border)] shadow-[0_2px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_16px_rgba(0,0,0,0.3)] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-7 py-5 border-b border-emerald-50 dark:border-[var(--dash-border)]">
                <div className="flex items-center gap-2">
                    <Clock size={18} className="text-emerald-500 dark:text-emerald-400" />
                    <span className="font-[Syne] text-[17px] font-bold text-[#0f1f12] dark:text-[var(--dash-text)]">
                        Recent Tickets
                    </span>
                </div>
                <button
                    onClick={() => navigate('/my-tickets')}
                    className="bg-transparent border-none cursor-pointer text-emerald-600 dark:text-emerald-400 text-[13px] font-semibold hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                >
                    View All →
                </button>
            </div>

            {/* Content */}
            <div className={loading || error || tickets.length === 0 ? 'p-7' : ''}>
                {loading ? (
                    <div className="flex flex-col gap-4">
                        <style>{`@keyframes shimmer{100%{transform:translateX(100%)}}`}</style>
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="flex items-center gap-4 py-3">
                                <div className="h-6 w-16 bg-gray-100 dark:bg-gray-800 rounded-md relative overflow-hidden flex-shrink-0">
                                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 dark:via-gray-700/60 to-transparent animate-[shimmer_1.5s_infinite]" />
                                </div>
                                <div className="h-5 flex-1 bg-gray-100 dark:bg-gray-800 rounded-md relative overflow-hidden">
                                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 dark:via-gray-700/60 to-transparent animate-[shimmer_1.5s_infinite]" />
                                </div>
                                <div className="h-6 w-20 bg-gray-100 dark:bg-gray-800 rounded-full relative overflow-hidden flex-shrink-0">
                                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 dark:via-gray-700/60 to-transparent animate-[shimmer_1.5s_infinite]" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-red-500 bg-red-50/50 dark:bg-red-900/10 rounded-2xl border border-dashed border-red-200 dark:border-red-800/40">
                        <AlertCircle size={32} className="mb-3 opacity-50" />
                        <p className="text-sm font-bold">Sync Failed</p>
                        <p className="text-[10px] mt-1 text-red-400">{error}</p>
                    </div>
                ) : tickets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500 dark:text-[var(--dash-text-muted)] bg-gray-50/50 dark:bg-[var(--dash-surface-alt)] rounded-2xl border border-dashed border-gray-200 dark:border-[var(--dash-border)]">
                        <Inbox size={32} className="mb-3 opacity-20 dark:opacity-40" />
                        <p className="text-sm font-medium">No tickets yet.</p>
                        <p className="text-xs mt-1">Report an issue and our AI will start helping immediately.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-[var(--dash-surface-alt)] border-b border-emerald-50 dark:border-[var(--dash-border)]">
                                    <th className="text-[11px] tracking-[0.1em] text-gray-400 dark:text-[var(--dash-text-dim)] font-semibold uppercase px-7 py-2.5">ID</th>
                                    <th className="text-[11px] tracking-[0.1em] text-gray-400 dark:text-[var(--dash-text-dim)] font-semibold uppercase px-7 py-2.5">Subject</th>
                                    <th className="text-[11px] tracking-[0.1em] text-gray-400 dark:text-[var(--dash-text-dim)] font-semibold uppercase px-7 py-2.5">Status</th>
                                    <th className="text-[11px] tracking-[0.1em] text-gray-400 dark:text-[var(--dash-text-dim)] font-semibold uppercase px-7 py-2.5">Submitted</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tickets.map((ticket) => (
                                    <tr
                                        key={ticket.id}
                                        onClick={() => navigate(`/ticket/${ticket.id}`)}
                                        className="border-b border-gray-50 dark:border-[var(--dash-border)] cursor-pointer transition-colors hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10"
                                    >
                                        <td className="px-7 py-4">
                                            <span className="font-mono text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                                                #{ticket.id}
                                            </span>
                                        </td>
                                        <td className="px-7 py-4">
                                            <p className="text-sm font-medium text-gray-900 dark:text-[var(--dash-text)] m-0 overflow-hidden text-ellipsis whitespace-nowrap max-w-[320px]">
                                                {ticket.summary || ticket.subject || ticket.description || "No description provided"}
                                            </p>
                                        </td>
                                        <td className="px-7 py-4">
                                            {getStatusBadge(ticket.status)}
                                        </td>
                                        <td className="px-7 py-4 whitespace-nowrap">
                                            <span className="text-gray-500 dark:text-[var(--dash-text-muted)] text-xs">
                                                {formatTimelineDate(ticket.created_at)}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecentTickets;
