import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Card } from '../../components/ui/card';

export default function CookiePolicy() {
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
                            <span className="px-2 py-0.5 text-[10px] font-black bg-slate-100 text-slate-800 rounded-md uppercase tracking-wider">Legal</span>
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

            <div className="max-w-[800px] mx-auto px-4 md:px-6 mt-12 space-y-8">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-500/10 border border-slate-500/20 rounded-full text-slate-700 text-xs font-bold">
                        <ShieldAlert size={14} /> Compliance Guide
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Cookie Policy</h1>
                    <p className="text-slate-400 text-xs font-semibold">Last Updated: May 2026</p>
                </div>

                <Card className="p-8 rounded-[2rem] border border-slate-200 bg-white space-y-6 shadow-sm text-sm text-slate-600 leading-relaxed font-medium">
                    <h3 className="text-lg font-black text-slate-800 tracking-tight">1. Why We Use Cookies</h3>
                    <p>
                        HELPDESK.AI uses secure, essential first-party cookies to manage active user sessions, retain user preferences, and authenticate client tokens accessing our Supabase data gateway.
                    </p>
                    
                    <h3 className="text-lg font-black text-slate-800 tracking-tight">2. Third-Party Trackers</h3>
                    <p>
                        We do not run external tracking scripts or advertising scripts. Stripe cookies are injected solely during active checkouts to maintain secure payment processing integrity.
                    </p>

                    <h3 className="text-lg font-black text-slate-800 tracking-tight">3. Managing Preferences</h3>
                    <p>
                        You can clean, block, or disable active cookies via your browser's security panel settings at any time.
                    </p>
                </Card>
            </div>
        </div>
    );
}
