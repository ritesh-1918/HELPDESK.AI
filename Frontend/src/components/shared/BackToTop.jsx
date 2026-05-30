import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

const BackToTop = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    // Reset hover state whenever visibility changes (component remounts)
    useEffect(() => {
        if (!isVisible) {
            setIsHovered(false);
        }
    }, [isVisible]);

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    const scrollToTop = useCallback(() => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }, []);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.button
                    key="back-to-top"
                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                    animate={{
                        opacity: 1,
                        scale: isHovered ? 1.1 : 1,
                        y: 0,
                    }}
                    exit={{ opacity: 0, scale: 0.8, y: 10 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    whileTap={{ scale: 0.9 }}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    onClick={scrollToTop}
                    className="fixed bottom-20 right-4 md:bottom-24 md:right-6 z-50 flex items-center justify-center gap-2 p-3 rounded-full shadow-lg border transition-all cursor-pointer bg-[#13ec80] hover:bg-[#0fd472] text-[#111814] border-[#13ec80]/50 hover:shadow-[#13ec80]/20 dark:bg-[#1a2e24] dark:hover:bg-[#223d30] dark:text-[#13ec80] dark:border-[#2a4034] dark:hover:border-[#13ec80]/50 dark:hover:shadow-slate-950/40"
                    aria-label="Back to Top"
                >
                    <ArrowUp
                        className={`w-5 h-5 transition-transform duration-200 ${isHovered ? '-rotate-12' : 'rotate-0'
                            }`}
                    />
                    {isHovered && (
                        <span className="text-xs font-semibold whitespace-nowrap transition-opacity duration-200">
                            Back to Top
                        </span>
                    )}
                </motion.button>
            )}
        </AnimatePresence>
    );
};

export default BackToTop;
