import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MessageSquare, X, Send, Bot, User, Loader2 } from 'lucide-react';
import { API_CONFIG } from '../../config'; // Assuming a standard config file

/**
 * AIAssistant Widget
 * Provides a floating chat interface for AI assistance.
 * 
 * Includes proper cleanup of Server-Sent Events (SSE) / streaming fetch 
 * on unmount to prevent memory leaks as per Issue #2185.
 */
const AIAssistant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const abortControllerRef = useRef(null);

    // Auto-scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    // Cleanup hook for SSE streams on unmount (Resolves Issue #2185)
    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                console.log('[AIAssistant] Unmounting: Aborting active SSE stream to prevent memory leaks.');
                abortControllerRef.current.abort();
            }
        };
    }, []);

    const handleSend = async (e) => {
        e?.preventDefault();
        if (!input.trim()) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsTyping(true);

        // Abort any existing stream before starting a new one
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        const controller = new AbortController();
        abortControllerRef.current = controller;

        // Create a placeholder for the bot's streaming response
        setMessages(prev => [...prev, { role: 'bot', content: '' }]);

        try {
            // Initiate the streaming request (POST for AI query)
            const response = await fetch(`${API_CONFIG?.BACKEND_URL || 'http://localhost:8000'}/ai/analyze_stream`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'text/event-stream'
                },
                body: JSON.stringify({
                    query: userMessage,
                    history: messages
                }),
                signal: controller.signal
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.statusText}`);
            }

            // Read the stream
            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');
            let isDone = false;

            while (!isDone) {
                const { value, done } = await reader.read();
                isDone = done;

                if (value) {
                    const chunk = decoder.decode(value, { stream: true });
                    // Parse standard SSE format: data: {...}\n\n
                    const lines = chunk.split('\n');
                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const dataStr = line.slice(6).trim();
                            if (dataStr === '[DONE]') continue;
                            
                            try {
                                const data = JSON.parse(dataStr);
                                if (data.text) {
                                    setMessages(prev => {
                                        const newMsgs = [...prev];
                                        const lastMsg = newMsgs[newMsgs.length - 1];
                                        if (lastMsg.role === 'bot') {
                                            lastMsg.content += data.text;
                                        }
                                        return newMsgs;
                                    });
                                }
                            } catch (err) {
                                // Ignore incomplete chunks or non-JSON data
                                console.warn('Failed to parse SSE chunk:', dataStr);
                            }
                        } else if (line && !line.startsWith(':')) {
                            // Raw streaming chunk fallback if not properly formatted as SSE
                            try {
                                const data = JSON.parse(line);
                                if (data.text) {
                                    setMessages(prev => {
                                        const newMsgs = [...prev];
                                        const lastMsg = newMsgs[newMsgs.length - 1];
                                        if (lastMsg.role === 'bot') {
                                            lastMsg.content += data.text;
                                        }
                                        return newMsgs;
                                    });
                                }
                            } catch {
                                // Raw text append
                                setMessages(prev => {
                                    const newMsgs = [...prev];
                                    const lastMsg = newMsgs[newMsgs.length - 1];
                                    if (lastMsg.role === 'bot') {
                                        lastMsg.content += line;
                                    }
                                    return newMsgs;
                                });
                            }
                        }
                    }
                }
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                console.log('[AIAssistant] Stream aborted successfully.');
            } else {
                console.error('[AIAssistant] Stream error:', error);
                setMessages(prev => {
                    const newMsgs = [...prev];
                    const lastMsg = newMsgs[newMsgs.length - 1];
                    if (lastMsg.role === 'bot' && !lastMsg.content) {
                        lastMsg.content = 'Sorry, I encountered an error connecting to the server.';
                    }
                    return newMsgs;
                });
            }
        } finally {
            setIsTyping(false);
            abortControllerRef.current = null;
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Chat Window */}
            {isOpen && (
                <div className="absolute bottom-16 right-0 w-80 md:w-96 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 transform origin-bottom-right" style={{ height: '500px' }}>
                    
                    {/* Header */}
                    <div className="bg-indigo-600 p-4 flex justify-between items-center text-white">
                        <div className="flex items-center space-x-2">
                            <Bot size={20} />
                            <h3 className="font-semibold text-sm">AI Support Assistant</h3>
                        </div>
                        <button 
                            onClick={() => setIsOpen(false)}
                            className="text-white hover:text-gray-200 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 p-4 overflow-y-auto bg-gray-800 space-y-4">
                        {messages.length === 0 ? (
                            <div className="text-center text-gray-400 mt-10 text-sm">
                                <Bot size={40} className="mx-auto mb-3 opacity-50" />
                                <p>Hi! How can I help you today?</p>
                            </div>
                        ) : (
                            messages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] rounded-lg p-3 text-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-gray-700 text-gray-200 rounded-bl-none'}`}>
                                        <div className="flex items-center space-x-2 mb-1 opacity-70">
                                            {msg.role === 'user' ? <User size={12} /> : <Bot size={12} />}
                                            <span className="text-xs uppercase">{msg.role}</span>
                                        </div>
                                        <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                    </div>
                                </div>
                            ))
                        )}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-gray-700 rounded-lg p-3 rounded-bl-none">
                                    <Loader2 size={16} className="text-indigo-400 animate-spin" />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSend} className="p-3 bg-gray-900 border-t border-gray-700 flex items-center space-x-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type your message..."
                            className="flex-1 bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || isTyping}
                            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-colors"
                        >
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            )}

            {/* Floating Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-4 shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center justify-center ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
            >
                <MessageSquare size={24} />
            </button>
        </div>
    );
};

export default AIAssistant;
