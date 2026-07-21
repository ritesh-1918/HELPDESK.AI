import React, { useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Card } from '@/components/ui/card';

const ResolutionAnalyticsChart = ({ tickets }) => {
    const data = useMemo(() => {
        if (!tickets || tickets.length === 0) return [];
        
        // Days of week initialization
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const stats = {
            'Sunday': { totalHours: 0, count: 0 },
            'Monday': { totalHours: 0, count: 0 },
            'Tuesday': { totalHours: 0, count: 0 },
            'Wednesday': { totalHours: 0, count: 0 },
            'Thursday': { totalHours: 0, count: 0 },
            'Friday': { totalHours: 0, count: 0 },
            'Saturday': { totalHours: 0, count: 0 },
        };

        tickets.forEach(t => {
            const isResolved = t.status?.toLowerCase() === 'resolved' || t.status?.toLowerCase() === 'closed';
            if (isResolved) {
                const start = new Date(t.created_at || t.createdAt);
                const end = new Date(t.resolved_at || t.closed_at || t.updated_at);
                
                if (start && end && !isNaN(start.getTime()) && !isNaN(end.getTime())) {
                    const diffHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                    if (diffHours >= 0) {
                        const day = days[start.getDay()];
                        if (day) {
                            stats[day].totalHours += diffHours;
                            stats[day].count += 1;
                        }
                    }
                }
            }
        });

        return days.map(day => ({
            name: day.substring(0, 3), // Mon, Tue, etc.
            avgHours: stats[day].count > 0 ? Number((stats[day].totalHours / stats[day].count).toFixed(1)) : 0
        }));
    }, [tickets]);

    return (
        <Card className="p-6 rounded-[2rem] border border-slate-100 shadow-sm bg-white">
            <div className="mb-6">
                <h3 className="text-lg font-black text-slate-800 tracking-tight">Resolution Analytics</h3>
                <p className="text-sm font-semibold text-slate-400">Average resolution duration (hours) grouped by weekday</p>
            </div>
            
            <div className="h-[300px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }}
                            dy={10}
                        />
                        <YAxis 
                            axisLine={false} 
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }}
                        />
                        <Tooltip 
                            cursor={{ fill: '#f8fafc' }}
                            contentStyle={{ borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', fontWeight: 700, fontSize: '13px', color: '#1e293b' }}
                            formatter={(value) => [`${value} hrs`, 'Avg Resolution']}
                        />
                        <Bar 
                            dataKey="avgHours" 
                            fill="#10b981" 
                            radius={[8, 8, 8, 8]}
                            barSize={36}
                            animationDuration={1500}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};

export default ResolutionAnalyticsChart;
