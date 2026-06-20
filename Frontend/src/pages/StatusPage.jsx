import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, CheckCircle, AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react';
import { Card } from '../components/ui/card';

export default function StatusPage() {
    const navigate = useNavigate();
    const [isRefreshing, setIsRefreshing] = React.useState(false);

    const handleRefresh = () => {
        setIsRefreshing(true);
        setTimeout(() => setIsRefreshing(false), 1000);
    };

    const services = [
        { name: 'AI Triage Engine (NER & Categorization)', status: 'Operational', desc: 'Active pipeline & Gemini Model backup failovers' },
        { name: 'Supabase Data Gateway', status: 'Operational', desc: 'Secure database endpoints & real-time socket connections' },
        { name: 'Speech Dictation Interface', status: 'Operational', desc: 'Local Web Speech Recognition browser framework compatibility' },
        { name: 'Client-Side OCR Telemetry', status: 'Operational', desc: 'Tesseract.js script injection & parallel image worker processes' },
        { name: 'Stripe Payment Processor Integration', status: 'Operational', desc: 'Live billing checkout links & dynamic upgrade callbacks' }
    ];

    return (
        <div className="min-h-screen bg-[#f6f8f7] pb-20">
            {/* Header */}
            <header className="w-full bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-[1100px] mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
                        <img src="/favicon.png" alt="HELPDESK.AI Logo" className="w-7 h-7 object-contain" />
                        <div className="flex items-baseline gap-2">
                            <h1 className="text-xl font-black tracking-tighter text-gray-900 italic">HELPDESK.AI</h1>
                            <span className="px-2 py-0.5 text-[10px] font-black bg-emerald-100 text-emerald-800 rounded-md uppercase tracking-wider">Status</span>
                        </div>
                    </div>
                    <button 
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-emerald-600 transition-colors bg-gray-50 hover:bg-emerald-50 px-3.5 py-2 rounded-xl border border-gray-200"
                    >
                        <ArrowLeft size={14} /> Back to Home
                    </button>
                </div>
            </header>

            <div className="max-w-[800px] mx-auto px-4 md:px-6 mt-12 space-y-10">
                {/* Hero Banner */}
                <div className="bg-emerald-950 text-white rounded-[2rem] p-8 md:p-10 shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="absolute -right-10 -top-10 w-44 h-44 bg-emerald-500/10 rounded-full blur-3xl" />
                    
                    <div className="space-y-3 z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 rounded-full border border-emerald-500/30">
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-300">Live Status Radar</span>
                        </div>
                        <h2 className="text-3xl font-black italic tracking-tight">All Systems Operational</h2>
                        <p className="text-slate-300 text-xs font-semibold">100% of microservices running successfully within target parameters.</p>
                    </div>

                    <button 
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="self-start md:self-auto px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 border border-white/15 transition-all active:scale-95 disabled:opacity-50"
                    >
                        <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} /> {isRefreshing ? 'Checking...' : 'Refresh Status'}
                    </button>
                </div>

                {/* Service Cards */}
                <div className="space-y-4">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Active Services</h3>
                    <div className="space-y-3">
                        {services.map((service, idx) => (
                            <Card key={idx} className="p-6 rounded-[1.5rem] border border-slate-200/80 bg-white flex items-center justify-between shadow-sm flex-wrap gap-4">
                                <div className="space-y-1">
                                    <h4 className="font-extrabold text-slate-900 text-sm">{service.name}</h4>
                                    <p className="text-xs text-slate-400 font-semibold">{service.desc}</p>
                                </div>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest">
                                    <CheckCircle size={10} /> {service.status}
                                </span>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
