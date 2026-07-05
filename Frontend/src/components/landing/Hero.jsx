import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, ArrowRight, Play, X, Mail, Search, Bell, AlertCircle, Folder, MapPin, Clock } from 'lucide-react';

// ---- Demo Modal ----
function DemoModal({ onClose }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const videoId = "Bj00LzeMylM";
    const navigate = useNavigate();

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
            <div
                className="relative bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-2xl w-full max-w-4xl overflow-hidden z-10 animate-in fade-in zoom-in duration-300"
                onClick={e => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 dark:hover:text-white bg-white/10 dark:bg-slate-800 rounded-full p-2 transition-colors z-30"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="aspect-video w-full bg-black flex items-center justify-center relative group">
                    {!isPlaying ? (
                        <div
                            className="absolute inset-0 cursor-pointer overflow-hidden"
                            onClick={() => setIsPlaying(true)}
                        >
                            <img
                                src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                                alt="Video Thumbnail"
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300" />

                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-20 h-20 bg-emerald-600 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-600/50 transform group-hover:scale-110 transition-transform duration-300">
                                    <Play className="w-8 h-8 text-white fill-white ml-1" />
                                </div>
                            </div>

                            <div className="absolute bottom-6 left-6 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                <span className="text-xs font-black text-white uppercase tracking-widest">Click to Watch</span>
                            </div>
                        </div>
                    ) : (
                        <iframe
                            className="w-full h-full"
                            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
                            title="HelpDesk.ai Platform Demo"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                        ></iframe>
                    )}
                </div>

                <div className="p-6 bg-gray-50 dark:bg-slate-950 border-t border-gray-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="text-left">
                        <h2 className="text-xl font-extrabold text-gray-900 dark:text-white uppercase tracking-tight">Full Platform Walkthrough</h2>
                        <p className="text-gray-500 dark:text-gray-400 dark:text-slate-400 text-xs font-medium">Experience the synergy of AI and human expertise.</p>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <button
                            onClick={() => { onClose(); navigate('/admin-signup'); }}
                            className="flex-1 md:px-8 bg-emerald-600 hover:bg-emerald-500 text-white py-3 px-6 rounded-xl font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 border-none cursor-pointer"
                        >
                            Start Free <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Hero() {
    const navigate = useNavigate();
    const [showDemo, setShowDemo] = useState(false);

    return (
        <div className="w-full relative">
            {showDemo && <DemoModal onClose={() => setShowDemo(false)} />}

            <section className="relative pt-12 md:pt-20 pb-20 md:pb-32 overflow-hidden bg-white dark:bg-slate-900 transition-colors duration-300">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[300px] md:h-[600px] bg-gradient-to-b from-green-50/80 dark:from-emerald-950/10 to-transparent pointer-events-none -z-10" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-8">
                        <Activity className="w-3 h-3" />
                        <span>AI-Powered Helpdesk Automation · Made in India 🇮🇳</span>
                    </div>

                    <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-6 leading-[1.1]">
                        Your IT Helpdesk,<br />
                        <span className="text-emerald-700 dark:text-emerald-400">Fully Automated.</span>
                    </h1>

                    <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-500 dark:text-gray-400 dark:text-slate-300 mb-10 leading-relaxed">
                        Turn messy user complaints into structured, categorized, and prioritized support tickets — instantly. No manual triage. No missed urgencies.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
                        <button
                            onClick={() => navigate('/admin-signup')}
                            className="w-full sm:w-auto px-8 py-4 bg-emerald-900 dark:bg-emerald-600 text-white rounded-xl font-bold shadow-xl shadow-emerald-900/25 dark:shadow-emerald-900/10 hover:bg-emerald-800 dark:hover:bg-emerald-500 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-base"
                        >
                            Get Started Free <ArrowRight className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setShowDemo(true)}
                            className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 border border-gray-200 dark:border-slate-700 rounded-xl font-semibold hover:border-emerald-500 dark:hover:border-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-400 transition-all flex items-center justify-center gap-2 text-base"
                        >
                            <Play className="w-4 h-4 fill-gray-500 dark:fill-current" /> Watch a Demo
                        </button>
                    </div>

                    {/* BENTO VISUAL */}
                    <div className="relative max-w-6xl mx-auto">
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-100 via-teal-50 to-emerald-50 dark:from-emerald-950/10 dark:via-slate-900 dark:to-emerald-900/10 blur-3xl opacity-60 -z-10 rounded-full" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
                            {/* LEFT: Email */}
                            <div className="relative group perspective-1000">
                                <div className="absolute -inset-1 bg-gradient-to-r from-gray-200 to-gray-100 dark:from-slate-800 dark:to-slate-700 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000" />
                                <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-200/60 dark:border-slate-700 overflow-hidden transform transition-transform group-hover:scale-[1.01]">
                                    <div className="bg-gray-50 dark:bg-slate-900/50 border-b border-gray-200 dark:border-slate-700 px-4 py-3 flex items-center justify-between">
                                        <div className="flex gap-1.5">
                                            <div className="w-3 h-3 rounded-full bg-red-400" />
                                            <div className="w-3 h-3 rounded-full bg-yellow-400" />
                                            <div className="w-3 h-3 rounded-full bg-green-400" />
                                        </div>
                                        <div className="text-xs font-semibold text-gray-400 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                            <Mail className="w-3 h-3" /> Incoming Request
                                        </div>
                                    </div>
                                    <div className="p-6 text-left">
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-sm">SC</div>
                                                <div>
                                                    <div className="font-semibold text-gray-900 dark:text-slate-100 text-sm">Sarah Connors</div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 dark:text-slate-400">sarah@university.edu</div>
                                                </div>
                                            </div>
                                            <div className="text-xs text-gray-400 dark:text-slate-400">2 mins ago</div>
                                        </div>
                                        <div className="mb-4">
                                            <h3 className="text-sm font-bold text-gray-800 dark:text-slate-100 mb-1">Subject: Wifi down again in Lab 3??</h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-slate-300 leading-relaxed">
                                                Hey support, the wifi in <span className="bg-yellow-100 dark:bg-yellow-950/40 dark:text-yellow-200 px-1 rounded">downstairs lab 3</span> is acting up again.
                                                Can't connect at all. Class starts in 20 mins, need this fixed ASAP!<br /><br />
                                                Thanks,<br />Sarah
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="hidden md:flex absolute -right-8 top-1/2 -translate-y-1/2 z-20 text-emerald-300 dark:text-emerald-400">
                                    <ArrowRight className="w-8 h-8 animate-pulse" />
                                </div>
                            </div>

                            {/* RIGHT: Processed Ticket */}
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000" />
                                <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700 overflow-hidden transform transition-all group-hover:-translate-y-1">
                                    <div className="bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700 px-5 py-3 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-xs font-bold text-gray-500 dark:text-gray-400 dark:text-slate-400">#T-4029</span>
                                            <span className="bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400 text-xs font-bold px-2 py-0.5 rounded-full border border-green-200 dark:border-green-900/30 uppercase tracking-wide">AI Processed</span>
                                        </div>
                                        <div className="flex gap-2 text-gray-400 dark:text-slate-400">
                                            <Search className="w-4 h-4" />
                                            <Bell className="w-4 h-4" />
                                            <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">AI</div>
                                        </div>
                                    </div>
                                    <div className="p-6 space-y-5 text-left">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-bold text-gray-800 dark:text-slate-100 text-lg mb-1">WiFi Connectivity Issue</h3>
                                                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 dark:text-slate-400">
                                                    <Clock className="w-3 h-3" /> Created 1m ago
                                                    <span>•</span> via Email
                                                </div>
                                            </div>
                                            <button className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors shadow-sm shadow-emerald-200 dark:shadow-none">
                                                Resolve
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="bg-gray-50 dark:bg-slate-900/50 p-3 rounded-lg border border-gray-100 dark:border-slate-700">
                                                <div className="text-xs uppercase font-bold text-gray-400 dark:text-slate-400 mb-1 flex items-center gap-1">
                                                    <AlertCircle className="w-3 h-3" /> Priority
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                                    <span className="text-sm font-bold text-gray-800 dark:text-slate-100">High</span>
                                                </div>
                                            </div>
                                            <div className="bg-gray-50 dark:bg-slate-900/50 p-3 rounded-lg border border-gray-100 dark:border-slate-700">
                                                <div className="text-xs uppercase font-bold text-gray-400 dark:text-slate-400 mb-1 flex items-center gap-1">
                                                    <Folder className="w-3 h-3" /> Category
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <span className="text-sm font-bold text-gray-800 dark:text-slate-100">Network</span>
                                                </div>
                                            </div>
                                            <div className="bg-gray-50 dark:bg-slate-900/50 p-3 rounded-lg border border-gray-100 dark:border-slate-700 col-span-2">
                                                <div className="text-xs uppercase font-bold text-gray-400 dark:text-slate-400 mb-1 flex items-center gap-1">
                                                    <MapPin className="w-3 h-3" /> Location
                                                </div>
                                                <div className="text-sm font-bold text-gray-800 dark:text-slate-100">Lab 3 (Downstairs)</div>
                                            </div>
                                        </div>
                                        <div className="border-t border-gray-100 dark:border-slate-700 pt-3 flex items-center justify-between">
                                            <div className="text-xs text-gray-500 dark:text-gray-400 dark:text-slate-400 flex items-center gap-1">
                                                Assigned to <span className="font-bold text-gray-700 dark:text-slate-200">NetOps Team</span>
                                            </div>
                                            <div className="flex -space-x-1">
                                                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 border-2 border-white dark:border-slate-800" />
                                                <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900 border-2 border-white dark:border-slate-800 flex items-center justify-center text-[8px] font-bold text-green-700 dark:text-green-300">+3</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}