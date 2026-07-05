import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';

const priorities = [
    { level: 'Critical', color: 'bg-red-500', text: 'text-red-700', bg: 'bg-red-50 border-red-200', desc: 'System outages, data breaches, total blockers. Responded to immediately.', examples: ['Server completely down', 'Security breach detected', 'All users locked out'] },
    { level: 'High', color: 'bg-orange-500', text: 'text-orange-700', bg: 'bg-orange-50 border-orange-200', desc: 'Major feature broken, deadline-sensitive. Responded to within 1 hour.', examples: ['Production deploy failing', 'VPN down for team', 'Payment system error'] },
    { level: 'Medium', color: 'bg-yellow-500', text: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-200', desc: 'Partial functionality impacted. Responded to within 4 hours.', examples: ['Printer not working', 'Email delays', 'Slow performance'] },
    { level: 'Low', color: 'bg-green-500', text: 'text-green-700', bg: 'bg-green-50 border-green-200', desc: 'Minor inconvenience, cosmetic issues. Responded to within 24 hours.', examples: ['Wrong timezone on dashboard', 'Typo in email', 'Dark mode request'] },
];

const signals = [
    { signal: '"ASAP"', priority: 'Critical', weight: '↑↑↑' },
    { signal: '"urgent"', priority: 'High', weight: '↑↑' },
    { signal: '"all users affected"', priority: 'Critical', weight: '↑↑↑' },
    { signal: '"minor issue"', priority: 'Low', weight: '↓' },
    { signal: '"when you can"', priority: 'Low', weight: '↓↓' },
    { signal: '"class starts in 20 mins"', priority: 'High', weight: '↑↑' },
];

export default function PriorityDetectionFeature() {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen bg-white font-sans">
            <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                <button onClick={() => navigate('/')} className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-emerald-700 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Home
                </button>
                <span className="font-black text-emerald-900 italic uppercase text-lg">HelpDesk.ai</span>
                <button onClick={() => navigate('/admin-signup')} className="bg-emerald-900 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-800 transition-all">
                    Get Started Free
                </button>
            </nav>

            <section className="bg-gradient-to-br from-red-50 via-white to-orange-50 py-24 px-6 text-center">
                <div className="max-w-4xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm font-bold mb-6">
                        <AlertCircle className="w-4 h-4" /> Priority Detection
                    </div>
                    <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-6">
                        No More <span className="text-red-600">Missed Urgencies</span>
                    </h1>
                    <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
                        Our AI reads emotional context, keywords, and impact signals to automatically assign the right priority — before any human sees it.
                    </p>
                </div>
            </section>

            <section className="py-20 px-6 max-w-6xl mx-auto">
                <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">The Four Priority Levels</h2>
                <div className="space-y-4">
                    {priorities.map(({ level, color, text, bg, desc, examples }) => (
                        <div key={level} className={`rounded-2xl border p-6 ${bg} flex flex-col md:flex-row md:items-center gap-6`}>
                            <div className="flex items-center gap-4 min-w-[160px]">
                                <div className={`w-3 h-3 rounded-full ${color} animate-pulse`} />
                                <span className={`text-lg font-black uppercase tracking-wider ${text}`}>{level}</span>
                            </div>
                            <div className="flex-1">
                                <p className="text-gray-700 font-medium mb-2">{desc}</p>
                                <div className="flex flex-wrap gap-2">
                                    {examples.map(ex => (
                                        <span key={ex} className="text-xs bg-white/80 border border-gray-200 text-gray-600 px-3 py-1 rounded-full font-medium">{ex}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="bg-gray-950 py-24 px-6">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl font-bold text-white text-center mb-3">Urgency Signals the AI Detects</h2>
                    <p className="text-gray-400 text-center mb-12">Phrases that influence priority scoring in real-time.</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {signals.map(({ signal, priority, weight }) => (
                            <div key={signal} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                                <p className="text-emerald-400 font-mono font-bold mb-2">{signal}</p>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-400 uppercase tracking-widest">→ {priority}</span>
                                    <span className="text-xs font-black text-red-400">{weight}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-24 px-6 text-center bg-white">
                <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Stop firefighting. Start triaging.</h2>
                <p className="text-gray-500 mb-8">Let AI handle the urgency so your team focuses on the fix.</p>
                <button onClick={() => navigate('/admin-signup')} className="inline-flex items-center gap-2 bg-emerald-900 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-emerald-800 transition-all shadow-xl shadow-emerald-900/20">
                    Get Started Free <ArrowRight className="w-5 h-5" />
                </button>
            </section>
        </div>
    );
}
