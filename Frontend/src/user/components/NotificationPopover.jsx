import React from 'react';
import { Bell, CheckCircle2, MessageSquare, Ticket, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover";
import { Button } from "../../components/ui/button";
import useTicketStore from "../../store/ticketStore";

const NotificationPopover = ({ isAdmin = false }) => {
    const navigate = useNavigate();
    const { notifications = [], markNotificationsRead } = useTicketStore();
    const currentRole = isAdmin ? 'admin' : 'user';

    // Filter to only show notifications meant for this role.
    // Legacy notifications without recipientRole are shown to everyone for backwards compat.
    const myNotifications = notifications.filter(
        n => !n.recipientRole || n.recipientRole === currentRole
    );

    const unreadCount = myNotifications.filter(n => !n.read).length;

    const getIcon = (type) => {
        switch (type) {
            case 'resolution': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
            case 'message': return <MessageSquare className="w-5 h-5 text-blue-500" />;
            case 'new_ticket': return <Ticket className="w-5 h-5 text-amber-500" />;
            default: return <Bell className="w-5 h-5 text-gray-400" />;
        }
    };

    return (
        <Popover onOpenChange={(open) => { if (!open) markNotificationsRead(); }}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] text-[10px] font-bold text-white bg-red-500 rounded-full flex items-center justify-center border-2 border-white px-1">
                            {unreadCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0 shadow-2xl border-gray-100 rounded-2xl overflow-hidden mt-1 z-50">
                <div className="p-4 border-b border-gray-100 bg-white flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-gray-900 leading-none">Notifications</h3>
                        <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-widest">Recent Activity</p>
                    </div>
                    {unreadCount > 0 && (
                        <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">{unreadCount} NEW</span>
                    )}
                </div>
                <div className="max-h-[400px] overflow-y-auto bg-white">
                    {myNotifications.length > 0 ? (
                        <div className="divide-y divide-gray-50">
                            {myNotifications.map((notif) => (
                                <div
                                    key={notif.id}
                                    onClick={() => {
                                        // Correct route: /admin/ticket/:id for admins, /ticket/:id for users
                                        const route = isAdmin
                                            ? `/admin/ticket/${notif.ticketId}`
                                            : `/ticket/${notif.ticketId}`;
                                        navigate(route);
                                    }}
                                    className={`p-4 hover:bg-gray-50/80 transition cursor-pointer flex gap-3 ${!notif.read ? 'bg-emerald-50/20' : ''}`}
                                >
                                    <div className="mt-1 shrink-0 p-2 bg-gray-50 rounded-lg">
                                        {getIcon(notif.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-xs ${!notif.read ? 'font-bold text-gray-900' : 'font-medium text-gray-600'}`}>
                                            {notif.title}
                                        </p>
                                        <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">{notif.message}</p>
                                        <p className="text-[9px] font-bold text-gray-400 mt-2 uppercase tracking-tighter">
                                            {new Date(notif.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-10 text-center flex flex-col items-center">
                            <div className="size-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
                                <Bell className="w-6 h-6 text-gray-200" />
                            </div>
                            <p className="text-sm font-bold text-gray-900">All caught up</p>
                            <p className="text-xs font-medium text-gray-500 mt-1">No new activity to show</p>
                        </div>
                    )}
                </div>
                <div className="p-3 bg-gray-50 border-t border-gray-100">
                    <button
                        onClick={() => markNotificationsRead()}
                        className="w-full py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-emerald-600 transition-colors bg-white rounded-lg border border-gray-100"
                    >
                        Mark all as read
                    </button>
                </div>
            </PopoverContent>
        </Popover>
    );
};

export default NotificationPopover;
