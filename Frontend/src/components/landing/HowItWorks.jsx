import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Bot, CheckCircle, Zap } from 'lucide-react';

export default function HowItWorks() {
    const [activeStep, setActiveStep] = useState(0);

    const steps = [
        {
            num: '01',
            title: 'Messy User Input',
            label: 'The Problem',
            desc: 'Users describe issues in natural language, often lacking critical details or context.',
            visual: (
                <div className="bg-white/5 dark:bg-black/20 border border-white/10 dark:border-white/5 rounded-2xl p-6 w-full animate-in zoom-in duration-300">
                    <p className="text-sm text-blue-100 italic font-medium">"Hey support, the wifi in downstream lab 3 is acting up again. Can't connect. Need fixed ASAP!"</p>
                </div>
            )
        },
        {
            num: '02',
            title: 'AI Analysis',
            label: 'The Brain',
            desc: 'AI parses intent, extracts entities (Lab 3), and detects urgency (ASAP) in milliseconds.',
            visual: (
                <div className="flex flex-col items-center gap-6 animate-in zoom-in duration-300">
                    <div className="w-24 h-24 bg-emerald-500/20 rounded-full border border-emerald-500/30 flex items-center justify-center animate-pulse">
                        <Zap className="w-10 h-10 text-emerald-400" />
                    </div>
                    <div className="grid grid-cols-2 gap-3 w-full">
                        <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg text-xs text-emerald-300 font-bold uppercase text-center">Category: Network</div>
                        <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg text-xs text-emerald-300 font-bold uppercase text-center">Priority: High</div>
                    </div>
                </div>
            )
        },
        {
            num: '03',
            title: 'Smart Resolution',
            label: 'The Solution',
            desc: 'AI either resolves the ticket using history or routes it with full context to the right human team.',
            visual: (
                <div className="w-full max-w-sm animate-in zoom-in duration-300">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden border border-emerald-500/20">
                        <div className="bg-emerald-600 px-4 py-2 flex justify-between items-center">
                            <span className="text-xs font-black text-white uppercase tracking-widest">Ticket #4029</span>
                            <span className="text-xs font-bold text-white/80">RESOLVED</span>
                        </div>
                        <div className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-6 h-6 bg-emerald-100 dark:bg-slate-900 rounded-full flex items-center justify-center">
                                    <Bot className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <span className="text-xs font-bold text-gray-800 dark:text-slate-200 italic">HelpDesk AI</span>
                            </div>
                            <p className="text-[11px] text-gray-600 dark:text-gray-400 dark:text-slate-400">"Remotely reset the Lab 3 router. Connectivity restored. Total downtime: 143ms."</p>
                        </div>
                    </div>
                </div>
            )
        }
    ];

    return (
        <section className="py-24 bg-emerald-950 dark:bg-slate-950 text-white overflow-hidden transition-colors duration-300" id="how-it-works">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row gap-16 items-center">
                    {/* Left: Interactive Stepper */}
                    <div className="w-full md:w-1/2">
                        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white mb-12 leading-[0.9]">
                            From Chaos <br /> 
                            to <span className="text-emerald-500">Clarity.</span>
                        </h2>
                        <div className="space-y-4">
                            {steps.map((step, idx) => (
                                <button
                                    key={idx}
                                    onMouseEnter={() => setActiveStep(idx)}
                                    className={`w-full text-left p-6 rounded-3xl transition-all duration-300 border ${activeStep === idx ? 'bg-white/10 border-white/20' : 'bg-transparent border-transparent opacity-40 hover:opacity-100'}`}
                                >
                                    <div className="flex items-start gap-6">
                                        <div className={`shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl italic transition-all ${activeStep === idx ? 'bg-emerald-500 rotate-12 scale-110' : 'bg-white/10'}`}>
                                            {step.num}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black uppercase">{step.title}</h3>
                                            {activeStep === idx && <p className="text-white/60 text-sm mt-2">{step.desc}</p>}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right: Visual Display */}
                    <div className="w-full md:w-1/2 h-[400px] flex items-center justify-center bg-white/5 dark:bg-black/20 rounded-[40px] border border-white/5 backdrop-blur-xl p-12">
                        <AnimatePresence mode="wait">
                            <motion.div 
                                key={activeStep}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="w-full flex flex-col items-center justify-center"
                            >
                                <div className="mb-8 px-4 py-1.5 bg-white/5 rounded-full text-xs font-black uppercase tracking-[0.2em] text-emerald-400">
                                    {steps[activeStep].label}
                                </div>
                                {steps[activeStep].visual}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </section>
    );
}