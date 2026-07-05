import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Bot, CheckCircle, Users, MessageSquare, Zap, Database } from 'lucide-react';

const flowSteps = [
    { icon: MessageSquare, title: 'Ticket Received', desc: 'User submits an issue via web form, email, or chat.', color: 'bg-blue-100 text-blue-600' },
    { icon: Database, title: 'Knowledge Check', desc: 'AI scans historical tickets for a matching resolved issue.', color: 'bg-purple-100 text-purple-600' },
    { icon: Bot, title: 'Auto-Resolve (if match found)', desc: 'Chatbot sends the proven solution and marks ticket resolved.', color: 'bg-emerald-100 text-emerald-600' },
    { icon: Users, title: 'Human Escalation (if no match)', desc: 'Routes to the correct team with full context pre-filled.', color: 'bg-orange-100 text-orange-600' },
];

const autoResolvable = [
    'Password reset requests',
    'Software license activation',
    'VPN setup instructions',
    'Printer driver installation',
    'Email account configuration',
    'MFA / 2FA setup guidance',
    'Common app crashes (known fixes)',
    'Account unlock requests',
];

export default function SmartResolutionFeature() {
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

            <section className="bg-gradient-to-br from-emerald-50 via-white to-teal-50 py-24 px-6 text-center">
                <div className="max-w-4xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-bold mb-6">
                        <Bot className="w-4 h-4" /> Smart Resolution
                    </div>
                    <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-6">
                        Fix Issues Before <span className="text-emerald-700">Humans Even Wake Up</span>
                    </h1>
                    <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
                        Our AI checks your historical ticket database. If it's seen this issue before — and knows the fix — it resolves it automatically, 24/7.
                    </p>
                    <div className="mt-10 flex items-center justify-center gap-2 text-sm font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full px-5 py-2.5 w-fit mx-auto">
                        <Zap className="w-4 h-4" /> Average resolution in under 30 seconds for known issues
                    </div>
                </div>
            </section>

            <section className="py-20 px-6 max-w-5xl mx-auto">
                <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">How Smart Resolution Works</h2>
                <div className="relative">
                    <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-100 hidden md:block" />
                    <div className="space-y-8">
                        {flowSteps.map(({ icon: Icon, title, desc, color }, i) => (
                            <div key={i} className="flex gap-6 items-start">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 relative z-10 ${color}`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                <div className="flex-1 pt-2">
                                    <h3 className="font-bold text-gray-900 text-lg mb-1">{i + 1}. {title}</h3>
                                    <p className="text-gray-500">{desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-emerald-950 py-24 px-6">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl font-bold text-white text-center mb-3">What Can Be Auto-Resolved?</h2>
                    <p className="text-emerald-300/70 text-center mb-12">These are the most common request types our AI handles end-to-end.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {autoResolvable.map((item, i) => (
                            <div key={i} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-4">
                                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                                <span className="text-white font-medium">{item}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-24 px-6 text-center bg-white">
                <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Your team, at full capacity.</h2>
                <p className="text-gray-500 mb-8">Let the AI handle Tier-1. Your team focuses on what matters.</p>
                <button onClick={() => navigate('/admin-signup')} className="inline-flex items-center gap-2 bg-emerald-900 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-emerald-800 transition-all shadow-xl shadow-emerald-900/20">
                    Get Started Free <ArrowRight className="w-5 h-5" />
                </button>
            </section>
        </div>
    );
}
