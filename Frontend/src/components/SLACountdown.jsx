import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';

const SLA_HOURS = {
    'critical': 4,
    'urgent': 4,
    'high': 8,
    'medium': 24,
    'normal': 24,
    'low': 48
};

const SLACountdown = ({ createdAt, priority, status }) => {
    const [timeLeft, setTimeLeft] = useState('');
    const [statusColor, setStatusColor] = useState('text-slate-500 bg-slate-100 border-slate-200');
    const [isExpired, setIsExpired] = useState(false);

    // Derive isResolved during render to prevent cascading renders
    const isResolved = status?.toLowerCase() === 'resolved' || status?.toLowerCase() === 'closed';

    useEffect(() => {
        if (!createdAt) return;

        const createdTime = new Date(createdAt).getTime();
        
        // Guard against invalid date values
        if (isNaN(createdTime)) {
            setTimeLeft('Invalid Date');
            setStatusColor('text-slate-500 bg-slate-100 border-slate-200');
            return;
        }
        const priorityKey = (priority || 'normal').toLowerCase();
        const hoursAllowed = SLA_HOURS[priorityKey] || 24;
        const targetTime = createdTime + (hoursAllowed * 60 * 60 * 1000);

        const calculateTimeLeft = () => {
            const now = new Date().getTime();
            const difference = targetTime - now;

            if (difference <= 0) {
                setTimeLeft('Expired');
                setIsExpired(true);
                setStatusColor('text-red-600 bg-red-50 border-red-200 shadow-[0_0_10px_rgba(220,38,38,0.2)]');
                return;
            }

            setIsExpired(false);
            const hoursLeft = difference / (1000 * 60 * 60);
            const percentLeft = hoursLeft / hoursAllowed;
            
            if (percentLeft > 0.5) {
                setStatusColor('text-emerald-600 bg-emerald-50 border-emerald-200');
            } else if (percentLeft > 0.1) {
                setStatusColor('text-amber-600 bg-amber-50 border-amber-200');
            } else {
                setStatusColor('text-red-600 bg-red-50 border-red-200 animate-pulse');
            }

            const h = Math.floor(difference / (1000 * 60 * 60));
            const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            
            setTimeLeft(`${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m`);
        };

        if (isResolved) {
            setTimeLeft('Resolved');
            setStatusColor('text-slate-500 bg-slate-50 border-slate-200');
            setIsExpired(false);
            return;
        }

        calculateTimeLeft();
        const interval = setInterval(calculateTimeLeft, 60000); // update every minute
        return () => clearInterval(interval);

    }, [createdAt, priority, isResolved]);

    if (!timeLeft) return null;

    return (
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider transition-colors ${statusColor}`}>
            {isResolved ? <CheckCircle2 size={12} /> : isExpired ? <AlertTriangle size={12} /> : <Clock size={12} />}
            {timeLeft}
        </div>
    );
};

export default SLACountdown;
