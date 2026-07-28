import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, X, ArrowRight } from 'lucide-react';

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

export default function Promote() {
    const navigate = useNavigate();
    const [showDemo, setShowDemo] = useState(false);

    return (
        <div className="mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 pb-10 sm:pb-16 text-center border-b border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-950 transition-colors duration-500">

            {/* Main Headline */}
            <h2 className="text-xl sm:text-3xl md:text-5xl font-black tracking-tighter mb-4 max-w-3xl mx-auto leading-tight text-slate-900 dark:text-white font-syne uppercase">
                The Smartest IT Helpdesk for <br className="hidden sm:block" />
                <span className="text-emerald-600 dark:text-emerald-400">Indian Businesses</span>
            </h2>

            {/* Sub-headline */}
            <p className="text-slate-500 dark:text-slate-400 dark:text-slate-400 text-xs sm:text-base md:text-lg mb-6 sm:mb-8 max-w-xl mx-auto px-2 font-medium">
                Start automating ticket triage today. No credit card required.
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-xs sm:max-w-none mx-auto">
                <button
                    onClick={() => navigate('/admin-signup')}
                    className="w-full sm:w-auto px-8 py-4 bg-emerald-900 dark:bg-white text-white dark:text-slate-950 font-black uppercase tracking-widest rounded-xl hover:bg-emerald-800 dark:hover:bg-emerald-50 transition-all text-xs shadow-2xl shadow-emerald-900/10 active:scale-95 cursor-pointer border-none"
                >
                    Get Started Free
                </button>

                <button
                    onClick={() => setShowDemo(true)}
                    className="w-full sm:w-auto px-8 py-4 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-black uppercase tracking-widest rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-all flex items-center justify-center gap-2 text-xs active:scale-95 cursor-pointer bg-transparent"
                >
                    <Play className="w-3.5 h-3.5 fill-slate-700 dark:fill-slate-200" /> Watch Demo
                </button>
            </div>

            {/* Secondary Login Link */}
            <div className="mt-8">
                <button
                    onClick={() => navigate('/login')}
                    className="text-slate-400 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] transition-colors cursor-pointer bg-transparent border-none"
                >
                    Already have an account? <span className="underline underline-offset-8 decoration-slate-200 dark:decoration-slate-800">Sign in</span>
                </button>
            </div>

            {/* Render DemoModal overlay conditionally */}
            {showDemo && <DemoModal onClose={() => setShowDemo(false)} />}
        </div>
    );
}