import React from 'react';
import { ArrowLeft, Bell, CheckCircle2, MessageSquare, Ticket, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useTicketStore from "../../store/ticketStore";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { formatTicketId } from "../../utils/format";

const NotificationsPage = () => {
    const navigate = useNavigate();
    const { notifications = [], markNotificationsRead } = useTicketStore();

    const getIcon = (type) => {
        switch (type) {
            case 'resolution': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
            case 'message': return <MessageSquare className="w-5 h-5 text-blue-500" />;
            case 'new_ticket': return <Ticket className="w-5 h-5 text-amber-500" />;
            default: return <Bell className="w-5 h-5 text-gray-400" />;
        }
    };

    return (
        <main className="flex-1 max-w-[800px] w-full mx-auto px-6 py-12">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Notifications</h1>
                    <p className="text-gray-500 font-medium mt-1">Keep track of your ticket updates and responses.</p>
                </div>
                <button
                    onClick={() => markNotificationsRead()}
                    className="text-sm font-bold text-gray-400 hover:text-emerald-600 transition-colors uppercase tracking-widest"
                >
                    Mark all as read
                </button>
            </div>

            <div className="space-y-4">
                {notifications.length > 0 ? (
                    notifications.map((notif) => (
                        <Card
                            key={notif.id}
                            onClick={() => navigate(`/ticket/${notif.ticketId}`)}
                            className={`p-6 rounded-2xl border transition-all cursor-pointer group flex gap-5 items-start ${!notif.read ? 'border-emerald-200 bg-emerald-50/20 shadow-sm' : 'border-gray-100 hover:border-gray-200'}`}
                        >
                            <div className={`p-3 rounded-xl shrink-0 ${!notif.read ? 'bg-emerald-100/50' : 'bg-gray-100 group-hover:bg-gray-200'}`}>
                                {getIcon(notif.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-4">
                                    <h3 className={`text-base leading-tight ${!notif.read ? 'font-bold text-gray-900' : 'font-semibold text-gray-700'}`}>
                                        {notif.title}
                                    </h3>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider tabular-nums whitespace-nowrap">
                                        {new Date(notif.timestamp).toLocaleString()}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 mt-2 leading-relaxed max-w-2xl">
                                    {notif.message}
                                </p>
                                <div className="flex items-center gap-3 mt-4">
                                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md uppercase tracking-wider border border-emerald-100">
                                        Ticket #{formatTicketId(notif.ticketId)}
                                    </span>
                                    {!notif.read && (
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))
                ) : (
                    <div className="text-center py-20 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
                        <Bell className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-gray-900">No notifications yet</h3>
                        <p className="text-gray-500 text-sm mt-1 max-w-xs mx-auto">When your tickets get updated or support replies, you'll see them here.</p>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="mt-8 px-6 py-2.5 bg-white border border-gray-100 text-emerald-600 font-bold rounded-xl shadow-sm hover:shadow-md transition-all"
                        >
                            Back to Dashboard
                        </button>
                    </div>
                )}
            </div>
        </main>
    );
};

export default NotificationsPage;
