import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Menu, X, Check, BrainCircuit, Activity,
    MapPin, AlertCircle, Folder, Zap, Bot, ArrowRight,
    Clock, ListOrdered, DollarSign, CheckCircle,
    Star, Twitter, Linkedin, Github, Globe,
    Mail, MessageSquare, User, MoreHorizontal, Search, Bell
} from 'lucide-react';

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
        const from = 0;
        const to = parseFloat(target);
        const step = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // easeOut cubic
            const current = Math.round(from + (to - from) * eased);
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

import useAuthStore from '../store/authStore';
import TeamSection from '../components/landing/TeamSection';

export default function LandingPage() {
    const navigate = useNavigate();
    const { user, profile, loading } = useAuthStore();

    useEffect(() => {
        if (!loading && user && profile) {
            if (profile.role === 'master_admin') {
                navigate('/master-admin/dashboard');
            } else if (profile.role === 'admin') {
                navigate('/admin/dashboard');
            } else {
                navigate('/dashboard');
            }
        }
    }, [user, profile, loading, navigate]);

    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-white font-sans text-slate-800">
            {/* ----------------- NAV ----------------- */}
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                            <div className="bg-emerald-900 p-1.5 rounded-lg">
                                <BrainCircuit className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-bold text-xl tracking-tight text-emerald-900">HelpDesk.ai</span>
                        </div>

                        {/* Desktop Menu */}
                        <div className="hidden md:flex items-center gap-8">
                            <a href="#features" className="text-sm font-medium text-gray-600 hover:text-emerald-800 transition-colors">Software</a>
                            <a href="#pricing" className="text-sm font-medium text-gray-600 hover:text-emerald-800 transition-colors">Pricing</a>
                            <a href="/admin-signup" className="text-sm font-medium text-emerald-700 hover:text-emerald-800 transition-colors flex items-center gap-1">
                                Register Company <ArrowRight className="w-3 h-3" />
                            </a>
                        </div>

                        {/* CTA Buttons */}
                        <div className="hidden md:flex items-center gap-4">
                            <button
                                onClick={() => navigate('/login')}
                                className="text-sm font-medium text-emerald-900 hover:text-emerald-700 transition-colors"
                            >
                                Log In
                            </button>
                            <button
                                onClick={() => navigate('/admin-signup')}
                                className="bg-emerald-900 hover:bg-emerald-800 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-all shadow-lg shadow-emerald-900/20 hover:shadow-emerald-900/30"
                            >
                                Register Company
                            </button>
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="md:hidden flex items-center">
                            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-600 hover:text-emerald-800">
                                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu Dropdown */}
                {isMenuOpen && (
                    <div className="md:hidden bg-white border-t border-gray-100 absolute w-full shadow-xl">
                        <div className="px-4 pt-2 pb-6 space-y-4">
                            <a href="#" className="block text-base font-medium text-gray-700 hover:text-emerald-800">Software</a>
                            <a href="#" className="block text-base font-medium text-gray-700 hover:text-emerald-800">Pricing</a>
                            <a href="#" className="block text-base font-medium text-gray-700 hover:text-emerald-800">Resources</a>
                            <div className="pt-4 flex flex-col gap-3">
                                <button
                                    onClick={() => navigate('/login')}
                                    className="w-full text-center py-2 text-emerald-900 font-semibold border border-gray-100 rounded-lg"
                                >
                                    Log In
                                </button>
                                <button
                                    onClick={() => navigate('/admin-signup')}
                                    className="w-full bg-emerald-900 text-white py-3 rounded-lg font-semibold shadow-lg shadow-emerald-900/20"
                                >
                                    Register Company
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </nav>

            {/* ----------------- HERO ----------------- */}
            <section className="relative pt-20 pb-32 overflow-hidden">
                {/* Background Gradients */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-green-50 to-transparent pointer-events-none -z-10" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 border border-green-100 text-green-700 text-xs font-semibold uppercase tracking-wider mb-8">
                        <Activity className="w-3 h-3" />
                        <span>AI-Powered Automation V2.0</span>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-6 leading-[1.15]">
                        Automate Your <span className="text-emerald-900">IT Helpdesk</span> <br className="hidden md:block" /> with Artificial Intelligence
                    </h1>

                    <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-500 mb-10 leading-relaxed">
                        Turn messy user complaints into clean, structured support tickets instantly.
                        Our AI detects categories, extracts details, and routes issues so your human team doesn't have to.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
                        <button
                            onClick={() => navigate('/admin-signup')}
                            className="w-full sm:w-auto px-8 py-3.5 bg-emerald-900 text-white rounded-xl font-semibold shadow-xl shadow-emerald-900/25 hover:bg-emerald-800 hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                            Register your company
                        </button>
                        <button
                            onClick={() => navigate('/signup')}
                            className="w-full sm:w-auto px-8 py-3.5 bg-white text-gray-700 border border-gray-200 rounded-xl font-semibold hover:border-emerald-900 hover:text-emerald-800 transition-colors"
                        >
                            I'm an Employee
                        </button>
                    </div>

                    {/* ----------------- BENTO VISUAL ----------------- */}
                    <div className="relative max-w-6xl mx-auto mt-16">
                        {/* Glow / Backdrop */}
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-100 via-teal-50 to-emerald-50 blur-3xl opacity-60 -z-10 rounded-full" />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">

                            {/* LEFT: Realistic Email Input */}
                            <div className="relative group perspective-1000">
                                <div className="absolute -inset-1 bg-gradient-to-r from-gray-200 to-gray-100 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000"></div>
                                <div className="relative bg-white rounded-2xl shadow-xl border border-gray-200/60 overflow-hidden transform transition-transform group-hover:scale-[1.01]">
                                    {/* Fake Email Header */}
                                    <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="flex gap-1.5">
                                                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                            </div>
                                        </div>
                                        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                            <Mail className="w-3 h-3" /> Incoming Request
                                        </div>
                                    </div>

                                    {/* Email Body */}
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
                                                Can't connect to the server at all. We have a class starting in 20 mins, need this fixed ASAP!
                                                <br /><br />
                                                Thanks,<br />Sarah
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Connection Arrow (Desktop) */}
                                <div className="hidden md:flex absolute -right-8 top-1/2 -translate-y-1/2 z-20 text-emerald-300">
                                    <ArrowRight className="w-8 h-8 animate-pulse" />
                                </div>
                            </div>

                            {/* RIGHT: Detailed Processed Ticket */}
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                                <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden transform transition-all group-hover:-translate-y-1">
                                    {/* SaaS Header */}
                                    <div className="bg-white border-b border-gray-100 px-5 py-3 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-xs font-bold text-gray-500">#T-4029</span>
                                            <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-green-200 uppercase tracking-wide">AI Processed</span>
                                        </div>
                                        <div className="flex gap-2 text-gray-400">
                                            <Search className="w-4 h-4 cursor-pointer hover:text-gray-600" />
                                            <Bell className="w-4 h-4 cursor-pointer hover:text-gray-600" />
                                            <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-[10px]">AI</div>
                                        </div>
                                    </div>

                                    {/* Ticket Content */}
                                    <div className="p-6 space-y-5">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-bold text-gray-800 text-lg mb-1">WiFi Connectivity Issue</h3>
                                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                                    <Clock className="w-3 h-3" /> Created 1m ago
                                                    <span>•</span>
                                                    <span>via Email</span>
                                                </div>
                                            </div>
                                            <button className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors shadow-sm shadow-emerald-200">
                                                Resolve
                                            </button>
                                        </div>

                                        {/* Meta Grid */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                                <div className="text-[10px] uppercase font-bold text-gray-400 mb-1 flex items-center gap-1">
                                                    <AlertCircle className="w-3 h-3" /> Priority
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                                                    <span className="text-sm font-bold text-gray-800">High</span>
                                                </div>
                                            </div>
                                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                                <div className="text-[10px] uppercase font-bold text-gray-400 mb-1 flex items-center gap-1">
                                                    <BrainCircuit className="w-3 h-3" /> Category
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <span className="text-sm font-bold text-gray-800">Network</span>
                                                    <span className="text-[10px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">Hardware</span>
                                                </div>
                                            </div>
                                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 col-span-2">
                                                <div className="text-[10px] uppercase font-bold text-gray-400 mb-1 flex items-center gap-1">
                                                    <MapPin className="w-3 h-3" /> Location
                                                </div>
                                                <div className="text-sm font-bold text-gray-800">Lab 3 (Downstairs)</div>
                                            </div>
                                        </div>

                                        {/* AI Analysis Footer */}
                                        <div className="border-t border-gray-100 pt-3 mt-2">
                                            <div className="flex items-center justify-between">
                                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                                    Assigned to <span className="font-bold text-gray-700">NetOps Team</span>
                                                </div>
                                                <div className="flex -space-x-1">
                                                    <div className="w-6 h-6 rounded-full bg-blue-100 border-2 border-white"></div>
                                                    <div className="w-6 h-6 rounded-full bg-green-100 border-2 border-white flex items-center justify-center text-[8px] font-bold text-green-700">+3</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </section>

            {/* ----------------- STATS BAR ----------------- */}
            <section className="bg-emerald-900 py-12 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center divide-y sm:divide-y-0 sm:divide-x divide-white/20">
                        <AnimatedStat prefix="+" target="80" suffix="%" label="Faster Triage" />
                        <AnimatedStat target="99" suffix="%" label="Accuracy" />
                        <AnimatedStat target="Zero" label="Manual Routing" isWord={true} />
                        <AnimatedStat target="24" suffix="/7" label="Auto-resolution" />
                    </div>
                </div>
            </section>

            {/* ----------------- FEATURES GRID ----------------- */}
            <section className="py-24 bg-white" id="features">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <span className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-2 block">Smart + Fast</span>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Doing smarter, not harder</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Card 1: Auto-Categorization */}
                        <div className="group rounded-3xl bg-gray-50 border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 hover:-translate-y-1">
                            <div className="h-48 bg-gray-100/50 p-6 flex items-center justify-center relative overflow-hidden">
                                {/* Abstract Background */}
                                <div className="absolute inset-0 bg-grid-slate-200/50 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
                                {/* Floating Tags Animation */}
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
                                    Instantly detects if an issue is Network, Hardware, Software, or Access-related.
                                </p>
                                <a href="#" className="inline-flex items-center text-sm font-semibold text-emerald-900 hover:text-emerald-700 group-hover:gap-2 transition-all">
                                    Explore <ArrowRight className="w-4 h-4 ml-1" />
                                </a>
                            </div>
                        </div>

                        {/* Card 2: Priority Detection */}
                        <div className="group rounded-3xl bg-gray-50 border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 hover:-translate-y-1">
                            <div className="h-48 bg-gray-100/50 p-6 flex items-center justify-center relative overflow-hidden">
                                <div className="absolute inset-0 bg-grid-slate-200/50 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
                                {/* Priority Visual */}
                                <div className="relative z-10 w-full max-w-[200px] space-y-2.5">
                                    <div className="bg-white p-2.5 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between opacity-50 scale-95">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-green-400" />
                                            <div className="h-1.5 w-12 bg-gray-200 rounded" />
                                        </div>
                                        <span className="text-[10px] font-bold text-gray-400">Low</span>
                                    </div>
                                    <div className="bg-white p-3 rounded-xl border border-red-100 shadow-md flex items-center justify-between relative ring-2 ring-red-50">
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
                                    Understands urgency and automatically flags issues from Low to Critical.
                                </p>
                                <a href="#" className="inline-flex items-center text-sm font-semibold text-emerald-900 hover:text-emerald-700 group-hover:gap-2 transition-all">
                                    Explore <ArrowRight className="w-4 h-4 ml-1" />
                                </a>
                            </div>
                        </div>

                        {/* Card 3: Smart Resolution */}
                        <div className="group rounded-3xl bg-gray-50 border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 hover:-translate-y-1">
                            <div className="h-48 bg-gray-100/50 p-6 flex items-center justify-center relative overflow-hidden">
                                <div className="absolute inset-0 bg-grid-slate-200/50 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
                                {/* Chat/Bot Visual */}
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
                                    Checks historical data to let the chatbot fix simple issues, or routes complex ones to humans.
                                </p>
                                <a href="#" className="inline-flex items-center text-sm font-semibold text-emerald-900 hover:text-emerald-700 group-hover:gap-2 transition-all">
                                    Explore <ArrowRight className="w-4 h-4 ml-1" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ----------------- HOW IT WORKS ----------------- */}
            <section className="bg-emerald-900 py-24 text-white overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white text-center">Built for Speed & Intelligence</h2>
                        <p className="text-white/75 text-lg max-w-2xl mx-auto text-center">
                            From messy user complaints to resolved tickets in seconds.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        {/* Left: The Process */}
                        <div className="space-y-12">
                            <div className="relative pl-8 border-l-2 border-white/20">
                                <span className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-emerald-900" />
                                <h3 className="text-xl font-bold text-white mb-2">1. User Reports an Issue</h3>
                                <p className="text-white/70">
                                    User writes: <span className="italic text-white">"wifi not working in lab 3 after update"</span>.
                                    Can include screenshots or logs.
                                </p>
                            </div>
                            <div className="relative pl-8 border-l-2 border-white/20">
                                <span className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-emerald-900" />
                                <h3 className="text-xl font-bold text-white mb-2">2. AI Analyzes Instantly</h3>
                                <ul className="space-y-2 mt-2 text-white/70">
                                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400" /> Detects Category (Network)</li>
                                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400" /> Sets Priority (High)</li>
                                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400" /> Extracts Details (Location: Lab 3)</li>
                                </ul>
                            </div>
                            <div className="relative pl-8 border-l-2 border-white/20">
                                <span className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-emerald-900" />
                                <h3 className="text-xl font-bold text-white mb-2">3. Smart Resolution</h3>
                                <p className="text-white/70">
                                    Simple issues are fixed by the chatbot. Complex ones are routed to the right human team with all context attached.
                                </p>
                            </div>
                        </div>

                        {/* Right: The Visual Logic */}
                        <div className="bg-white/10 rounded-2xl p-8 border border-white/20 backdrop-blur-sm relative">
                            <div className="absolute top-4 right-4 bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded">LIVE DEMO</div>

                            {/* Mock Code/Logic View */}
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

            {/* ----------------- PRICING ----------------- */}
            <section className="py-24 bg-white" id="pricing">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Transparent pricing for all IT teams</h2>
                        <p className="text-gray-500">Choose the plan that best fits your organization's needs.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {/* Starter */}
                        <div className="p-8 rounded-2xl border border-gray-200 bg-white hover:border-gray-300 transition-colors">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Starter</h3>
                            <div className="text-4xl font-bold text-gray-900 mb-6">$0<span className="text-base font-normal text-gray-500">/mo</span></div>
                            <p className="text-sm text-gray-500 mb-8">Perfect for small teams getting started.</p>
                            <button className="w-full py-2.5 rounded-lg border border-gray-200 font-semibold text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all mb-8">Get Started</button>
                            <ul className="space-y-4">
                                {['Up to 50 tickets/mo', 'Basic AI Categorization', 'Email Support', '1 Team Member'].map((feat) => (
                                    <li key={feat} className="flex items-start gap-3 text-sm text-gray-600">
                                        <CheckCircle className="w-5 h-5 text-emerald-900 shrink-0" />
                                        {feat}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Growth - Popular */}
                        <div className="p-8 rounded-2xl border border-emerald-900 bg-green-50/30 relative shadow-xl">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-emerald-900 text-white px-3 py-1 rounded-full text-xs font-bold tracking-wide">
                                MOST POPULAR
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Growth</h3>
                            <div className="text-4xl font-bold text-gray-900 mb-6">$49<span className="text-base font-normal text-gray-500">/mo</span></div>
                            <p className="text-sm text-gray-500 mb-8">For growing teams needing automation.</p>
                            <button className="w-full py-2.5 rounded-lg bg-emerald-900 text-white font-semibold hover:bg-emerald-800 shadow-lg shadow-emerald-900/20 transition-all mb-8">Start Free Trial</button>
                            <ul className="space-y-4">
                                {['Up to 500 tickets/mo', 'Advanced AI Parsing', 'Slack Integration', 'Priority Detection', '5 Team Members'].map((feat) => (
                                    <li key={feat} className="flex items-start gap-3 text-sm text-gray-600">
                                        <CheckCircle className="w-5 h-5 text-emerald-900 shrink-0" />
                                        {feat}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Enterprise */}
                        <div className="p-8 rounded-2xl border border-gray-200 bg-white hover:border-gray-300 transition-colors">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Enterprise</h3>
                            <div className="text-4xl font-bold text-gray-900 mb-6">Custom</div>
                            <p className="text-sm text-gray-500 mb-8">For large organizations with custom needs.</p>
                            <button className="w-full py-2.5 rounded-lg border border-gray-200 font-semibold text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all mb-8">Contact Sales</button>
                            <ul className="space-y-4">
                                {['Unlimited tickets', 'Custom AI Models', 'SSO & Audit Logs', 'Dedicated Support', 'SLA Guarantees'].map((feat) => (
                                    <li key={feat} className="flex items-start gap-3 text-sm text-gray-600">
                                        <CheckCircle className="w-5 h-5 text-emerald-900 shrink-0" />
                                        {feat}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* ----------------- TESTIMONIALS ----------------- */}
            <section className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                            Join over <span className="text-emerald-900">10K+</span> happy IT professionals
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        {/* Card 1 */}
                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex gap-1 mb-5">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                                ))}
                            </div>
                            <p className="text-gray-700 leading-relaxed mb-6 text-[15px]">
                                "AutoDesk AI completely transformed how we handle incoming issues. What used to take my team 3 hours of manual triage every morning now happens automatically before we even open our laptops. It's a genuine game-changer."
                            </p>
                            <div className="flex items-center gap-3">
                                <img src="https://i.pravatar.cc/150?u=a" alt="User" className="w-10 h-10 rounded-full border-2 border-white shadow-sm" />
                                <div>
                                    <div className="font-semibold text-gray-900 text-sm">Marcus Kim</div>
                                    <div className="text-xs text-gray-500">Head of IT, Apex Systems</div>
                                </div>
                            </div>
                        </div>

                        {/* Card 2 */}
                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex gap-1 mb-5">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                                ))}
                            </div>
                            <p className="text-gray-700 leading-relaxed mb-6 text-[15px]">
                                "Our MTTR dropped by 60% in the first month. The AI's ability to correctly classify Network vs Hardware tickets on the first attempt — with zero training from our side — is remarkable. The Slack integration sealed the deal."
                            </p>
                            <div className="flex items-center gap-3">
                                <img src="https://i.pravatar.cc/150?u=b" alt="User" className="w-10 h-10 rounded-full border-2 border-white shadow-sm" />
                                <div>
                                    <div className="font-semibold text-gray-900 text-sm">Sakshi Rao</div>
                                    <div className="text-xs text-gray-500">IT Operations Lead, NovaCorp</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ----------------- TEAM SECTION ----------------- */}
            <TeamSection />

            {/* ----------------- FOOTER ----------------- */}
            <footer className="bg-emerald-900 text-white">
                {/* CTA Block */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 text-center border-b border-white/20">
                    <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 max-w-3xl mx-auto leading-tight text-white">
                        The Best AI Helpdesk Solution for Your Business
                    </h2>
                    <p className="text-white/75 text-lg mb-10 max-w-xl mx-auto">
                        Start automating tickets today. No credit card required.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                            onClick={() => navigate('/admin-signup')}
                            className="w-full sm:w-auto px-8 py-3.5 bg-white text-emerald-900 font-bold rounded-xl hover:bg-green-50 transition-all shadow-xl"
                        >
                            Register your company
                        </button>
                        <button className="w-full sm:w-auto px-8 py-3.5 border border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-all">
                            View Demo
                        </button>
                    </div>
                    <div className="mt-8">
                        <button
                            onClick={() => navigate('/signup')}
                            className="text-white/60 hover:text-white text-sm font-medium transition-colors flex items-center gap-1 mx-auto"
                        >
                            Already have an invite from your admin? <span className="underline underline-offset-4 decoration-white/20">Join your team</span>
                        </button>
                    </div>
                </div>

                {/* Footer Links */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
                        {/* Brand Column */}
                        <div className="col-span-2 md:col-span-1">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="bg-white/20 p-1.5 rounded-lg">
                                    <BrainCircuit className="w-5 h-5 text-white" />
                                </div>
                                <span className="font-bold text-lg text-white">HelpDesk.ai</span>
                            </div>
                            <p className="text-white/60 text-sm leading-relaxed">
                                AI-powered IT helpdesk automation for modern teams.
                            </p>
                            <div className="flex gap-3 mt-6">
                                <a href="#" className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors">
                                    <Twitter className="w-4 h-4" />
                                </a>
                                <a href="#" className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors">
                                    <Linkedin className="w-4 h-4" />
                                </a>
                                <a href="#" className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors">
                                    <Github className="w-4 h-4" />
                                </a>
                            </div>
                        </div>

                        {[
                            {
                                heading: 'Products',
                                links: ['Ticket Parser', 'Auto-Router', 'Priority Engine', 'Analytics Dashboard']
                            },
                            {
                                heading: 'Resources',
                                links: ['Documentation', 'API Reference', 'Blog', 'Changelog']
                            },
                            {
                                heading: 'Company',
                                links: ['About Us', 'Careers', 'Privacy Policy', 'Terms of Service']
                            },
                            {
                                heading: 'Trending',
                                links: ['AI Ticket Parsing', 'Slack Integration', 'Jira Sync', 'Priority Detection']
                            }
                        ].map(({ heading, links }) => (
                            <div key={heading}>
                                <h4 className="text-sm font-bold uppercase tracking-widest text-white/50 mb-4">{heading}</h4>
                                <ul className="space-y-3">
                                    {links.map(link => (
                                        <li key={link}>
                                            <a href="#" className="text-sm text-white/75 hover:text-white transition-colors">{link}</a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    {/* Bottom bar */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-16 pt-8 border-t border-white/20">
                        <p className="text-xs text-white/50">© 2026 HelpDesk.ai. All rights reserved.</p>
                        <div className="flex items-center gap-2 text-xs text-white/60 border border-white/20 rounded-lg px-3 py-1.5 cursor-pointer hover:bg-white/10 transition-colors">
                            <Globe className="w-3.5 h-3.5" />
                            <span>English (US)</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
