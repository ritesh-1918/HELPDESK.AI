import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Heart, Sparkles, ArrowLeft, Target, Award } from 'lucide-react';
import { Card } from '../components/ui/card';

export default function AboutUs() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#f6f8f7] pb-20">
            {/* Header */}
            <header className="w-full bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-[1100px] mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
                        <img src="/favicon.png" alt="HELPDESK.AI Logo" className="w-7 h-7 object-contain" />
                        <div className="flex items-baseline gap-2">
                            <h1 className="text-xl font-black tracking-tighter text-gray-900 italic">HELPDESK.AI</h1>
                            <span className="px-2 py-0.5 text-[10px] font-black bg-emerald-100 text-emerald-800 rounded-md uppercase tracking-wider">About</span>
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
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-700 text-xs font-bold">
                        <Heart size={14} /> Our Mission
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Pioneering Intelligent Triage</h1>
                    <p className="text-slate-600 text-base leading-relaxed">
                        At HELPDESK.AI, we strive to build local machine learning workflows that eliminate manual ticket tagging, priority guessing, and routing bottlenecks for modern Indian businesses.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="p-6 rounded-[2rem] border border-slate-200 bg-white space-y-3">
                        <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <Target size={16} />
                        </div>
                        <h4 className="font-extrabold text-slate-800 text-sm">Self-Healing Backups</h4>
                        <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                            By backing up offline sentence embeddings with fast Gemini failover pipelines, we achieve 100% platform availability under tight network margins.
                        </p>
                    </Card>

                    <Card className="p-6 rounded-[2rem] border border-slate-200 bg-white space-y-3">
                        <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <Award size={16} />
                        </div>
                        <h4 className="font-extrabold text-slate-800 text-sm">100% Indian Data Sovereignty</h4>
                        <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                            All ticket summaries, OCR attachments, and database timelines remain securely locked under regional cloud networks.
                        </p>
                    </Card>
                </div>
            </div>
        </div>
    );
}
