import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Mic, MicOff, X, ArrowRight, CheckCircle2, Loader2,
    Volume2, Globe, ChevronDown, Sparkles
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import useVoiceRecognition from '../../hooks/useVoiceRecognition';
import { SUPPORTED_LANGUAGES } from '../../services/translationService';

const LANG_MAP = {
    en: 'en-US', hi: 'hi-IN', es: 'es-ES', fr: 'fr-FR',
    de: 'de-DE', zh: 'zh-CN', ja: 'ja-JP', ko: 'ko-KR',
    pt: 'pt-BR', ar: 'ar-SA', ru: 'ru-RU', bn: 'bn-IN',
    ta: 'ta-IN', te: 'te-IN', mr: 'mr-IN', gu: 'gu-IN',
    kn: 'kn-IN', ml: 'ml-IN', pa: 'pa-IN', ur: 'ur-PK',
};

/**
 * VoiceToTicket – Standalone voice-to-ticket component.
 * Can be used as a full-page view or embedded as a modal / card.
 *
 * Props:
 *  - embedded: bool   When true, renders without the outer page wrapper.
 *  - onInsert: fn     Called with the final transcript string instead of navigating.
 *  - initialLang: string   BCP-47 code or short language code.
 */
const VoiceToTicket = ({ embedded = false, onInsert = null, initialLang = 'en' }) => {
    const navigate = useNavigate();

    /* ── language selector state ─────────────────────── */
    const [selectedLanguage, setSelectedLanguage] = useState(initialLang);
    const [isLangOpen, setIsLangOpen]             = useState(false);
    const [confirming, setConfirming]             = useState(false);

    const speechLang = LANG_MAP[selectedLanguage] || 'en-US';

    /* ── voice hook ──────────────────────────────────── */
    const {
        isListening, transcript, interim, visualizerData,
        error, isSupported,
        start, stop, toggle, reset,
        setTranscript, setInterim, setError,
    } = useVoiceRecognition({ lang: speechLang, continuous: true });

    /* ── auto-start on mount ─────────────────────────── */
    useEffect(() => {
        if (isSupported) start();
        return () => stop();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /* ── handlers ────────────────────────────────────── */
    const handleConfirm = () => {
        const text = (transcript + ' ' + interim).trim();
        if (!text) {
            setError('No speech captured yet. Please speak before confirming.');
            return;
        }
        stop();

        if (onInsert) {
            onInsert(text);
            return;
        }

        // Navigate to AI processing with the voice transcript
        navigate('/ai-processing', {
            state: {
                text,
                original_text: text,
                original_language: selectedLanguage,
                source: 'voice',
            },
        });
    };

    const handleDiscard = () => {
        reset();
    };

    /* ── unsupported ─────────────────────────────────── */
    if (!isSupported) {
        return (
            <div className="flex flex-col items-center justify-center p-10 text-center gap-4">
                <div className="p-4 bg-red-50 rounded-full">
                    <MicOff size={32} className="text-red-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-800">Voice Not Supported</h3>
                <p className="text-sm text-gray-500 max-w-sm">
                    Your browser does not support the Web Speech API.
                    Please try Chrome, Edge, or Safari&nbsp;14.1+.
                </p>
            </div>
        );
    }

    /* ── inner content ───────────────────────────────── */
    const content = (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={`relative p-3 rounded-2xl transition-all duration-300 ${
                        isListening
                            ? 'bg-red-50 text-red-600 shadow-lg shadow-red-100'
                            : 'bg-emerald-50 text-emerald-600'
                    }`}>
                        {isListening && (
                            <span className="absolute inset-0 rounded-2xl border-2 border-red-300 animate-ping" />
                        )}
                        <Mic size={24} className={isListening ? 'animate-pulse' : ''} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">
                            {isListening ? 'Listening...' : 'Voice-to-Ticket'}
                        </h3>
                        <p className="text-xs text-gray-500 font-medium">
                            {isListening
                                ? 'Speak your issue clearly'
                                : 'Tap the mic to start dictating'}
                        </p>
                    </div>
                </div>

                {/* Language picker */}
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setIsLangOpen(!isLangOpen)}
                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-gray-600 bg-gray-50 border border-gray-100 rounded-xl hover:bg-white hover:border-emerald-200 transition-all"
                    >
                        <Globe size={12} className="text-emerald-500" />
                        {SUPPORTED_LANGUAGES.find((l) => l.code === selectedLanguage)?.label || 'English'}
                        <ChevronDown size={12} />
                    </button>
                    <AnimatePresence>
                        {isLangOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                className="absolute z-50 right-0 top-full mt-1 bg-white border border-gray-100 rounded-2xl shadow-2xl p-2 w-48 max-h-[200px] overflow-y-auto"
                            >
                                {SUPPORTED_LANGUAGES.map((lang) => (
                                    <button
                                        key={lang.code}
                                        type="button"
                                        onClick={() => {
                                            setSelectedLanguage(lang.code);
                                            setIsLangOpen(false);
                                        }}
                                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                                            selectedLanguage === lang.code
                                                ? 'bg-emerald-50 text-emerald-700'
                                                : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                    >
                                        {lang.label}
                                        {selectedLanguage === lang.code && (
                                            <CheckCircle2 size={12} className="text-emerald-500" />
                                        )}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Wave visualizer */}
            <AnimatePresence>
                {isListening && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 48 }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center justify-center gap-1 overflow-hidden"
                    >
                        {visualizerData.map((h, i) => (
                            <motion.div
                                key={i}
                                animate={{
                                    height: h,
                                    backgroundColor: h > 25 ? '#10b981' : '#34d399',
                                }}
                                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                className="w-1.5 rounded-full bg-emerald-400"
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Transcript area */}
            <div className="min-h-[140px] max-h-[260px] overflow-y-auto rounded-2xl border border-gray-100 bg-gray-50/50 p-5 relative">
                {transcript || interim ? (
                    <p className="text-gray-800 text-base leading-relaxed font-medium">
                        {transcript}
                        <span className="text-gray-400"> {interim}</span>
                        {isListening && (
                            <span className="inline-block w-0.5 h-4 ml-1 align-middle bg-emerald-400 animate-pulse" />
                        )}
                    </p>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2 py-4">
                        <Volume2 size={28} className="opacity-40" />
                        <p className="text-sm font-medium italic">
                            Start speaking… your words will appear here.
                        </p>
                    </div>
                )}
            </div>

            {/* Error */}
            {error && (
                <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium">
                    {error}
                </div>
            )}

            {/* Controls */}
            <div className="flex items-center gap-3">
                {/* Mic toggle */}
                <Button
                    type="button"
                    onClick={toggle}
                    className={`h-14 w-14 rounded-full flex items-center justify-center border-none transition-all duration-300 shrink-0 ${
                        isListening
                            ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-200 scale-110'
                            : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-200'
                    }`}
                >
                    {isListening ? <Volume2 className="animate-bounce" size={24} /> : <Mic size={24} />}
                </Button>

                {/* Discard */}
                <Button
                    type="button"
                    variant="outline"
                    onClick={handleDiscard}
                    className="flex-1 h-14 font-bold text-gray-600 border-gray-200 rounded-2xl hover:bg-white"
                >
                    <X size={16} className="mr-2" /> Discard
                </Button>

                {/* Confirm */}
                <Button
                    type="button"
                    onClick={handleConfirm}
                    disabled={!transcript.trim() && !interim.trim()}
                    className="flex-1 h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-200 disabled:opacity-40"
                >
                    <Sparkles size={16} className="mr-2" />
                    {onInsert ? 'Insert Text' : 'Create Ticket'}
                    <ArrowRight size={16} className="ml-2" />
                </Button>
            </div>
        </div>
    );

    /* ── render ───────────────────────────────────────── */
    if (embedded) return content;

    return (
        <div className="min-h-screen bg-[#f6f8f7] pb-20">
            <main className="pt-32 px-6">
                <div className="w-full max-w-2xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden p-8">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg">
                                    <Sparkles size={18} className="fill-emerald-600" />
                                </div>
                                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">
                                    Voice-to-Ticket
                                </span>
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">
                                Speak Your Issue
                            </h2>
                            <p className="text-base text-gray-500 mb-8">
                                Describe your problem using your voice. Our AI will transcribe it and create a support ticket automatically.
                            </p>
                            {content}
                        </div>
                    </motion.div>
                </div>
            </main>
        </div>
    );
};

export default VoiceToTicket;
