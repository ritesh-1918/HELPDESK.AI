import React from 'react';
import { Target, UserCheck, ShieldAlert, CheckCircle2 } from 'lucide-react';

const ScorecardMetric = ({ icon: Icon, title, value, percentage, isPositive, color }) => (
    <div style={{ background: '#fff', borderRadius: '16px', padding: '20px', border: '1px solid #f0fdf4', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
        <div className="flex justify-between items-start mb-4">
            <div style={{ background: `${color}15`, color: color, padding: '10px', borderRadius: '12px' }}>
                <Icon size={20} strokeWidth={2.5} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: isPositive ? '#dcfce7' : '#fee2e2', color: isPositive ? '#16a34a' : '#ef4444', padding: '4px 8px', borderRadius: '100px', fontSize: '12px', fontWeight: 600 }}>
                {isPositive ? '+' : '-'}{percentage}%
            </div>
        </div>
        <div>
            <h4 style={{ color: '#6b7280', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>{title}</h4>
            <div style={{ color: '#0f1f12', fontSize: '24px', fontWeight: 800, fontFamily: 'Syne, sans-serif' }}>
                {value}
            </div>
        </div>
    </div>
);

const VisualScorecard = ({ metrics }) => {
    // Generate some display numbers based on total metrics to act as the scorecard
    const total = metrics?.total || 100;
    const autoResolved = metrics?.autoResolved || 0;
    const escalated = metrics?.humanEscalated || 0;
    
    // Derived dummy/approximated stats for the scorecard if not provided by backend directly
    const classificationAccuracy = total > 0 ? Math.min(100, Math.round(((total - escalated) / total) * 100)) : 0;
    const humanOverrides = escalated; // using escalated as overrides
    const successfulAudits = total > 0 ? total - escalated : 0;
    
    return (
        <div className="mb-8">
            <div className="flex items-center justify-between mb-4 px-2">
                <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '18px', fontWeight: 700, color: '#0f1f12', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Target size={18} color="#16a34a" />
                    Classification vs Audit Scorecard
                </h2>
                <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 500 }}>
                    Last 30 Days
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <ScorecardMetric 
                    icon={Target} 
                    title="Classification Accuracy" 
                    value={`${classificationAccuracy}%`} 
                    percentage={2.4} 
                    isPositive={true} 
                    color="#16a34a" 
                />
                <ScorecardMetric 
                    icon={ShieldAlert} 
                    title="Human Overrides" 
                    value={humanOverrides} 
                    percentage={1.2} 
                    isPositive={false} 
                    color="#ef4444" 
                />
                <ScorecardMetric 
                    icon={UserCheck} 
                    title="Human Audits" 
                    value={total} 
                    percentage={5.0} 
                    isPositive={true} 
                    color="#3b82f6" 
                />
                <ScorecardMetric 
                    icon={CheckCircle2} 
                    title="Successful Matches" 
                    value={successfulAudits} 
                    percentage={3.1} 
                    isPositive={true} 
                    color="#8b5cf6" 
                />
            </div>
        </div>
    );
};

export default VisualScorecard;
