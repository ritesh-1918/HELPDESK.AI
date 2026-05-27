import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, GitCommit, ArrowLeft, Heart, Zap, Sparkles } from 'lucide-react';
import { Card } from '../components/ui/card';

export default function Changelog() {
    const navigate = useNavigate();

    const changes = [
        {
            version: 'v1.2.0',
            date: 'May 2026',
            badge: 'Latest Release',
            highlight: 'Standalone Docs Portal & Dynamic Search',
            items: [
                'Created complete standalone Docs Portal (/docs) outside authenticated routing grids.',
                'Integrated interactive on-screen endpoint payload simulation and terminal output logs.',
                'Resolved jsconfig compiler issues by deprecating outdated ignoreDeprecations keys.',
                'Optimized responsive layout transitions across both mobile drawer and desktop headers.'
            ]
        },
        {
            version: 'v1.1.0',
            date: 'April 2026',
            badge: 'Update',
            highlight: 'Local Tesseract.js OCR and Siri Voice Recognition',
            items: [
                'Added client-side webkitSpeechRecognition API dictation assistant with live amplitude waveforms.',
                'Implemented offline image OCR with local Tesseract.js engine parsing image attachment telemetry.',
                'Connected Supabase tables to log AI entities scanned directly from ticket descriptions.',
                'Enacted dynamic SLA fallback computations based on category routing priorities.'
            ]
        },
        {
            version: 'v1.0.0',
            date: 'March 2026',
            badge: 'Major Release',
            highlight: 'Core AI Routing Engine Deployment',
            items: [
                'Launched main multi-tenant portal with full dashboard telemetry, tracking, and company lobbies.',
                'Connected Gemini API fallback interfaces to self-heal local database load degradation issues.',
                'Created admin console enabling support agents to claim, claim-override, or resolve tickets live.'
            ]
        }
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
                            <span className="px-2 py-0.5 text-[10px] font-black bg-indigo-100 text-indigo-800 rounded-md uppercase tracking-wider">Changelog</span>
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
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-700 text-xs font-bold">
                        <Sparkles size={14} /> System Changelog
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Product Updates & Features</h1>
                    <p className="text-slate-600 text-base leading-relaxed">
                        Stay informed about system features, framework optimizations, and local AI training models introduced into HELPDESK.AI.
                    </p>
                </div>

                {/* Timeline */}
                <div className="relative border-l border-slate-200 pl-6 ml-4 space-y-12">
                    {changes.map((change, idx) => (
                        <div key={change.version} className="relative">
                            {/* Dot icon */}
                            <span className="absolute -left-[35px] top-1.5 w-6 h-6 rounded-full bg-indigo-50 border border-indigo-300 flex items-center justify-center text-indigo-600">
                                <GitCommit size={14} />
                            </span>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3 flex-wrap">
                                    <span className="text-xl font-extrabold text-slate-900">{change.version}</span>
                                    <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                                        <Calendar size={12} /> {change.date}
                                    </span>
                                    <span className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-100 text-[10px] font-black text-emerald-800 uppercase tracking-widest">
                                        {change.badge}
                                    </span>
                                </div>

                                <Card className="p-6 rounded-[2rem] border border-slate-100 shadow-sm bg-white space-y-4">
                                    <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                                        <Zap size={14} className="text-indigo-500" /> {change.highlight}
                                    </h4>
                                    <ul className="list-disc pl-5 text-xs text-slate-600 space-y-2 leading-relaxed">
                                        {change.items.map((item, itemIdx) => (
                                            <li key={itemIdx}>{item}</li>
                                        ))}
                                    </ul>
                                </Card>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
