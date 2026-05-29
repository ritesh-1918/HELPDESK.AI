import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, ChevronRight, Inbox, Loader2, AlertCircle } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { supabase } from '../../lib/supabaseClient';
import { formatTimelineDate } from '../../utils/dateUtils';
import LanguageBadge from '../../components/shared/LanguageBadge';
import SLABadge from '../../admin/components/SLABadge';

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
        const baseClasses = "inline-block rounded-full px-2.5 py-1 text-[11px] font-bold tracking-tight";
        switch (s) {
            case 'resolved':
            case 'resolved by human support':
                return <span className={`${baseClasses} bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800/30`}>Resolved</span>;
            case 'pending':
            case 'pending human support':
            case 'pending_human':
                return <span className={`${baseClasses} bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800/30`}>Pending</span>;
            case 'in progress':
                return <span className={`${baseClasses} bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/30`}>In Progress</span>;
            case 'open':
                return <span className={`${baseClasses} bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/20`}>Open</span>;
            default:
                return <span className={`${baseClasses} bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/20`}>{status || 'Open'}</span>;
        }
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-[20px] border border-emerald-50 dark:border-slate-800 shadow-sm dark:shadow-slate-950/50 overflow-hidden">
            {/* Header */}
            <div className="px-7 py-5 border-b border-green-50 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900">
                <div className="flex items-center gap-2">
                    <Clock size={18} className="text-green-500 dark:text-green-400" />
                    <span className="font-syne text-[17px] font-bold text-slate-900 dark:text-white">
                        Recent Tickets
                    </span>
                </div>
                <button
                    onClick={() => navigate('/my-tickets')}
                    className="bg-transparent border-none cursor-pointer text-green-600 dark:text-green-400 text-[13px] font-bold hover:text-green-700 dark:hover:text-green-300 transition-colors"
                >
                    View All →
                </button>
            </div>

            {/* Content */}
            <div className={loading || error || tickets.length === 0 ? "p-7" : "p-0"}>
                {loading ? (
                    <div className="flex flex-col gap-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="flex items-center gap-4 py-3 animate-pulse">
                                <div className="h-6 w-16 bg-slate-100 dark:bg-slate-800 rounded-md shrink-0" />
                                <div className="h-5 flex-1 bg-slate-100 dark:bg-slate-800 rounded-md" />
                                <div className="h-6 w-20 bg-slate-100 dark:bg-slate-800 rounded-full shrink-0" />
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-red-500 bg-red-50/50 dark:bg-red-900/10 rounded-2xl border border-dashed border-red-200 dark:border-red-900/30">
                        <AlertCircle size={32} className="mb-3 opacity-50" />
                        <p className="text-sm font-bold">Sync Failed</p>
                        <p className="text-[10px] mt-1 text-red-400">{error}</p>
                    </div>
                ) : tickets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500 bg-gray-50/50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-gray-200 dark:border-slate-800">
                        <Inbox size={32} className="mb-3 opacity-20 dark:text-white" />
                        <p className="text-sm font-medium dark:text-gray-400">No tickets yet.</p>
                        <p className="text-[12px] mt-1 dark:text-gray-500">Report an issue and our AI will start helping immediately.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-green-50 dark:border-slate-800">
                                    <th className="text-[11px] tracking-widest text-gray-400 dark:text-gray-500 font-bold uppercase px-7 py-3">ID</th>
                                    <th className="text-[11px] tracking-widest text-gray-400 dark:text-gray-500 font-bold uppercase px-7 py-3">Subject</th>
                                    <th className="text-[11px] tracking-widest text-gray-400 dark:text-gray-500 font-bold uppercase px-7 py-3">Status</th>
                                    <th className="text-[11px] tracking-widest text-gray-400 dark:text-gray-500 font-bold uppercase px-7 py-3">Est. SLA</th>
                                    <th className="text-[11px] tracking-widest text-gray-400 dark:text-gray-500 font-bold uppercase px-7 py-3">Submitted</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tickets.map((ticket) => (
                                    <tr
                                        key={ticket.id}
                                        onClick={() => navigate(`/ticket/${ticket.id}`)}
                                        className="border-b border-slate-50 dark:border-slate-800/50 cursor-pointer transition-colors hover:bg-green-50/30 dark:hover:bg-green-900/10"
                                    >
                                        <td className="px-7 py-4">
                                            <span className="font-mono text-[11px] font-bold text-green-600 dark:text-green-500">
                                                #{ticket.id}
                                            </span>
                                        </td>
                                        <td className="px-7 py-4">
                                            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate max-w-[320px]">
                                                {ticket.summary || ticket.subject || ticket.description || "No description provided"}
                                            </p>
                                            <div className="mt-1">
                                                <LanguageBadge detectedLanguage={ticket?.detected_language} compact />
                                            </div>
                                        </td>
                                        <td className="px-7 py-4">
                                            {getStatusBadge(ticket.status)}
                                        </td>
                                        <td className="px-7 py-4">
                                            <SLABadge
                                                priority={ticket.priority}
                                                createdAt={ticket.created_at}
                                                slaBreachAt={ticket.sla_breach_at}
                                                slaStatus={ticket.sla_status}
                                                status={ticket.status}
                                                compact
                                                ticketId={ticket.id}
                                            />
                                        </td>
                                        <td className="px-7 py-4 whitespace-nowrap">
                                            <span className="text-gray-500 dark:text-gray-500 text-[12px] font-medium">
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
