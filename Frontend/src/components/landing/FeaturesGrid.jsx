import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Folder, Bot, CheckCircle, ChevronRight } from 'lucide-react';

export default function FeaturesGrid() {
    const navigate = useNavigate();

    return (
        <section className="py-24 bg-white dark:bg-slate-900 transition-colors duration-300" id="features">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <span className="text-xs font-bold tracking-widest text-emerald-700 dark:text-emerald-400 uppercase mb-3 block">Core Intelligence</span>
                    <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">Work Smarter, Not Harder</h2>
                    <p className="text-gray-500 dark:text-gray-400 dark:text-slate-400 mt-4 text-lg max-w-xl mx-auto">Three AI capabilities that eliminate manual helpdesk work.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Card 1: Auto-Categorization */}
                    <div className="group rounded-3xl bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 overflow-hidden hover:shadow-xl dark:hover:shadow-black/30 transition-all duration-300 hover:-translate-y-1">
                        <div className="h-52 bg-gradient-to-br from-blue-50 to-gray-50 dark:from-slate-900/50 dark:to-slate-800/50 p-6 flex items-center justify-center relative overflow-hidden">
                            <div className="relative z-10 flex flex-col gap-3 items-center">
                                <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 text-xs font-bold text-gray-400 dark:text-slate-400 flex items-center gap-2 transform -translate-x-4 opacity-60">
                                    <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-slate-600" /> Ticket #1024
                                </div>
                                <div className="bg-white dark:bg-slate-800 px-5 py-3 rounded-xl shadow-lg border border-blue-100 dark:border-blue-900 flex items-center gap-3 transform scale-110">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
                                        <Folder className="w-4 h-4 text-blue-600 dark:text-blue-400 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <div className="h-2 w-16 bg-gray-200 dark:bg-slate-700 rounded mb-1.5" />
                                        <span className="bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 text-xs font-bold px-2 py-0.5 rounded border border-blue-100 dark:border-blue-900">Network</span>
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 text-xs font-bold text-gray-400 dark:text-slate-400 flex items-center gap-2 transform translate-x-6 opacity-60">
                                    <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-slate-600" /> Ticket #1025
                                    </div>
                            </div>
                        </div>
                        <div className="p-8">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Auto-Categorization</h3>
                            <p className="text-gray-500 dark:text-gray-400 dark:text-slate-400 leading-relaxed mb-6">
                                Instantly detects if an issue is Network, Hardware, Software, or Access-related — no manual tagging.
                            </p>
                            <button
                                onClick={() => navigate('/features/categorization')}
                                className="inline-flex items-center text-sm font-semibold text-emerald-900 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 gap-1 group-hover:gap-2 transition-all cursor-pointer bg-transparent border-none p-0"
                            >
                                Explore <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Card 2: Priority Detection */}
                    <div className="group rounded-3xl bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 overflow-hidden hover:shadow-xl dark:hover:shadow-black/30 transition-all duration-300 hover:-translate-y-1">
                        <div className="h-52 bg-gradient-to-br from-red-50 to-orange-50 dark:from-slate-900/50 dark:to-slate-800/50 p-6 flex items-center justify-center relative overflow-hidden">
                            <div className="relative z-10 w-full max-w-[200px] space-y-2.5">
                                <div className="bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm flex items-center justify-between opacity-50 scale-95">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-green-400" />
                                        <div className="h-1.5 w-12 bg-gray-200 dark:bg-slate-700 rounded" />
                                    </div>
                                    <span className="text-xs font-bold text-gray-400 dark:text-slate-400">Low</span>
                                </div>
                                <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-red-100 dark:border-red-900 shadow-md flex items-center justify-between ring-2 ring-red-50 dark:ring-red-950/20">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                        <div className="h-2 w-20 bg-gray-800 dark:bg-slate-100 rounded" />
                                    </div>
                                    <span className="text-xs bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 font-bold px-1.5 py-0.5 rounded border border-red-100 dark:border-red-900">CRITICAL</span>
                                </div>
                                <div className="bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm flex items-center justify-between opacity-50 scale-95">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-yellow-400" />
                                        <div className="h-1.5 w-16 bg-gray-200 dark:bg-slate-700 rounded" />
                                    </div>
                                    <span className="text-xs font-bold text-gray-400 dark:text-slate-400">Medium</span>
                                </div>
                            </div>
                        </div>
                        <div className="p-8">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Priority Detection</h3>
                            <p className="text-gray-500 dark:text-gray-400 dark:text-slate-400 leading-relaxed mb-6">
                                Understands urgency signals in text and automatically flags issues from Low to Critical.
                            </p>
                            <button
                                onClick={() => navigate('/features/priority')}
                                className="inline-flex items-center text-sm font-semibold text-emerald-900 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 gap-1 group-hover:gap-2 transition-all cursor-pointer bg-transparent border-none p-0"
                            >
                                Explore <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Card 3: Smart Resolution */}
                    <div className="group rounded-3xl bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 overflow-hidden hover:shadow-xl dark:hover:shadow-black/30 transition-all duration-300 hover:-translate-y-1">
                        <div className="h-52 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-900/50 dark:to-slate-800/50 p-6 flex items-center justify-center relative overflow-hidden">
                            <div className="relative z-10 w-full max-w-[200px] flex flex-col gap-3">
                                <div className="self-end bg-emerald-600 text-white p-2.5 rounded-2xl rounded-tr-none shadow-sm text-xs max-w-[80%]">
                                    Reset password for user@company.com?
                                </div>
                                <div className="self-start flex items-end gap-2">
                                    <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 border border-white dark:border-slate-700 shadow-sm flex items-center justify-center">
                                        <Bot className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <div className="bg-white dark:bg-slate-800 p-2.5 rounded-2xl rounded-tl-none border border-gray-200 dark:border-slate-700 shadow-sm text-xs text-gray-600 dark:text-gray-400 dark:text-slate-300">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <CheckCircle className="w-3 h-3 text-emerald-500" />
                                            <span className="font-bold text-gray-800 dark:text-slate-200">Done</span>
                                        </div>
                                        Reset link sent successfully.
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-8">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Smart Resolution</h3>
                            <p className="text-gray-500 dark:text-gray-400 dark:text-slate-400 leading-relaxed mb-6">
                                Checks historical data to auto-fix simple issues, or routes complex ones to the right human team.
                            </p>
                            <button
                                onClick={() => navigate('/features/resolution')}
                                className="inline-flex items-center text-sm font-semibold text-emerald-900 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 gap-1 group-hover:gap-2 transition-all cursor-pointer bg-transparent border-none p-0"
                            >
                                Explore <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}