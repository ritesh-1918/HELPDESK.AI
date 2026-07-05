import React from 'react';
 
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X, Zap } from 'lucide-react';
import useToastStore from '../../store/toastStore';

const Toaster = () => {
    const { toasts, removeToast } = useToastStore();

    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
            <AnimatePresence mode="popLayout">
                {toasts.map((toast) => (
                    <motion.div
                        key={toast.id}
                        layout
                        initial={{ opacity: 0, y: 50, scale: 0.8, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, scale: 0.5, filter: 'blur(10px)', transition: { duration: 0.2 } }}
                        className="pointer-events-auto"
                    >
                        <div className={`
                            min-w-[320px] max-w-[400px] p-4 rounded-2xl border shadow-2xl backdrop-blur-md
                            flex items-center gap-4 group relative overflow-hidden
                            ${toast.type === 'success' ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-50' : ''}
                            ${toast.type === 'error' ? 'bg-red-950/90 border-red-500/30 text-red-50' : ''}
                            ${toast.type === 'info' ? 'bg-indigo-950/90 border-indigo-500/30 text-indigo-50' : ''}
                            ${toast.type === 'warning' ? 'bg-amber-950/90 border-amber-500/30 text-amber-50' : ''}
                        `}>
                            {/* Animated Background Pulse */}
                            <div className={`absolute inset-0 opacity-10 animate-pulse pointer-events-none
                                ${toast.type === 'success' ? 'bg-emerald-500' : ''}
                                ${toast.type === 'error' ? 'bg-red-500' : ''}
                                ${toast.type === 'info' ? 'bg-indigo-500' : ''}
                                ${toast.type === 'warning' ? 'bg-amber-500' : ''}
                            `} />

                            <div className="shrink-0">
                                {toast.type === 'success' && <CheckCircle2 className="w-6 h-6 text-emerald-400" />}
                                {toast.type === 'error' && <AlertCircle className="w-6 h-6 text-red-400" />}
                                {toast.type === 'info' && <Zap className="w-6 h-6 text-indigo-400" />}
                                {toast.type === 'warning' && <Info className="w-6 h-6 text-amber-400" />}
                            </div>

                            <div className="flex-1">
                                <p className="text-sm font-black uppercase tracking-widest italic group-hover:not-italic transition-all">
                                    {toast.type || 'PROTOCOL'}
                                </p>
                                <p className="text-xs font-bold opacity-80 leading-relaxed">
                                    {toast.message}
                                </p>
                            </div>

                            <button
                                onClick={() => removeToast(toast.id)}
                                className="shrink-0 p-1 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <X className="w-4 h-4 opacity-50 hover:opacity-100" />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

export default Toaster;
