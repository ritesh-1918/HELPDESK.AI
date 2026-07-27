import React from 'react';
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useTheme } from '../../contexts/ThemeContext';

/**
 * Reusable StatCard for Admin Metrics
 */
const StatCard = ({ label, value, subtitle, icon: Icon, trend, color = 'indigo', customIcon }) => {
    const { isDark } = useTheme();
    const semanticColors = {
        indigo: { bg: isDark ? '#1e1b4b' : '#EEF2FF', text: '#6366f1' },
        amber: { bg: isDark ? '#451a03' : '#FFF7ED', text: '#f97316' },
        emerald: { bg: isDark ? '#022c22' : '#F0FDF4', text: '#16a34a' },
        red: { bg: isDark ? '#1e293b' : '#EFF6FF', text: '#3b82f6' },
        slate: { bg: isDark ? '#1e293b' : '#F8FAFC', text: '#64748B' }
    };
    const currentStyle = semanticColors[color] || semanticColors.slate;

    return (
        <div style={{
            background: isDark ? '#1e293b' : '#ffffff', borderRadius: '16px', border: `1px solid ${isDark ? '#334155' : '#F0FDF4'}`,
            boxShadow: isDark ? '0 1px 3px rgba(0,0,0,0.1), 0 4px 16px rgba(0,0,0,0.1)' : '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)',
            padding: '24px 28px', transition: 'all 0.3s ease', position: 'relative', overflow: 'hidden'
        }} className="hover:shadow-lg hover:-translate-y-1 group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <p style={{ fontSize: '11px', color: isDark ? '#64748b' : '#9ca3af', letterSpacing: '0.1em', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>
                        {label}
                    </p>
                    <div className="flex items-baseline gap-2">
                        <p style={{ fontSize: '36px', fontWeight: 800, color: isDark ? '#e2e8f0' : '#0f1f12', lineHeight: 1, letterSpacing: '-0.03em', margin: '8px 0 6px' }}>
                            {value}
                        </p>
                        {trend && (
                            <span className={`text-[11px] font-bold flex items-center gap-0.5 ${trend.startsWith('+') ? 'text-emerald-500' : 'text-red-500'}`}>
                                {trend.startsWith('+') ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                {trend}
                            </span>
                        )}
                    </div>
                    {subtitle && <p style={{ fontSize: '12px', color: isDark ? '#64748b' : '#9ca3af' }}>{subtitle}</p>}
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
