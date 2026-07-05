import React from 'react';
import { Badge } from "../../components/ui/badge";
 
import { motion } from 'framer-motion';

const TicketStatusBadge = ({ status }) => {
    const s = (status || '').toLowerCase();

    const getStatusConfig = () => {
        if (s.includes('resolv') || s.includes('closed')) {
            return {
                label: 'Resolved',
                className: 'bg-slate-100 text-slate-500 border-slate-200',
                dotColor: 'bg-slate-400'
            };
        }
        if (s.includes('progress') || s.includes('active')) {
            return {
                label: 'In Progress',
                className: 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm shadow-emerald-500/5',
                dotColor: 'bg-emerald-500',
                animate: true
            };
        }
        if (s.includes('escalate')) {
            return {
                label: 'Escalated',
                className: 'bg-red-50 text-red-600 border-red-100 shadow-sm shadow-red-500/5',
                dotColor: 'bg-red-500',
                animate: true
            };
        }
        // Default: Pending/Open
        return {
            label: status?.toUpperCase() || 'OPEN',
            className: 'bg-amber-50 text-amber-600 border-amber-100 shadow-sm shadow-amber-500/5',
            dotColor: 'bg-amber-500',
            animate: s.includes('open') || s.includes('pend')
        };
    };

    const config = getStatusConfig();

    return (
        <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            key={status} // Animate on status change
        >
            <Badge className={`flex items-center gap-1.5 px-3 py-1 text-[10px] font-black uppercase tracking-widest border-2 rounded-xl transition-all ${config.className}`}>
                <span className="relative flex h-2 w-2">
                    {config.animate && (
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${config.dotColor}`}></span>
                    )}
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${config.dotColor}`}></span>
                </span>
                {config.label}
            </Badge>
        </motion.div>
    );
};

export default TicketStatusBadge;
