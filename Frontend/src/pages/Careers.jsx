import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, ArrowLeft, ArrowRight, Star } from 'lucide-react';
import { Card } from '../components/ui/card';

export default function Careers() {
    const navigate = useNavigate();

    const jobs = [
        { title: 'Senior NLP Architect', location: 'Bengaluru / Remote', type: 'Full-Time', scale: '₹24L - ₹32L' },
        { title: 'Lead Full-Stack Engineer (React / Node)', location: 'Mumbai / Hybrid', type: 'Full-Time', scale: '₹18L - ₹26L' },
        { title: 'AI Support Specialist (Tier 2 Override Ops)', location: 'Bengaluru', type: 'Full-Time', scale: '₹8L - ₹12L' }
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
                            <span className="px-2 py-0.5 text-[10px] font-black bg-blue-100 text-blue-800 rounded-md uppercase tracking-wider">Careers</span>
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

            <div className="max-w-[800px] mx-auto px-4 md:px-6 mt-12 space-y-12">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-700 text-xs font-bold">
                        <Briefcase size={14} /> Open Positions
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Shape the Future of IT Triage</h1>
                    <p className="text-slate-600 text-base leading-relaxed">
                        Join our engineering-first team. We build self-healing pipelines, Tesseract OCR integrations, and dynamic telemetry mapping products.
                    </p>
                </div>

                <div className="space-y-4">
                    {jobs.map((job, idx) => (
                        <Card key={idx} className="p-6 rounded-[1.5rem] border border-slate-200/80 bg-white flex items-center justify-between shadow-sm flex-wrap gap-4 hover:border-emerald-300 transition-all cursor-pointer">
                            <div className="space-y-1">
                                <h4 className="font-extrabold text-slate-900 text-sm">{job.title}</h4>
                                <p className="text-xs text-slate-400 font-semibold">{job.location} · {job.type}</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-xs font-bold text-emerald-700">{job.scale}</span>
                                <button className="p-2 bg-gray-50 hover:bg-emerald-50 rounded-lg border border-gray-100 hover:border-emerald-100 text-slate-500 hover:text-emerald-700 transition-colors">
                                    <ArrowRight size={16} />
                                </button>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
