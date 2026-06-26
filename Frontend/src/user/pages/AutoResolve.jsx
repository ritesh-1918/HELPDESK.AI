import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, User, CheckCircle2, XCircle, Send, RefreshCcw, ShieldCheck } from 'lucide-react';
import useTicketStore from '../../store/ticketStore';

function AutoResolve() {
    const { aiTicket } = useTicketStore();
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [isThinking, setIsThinking] = useState(false);
    const [currentOptions, setCurrentOptions] = useState([]);
    const [isFinal, setIsFinal] = useState(false);
    const scrollRef = useRef(null);

    const fetchNextStep = async (history = []) => {
        setIsThinking(true);
        try {
            const response = await fetch('http://127.0.0.1:8000/ai/troubleshoot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: aiTicket.summary,
                    category: aiTicket.category,
                    history: history
                })
            });
            const data = await response.json();

            // Add bot message
            setMessages(prev => [...prev, { role: 'bot', text: data.step_text }]);
            setCurrentOptions(data.options || []);
            setIsFinal(data.is_final);
        } catch (error) {
            console.error("Troubleshooting Error:", error);
            setMessages(prev => [...prev, {
                role: 'bot',
                text: "I encountered an error connecting to the AI. Let's try basic troubleshooting first."
            }]);
            setCurrentOptions(["My internet is working", "I'm not sure"]);
        } finally {
            setIsThinking(false);
        }
    };

    useEffect(() => {
        if (!aiTicket) {
            navigate('/create-ticket');
            return;
        }

        // Initial fetch
        if (messages.length === 0) {
            fetchNextStep([]);
        }
     
    }, [aiTicket, navigate]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isThinking]);

    const handleUserChoice = (choice) => {
        const newUserMsg = { role: 'user', text: choice };
        const updatedHistory = [...messages, newUserMsg];
        setMessages(prev => [...prev, newUserMsg]);
        setCurrentOptions([]); // Clear options while thinking
        fetchNextStep(updatedHistory);
    };

    if (!aiTicket) return null;

    return (
        <main className="flex-1 flex flex-col h-[calc(100vh-64px)] overflow-hidden">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between shadow-sm shrink-0">
                <div className="flex items-center gap-3">
                    <div className="bg-emerald-100 p-2 rounded-lg">
                        <Bot className="w-5 h-5 text-emerald-700" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-gray-900 uppercase tracking-tight">Troubleshooting Assistant</h1>
                        <p className="text-xs text-gray-500 font-medium">Auto-Resolution for {aiTicket.summary}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">AI Guided Mode</span>
                </div>
            </div>

            {/* Chat Area */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scroll-smooth"
            >
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${msg.role === 'bot' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-400 border border-gray-100'
                                }`}>
                                {msg.role === 'bot' ? <Bot size={20} /> : <User size={20} />}
                            </div>
                            <div className={`p-4 rounded-2xl text-sm font-medium leading-relaxed shadow-sm ${msg.role === 'bot'
                                ? 'bg-white text-gray-700 rounded-tl-none border border-emerald-50'
                                : 'bg-emerald-900 text-white rounded-tr-none'
                                }`}>
                                {msg.text}
                            </div>
                        </div>
                    </div>
                ))}
                {isThinking && (
                    <div className="flex justify-start">
                        <div className="flex gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                                <Bot size={20} />
                            </div>
                            <div className="bg-white border border-emerald-50 p-4 rounded-2xl rounded-tl-none flex gap-1 items-center shadow-sm">
                                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce"></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer / Input */}
            <div className="bg-white border-t border-gray-100 p-6 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] shrink-0">
                <div className="max-w-4xl mx-auto">
                    {!isFinal ? (
                        <div className="flex flex-wrap gap-3 justify-center">
                            {currentOptions.map((option, idx) => (
                                <button
                                    key={idx}
                                    disabled={isThinking}
                                    onClick={() => handleUserChoice(option)}
                                    className="px-6 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:border-emerald-500 hover:text-emerald-700 hover:bg-emerald-50/50 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center gap-2 group"
                                >
                                    {option}
                                    <Send size={14} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                            <button
                                onClick={() => navigate('/resolved')}
                                className="w-full sm:w-auto px-8 py-4 bg-emerald-600 text-white font-black rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            >
                                <CheckCircle2 size={20} />
                                Yes, It Works
                            </button>
                            <button
                                onClick={() => navigate('/ticket-tracking')}
                                className="w-full sm:w-auto px-8 py-4 bg-gray-900 text-white font-black rounded-xl hover:bg-black shadow-lg shadow-gray-900/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            >
                                <XCircle size={20} />
                                Still Not Working
                            </button>
                            <button
                                onClick={() => window.location.reload()}
                                className="w-full sm:w-auto px-4 py-4 text-gray-400 hover:text-emerald-600 transition-colors"
                            >
                                <RefreshCcw size={20} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}

export default AutoResolve;
