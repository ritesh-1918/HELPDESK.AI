import React, { useRef, useState, useEffect } from 'react';

export default function AnimatedCounter({ target, suffix = '', prefix = '', label, isWord = false }) {
    const [display, setDisplay] = useState(isWord ? target : '0');
    const [triggered, setTriggered] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !triggered) {
                    setTriggered(true);
                }
            },
            { threshold: 0.5 }
        );
        
        observer.observe(el);
        
        return () => observer.disconnect();
    }, [triggered]);

    useEffect(() => {
        if (!triggered || isWord) return;
        
        const duration = 1500;
        const start = performance.now();
        const to = parseFloat(target);
        
        const step = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(to * eased);
            setDisplay(String(current));
            
            if (progress < 1) {
                requestAnimationFrame(step);
            }
        };
        
        requestAnimationFrame(step);
    }, [triggered, target, isWord]);

    return (
        <div ref={ref} className="p-4">
            <div className="text-4xl font-extrabold mb-1 text-white tabular-nums">
                {prefix}{display}{suffix}
            </div>
            <div className="text-sm text-white font-medium tracking-wide opacity-75">{label}</div>
        </div>
    );
}
