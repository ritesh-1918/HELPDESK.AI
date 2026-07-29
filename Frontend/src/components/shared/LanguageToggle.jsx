import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, ChevronDown, CheckCircle2 } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../../services/translationService';

const LanguageToggle = ({ selectedLanguage, onLanguageChange, compact = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const currentLang = SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage);

    if (compact) {
        return (
            <div className="relative" ref={ref}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/80 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-white hover:border-emerald-200 transition-all shadow-sm"
                >
                    <Globe size={14} className="text-emerald-500" />
                    <span>{currentLang?.code?.toUpperCase() || 'EN'}</span>
                    <ChevronDown size={12} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 8, scale: 0.95 }}
                            animate={{ opacity: 1, y: 4, scale: 1 }}
                            exit={{ opacity: 0, y: 8, scale: 0.95 }}
                            className="absolute right-0 z-50 mt-1 bg-white border border-gray-100 rounded-xl shadow-xl shadow-emerald-900/10 p-1.5 min-w-[160px]"
                        >
                            {SUPPORTED_LANGUAGES.map(lang => (
                                <button
                                    key={lang.code}
                                    onClick={() => { onLanguageChange(lang.code); setIsOpen(false); }}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-between
                                        ${selectedLanguage === lang.code ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600 hover:bg-gray-50'}`}
                                >
                                    <span>{lang.nativeName || lang.label}</span>
                                    {selectedLanguage === lang.code && <CheckCircle2 size={12} className="text-emerald-500" />}
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-white hover:border-emerald-200 transition-all shadow-sm group"
            >
                <Globe size={14} className="text-emerald-500" />
                <span>{currentLang?.label || 'English'}</span>
                <ChevronDown size={16} className={`text-gray-400 group-hover:text-emerald-500 transition-all ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 5, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 z-50 mt-1 bg-white border border-gray-100 rounded-2xl shadow-2xl shadow-emerald-900/10 p-2 min-w-[200px]"
                    >
                        <div className="max-h-[260px] overflow-y-auto space-y-1">
                            {SUPPORTED_LANGUAGES.map(lang => (
                                <button
                                    key={lang.code}
                                    onClick={() => { onLanguageChange(lang.code); setIsOpen(false); }}
                                    className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-between
                                        ${selectedLanguage === lang.code ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600 hover:bg-gray-50'}`}
                                >
                                    <span>{lang.label}</span>
                                    {selectedLanguage === lang.code && <CheckCircle2 size={14} className="text-emerald-500" />}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LanguageToggle;
