import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
 
import { motion, AnimatePresence } from 'framer-motion';

export const Select = ({ value, onChange, options, placeholder = "Select an option", className = "", buttonClassName = "", disabled = false, ...props }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find(opt => String(opt.value) === String(value)) || null;

    return (
        <div ref={containerRef} className={`relative ${className || 'flex-1'}`} {...props}>
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={buttonClassName || `w-full flex items-center justify-between pl-4 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-50' : 'hover:bg-slate-50 cursor-pointer text-slate-700'}`}
            >
                <span className={`truncate ${selectedOption ? "text-slate-900" : "text-slate-400"}`}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown className={`w-4 h-4 ml-2 text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute z-[100] w-full mt-2 bg-white border border-slate-100 rounded-xl shadow-xl overflow-hidden py-1 min-w-[140px]"
                    >
                        <div className="max-h-60 overflow-y-auto">
                            {options.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => {
                                        // Fake native event structure for easy drop-in replacement
                                        if (onChange) onChange({ target: { value: option.value, name: props.name } });
                                        setIsOpen(false);
                                    }}
                                    className={`w-full text-left flex items-center justify-between px-4 py-2.5 text-sm transition-colors
                                        ${String(value) === String(option.value)
                                            ? 'bg-emerald-50 text-emerald-700 font-bold'
                                            : 'text-slate-700 font-medium hover:bg-slate-50'
                                        }`}
                                >
                                    <span className="truncate">{option.label}</span>
                                    {String(value) === String(option.value) && <Check className="w-4 h-4 shrink-0 text-emerald-600 ml-2" />}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
