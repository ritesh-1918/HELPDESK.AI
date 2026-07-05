import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Folder, Network, Cpu, HardDrive, Wifi, Lock, CheckCircle, Zap, Bot } from 'lucide-react';

const categories = [
    { icon: Wifi, name: 'Network', color: 'bg-blue-100 text-blue-600', desc: 'VPN, internet, DNS, routing issues' },
    { icon: HardDrive, name: 'Hardware', color: 'bg-orange-100 text-orange-600', desc: 'Printers, monitors, peripherals' },
    { icon: Cpu, name: 'Software', color: 'bg-purple-100 text-purple-600', desc: 'Crashes, installs, license errors' },
    { icon: Lock, name: 'Access', color: 'bg-emerald-100 text-emerald-600', desc: 'Passwords, SSO, permissions' },
];

const examples = [
    { input: '"My laptop won\'t connect to the office WiFi after the Windows update"', output: { category: 'Network', subcategory: 'WiFi Connectivity', confidence: '97%', team: 'NetOps Team' } },
    { input: '"I can\'t log in to Jira with my SSO credentials since yesterday"', output: { category: 'Access', subcategory: 'SSO / Identity', confidence: '95%', team: 'IAM Team' } },
    { input: '"The projector in Conference Room B keeps disconnecting mid-call"', output: { category: 'Hardware', subcategory: 'AV Equipment', confidence: '92%', team: 'Hardware Support' } },
];

export default function AutoCategorizationFeature() {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen bg-white font-sans">
            {/* Nav */}
            <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                <button onClick={() => navigate('/')} className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-emerald-700 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Home
                </button>
                <span className="font-black text-emerald-900 italic uppercase text-lg">HelpDesk.ai</span>
                <button onClick={() => navigate('/admin-signup')} className="bg-emerald-900 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-800 transition-all">
                    Get Started Free
                </button>
            </nav>

            {/* Hero */}
            <section className="bg-gradient-to-br from-blue-50 via-white to-emerald-50 py-24 px-6 text-center">
                <div className="max-w-4xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-bold mb-6">
                        <Folder className="w-4 h-4" /> Auto-Categorization
                    </div>
                    <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-6">
                        Zero-Touch <span className="text-emerald-700">Ticket Sorting</span>
                    </h1>
                    <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
                        Our AI reads the intent of every ticket and tags it with the right category, subcategory, and team — in under 200ms.
                    </p>
                </div>
            </section>

            {/* Categories Grid */}
            <section className="py-20 px-6 max-w-6xl mx-auto">
                <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Four Core Categories</h2>
                <p className="text-center text-gray-500 mb-12">Every ticket is mapped to one of these intelligent domains.</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {categories.map(({ icon: Icon, name, color, desc }) => (
                        <div key={name} className="p-6 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-lg hover:-translate-y-1 transition-all text-center">
                            <div className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-4 ${color}`}>
                                <Icon className="w-7 h-7" />
                            </div>
                            <h3 className="font-bold text-gray-900 text-lg mb-1">{name}</h3>
                            <p className="text-xs text-gray-500">{desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Live Examples */}
            <section className="bg-gray-950 py-24 px-6">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl font-bold text-white text-center mb-3">See It in Action</h2>
                    <p className="text-gray-400 text-center mb-12">Real user messages → instant AI categorization.</p>
                    <div className="space-y-6">
                        {examples.map((ex, i) => (
                            <div key={i} className="rounded-2xl bg-gray-900 border border-gray-800 overflow-hidden">
                                <div className="p-5 border-b border-gray-800">
                                    <p className="text-xs text-gray-500 mb-2 uppercase tracking-widest font-bold">User Input</p>
                                    <p className="text-white font-medium italic">{ex.input}</p>
                                </div>
                                <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-4 bg-emerald-950/30">
                                    {Object.entries(ex.output).map(([key, val]) => (
                                        <div key={key}>
                                            <p className="text-[10px] text-emerald-500 uppercase tracking-widest font-bold mb-1">{key}</p>
                                            <p className="text-white font-bold text-sm">{val}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 px-6 text-center bg-white">
                <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Ready to automate?</h2>
                <p className="text-gray-500 mb-8">Start routing tickets smarter today.</p>
                <button onClick={() => navigate('/admin-signup')} className="inline-flex items-center gap-2 bg-emerald-900 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-emerald-800 transition-all shadow-xl shadow-emerald-900/20">
                    Get Started Free <ArrowRight className="w-5 h-5" />
                </button>
            </section>
        </div>
    );
}
