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
        <div style={{
            background: '#fff', borderRadius: '20px', border: '1px solid #e7f5ee',
            boxShadow: '0 2px 16px rgba(0,0,0,0.06)', overflow: 'hidden',
        }}>
            {/* Header */}
            <div style={{
                padding: '20px 28px', borderBottom: '1px solid #f0fdf4',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={18} style={{ color: '#22c55e' }} />
                    <span style={{ fontFamily: 'Syne, sans-serif', fontSize: '17px', fontWeight: 700, color: '#0f1f12' }}>
                        Recent Tickets
                    </span>
                </div>
                <button
                    onClick={() => navigate('/my-tickets')}
                    style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: '#16a34a', fontSize: '13px', fontWeight: 600,
                    }}
                >
                    View All →
                </button>
            </div>

            {/* Content */}
            <div style={{ padding: loading || error || tickets.length === 0 ? '28px' : '0' }}>
                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <style>{`@keyframes shimmer{100%{transform:translateX(100%)}}`}</style>
                        {[...Array(4)].map((_, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 0' }}>
                                <div style={{ height: '24px', width: '64px', background: '#f1f5f9', borderRadius: '6px', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
                                    <div style={{ position: 'absolute', inset: 0, transform: 'translateX(-100%)', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)', animation: 'shimmer 1.5s infinite' }} />
                                </div>
                                <div style={{ height: '20px', flex: 1, background: '#f1f5f9', borderRadius: '6px', position: 'relative', overflow: 'hidden' }}>
                                    <div style={{ position: 'absolute', inset: 0, transform: 'translateX(-100%)', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)', animation: 'shimmer 1.5s infinite' }} />
                                </div>
                                <div style={{ height: '24px', width: '80px', background: '#f1f5f9', borderRadius: '100px', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
                                    <div style={{ position: 'absolute', inset: 0, transform: 'translateX(-100%)', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)', animation: 'shimmer 1.5s infinite' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 0', textAlign: 'center', color: '#ef4444', background: 'rgba(254,242,242,0.5)', borderRadius: '16px', border: '1px dashed #fecaca' }}>
                        <AlertCircle size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
                        <p style={{ fontSize: '14px', fontWeight: 700 }}>Sync Failed</p>
                        <p style={{ fontSize: '10px', marginTop: '4px', color: '#f87171' }}>{error}</p>
                    </div>
                ) : tickets.length === 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 0', textAlign: 'center', color: '#6b7280', background: 'rgba(249,250,251,0.5)', borderRadius: '16px', border: '1px dashed #e5e7eb' }}>
                        <Inbox size={32} style={{ marginBottom: '12px', opacity: 0.2 }} />
                        <p style={{ fontSize: '14px', fontWeight: 500 }}>No tickets yet.</p>
                        <p style={{ fontSize: '12px', marginTop: '4px' }}>Report an issue and our AI will start helping immediately.</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#fafafa', borderBottom: '1px solid #f0fdf4' }}>
                                    <th style={{ fontSize: '11px', letterSpacing: '0.1em', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', padding: '10px 28px' }}>ID</th>
                                    <th style={{ fontSize: '11px', letterSpacing: '0.1em', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', padding: '10px 28px' }}>Subject</th>
                                    <th style={{ fontSize: '11px', letterSpacing: '0.1em', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', padding: '10px 28px' }}>Status</th>
                                    <th style={{ fontSize: '11px', letterSpacing: '0.1em', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', padding: '10px 28px' }}>Submitted</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tickets.map((ticket) => (
                                    <tr
                                        key={ticket.id}
                                        onClick={() => navigate(`/ticket/${ticket.id}`)}
                                        style={{ borderBottom: '1px solid #f9fafb', cursor: 'pointer', transition: 'background 0.2s' }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = '#f0fdf4'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <td style={{ padding: '16px 28px' }}>
                                            <span style={{ fontFamily: 'monospace', fontSize: '11px', fontWeight: 600, color: '#16a34a' }}>
                                                #{ticket.id}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px 28px' }}>
                                            <p style={{ fontSize: '14px', fontWeight: 500, color: '#111827', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '320px' }}>
                                                {ticket.summary || ticket.subject || ticket.description || "No description provided"}
                                            </p>
                                        </td>
                                        <td style={{ padding: '16px 28px' }}>
                                            {getStatusBadge(ticket.status)}
                                        </td>
                                        <td style={{ padding: '16px 28px', whiteSpace: 'nowrap' }}>
                                            <span style={{ color: '#6b7280', fontSize: '12px' }}>
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

