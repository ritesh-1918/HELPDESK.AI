import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    ShieldCheck, Heart, Sparkles, ArrowLeft, Target, Award, 
    Bot, Cpu, Network, Zap, GitBranch, Terminal, Users, 
    Calendar, ArrowRight, Github, Shield
} from 'lucide-react';
import { Card } from '../components/ui/card';

export default function AboutUs() {
    const navigate = useNavigate();

    // Features data
    const features = [
        {
            icon: Bot,
            title: "Auto-Categorization",
            desc: "Instantly assigns incoming tickets to standard domains (Network, Hardware, Access) using on-device Natural Language Processing."
        },
        {
            icon: Zap,
            title: "Urgency & Priority Detection",
            desc: "Detects emotional sentiments and urgency cues within plain-text descriptions, automatically prioritizing issues."
        },
        {
            icon: Cpu,
            title: "Offline Safetensors Model",
            desc: "Operates utilizing a secure local sentence-transformers model without relying on external third-party API dependencies."
        },
        {
            icon: Network,
            title: "Intelligent Triage & Routing",
            desc: "Bypasses human delays to instantly forward processed tickets to the appropriate engineering or SysOps queues."
        }
    ];

    // AI Pipeline steps
    const pipelineSteps = [
        {
            step: "01",
            title: "Ingestion",
            desc: "Standardizes inputs from emails, web portals, and system logs."
        },
        {
            step: "02",
            title: "Local Analysis",
            desc: "Parses queries via local Safetensors model in milliseconds."
        },
        {
            step: "03",
            title: "Triage & Tagging",
            desc: "Correctly assigns tags, priority level, and key entities."
        },
        {
            step: "04",
            title: "Auto-Resolution",
            desc: "Closes basic issues or forwards complex ones to NetOps."
        }
    ];

    // Roadmap Phases
    const roadmap = [
        {
            phase: "Phase 1: Local Triage",
            status: "Released",
            desc: "Introduced on-device machine learning categorization, priority tagging, and secure regional data hosting."
        },
        {
            phase: "Phase 2: Self-Healing",
            status: "In Progress",
            desc: "Developing local automation workers to automatically reset network routers and clear storage leaks."
        },
        {
            phase: "Phase 3: Deep AI Agent",
            status: "Planned",
            desc: "Enabling cross-organization telemetry checks and fully autonomous voice/chat interactive resolution."
        }
    ];

    return (
        <div className="min-h-screen bg-[#f6f8f7] dark:bg-[#102219] text-slate-800 dark:text-slate-100 transition-colors duration-300 pb-20">
            {/* Header */}
            <header className="w-full bg-white dark:bg-[#1a2e24] border-b border-gray-200 dark:border-[#2a4034] sticky top-0 z-50 transition-colors">
                <div className="max-w-[1100px] mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
                        <img src="/favicon.png" alt="HELPDESK.AI Logo" className="w-7 h-7 object-contain" />
                        <div className="flex items-baseline gap-2">
                            <h1 className="text-xl font-black tracking-tighter text-gray-900 dark:text-white italic">HELPDESK.AI</h1>
                            <span className="px-2 py-0.5 text-[10px] font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-md uppercase tracking-wider">About</span>
                        </div>
                    </div>
                    <button 
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-xs font-bold text-gray-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors bg-gray-50 dark:bg-[#1a2e24] hover:bg-emerald-50 dark:hover:bg-[#223d30] px-3.5 py-2 rounded-xl border border-gray-200 dark:border-[#2a4034]"
                    >
                        <ArrowLeft size={14} /> Back to Home
                    </button>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative overflow-hidden pt-16 pb-12">
                <div className="max-w-[1100px] mx-auto px-4 md:px-6 text-center space-y-6">
                    <motion.div 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20 rounded-full text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider"
                    >
                        <Sparkles size={14} /> Shaping The Future of Support
                    </motion.div>
                    <motion.h1 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-gray-900 dark:text-white italic uppercase"
                    >
                        Your Intelligent <br />
                        <span className="text-emerald-600 dark:text-emerald-400">Triage Partner</span>
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="max-w-2xl mx-auto text-slate-600 dark:text-slate-400 text-base md:text-lg leading-relaxed font-medium"
                    >
                        We build locally hosted machine learning workflows that eliminate manual ticket tagging, priority guesswork, and routing bottlenecks for modern IT landscapes.
                    </motion.p>
                </div>
            </section>

            {/* Mission & Key Cards */}
            <section className="max-w-[1100px] mx-auto px-4 md:px-6 py-8 space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20 rounded-full text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                            <Heart size={14} /> Our Mission
                        </div>
                        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Pioneering Localized AI Excellence</h2>
                        <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base leading-relaxed">
                            HELPDESK.AI was founded on a simple premise: IT helpdesk operations shouldn't depend on complex third-party external clouds, exposing sensitive corporate data to external risks. By anchoring our system to fast local classification modules, we provide rapid automated triage with full data sovereignty.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Card className="p-5 rounded-[2rem] border border-slate-200 dark:border-[#2a4034] bg-white dark:bg-[#1a2e24] space-y-3 transition-colors">
                            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                <Target size={16} />
                            </div>
                            <h4 className="font-extrabold text-slate-800 dark:text-white text-sm">Targeted Accuracy</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                                Using fine-tuned offline NLP models, we predict categories and priority levels with high accuracy.
                            </p>
                        </Card>

                        <Card className="p-5 rounded-[2rem] border border-slate-200 dark:border-[#2a4034] bg-white dark:bg-[#1a2e24] space-y-3 transition-colors">
                            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                                <Award size={16} />
                            </div>
                            <h4 className="font-extrabold text-slate-800 dark:text-white text-sm">Data Sovereignty</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                                100% of summaries, OCR attachments, and communication logs remain regionalized and secure.
                            </p>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Platform Features Showcase */}
            <section className="bg-white dark:bg-[#1a2e24]/30 py-16 border-y border-gray-200/50 dark:border-[#2a4034]/50 transition-colors">
                <div className="max-w-[1100px] mx-auto px-4 md:px-6">
                    <div className="text-center space-y-3 mb-12">
                        <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">Robust Platform Capabilities</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-lg mx-auto">Discover the foundational modules that keep HelpDesk.ai running at peak efficiency.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feat, index) => {
                            const IconComp = feat.icon;
                            return (
                                <div key={index} className="p-6 bg-white dark:bg-[#1a2e24] border border-slate-100 dark:border-[#2a4034] rounded-3xl space-y-4 hover:shadow-lg transition-all duration-300">
                                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                                        <IconComp size={20} />
                                    </div>
                                    <h4 className="font-bold text-slate-900 dark:text-white text-base">{feat.title}</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{feat.desc}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Architecture / Pipeline Section */}
            <section className="max-w-[1100px] mx-auto px-4 md:px-6 py-16">
                <div className="text-center space-y-3 mb-12">
                    <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">Our AI Pipeline</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm max-w-lg mx-auto">See how ticket chaos is transformed into structured, actionable resolutions.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
                    {pipelineSteps.map((step, idx) => (
                        <div key={idx} className="relative group p-6 bg-slate-50 dark:bg-[#1a2e24] border border-slate-200/50 dark:border-[#2a4034] rounded-3xl flex flex-col justify-between min-h-[160px] transition-colors">
                            <div>
                                <span className="font-mono text-3xl font-black text-emerald-500/30 dark:text-emerald-400/20">{step.step}</span>
                                <h4 className="font-bold text-slate-800 dark:text-white text-sm mt-2">{step.title}</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-1">{step.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Roadmap */}
            <section className="bg-slate-900 text-white py-16 transition-colors">
                <div className="max-w-[1100px] mx-auto px-4 md:px-6">
                    <div className="text-center space-y-3 mb-12">
                        <h2 className="text-3xl font-extrabold tracking-tight">Project Roadmap</h2>
                        <p className="text-slate-400 text-sm max-w-lg mx-auto">Following our steady path from local triage assistants to autonomous workflows.</p>
                    </div>

                    <div className="space-y-6 max-w-3xl mx-auto">
                        {roadmap.map((road, idx) => (
                            <div key={idx} className="p-6 bg-white/5 border border-white/10 rounded-3xl flex flex-col sm:flex-row items-start justify-between gap-4">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <h4 className="font-bold text-white text-base">{road.phase}</h4>
                                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                                            road.status === "Released" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : 
                                            road.status === "In Progress" ? "bg-blue-500/20 text-blue-300 border border-blue-500/30" : 
                                            "bg-slate-500/20 text-slate-300 border border-slate-500/30"
                                        }`}>{road.status}</span>
                                    </div>
                                    <p className="text-xs text-slate-400 leading-relaxed">{road.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Community & Contributors */}
            <section className="max-w-[1100px] mx-auto px-4 md:px-6 py-16">
                <Card className="p-8 sm:p-12 rounded-[2.5rem] border border-slate-200 dark:border-[#2a4034] bg-white dark:bg-[#1a2e24] text-center space-y-6 shadow-xl dark:shadow-slate-950/40 transition-colors">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                        <Users size={24} />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Collaborative Community</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto">HelpDesk.ai is powered by community collaboration. Join hands with open-source contributors around the globe to build a faster helpdesk.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                        <a 
                            href="https://github.com/ritesh-1918/HELPDESK.AI" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="w-full sm:w-auto px-6 py-3 bg-[#111814] text-white hover:bg-black rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg hover:scale-[1.01] transition-all"
                        >
                            <Github size={16} /> Open Github Repository
                        </a>
                        <button 
                            onClick={() => navigate('/signup')} 
                            className="w-full sm:w-auto px-6 py-3 bg-[#13ec80] hover:bg-[#0fd472] text-[#111814] rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#13ec80]/20 hover:scale-[1.01] transition-all"
                        >
                            Get Started Free <ArrowRight size={16} />
                        </button>
                    </div>
                </Card>
            </section>
        </div>
    );
}
