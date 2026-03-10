import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Menu, X, Check, Activity,
    MapPin, AlertCircle, Folder, Zap, Bot, ArrowRight,
    Clock, CheckCircle,
    Star, Twitter, Linkedin, Github, Globe,
    Mail, Search, Bell, Play, ChevronRight,
    Shield, Lock, Network, HardDrive, Cpu, Copy,
    Users, BarChart3, Inbox, Building2, BrainCircuit
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import TeamSection from '../components/landing/TeamSection';

// ---- Count-up animation component ----
function AnimatedStat({ target, suffix = '', prefix = '', label, isWord = false }) {
    const [display, setDisplay] = useState(isWord ? target : '0');
    const [triggered, setTriggered] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting && !triggered) setTriggered(true); },
            { threshold: 0.5 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [triggered]);

    useEffect(() => {
        if (!triggered || isWord) return;
        const duration = 1500;
        const start = performance.now();
        const to = parseFloat(target);
        const step = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round((to) * eased);
            setDisplay(String(current));
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [triggered, target, isWord]);

    return (
        <div ref={ref} className="p-4">
            <div className="text-4xl font-extrabold mb-1 text-white tabular-nums">
                {prefix}{display}{suffix}
            </div>
            <div className="text-sm text-white font-medium tracking-wide opacity-75">{label}</div>
        </div>
    );
}

