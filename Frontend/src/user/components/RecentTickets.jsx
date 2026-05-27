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
        const baseStyle = { borderRadius: '100px', padding: '3px 10px', fontSize: '11px', fontWeight: 600, display: 'inline-block' };
        switch (s) {
            case 'resolved':
            case 'resolved by human support':
                return <span style={{ ...baseStyle, background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0' }}>Resolved</span>;
            case 'pending':
            case 'pending human support':
            case 'pending_human':
                return <span style={{ ...baseStyle, background: '#fef9c3', color: '#854d0e', border: '1px solid #fde68a' }}>Pending</span>;
            case 'in progress':
                return <span style={{ ...baseStyle, background: '#dbeafe', color: '#1d4ed8', border: '1px solid #93c5fd' }}>In Progress</span>;
            case 'open':
                return <span style={{ ...baseStyle, background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe' }}>Open</span>;
            default:
                return <span style={{ ...baseStyle, background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe' }}>{status || 'Open'}</span>;
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-[20px] border border-[#e7f5ee] dark:border-gray-700 shadow-[0_2px_16px_rgba(0,0,0,0.06)] overflow-hidden transition-colors duration-200">
            {/* Header */}
            <div className="px-7 py-5 border-b border-[#f0fdf4] dark:border-gray-700 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Clock size={18} className="text-emerald-500" />
                    <span className="font-['Syne'] text-[17px] font-bold text-[#0f1f12] dark:text-white">
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
            {/* Content */}
            <div className={loading || error || tickets.length === 0 ? 'p-7' : 'p-0'}>
                {loading ? (
                    <div className="flex flex-col gap-4">
                        <style>{`@keyframes shimmer{100%{transform:translateX(100%)}}`}</style>
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="flex items-center gap-4 py-3">
                                <div className="h-6 w-16 bg-slate-100 dark:bg-gray-700 rounded-md relative overflow-hidden shrink-0">
                                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 dark:via-gray-600/60 to-transparent animate-[shimmer_1.5s_infinite]" />
                                </div>
                                <div className="h-5 flex-1 bg-slate-100 dark:bg-gray-700 rounded-md relative overflow-hidden">
                                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 dark:via-gray-600/60 to-transparent animate-[shimmer_1.5s_infinite]" />
                                </div>
                                <div className="h-6 w-20 bg-slate-100 dark:bg-gray-700 rounded-full relative overflow-hidden shrink-0">
                                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 dark:via-gray-600/60 to-transparent animate-[shimmer_1.5s_infinite]" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-red-500 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-dashed border-red-200 dark:border-red-800/30">
                        <AlertCircle size={32} className="mb-3 opacity-50" />
                        <p className="text-sm font-bold">Sync Failed</p>
                        <p className="text-[10px] mt-1 text-red-400">{error}</p>
                    </div>
                ) : tickets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                        <Inbox size={32} className="mb-3 opacity-20" />
                        <p className="text-sm font-medium">No tickets yet.</p>
                        <p className="text-xs mt-1">Report an issue and our AI will start helping immediately.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#fafafa] dark:bg-gray-800/50 border-b border-[#f0fdf4] dark:border-gray-700">
                                    <th className="text-[11px] tracking-widest text-gray-400 font-semibold uppercase px-7 py-2.5">ID</th>
                                    <th className="text-[11px] tracking-widest text-gray-400 font-semibold uppercase px-7 py-2.5">Subject</th>
                                    <th className="text-[11px] tracking-widest text-gray-400 font-semibold uppercase px-7 py-2.5">Status</th>
                                    <th className="text-[11px] tracking-widest text-gray-400 font-semibold uppercase px-7 py-2.5">Submitted</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tickets.map((ticket) => (
                                    <tr
                                        key={ticket.id}
                                        onClick={() => navigate(`/ticket/${ticket.id}`)}
                                        className="border-b border-gray-50 dark:border-gray-700/50 cursor-pointer transition-colors hover:bg-[#f0fdf4] dark:hover:bg-gray-700/30"
                                    >
                                        <td className="px-7 py-4">
                                            <span className="font-mono text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                                                #{ticket.id}
                                            </span>
                                        </td>
                                        <td className="px-7 py-4">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white m-0 overflow-hidden text-ellipsis whitespace-nowrap max-w-[320px]">
                                                {ticket.summary || ticket.subject || ticket.description || "No description provided"}
                                            </p>
                                            {ticket?.metadata?.translation?.translated && (
                                                <p className="text-[11px] text-sky-700 dark:text-sky-400 m-0 mt-1">
                                                    Translated from {ticket.metadata.translation.source_language_name || ticket.metadata.translation.source_language || 'Unknown'}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-7 py-4">
                                            {getStatusBadge(ticket.status)}
                                        </td>
                                        <td className="px-7 py-4 whitespace-nowrap">
                                            <span className="text-gray-500 dark:text-gray-400 text-xs">
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

