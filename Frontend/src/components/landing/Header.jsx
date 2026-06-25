import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, Play } from 'lucide-react';
import ThemeToggle from '../ThemeToggle';

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

export default function Header({ setShowDemo = () => {} }) {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <nav className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-gray-100 dark:border-slate-800 shadow-sm transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16 gap-4">
                    <div className="flex items-center gap-2 cursor-pointer shrink-0" onClick={() => navigate('/')}>
                        <img src="/favicon.png" alt="H" className="w-8 h-8 object-contain" />
                        <span className="font-black text-2xl tracking-tighter text-emerald-900 dark:text-emerald-400 uppercase">
                            HelpDesk.ai
                        </span>
                    </div>

                    <div className="hidden md:flex items-center gap-8">
                        <a href="#features" className="text-sm font-semibold text-gray-600 dark:text-gray-400 dark:text-slate-300 hover:text-emerald-800 dark:hover:text-emerald-400 transition-colors">
                            Features
                        </a>
                        <a href="#how-it-works" className="text-sm font-semibold text-gray-600 dark:text-gray-400 dark:text-slate-300 hover:text-emerald-800 dark:hover:text-emerald-400 transition-colors">
                            How It Works
                        </a>
                        <a href="#pricing" className="text-sm font-semibold text-gray-600 dark:text-gray-400 dark:text-slate-300 hover:text-emerald-800 dark:hover:text-emerald-400 transition-colors">
                            Pricing
                        </a>
                        <button
                            onClick={() => navigate('/about')}
                            className="text-sm font-semibold text-gray-600 dark:text-gray-400 dark:text-slate-300 hover:text-emerald-800 dark:hover:text-emerald-400 transition-colors"
                        >
                            About
                        </button>
                    </div>

                    <div className="hidden md:flex items-center gap-3 shrink-0">
                        <ThemeToggle />
                        
                        <button
                            onClick={() => navigate('/login')}
                            className="text-sm font-semibold text-gray-700 dark:text-slate-300 hover:text-emerald-800 dark:hover:text-emerald-400 transition-colors px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800"
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => setShowDemo(true)}
                            className="text-sm font-semibold text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-slate-700 px-4 py-2 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-all flex items-center gap-1.5 active:scale-95"
                        >
                            <Play className="w-3.5 h-3.5 fill-emerald-700 dark:fill-emerald-400" /> Watch Demo
                        </button>
                        <button
                            onClick={() => navigate('/admin-signup')}
                            className="bg-emerald-950 hover:bg-emerald-900 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-lg shadow-emerald-955/20 active:scale-95"
                        >
                            Get Started Free
                        </button>
                    </div>

                    <div className="md:hidden flex items-center gap-2">
                        <ThemeToggle />

                        <button 
                            onClick={() => setIsMenuOpen(!isMenuOpen)} 
                            className="text-gray-600 dark:text-gray-400 dark:text-slate-400 hover:text-emerald-800 dark:hover:text-emerald-400 p-2 active:scale-95"
                            aria-label="Toggle menu"
                        >
                            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {isMenuOpen && (
                <div className="md:hidden bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 absolute w-full shadow-xl z-50 animate-in fade-in slide-in-from-top duration-200">
                    <div className="px-5 pt-3 pb-6 space-y-4 text-center">
                        <a 
                            href="#features" 
                            onClick={() => setIsMenuOpen(false)} 
                            className="block text-base font-semibold text-gray-700 dark:text-slate-200 hover:text-emerald-800 dark:hover:text-emerald-400 py-2"
                        >
                            Features
                        </a>
                        <a 
                            href="#how-it-works" 
                            onClick={() => setIsMenuOpen(false)} 
                            className="block text-base font-semibold text-gray-700 dark:text-slate-200 hover:text-emerald-800 dark:hover:text-emerald-400 py-2"
                        >
                            How It Works
                        </a>
                        <a 
                            href="#pricing" 
                            onClick={() => setIsMenuOpen(false)} 
                            className="block text-base font-semibold text-gray-700 dark:text-slate-200 hover:text-emerald-800 dark:hover:text-emerald-400 py-2"
                        >
                            Pricing
                        </a>
                        <button
                            onClick={() => { setIsMenuOpen(false); navigate('/about'); }}
                            className="block w-full text-base font-semibold text-gray-700 dark:text-slate-200 hover:text-emerald-800 dark:hover:text-emerald-400 py-2"
                        >
                            About
                        </button>
                        <div className="pt-4 flex flex-col gap-3 border-t border-gray-100 dark:border-slate-800">
                            <button 
                                onClick={() => { setIsMenuOpen(false); setShowDemo(true); }} 
                                className="w-full text-center py-2.5 text-emerald-800 dark:text-emerald-400 font-semibold border border-emerald-200 dark:border-slate-700 rounded-lg flex items-center justify-center gap-2"
                            >
                                <Play className="w-4 h-4 fill-emerald-700 dark:fill-emerald-400" /> Watch Demo
                            </button>
                            <button 
                                onClick={() => { setIsMenuOpen(false); navigate('/login'); }} 
                                className="w-full text-center py-2.5 text-gray-700 dark:text-slate-200 font-semibold border border-gray-100 dark:border-slate-700 rounded-lg"
                            >
                                Sign In
                            </button>
                            <button 
                                onClick={() => { setIsMenuOpen(false); navigate('/admin-signup'); }} 
                                className="w-full bg-emerald-955 dark:bg-emerald-600 text-white py-3 rounded-lg font-semibold shadow"
                            >
                                Get Started Free
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}