// ---- Demo Modal ----
function DemoModal({ onClose }) {
    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
            <div
                className="relative bg-gray-950 rounded-3xl border border-white/10 shadow-2xl w-full max-w-4xl overflow-hidden z-10 animate-in fade-in zoom-in duration-300"
                onClick={e => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white bg-white/10 rounded-full p-2 transition-colors z-20"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Video Container */}
                <div className="aspect-video w-full bg-black flex items-center justify-center relative">
                    <iframe
                        className="w-full h-full"
                        src="https://www.youtube.com/embed/YOUR_VIDEO_ID_HERE?autoplay=1&rel=0"
                        title="HelpDesk.ai Platform Demo"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                    ></iframe>
                </div>

                <div className="p-6 bg-gray-900 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-extrabold text-white">Full Platform Walkthrough</h2>
                        <p className="text-gray-400 text-sm">See how AI transforms your IT operations.</p>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <button
                            onClick={() => { onClose(); window.location.href = '/admin-signup'; }}
                            className="flex-1 md:px-6 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                        >
                            Start Free <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}


export default function LandingPage() {
    const navigate = useNavigate();
    const { user, profile, loading } = useAuthStore();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showDemo, setShowDemo] = useState(false);
    const [billingAnnual, setBillingAnnual] = useState(false);

    useEffect(() => {
        if (!loading && user && profile) {
            if (profile.role === 'master_admin') navigate('/master-admin/dashboard');
            else if (profile.role === 'admin') navigate('/admin/dashboard');
            else navigate('/dashboard');
        }
    }, [user, profile, loading, navigate]);

    const pricingPlans = [
        {
            name: 'Starter',
            price: 0,
            period: '/mo',
            desc: 'Perfect for small teams exploring AI helpdesk.',
            cta: 'Get Started Free',
            ctaStyle: 'border border-gray-200 text-gray-700 hover:border-emerald-900 hover:text-emerald-800',
            features: ['Up to 50 tickets/mo', 'Basic AI Categorization', 'Email Support', '1 Team Member', 'Public API Access'],
            popular: false,
        },
        {
            name: 'Growth',
            price: billingAnnual ? 3199 : 3999,
            period: '/mo',
            desc: 'For growing IT teams needing full automation.',
            cta: 'Start Free Trial',
            ctaStyle: 'bg-emerald-900 text-white hover:bg-emerald-800 shadow-lg shadow-emerald-900/20',
            features: ['Up to 500 tickets/mo', 'Advanced AI Parsing', 'Priority Detection Engine', 'Duplicate Detection', '5 Team Members', 'Priority Email Support'],
            popular: true,
        },
        {
            name: 'Enterprise',
            priceLabel: 'Custom',
            period: '',
            desc: 'For large organizations with complex IT landscapes.',
            cta: 'Contact Sales',
            ctaStyle: 'border border-gray-200 text-gray-700 hover:border-emerald-900 hover:text-emerald-800',
            features: ['Unlimited tickets', 'Custom AI Fine-Tuning', 'SSO & Audit Logs', 'Dedicated SLA Manager', 'Unlimited Members', 'VAPT & Compliance Reports'],
            popular: false,
        },
    ];

    return (
        <div className="min-h-screen bg-white font-sans text-slate-800">
            {showDemo && <DemoModal onClose={() => setShowDemo(false)} />}

            {/* ==================== NAV ==================== */}
            <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                            <img src="/favicon.png" alt="H" className="w-8 h-8 object-contain" />
                            <span className="font-black text-2xl tracking-tighter text-emerald-900 italic uppercase">HelpDesk.ai</span>
                        </div>

                        {/* Desktop Links */}
                        <div className="hidden md:flex items-center gap-8">
                            <a href="#features" className="text-sm font-semibold text-gray-600 hover:text-emerald-800 transition-colors">Features</a>
                            <a href="#how-it-works" className="text-sm font-semibold text-gray-600 hover:text-emerald-800 transition-colors">How It Works</a>
                            <a href="#pricing" className="text-sm font-semibold text-gray-600 hover:text-emerald-800 transition-colors">Pricing</a>
                        </div>

                        {/* CTA Buttons */}
                        <div className="hidden md:flex items-center gap-3">
                            <button
                                onClick={() => navigate('/login')}
                                className="text-sm font-semibold text-gray-700 hover:text-emerald-800 transition-colors px-4 py-2 rounded-lg hover:bg-gray-50"
                            >
                                Sign In
                            </button>
                            <button
                                onClick={() => setShowDemo(true)}
                                className="text-sm font-semibold text-emerald-800 border border-emerald-200 px-4 py-2 rounded-lg hover:bg-emerald-50 transition-all flex items-center gap-1.5"
                            >
                                <Play className="w-3.5 h-3.5 fill-emerald-700" /> Watch Demo
                            </button>
                            <button
                                onClick={() => navigate('/admin-signup')}
                                className="bg-emerald-900 hover:bg-emerald-800 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-lg shadow-emerald-900/20"
                            >
                                Get Started Free
                            </button>
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="md:hidden">
                            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-600 hover:text-emerald-800 p-2">
                                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden bg-white border-t border-gray-100 absolute w-full shadow-xl z-50">
                        <div className="px-5 pt-3 pb-6 space-y-4">
                            <a href="#features" onClick={() => setIsMenuOpen(false)} className="block text-base font-semibold text-gray-700 hover:text-emerald-800 py-2">Features</a>
                            <a href="#how-it-works" onClick={() => setIsMenuOpen(false)} className="block text-base font-semibold text-gray-700 hover:text-emerald-800 py-2">How It Works</a>
                            <a href="#pricing" onClick={() => setIsMenuOpen(false)} className="block text-base font-semibold text-gray-700 hover:text-emerald-800 py-2">Pricing</a>
                            <div className="pt-4 flex flex-col gap-3 border-t border-gray-100">
                                <button onClick={() => { setIsMenuOpen(false); setShowDemo(true); }} className="w-full text-center py-2.5 text-emerald-800 font-semibold border border-emerald-200 rounded-lg flex items-center justify-center gap-2">
                                    <Play className="w-4 h-4 fill-emerald-700" /> Watch Demo
                                </button>
                                <button onClick={() => navigate('/login')} className="w-full text-center py-2.5 text-gray-700 font-semibold border border-gray-100 rounded-lg">
                                    Sign In
                                </button>
                                <button onClick={() => navigate('/admin-signup')} className="w-full bg-emerald-900 text-white py-3 rounded-lg font-semibold shadow">
                                    Get Started Free
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </nav>

            {/* ==================== HERO ==================== */}
            <section className="relative pt-20 pb-32 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-green-50/80 to-transparent pointer-events-none -z-10" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-8">
                        <Activity className="w-3 h-3" />
                        <span>AI-Powered Helpdesk Automation · Made in India 🇮🇳</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-6 leading-[1.1]">
                        Your IT Helpdesk,<br />
                        <span className="text-emerald-700">Fully Automated.</span>
                    </h1>

                    <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-500 mb-10 leading-relaxed">
                        Turn messy user complaints into structured, categorized, and prioritized support tickets — instantly. No manual triage. No missed urgencies.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
                        <button
                            onClick={() => navigate('/admin-signup')}
                            className="w-full sm:w-auto px-8 py-4 bg-emerald-900 text-white rounded-xl font-bold shadow-xl shadow-emerald-900/25 hover:bg-emerald-800 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-base"
                        >
                            Get Started Free <ArrowRight className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setShowDemo(true)}
                            className="w-full sm:w-auto px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-xl font-semibold hover:border-emerald-500 hover:text-emerald-700 transition-all flex items-center justify-center gap-2 text-base"
                        >
                            <Play className="w-4 h-4 fill-gray-500" /> Watch a Demo
                        </button>
                    </div>

                    <p className="text-xs text-gray-400 mb-16">
                        Free forever · No credit card needed · Used by IT teams across India
                    </p>

                    {/* BENTO VISUAL */}
                    <div className="relative max-w-6xl mx-auto">
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-100 via-teal-50 to-emerald-50 blur-3xl opacity-60 -z-10 rounded-full" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
                            {/* LEFT: Email */}
                            <div className="relative group perspective-1000">
                                <div className="absolute -inset-1 bg-gradient-to-r from-gray-200 to-gray-100 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000" />
                                <div className="relative bg-white rounded-2xl shadow-xl border border-gray-200/60 overflow-hidden transform transition-transform group-hover:scale-[1.01]">
                                    <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                                        <div className="flex gap-1.5">
                                            <div className="w-3 h-3 rounded-full bg-red-400" />
                                            <div className="w-3 h-3 rounded-full bg-yellow-400" />
                                            <div className="w-3 h-3 rounded-full bg-green-400" />
                                        </div>
                                        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                            <Mail className="w-3 h-3" /> Incoming Request
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-sm">SC</div>
                                                <div>
                                                    <div className="font-semibold text-gray-900 text-sm">Sarah Connors</div>
                                                    <div className="text-xs text-gray-500">sarah@university.edu</div>
                                                </div>
                                            </div>
                                            <div className="text-xs text-gray-400">2 mins ago</div>
                                        </div>
                                        <div className="mb-4">
                                            <h3 className="text-sm font-bold text-gray-800 mb-1">Subject: Wifi down again in Lab 3??</h3>
                                            <p className="text-sm text-gray-600 leading-relaxed">
                                                Hey support, the wifi in <span className="bg-yellow-100 px-1 rounded">downstairs lab 3</span> is acting up again.
                                                Can't connect at all. Class starts in 20 mins, need this fixed ASAP!<br /><br />
                                                Thanks,<br />Sarah
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="hidden md:flex absolute -right-8 top-1/2 -translate-y-1/2 z-20 text-emerald-300">
                                    <ArrowRight className="w-8 h-8 animate-pulse" />
                                </div>
                            </div>

                            {/* RIGHT: Processed Ticket */}
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000" />
                                <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden transform transition-all group-hover:-translate-y-1">
                                    <div className="bg-white border-b border-gray-100 px-5 py-3 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-xs font-bold text-gray-500">#T-4029</span>
                                            <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-green-200 uppercase tracking-wide">AI Processed</span>
                                        </div>
                                        <div className="flex gap-2 text-gray-400">
                                            <Search className="w-4 h-4" />
                                            <Bell className="w-4 h-4" />
                                            <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-[10px]">AI</div>
                                        </div>
                                    </div>
                                    <div className="p-6 space-y-5">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-bold text-gray-800 text-lg mb-1">WiFi Connectivity Issue</h3>
                                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                                    <Clock className="w-3 h-3" /> Created 1m ago
                                                    <span>•</span> via Email
                                                </div>
                                            </div>
                                            <button className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors shadow-sm shadow-emerald-200">
                                                Resolve
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                                <div className="text-[10px] uppercase font-bold text-gray-400 mb-1 flex items-center gap-1">
                                                    <AlertCircle className="w-3 h-3" /> Priority
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                                    <span className="text-sm font-bold text-gray-800">High</span>
                                                </div>
                                            </div>
                                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                                <div className="text-[10px] uppercase font-bold text-gray-400 mb-1 flex items-center gap-1">
                                                    <Folder className="w-3 h-3" /> Category
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <span className="text-sm font-bold text-gray-800">Network</span>
                                                </div>
                                            </div>
                                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 col-span-2">
                                                <div className="text-[10px] uppercase font-bold text-gray-400 mb-1 flex items-center gap-1">
                                                    <MapPin className="w-3 h-3" /> Location
                                                </div>
                                                <div className="text-sm font-bold text-gray-800">Lab 3 (Downstairs)</div>
                                            </div>
                                        </div>
                                        <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
                                            <div className="text-xs text-gray-500 flex items-center gap-1">
                                                Assigned to <span className="font-bold text-gray-700">NetOps Team</span>
                                            </div>
                                            <div className="flex -space-x-1">
                                                <div className="w-6 h-6 rounded-full bg-blue-100 border-2 border-white" />
                                                <div className="w-6 h-6 rounded-full bg-green-100 border-2 border-white flex items-center justify-center text-[8px] font-bold text-green-700">+3</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ==================== STATS BAR ==================== */}
            <section className="bg-emerald-900 py-12 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center divide-y-2 sm:divide-y-0 sm:divide-x divide-white/10">
                        <AnimatedStat prefix="+" target="80" suffix="%" label="Faster Ticket Triage" />
                        <AnimatedStat target="99" suffix="%" label="Classification Accuracy" />
                        <AnimatedStat target="Zero" label="Manual Routing Needed" isWord={true} />
                        <AnimatedStat target="24" suffix="/7" label="AI Auto-Resolution" />
                    </div>
                </div>
            </section>

            {/* ==================== FEATURES GRID ==================== */}
            <section className="py-24 bg-white" id="features">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <span className="text-xs font-bold tracking-widest text-emerald-700 uppercase mb-3 block">Core Intelligence</span>
                        <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight">Work Smarter, Not Harder</h2>
                        <p className="text-gray-500 mt-4 text-lg max-w-xl mx-auto">Three AI capabilities that eliminate manual helpdesk work.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Card 1: Auto-Categorization */}
                        <div className="group rounded-3xl bg-gray-50 border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 hover:-translate-y-1">
                            <div className="h-52 bg-gradient-to-br from-blue-50 to-gray-50 p-6 flex items-center justify-center relative overflow-hidden">
                                <div className="relative z-10 flex flex-col gap-3 items-center">
                                    <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 text-xs font-bold text-gray-400 flex items-center gap-2 transform -translate-x-4 opacity-60">
                                        <div className="w-2 h-2 rounded-full bg-gray-300" /> Ticket #1024
                                    </div>
                                    <div className="bg-white px-5 py-3 rounded-xl shadow-lg border border-blue-100 flex items-center gap-3 transform scale-110">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                            <Folder className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <div>
                                            <div className="h-2 w-16 bg-gray-200 rounded mb-1.5" />
                                            <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-100">Network</span>
                                        </div>
                                    </div>
                                    <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 text-xs font-bold text-gray-400 flex items-center gap-2 transform translate-x-6 opacity-60">
                                        <div className="w-2 h-2 rounded-full bg-gray-300" /> Ticket #1025
                                    </div>
                                </div>
                            </div>
                            <div className="p-8">
                                <h3 className="text-xl font-bold text-gray-900 mb-3">Auto-Categorization</h3>
                                <p className="text-gray-500 leading-relaxed mb-6">
                                    Instantly detects if an issue is Network, Hardware, Software, or Access-related — no manual tagging.
                                </p>
                                <button
                                    onClick={() => navigate('/features/categorization')}
                                    className="inline-flex items-center text-sm font-semibold text-emerald-900 hover:text-emerald-700 gap-1 group-hover:gap-2 transition-all"
                                >
                                    Explore <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Card 2: Priority Detection */}
                        <div className="group rounded-3xl bg-gray-50 border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 hover:-translate-y-1">
                            <div className="h-52 bg-gradient-to-br from-red-50 to-orange-50 p-6 flex items-center justify-center relative overflow-hidden">
                                <div className="relative z-10 w-full max-w-[200px] space-y-2.5">
                                    <div className="bg-white p-2.5 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between opacity-50 scale-95">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-green-400" />
                                            <div className="h-1.5 w-12 bg-gray-200 rounded" />
                                        </div>
                                        <span className="text-[10px] font-bold text-gray-400">Low</span>
                                    </div>
                                    <div className="bg-white p-3 rounded-xl border border-red-100 shadow-md flex items-center justify-between ring-2 ring-red-50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                            <div className="h-2 w-20 bg-gray-800 rounded" />
                                        </div>
                                        <span className="text-[10px] bg-red-50 text-red-600 font-bold px-1.5 py-0.5 rounded border border-red-100">CRITICAL</span>
                                    </div>
                                    <div className="bg-white p-2.5 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between opacity-50 scale-95">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-yellow-400" />
                                            <div className="h-1.5 w-16 bg-gray-200 rounded" />
                                        </div>
                                        <span className="text-[10px] font-bold text-gray-400">Medium</span>
                                    </div>
                                </div>
                            </div>
                            <div className="p-8">
                                <h3 className="text-xl font-bold text-gray-900 mb-3">Priority Detection</h3>
                                <p className="text-gray-500 leading-relaxed mb-6">
                                    Understands urgency signals in text and automatically flags issues from Low to Critical.
                                </p>
                                <button
                                    onClick={() => navigate('/features/priority')}
                                    className="inline-flex items-center text-sm font-semibold text-emerald-900 hover:text-emerald-700 gap-1 group-hover:gap-2 transition-all"
                                >
                                    Explore <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Card 3: Smart Resolution */}
                        <div className="group rounded-3xl bg-gray-50 border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 hover:-translate-y-1">
                            <div className="h-52 bg-gradient-to-br from-emerald-50 to-teal-50 p-6 flex items-center justify-center relative overflow-hidden">
                                <div className="relative z-10 w-full max-w-[200px] flex flex-col gap-3">
                                    <div className="self-end bg-emerald-600 text-white p-2.5 rounded-2xl rounded-tr-none shadow-sm text-[10px] max-w-[80%]">
                                        Reset password for user@company.com?
                                    </div>
                                    <div className="self-start flex items-end gap-2">
                                        <div className="w-6 h-6 rounded-full bg-emerald-100 border border-white shadow-sm flex items-center justify-center">
                                            <Bot className="w-3 h-3 text-emerald-600" />
                                        </div>
                                        <div className="bg-white p-2.5 rounded-2xl rounded-tl-none border border-gray-200 shadow-sm text-[10px] text-gray-600">
                                            <div className="flex items-center gap-1.5 mb-1">
                                                <CheckCircle className="w-3 h-3 text-emerald-500" />
                                                <span className="font-bold text-gray-800">Done</span>
                                            </div>
                                            Reset link sent successfully.
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="p-8">
                                <h3 className="text-xl font-bold text-gray-900 mb-3">Smart Resolution</h3>
                                <p className="text-gray-500 leading-relaxed mb-6">
                                    Checks historical data to auto-fix simple issues, or routes complex ones to the right human team.
                                </p>
                                <button
                                    onClick={() => navigate('/features/resolution')}
                                    className="inline-flex items-center text-sm font-semibold text-emerald-900 hover:text-emerald-700 gap-1 group-hover:gap-2 transition-all"
                                >
                                    Explore <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ==================== HOW IT WORKS ==================== */}
            <section className="bg-emerald-900 py-24 text-white overflow-hidden" id="how-it-works">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-4">Built for Speed & Intelligence</h2>
                        <p className="text-white/70 text-lg max-w-2xl mx-auto">From messy complaint to resolved ticket in seconds.</p>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-12">
                            {[
                                { num: '1', title: 'User Reports an Issue', desc: 'User writes: "WiFi not working in lab 3". Can include screenshots or files.' },
                                { num: '2', title: 'AI Analyzes Instantly', items: ['Detects Category (Network)', 'Sets Priority (High)', 'Extracts Details (Location: Lab 3)'] },
                                { num: '3', title: 'Smart Resolution', desc: 'Simple issues are fixed by the AI chatbot. Complex ones are routed to the right team with full context.' },
                            ].map(({ num, title, desc, items }) => (
                                <div key={num} className="relative pl-8 border-l-2 border-white/20">
                                    <span className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-emerald-900" />
                                    <h3 className="text-xl font-bold text-white mb-2">{num}. {title}</h3>
                                    {desc && <p className="text-white/70">{desc}</p>}
                                    {items && (
                                        <ul className="space-y-2 mt-2 text-white/70">
                                            {items.map(item => (
                                                <li key={item} className="flex items-center gap-2">
                                                    <CheckCircle className="w-4 h-4 text-emerald-400" /> {item}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="bg-white/10 rounded-2xl p-8 border border-white/20 backdrop-blur-sm relative">
                            <div className="absolute top-4 right-4 bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded">LIVE DEMO</div>
                            <div className="font-mono text-sm text-emerald-100/80 space-y-4">
                                <div>
                                    <span className="text-purple-300">const</span> <span className="text-blue-300">input</span> = <span className="text-yellow-300">"wifi broken in lab 3"</span>;
                                </div>
                                <div>
                                    <span className="text-purple-300">const</span> <span className="text-blue-300">analysis</span> = <span className="text-yellow-300">await</span> AI.analyze(input);
                                </div>
                                <div className="pl-4 border-l border-white/10">
                                    <span className="text-gray-400">// Output</span><br />
                                    {`{`}
                                    <div className="pl-4">
                                        category: <span className="text-green-300">"Network"</span>,<br />
                                        priority: <span className="text-red-300">"High"</span>,<br />
                                        location: <span className="text-blue-300">"Lab 3"</span>,<br />
                                        action: <span className="text-orange-300">"Route to NetOps"</span>
                                    </div>
                                    {`}`}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ==================== PRICING ==================== */}
            <section className="py-24 bg-gray-50" id="pricing">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
                        <p className="text-gray-500 mb-8">All plans in Indian Rupees (₹) · No hidden fees · GST applicable</p>

                        {/* Billing Toggle */}
                        <div className="inline-flex items-center gap-3 bg-white border border-gray-200 rounded-full px-2 py-2 shadow-sm">
                            <button
                                onClick={() => setBillingAnnual(false)}
                                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${!billingAnnual ? 'bg-emerald-900 text-white shadow' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Monthly
                            </button>
                            <button
                                onClick={() => setBillingAnnual(true)}
                                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${billingAnnual ? 'bg-emerald-900 text-white shadow' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Annual <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">Save 20%</span>
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {pricingPlans.map(({ name, price, priceLabel, period, desc, cta, ctaStyle, features, popular }) => (
                            <div
                                key={name}
                                className={`p-8 rounded-2xl bg-white transition-all relative ${popular ? 'border-2 border-emerald-900 shadow-2xl shadow-emerald-900/10 scale-[1.02]' : 'border border-gray-200 hover:border-gray-300'}`}
                            >
                                {popular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-900 text-white px-4 py-1.5 rounded-full text-xs font-bold tracking-wide whitespace-nowrap shadow-lg">
                                        ⭐ MOST POPULAR
                                    </div>
                                )}
                                <h3 className="text-lg font-bold text-gray-900 mb-2">{name}</h3>
                                <div className="text-4xl font-extrabold text-gray-900 mb-2">
                                    {priceLabel ? priceLabel : <>₹{price.toLocaleString('en-IN')}<span className="text-base font-normal text-gray-500">{period}</span></>}
                                </div>
                                <p className="text-sm text-gray-500 mb-6">{desc}</p>
                                <button
                                    onClick={() => navigate(name === 'Enterprise' ? '/admin-signup' : '/admin-signup')}
                                    className={`w-full py-3 rounded-xl font-semibold transition-all mb-8 text-sm ${ctaStyle}`}
                                >
                                    {cta}
                                </button>
                                <ul className="space-y-3">
                                    {features.map(feat => (
                                        <li key={feat} className="flex items-start gap-3 text-sm text-gray-600">
                                            <CheckCircle className="w-5 h-5 text-emerald-700 shrink-0 mt-px" />
                                            {feat}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    {/* Trust Badges */}
                    <div className="flex flex-wrap items-center justify-center gap-4 mt-12">
                        {['🔒 256-bit Encryption', '🇮🇳 DPDP Act Compliant', '⚡ 99.9% Uptime SLA', '✅ No Credit Card Required'].map(badge => (
                            <div key={badge} className="text-xs font-semibold text-gray-500 bg-white border border-gray-100 px-4 py-2 rounded-full shadow-sm">{badge}</div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ==================== TEAM SECTION ==================== */}
            <TeamSection />

            {/* ==================== FOOTER ==================== */}
            <footer className="bg-emerald-950 text-white">
                {/* CTA Block */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 text-center border-b border-white/10">
                    <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 max-w-3xl mx-auto leading-tight">
                        The Smartest IT Helpdesk for Indian Businesses
                    </h2>
                    <p className="text-white/70 text-lg mb-10 max-w-xl mx-auto">
                        Start automating ticket triage today. No credit card required.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                            onClick={() => navigate('/admin-signup')}
                            className="w-full sm:w-auto px-8 py-4 bg-white text-emerald-900 font-bold rounded-xl hover:bg-green-50 transition-all shadow-xl"
                        >
                            Get Started Free
                        </button>
                        <button
                            onClick={() => setShowDemo(true)}
                            className="w-full sm:w-auto px-8 py-4 border border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                        >
                            <Play className="w-4 h-4 fill-white" /> Watch Demo
                        </button>
                    </div>
                    <div className="mt-8">
                        <button
                            onClick={() => navigate('/login')}
                            className="text-white/50 hover:text-white text-sm font-medium transition-colors"
                        >
                            Already have an account? <span className="underline underline-offset-4 decoration-white/20">Sign in</span>
                        </button>
                    </div>
                </div>

                {/* Footer Links */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
                        {/* Brand Column */}
                        <div className="col-span-2 md:col-span-1">
                            <div className="flex items-center gap-2 mb-4">
                                <img src="/favicon.png" alt="H" className="w-8 h-8 object-contain" />
                                <span className="font-black text-lg text-white italic uppercase">HelpDesk.ai</span>
                            </div>
                            <p className="text-white/50 text-sm leading-relaxed mb-4">
                                AI-powered IT helpdesk automation for modern Indian enterprises.
                            </p>
                            <p className="text-xs text-white/30 mb-5">Made with ❤️ in India 🇮🇳</p>
                            <div className="flex gap-3">
                                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors">
                                    <Twitter className="w-4 h-4" />
                                </a>
                                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors">
                                    <Linkedin className="w-4 h-4" />
                                </a>
                                <a href="https://github.com/ritesh-1918/HELPDESK.AI" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors">
                                    <Github className="w-4 h-4" />
                                </a>
                            </div>
                        </div>

                        {[
                            {
                                heading: 'Product',
                                links: [
                                    { label: 'Auto-Categorization', href: '/features/categorization' },
                                    { label: 'Priority Detection', href: '/features/priority' },
                                    { label: 'Smart Resolution', href: '/features/resolution' },
                                    { label: 'Analytics Dashboard', href: '/admin-signup' },
                                ]
                            },
                            {
                                heading: 'Resources',
                                links: [
                                    { label: 'Documentation', href: '#' },
                                    { label: 'API Reference', href: '#' },
                                    { label: 'Changelog', href: '#' },
                                    { label: 'Status Page', href: '#' },
                                ]
                            },
                            {
                                heading: 'Company',
                                links: [
                                    { label: 'About Us', href: '#' },
                                    { label: 'Careers', href: '#' },
                                    { label: 'Privacy Policy', href: '/privacy' },
                                    { label: 'Terms of Service', href: '/terms' },
                                ]
                            },
                            {
                                heading: 'Legal & Security',
                                links: [
                                    { label: 'Security Overview', href: '/security' },
                                    { label: 'Privacy Policy', href: '/privacy' },
                                    { label: 'Terms of Service', href: '/terms' },
                                    { label: 'Cookie Policy', href: '#' },
                                ]
                            },
                        ].map(({ heading, links }) => (
                            <div key={heading}>
                                <h4 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-5">{heading}</h4>
                                <ul className="space-y-3">
                                    {links.map(({ label, href }) => (
                                        <li key={label}>
                                            {href.startsWith('/') ? (
                                                <button
                                                    onClick={() => navigate(href)}
                                                    className="text-sm text-white/65 hover:text-white transition-colors text-left"
                                                >
                                                    {label}
                                                </button>
                                            ) : (
                                                <a href={href} className="text-sm text-white/65 hover:text-white transition-colors">{label}</a>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    {/* Bottom bar */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-16 pt-8 border-t border-white/10">
                        <p className="text-xs text-white/40">
                            © 2026 HelpDesk.ai. All rights reserved. · Registered in India
                        </p>
                        <div className="flex items-center gap-4">
                            <button onClick={() => navigate('/terms')} className="text-xs text-white/40 hover:text-white transition-colors">Terms</button>
                            <button onClick={() => navigate('/privacy')} className="text-xs text-white/40 hover:text-white transition-colors">Privacy</button>
                            <button onClick={() => navigate('/security')} className="text-xs text-white/40 hover:text-white transition-colors">Security</button>
                            <div className="flex items-center gap-2 text-xs text-white/40 border border-white/10 rounded-lg px-3 py-1.5 cursor-pointer hover:bg-white/10 transition-colors">
                                <Globe className="w-3.5 h-3.5" />
                                <span>English (IN)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
