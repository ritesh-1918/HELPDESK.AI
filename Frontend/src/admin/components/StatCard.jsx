import React from 'react';
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

/**
 * Reusable StatCard for Admin Metrics
 */
const StatCard = ({ label, value, subtitle, icon: Icon, trend, color = 'indigo', customIcon }) => {
    const semanticColors = {
        indigo: { bg: '#EEF2FF', text: '#6366f1' },
        amber: { bg: '#FFF7ED', text: '#f97316' },
        emerald: { bg: '#F0FDF4', text: '#16a34a' },
        red: { bg: '#EFF6FF', text: '#3b82f6' },
        slate: { bg: '#F8FAFC', text: '#64748B' }
    };
    const currentStyle = semanticColors[color] || semanticColors.slate;

    return (
        <div style={{
            background: '#ffffff', borderRadius: '16px', border: '1px solid #F0FDF4',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)',
            padding: '24px 28px', transition: 'all 0.3s ease', position: 'relative', overflow: 'hidden'
        }} className="hover:shadow-lg hover:-translate-y-1 group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <p style={{ fontSize: '11px', color: '#9ca3af', letterSpacing: '0.1em', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>
                        {label}
                    </p>
                    <div className="flex items-baseline gap-2">
                        <p style={{ fontSize: '36px', fontWeight: 800, color: '#0f1f12', lineHeight: 1, letterSpacing: '-0.03em', margin: '8px 0 6px' }}>
                            {value}
                        </p>
                        {trend && (
                            <span className={`text-[11px] font-bold flex items-center gap-0.5 ${trend.startsWith('+') ? 'text-emerald-500' : 'text-red-500'}`}>
                                {trend.startsWith('+') ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                {trend}
                            </span>
                        )}
                    </div>
                    {subtitle && <p style={{ fontSize: '12px', color: '#9ca3af' }}>{subtitle}</p>}
                </div>
                <div style={{
                    background: currentStyle.bg, color: currentStyle.text,
                    padding: '10px', borderRadius: '12px', width: '40px', height: '40px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'transform 0.5s ease'
                }} className="group-hover:scale-110">
                    {customIcon || (Icon && <Icon size={20} />)}
                </div>
            </div>
        </div>
    );
};

export default StatCard;
