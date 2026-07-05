import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Bot, User, CheckCircle2, XCircle, Send, RefreshCcw,
    ShieldCheck, FileText, BotIcon, Zap, ImageIcon,
    ChevronRight, ArrowLeft, Mic, MicOff, Paperclip,
    Plus, Search, ListChecks, ArrowUpRight, Loader2,
    LifeBuoy
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import useTicketStore from '../../store/ticketStore';
import { Card, CardContent } from "../../components/ui/card";
import { askAI } from '../../services/aiAssistant';
import useToastStore from '../../store/toastStore';

const AutoResolveChat = () => {
    const { aiTicket } = useTicketStore();
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [isThinking, setIsThinking] = useState(false);
    const [isFinal, setIsFinal] = useState(false);
    const [inputText, setInputText] = useState('');
    const [isListening, setIsListening] = useState(false);
    const { showToast } = useToastStore();
    const scrollRef = useRef(null);
    const fileInputRef = useRef(null);

    // Initial Plan Generation
    useEffect(() => {
        if (!aiTicket) {
            navigate('/create-ticket');
            return;
        }

        // Update status for timeline sync
        if (aiTicket.status !== 'auto_resolve') {
            useTicketStore.getState().setAITicket({ ...aiTicket, status: 'auto_resolve' });
        }

        const generateInitialPlan = async () => {
            setIsThinking(true);
            try {
                const prompt = `Based on the incident report, generate a 4-step troubleshooting plan. 
                Focus on high-level actions. Format clearly with numbered steps 1-4.`;

                const response = await askAI(prompt, aiTicket, []);

                const lines = response.split('\n');
                const newSteps = [];
                let id = 1;

                for (const line of lines) {
                    if (id > 4) break;
                    const trimmed = line.trim();
                    if (!trimmed || trimmed.length < 5) continue;

                    const cleaned = trimmed
                        .replace(/^\*{1,2}/, '')
                        .replace(/\*{1,2}$/, '')
                        .replace(/^#{1,3}\s*/, '')
                        .replace(/^[\d]+[.)]\s*/, '')
                        .replace(/^[-*•]\s*/, '')
                        .replace(/^Step\s*\d+[:.)]\s*/i, '')
                        .trim();

                    const isStep = /^\d+[.)]\s/.test(trimmed)
                        || /^[-*•]\s/.test(trimmed)
                        || /^\*{1,2}\d/.test(trimmed)
                        || /^#{1,3}\s/.test(trimmed)
                        || /^Step\s*\d/i.test(trimmed);

                    if (isStep && cleaned.length > 5) {
                        newSteps.push({ id: id++, task: cleaned, completed: false });
                    }
                }

                if (newSteps.length >= 2) {
                    // Steps parsed successfully; welcome message sent below
                } else {
                    const sentences = response
                        .replace(/\*\*/g, '')
                        .split(/[.\n]/)
                        .map(s => s.trim())
                        .filter(s => s.length > 15)
                        .slice(0, 4);

                    if (sentences.length >= 2) {
                        // Plan parsed but not rendered; welcome message sent below
                    } else {
                        throw new Error("Could not parse steps from AI response.");
                    }
                }

                const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                setMessages([{
                    role: 'bot',
                    text: `Hello! I've analyzed your request: "${aiTicket.summary}". I've put together a 4-step troubleshooting plan to resolve this. How would you like to start?`,
                    timestamp: now
                }]);

            } catch (error) {
                console.error("AI Plan Generation Failed:", error);

                const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                setMessages([{
                    role: 'bot',
                    text: `I've analyzed your request. I've prepared a standard troubleshooting plan for "${aiTicket.summary}". Let's start with the first step.`,
                    timestamp: now
                }]);
            } finally {
                setIsThinking(false);
            }
        };

        if (messages.length === 0) {
            generateInitialPlan();
        }
    }, [aiTicket, navigate, messages.length]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isThinking]);

    const handleSendMessage = async (textOverride, imageOverride = null) => {
        const text = textOverride || inputText;
        if (!text.trim() && !imageOverride) return;

        const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const newUserMsg = {
            role: 'user',
            text: text,
            image: imageOverride,
            timestamp: now
        };

        setMessages(prev => [...prev, newUserMsg]);
        setInputText('');
        setIsThinking(true);

        try {
            const aiResponse = await askAI(text || "Sent an image for analysis", aiTicket, messages, imageOverride);
            const botNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            setMessages(prev => [...prev, { role: 'bot', text: aiResponse, timestamp: botNow }]);

            const lowerResponse = String(aiResponse || '').toLowerCase();
            if (lowerResponse.includes("resolved") || lowerResponse.includes("successfully")) {
                setIsFinal(true);
            }

        } catch (error) {
            console.error("Troubleshooting Error:", error);
            const botNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            setMessages(prev => [...prev, {
                role: 'bot',
                text: "I'm having a bit of trouble concentrating. Could you try sending that again?",
                timestamp: botNow
            }]);
        } finally {
            setIsThinking(false);
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                handleSendMessage("I've uploaded a screenshot for you to check.", reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const toggleMic = () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            showToast('Voice interface unavailable: Browser lacks speech protocols.', 'warning');
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => setIsListening(true);
        recognition.onresult = (event) => setInputText(event.results[0][0].transcript);
        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);

        if (isListening) recognition.stop();
        else recognition.start();
    };

    if (!aiTicket) return null;

    return (
        <div className="relative min-h-screen pt-24 pb-12 px-6 overflow-hidden">
            {/* ─── Premium Palette Background ─── */}
            <div className="fixed inset-0 -z-10 bg-[#f8faf9]">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-100/40 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-teal-50/50 rounded-full blur-[120px] [animation-delay:2s] animate-pulse"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30%] h-[30%] bg-indigo-50/30 rounded-full blur-[100px] [animation-delay:4s] animate-pulse"></div>
            </div>

            <div className="max-w-4xl mx-auto relative">
                {/* ─── Glassmorphic Chat Container ─── */}
                <Card className="rounded-[2.5rem] border border-white/20 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] bg-white/70 backdrop-blur-3xl flex flex-col h-[820px] overflow-hidden transition-all duration-500 hover:shadow-[0_48px_80px_-20px_rgba(0,0,0,0.12)]">

                    {/* Header */}
                    <div className="px-10 py-7 border-b border-white/40 bg-white/40 flex items-center justify-between backdrop-blur-md">
                        <div className="flex items-center gap-5">
                            <motion.div
                                initial={{ rotate: -10, scale: 0.9 }}
                                animate={{ rotate: 3, scale: 1 }}
                                transition={{ type: "spring", stiffness: 200 }}
                                className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 shrink-0"
                            >
                                <BotIcon size={28} />
                            </motion.div>
                            <div>
                                <h2 className="text-xl font-black text-slate-900 leading-tight tracking-tight uppercase italic">
                                    Assistant // AI
                                </h2>
                                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] flex items-center gap-1.5 mt-0.5">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                    </span>
                                    Neural Connection Active
                                </p>
                            </div>
                        </div>

                        {/* "Escalate Anyway" Integrated Option */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => navigate('/ticket-tracking')}
                                className="group px-6 py-2.5 bg-slate-900/5 hover:bg-slate-900 text-slate-600 hover:text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all duration-300 flex items-center gap-2 border border-slate-200/50 hover:border-slate-900"
                            >
                                <LifeBuoy size={14} className="group-hover:rotate-12 transition-transform" />
                                Escalate Anyway
                            </button>
                        </div>
                    </div>

                    {/* Chat Messages */}
                    <div
                        ref={scrollRef}
                        className="flex-1 overflow-y-auto px-10 py-8 space-y-10 scroll-smooth"
                    >
                        <AnimatePresence>
                            {messages.map((msg, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 15, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                                >
                                    <div className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                        <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center shadow-sm mt-1 
                                            ${msg.role === 'bot' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-800 text-white'}`}>
                                            {msg.role === 'bot' ? <BotIcon size={14} /> : <User size={14} />}
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <div className={`p-6 rounded-[1.75rem] text-sm font-semibold leading-relaxed shadow-sm transition-all
                                                ${msg.role === 'bot'
                                                    ? 'bg-white text-slate-700 rounded-tl-sm border border-slate-100'
                                                    : 'bg-emerald-600 text-white rounded-tr-sm shadow-lg shadow-emerald-500/10'
                                                }`}>
                                                {msg.image && (
                                                    <div className="mb-4 rounded-xl overflow-hidden border border-white/20 shadow-lg">
                                                        <img src={msg.image} alt="User upload" className="max-w-full h-auto" />
                                                    </div>
                                                )}
                                                {msg.role === 'bot' ? (
                                                    <ReactMarkdown
                                                        remarkPlugins={[remarkGfm]}
                                                        components={{
                                                            ul: ({ ...props }) => <ul className="list-disc ml-4 space-y-2 mb-3" {...props} />,
                                                            ol: ({ ...props }) => <ol className="list-decimal ml-4 space-y-2 mb-3" {...props} />,
                                                            li: ({ ...props }) => <li className="mb-1" {...props} />,
                                                            h1: ({ ...props }) => <h1 className="text-lg font-black mb-3 mt-3 text-slate-900 tracking-tight" {...props} />,
                                                            h2: ({ ...props }) => <h2 className="text-base font-black mb-3 mt-2 uppercase tracking-widest text-slate-800 text-[10px]" {...props} />,
                                                            p: ({ ...props }) => <p className="mb-3 last:mb-0" {...props} />,
                                                            code: ({ inline, ...props }) => (
                                                                inline
                                                                    ? <code className="bg-emerald-50 px-1.5 py-0.5 rounded font-mono text-[12px] font-bold text-emerald-600" {...props} />
                                                                    : <code className="block bg-slate-900 text-slate-100 p-5 rounded-2xl font-mono text-[12px] mb-4 border border-slate-800 shadow-xl overflow-x-auto" {...props} />
                                                            ),
                                                            strong: ({ ...props }) => <strong className="font-black text-slate-900" {...props} />
                                                        }}
                                                    >
                                                        {msg.text}
                                                    </ReactMarkdown>
                                                ) : (
                                                    msg.text
                                                )}
                                            </div>
                                            <span className={`text-[9px] font-black text-slate-400 uppercase tracking-widest ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                                                {msg.timestamp}
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {isThinking && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex justify-start items-center gap-3 pl-12"
                            >
                                <div className="bg-white border border-slate-100 px-6 py-4 rounded-[1.5rem] rounded-tl-sm flex gap-1.5 items-center shadow-sm">
                                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce"></span>
                                </div>
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Processing...</span>
                            </motion.div>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="p-8 pb-10 border-t border-white/40 bg-white/40 backdrop-blur-md">
                        <div className="max-w-3xl mx-auto space-y-6">
                            {isFinal && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex flex-col items-center gap-5 pb-2 cursor-pointer"
                                >
                                    <div className="flex items-center gap-3 px-4 py-1.5 bg-emerald-50 rounded-full border border-emerald-100">
                                        <CheckCircle2 size={14} className="text-emerald-500" />
                                        <p className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.2em]">Goal Satisfied?</p>
                                    </div>
                                    <div className="flex flex-wrap gap-4 justify-center">
                                        <button
                                            onClick={() => navigate('/resolved')}
                                            className="group px-8 py-3.5 bg-emerald-600 text-white font-black text-[11px] uppercase tracking-[0.15em] rounded-2xl shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 hover:shadow-emerald-500/30 active:scale-95 transition-all flex items-center gap-3"
                                        >
                                            <ShieldCheck size={18} className="group-hover:scale-110 transition-transform" />
                                            Confirm Resolution
                                        </button>
                                        <button
                                            onClick={() => navigate('/ticket-tracking')}
                                            className="group px-8 py-3.5 bg-slate-900 text-white font-black text-[11px] uppercase tracking-[0.15em] rounded-2xl shadow-xl shadow-slate-900/20 hover:bg-black hover:shadow-slate-900/30 active:scale-95 transition-all flex items-center gap-3"
                                        >
                                            <LifeBuoy size={18} className="group-hover:scale-110 transition-transform" />
                                            Human Liaison Required
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {/* Floating Interaction Pill */}
                            <div className="relative">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 blur-2xl opacity-0 group-within:opacity-20 transition-opacity duration-1000" />
                                <div className="relative flex items-center gap-3 bg-white/60 border border-white rounded-[2.5rem] p-2 pr-3 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] focus-within:bg-white focus-within:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.08)] transition-all duration-500 backdrop-blur-xl">
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-12 h-12 rounded-full flex items-center justify-center text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-all duration-300"
                                    >
                                        <Paperclip size={20} />
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleFileUpload}
                                        />
                                    </button>
                                    <input
                                        type="text"
                                        value={inputText}
                                        onChange={(e) => setInputText(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                        placeholder="Briefly describe what's happening..."
                                        className="flex-1 bg-transparent border-none focus:ring-0 text-[15px] font-bold text-slate-700 placeholder:text-slate-400/80 px-2"
                                    />
                                    <div className="flex items-center gap-1.5 pr-1">
                                        <button
                                            onClick={toggleMic}
                                            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500
                                                ${isListening
                                                    ? 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)] animate-pulse scale-110'
                                                    : 'bg-white border border-slate-200 text-slate-400 hover:text-emerald-500 hover:border-emerald-200 shadow-sm'}`}
                                        >
                                            <Mic size={24} />
                                        </button>
                                        <button
                                            onClick={() => handleSendMessage()}
                                            disabled={!inputText.trim()}
                                            className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center text-white shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 hover:rotate-6 active:scale-95 disabled:opacity-30 disabled:grayscale transition-all duration-300"
                                        >
                                            <Send size={18} className="translate-x-0.5 -translate-y-0.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Assistant Footer Prompt */}
                            {!isFinal && (
                                <div className="text-center px-4">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] opacity-60">
                                        Our AI is learning from your input to provide the most helpful response.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default AutoResolveChat;
