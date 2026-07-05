import React, { useEffect, useState } from 'react';
 
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCircle2, MessageSquare, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useTicketStore from "../../store/ticketStore";

const NotificationToast = () => {
    const notifications = useTicketStore(state => state.notifications);
    const [currentToast, setCurrentToast] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (notifications.length > 0) {
            const latest = notifications[0];
            // Only show if it's unread and hasn't been shown in this session as a toast
            // We use the ID to track which one we've already toasted
            const shownToasts = JSON.parse(sessionStorage.getItem('shownToasts') || '[]');

            if (!latest.read && !shownToasts.includes(latest.id)) {
                 
                setCurrentToast(latest);

                // Add to shown list
                sessionStorage.setItem('shownToasts', JSON.stringify([...shownToasts, latest.id]));

                // Auto hide after 5 seconds
                const timer = setTimeout(() => {
                    setCurrentToast(null);
                }, 5000);

                return () => clearTimeout(timer);
            }
        }
    }, [notifications]);

    if (!currentToast) return null;

    const getIcon = () => {
        if (currentToast.title.includes('Resolved')) return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
        return <MessageSquare className="w-5 h-5 text-blue-500" />;
    };

    return (
        <AnimatePresence>
            {currentToast && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                    className="fixed bottom-6 right-6 z-[100] w-full max-w-sm"
                >
                    <div
                        onClick={() => {
                            navigate(`/ticket/${currentToast.ticketId}`);
                            setCurrentToast(null);
                        }}
                        className="bg-white border border-gray-100 shadow-2xl rounded-2xl p-4 flex gap-4 cursor-pointer hover:shadow-emerald-500/10 transition-all group relative overflow-hidden"
                    >
                        {/* Progress bar background */}
                        <motion.div
                            initial={{ width: '100%' }}
                            animate={{ width: 0 }}
                            transition={{ duration: 5, ease: "linear" }}
                            className="absolute bottom-0 left-0 h-1 bg-emerald-500/20"
                        />

                        <div className="size-10 bg-gray-50 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-emerald-50 transition-colors">
                            {getIcon()}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-bold text-gray-900 truncate">{currentToast.title}</h4>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setCurrentToast(null);
                                    }}
                                    className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <p className="text-xs font-medium text-gray-500 mt-1 line-clamp-2">
                                {currentToast.message}
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default NotificationToast;
