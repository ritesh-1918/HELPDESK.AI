import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Lock, Server, Eye, Key, Activity, AlertCircle } from 'lucide-react';

const pillars = [
    { icon: Lock, title: 'Encryption at Rest & In Transit', color: 'bg-indigo-100 text-indigo-600', desc: 'All data stored on our servers is encrypted with AES-256. All connections are secured via TLS 1.3. API keys and secrets are never stored in plaintext.' },
    { icon: Server, title: 'Multi-tenant Data Isolation', color: 'bg-blue-100 text-blue-600', desc: 'Each company\'s data is siloed using Row Level Security (RLS) in Supabase. No data from one organization can ever be accessed by another — enforced at the database level.' },
    { icon: Key, title: 'Role-Based Access Control', color: 'bg-purple-100 text-purple-600', desc: 'Access is governed by strict RBAC. Employees can only see their own tickets. Admins see only their company. Master Admins have audit-only visibility with no data access.' },
    { icon: Eye, title: 'Audit Logging', color: 'bg-emerald-100 text-emerald-600', desc: 'All sensitive actions (admin approvals, ticket corrections, settings changes) are logged with timestamps, user IDs, and intent. Logs are immutable and retained for 12 months.' },
    { icon: Activity, title: 'Infrastructure Security', color: 'bg-orange-100 text-orange-600', desc: 'Deployed on Vercel (frontend) and Hugging Face / Cloud Run (AI backend). Auto-scaling protects against DDoS. Backend endpoints are rate-limited and secured behind API keys.' },
    { icon: AlertCircle, title: 'Responsible Disclosure', color: 'bg-red-100 text-red-600', desc: 'Found a vulnerability? We run a responsible disclosure program. Contact security@helpdesk.ai with a description and reproduction steps. We commit to responding within 72 hours.' },
];

export default function Security() {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-emerald-700 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Go Back
                </button>
                <button onClick={() => navigate('/')} className="font-black text-emerald-900 italic uppercase text-lg hover:text-emerald-700 transition-colors">
                    HelpDesk.ai
                </button>
                <div className="w-24" />
            </nav>

            {/* Hero */}
            <section className="bg-slate-900 text-white py-24 px-6 text-center">
                <div className="max-w-3xl mx-auto">
                    <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <ShieldCheck className="w-10 h-10 text-emerald-400" />
                    </div>
                    <h1 className="text-5xl font-extrabold mb-4">Security at HelpDesk.ai</h1>
                    <p className="text-slate-300 text-xl leading-relaxed max-w-2xl mx-auto">
                        We take your data seriously. Our platform is built from the ground up with security as a first principle, not an afterthought.
                    </p>
                </div>
            </section>

            {/* Security Pillars */}
            <section className="py-20 px-6 max-w-6xl mx-auto">
                <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Security Architecture</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pillars.map(({ icon: Icon, title, color, desc }) => (
                        <div key={title} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-all hover:-translate-y-1">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${color}`}>
                                <Icon className="w-6 h-6" />
                            </div>
                            <h3 className="font-bold text-gray-900 text-lg mb-2">{title}</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Compliance */}
            <section className="bg-slate-900 py-20 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl font-bold text-white mb-4">Compliance & Standards</h2>
                    <p className="text-slate-400 mb-12">We align with industry frameworks to protect your data.</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {['DPDP Act 2023', 'GDPR-Equivalent', 'TLS 1.3', 'AES-256'].map(item => (
                            <div key={item} className="bg-white/5 border border-white/10 rounded-xl p-4">
                                <ShieldCheck className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                                <p className="text-white font-bold text-sm">{item}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Responsible Disclosure CTA */}
            <section className="py-20 px-6 bg-white text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Report a Vulnerability</h2>
                <p className="text-gray-500 max-w-xl mx-auto mb-6">We appreciate security researchers who help us keep HelpDesk.ai safe. Use responsible disclosure to report any issues.</p>
                <a href="mailto:security@helpdesk.ai" className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-slate-800 transition-all">
                    <AlertCircle className="w-5 h-5" /> security@helpdesk.ai
                </a>
            </section>

            <div className="pb-8 text-center">
                <div className="flex items-center justify-center gap-4">
                    <button onClick={() => navigate('/terms')} className="text-sm text-emerald-700 hover:underline">Terms of Service</button>
                    <span className="text-gray-300">|</span>
                    <button onClick={() => navigate('/privacy')} className="text-sm text-emerald-700 hover:underline">Privacy Policy</button>
                </div>
                <p className="text-sm text-gray-400 mt-4">© 2026 HelpDesk.ai. All rights reserved.</p>
            </div>
        </div>
    );
}
