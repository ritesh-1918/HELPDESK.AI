import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Menu, X } from "lucide-react";

export default function NotFound() {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-white font-sans text-slate-800 flex flex-col">
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
                            <a href="/#features" className="text-sm font-semibold text-gray-600 hover:text-emerald-800 transition-colors">Features</a>
                            <a href="/#how-it-works" className="text-sm font-semibold text-gray-600 hover:text-emerald-800 transition-colors">How It Works</a>
                            <a href="/#pricing" className="text-sm font-semibold text-gray-600 hover:text-emerald-800 transition-colors">Pricing</a>
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
                            <a href="/#features" onClick={() => setIsMenuOpen(false)} className="block text-base font-semibold text-gray-700 hover:text-emerald-800 py-2">Features</a>
                            <a href="/#how-it-works" onClick={() => setIsMenuOpen(false)} className="block text-base font-semibold text-gray-700 hover:text-emerald-800 py-2">How It Works</a>
                            <a href="/#pricing" onClick={() => setIsMenuOpen(false)} className="block text-base font-semibold text-gray-700 hover:text-emerald-800 py-2">Pricing</a>
                            <div className="pt-4 flex flex-col gap-3 border-t border-gray-100">
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

            {/* ==================== 404 HERO ==================== */}
            <section className="relative flex-1 flex items-center justify-center pt-12 md:pt-20 pb-20 md:pb-32 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[300px] md:h-[600px] bg-gradient-to-b from-green-50/80 to-transparent pointer-events-none -z-10" />
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-100 via-teal-50 to-emerald-50 blur-3xl opacity-30 -z-10 rounded-full" />

                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <h1 className="text-7xl sm:text-9xl font-extrabold text-gray-900 tracking-tight mb-4 leading-[1.1] animate-in slide-in-from-bottom-4 duration-700">
                        4<span className="text-emerald-700">0</span>4
                    </h1>

                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 animate-in slide-in-from-bottom-6 duration-700 delay-100">
                        Page Not Found
                    </h2>

                    <p className="max-w-lg mx-auto text-lg text-gray-500 mb-10 leading-relaxed animate-in slide-in-from-bottom-8 duration-700 delay-200">
                        The page you're looking for doesn't exist or may have been moved. Let's get you back on track.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6 animate-in slide-in-from-bottom-10 duration-700 delay-300">
                        <button
                            onClick={() => navigate('/')}
                            className="w-full sm:w-auto px-8 py-4 bg-emerald-900 text-white rounded-xl font-bold shadow-xl shadow-emerald-900/25 hover:bg-emerald-800 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-base"
                        >
                            Return to Homepage <ArrowRight className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => navigate(-1)}
                            className="w-full sm:w-auto px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-xl font-semibold hover:border-emerald-500 hover:text-emerald-700 transition-all flex items-center justify-center gap-2 text-base"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
                
                {/* Decorative Elements */}
                <div className="absolute top-10 left-10 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl animate-pulse" />
                <div className="absolute bottom-10 right-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl animate-pulse delay-700" />
            </section>
        </div>
    );
}