import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
    Send, User, ShieldCheck, Bot, MessageSquare, Circle, Loader2, 
    Phone, Video, Mic, Smile, Paperclip, Play, Pause, X, Check, CheckCheck, MicOff, Volume2, Shield 
} from 'lucide-react';
import { supabase } from "../../lib/supabaseClient";
import useAuthStore from "../../store/authStore";

const TicketChat = ({ ticketId, currentUserRole = 'user' }) => {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [loading, setLoading] = useState(true);
// eslint-disable-next-line no-unused-vars
    const [unreadCount, setUnreadCount] = useState(0);
    const [isAtBottom, setIsAtBottom] = useState(true);

    const [isInternal, setIsInternal] = useState(false);
    const [isStaff, setIsStaff] = useState(false);

    // Simulated calling states
    const [activeCall, setActiveCall] = useState(null); // 'Audio' | 'Video' | null
    const [callDuration, setCallDuration] = useState(0);
    const [callStatus, setCallStatus] = useState('Ringing...'); // 'Ringing...' | 'Connected'
    const callTimerRef = useRef(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isSpeakerOn, setIsSpeakerOn] = useState(true);

    // Voice note simulation states
    const [isRecording, setIsRecording] = useState(false);
    const [recordDuration, setRecordDuration] = useState(0);
    const recordTimerRef = useRef(null);

    // Voice playback states
    const [playingVoiceId, setPlayingVoiceId] = useState(null);
    const [voiceProgress, setVoiceProgress] = useState({});
    const voicePlayTimerRef = useRef(null);

    const { user, profile } = useAuthStore();
    const messagesEndRef = useRef(null);
    const scrollContainerRef = useRef(null);
    const inputRef = useRef(null);
    const channelRef = useRef(null);

    // ─── Fetch Messages ──────────────────────────────────────────────────
    const fetchMessages = async () => {
        if (!ticketId) return;
        setLoading(true);
        try {
            // 1. Fetch Public Messages
            const { data: publicMsgs, error: pubErr } = await supabase
                .from('ticket_messages')
                .select('*')
                .eq('ticket_id', ticketId)
                .order('created_at', { ascending: true });

            if (pubErr) throw pubErr;

            // 2. Fetch Internal Notes if staff
            let internalMsgs = [];
            const userRole = profile?.role || 'user';
            const isStaffUser = ['admin', 'super_admin', 'agent', 'master_admin'].includes(userRole);
            setIsStaff(isStaffUser);

            if (isStaffUser) {
                const { data: privateMsgs, error: privErr } = await supabase
                    .from('internal_notes')
                    .select('*, profiles:agent_id(full_name)')
                    .eq('ticket_id', ticketId)
                    .order('created_at', { ascending: true });

                if (!privErr && privateMsgs) {
                    internalMsgs = privateMsgs.map(m => ({
                        ...m,
                        message: m.content,
                        sender_name: m.profiles?.full_name || 'Agent',
                        sender_role: 'admin',
                        is_internal: true
                    }));
                }
            }

            // 3. Combine and Sort
            const combined = [...(publicMsgs || []), ...internalMsgs].sort(
                (a, b) => new Date(a.created_at) - new Date(b.created_at)
            );

            setMessages(combined);
        } catch (err) {
            console.error("Error fetching messages:", err);
        } finally {
            setLoading(false);
            setTimeout(() => scrollToBottom(false), 50);
        }
    };

    // ─── Realtime Subscription ───────────────────────────────────────────
    useEffect(() => {
        fetchMessages();

        const channel = supabase.channel(`ticket_chat_${ticketId}`);
        channelRef.current = channel;

        // Subscribe to changes
        channel
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'ticket_messages',
                    filter: `ticket_id=eq.${ticketId}`
                },
                (payload) => {
                    const newMessage = payload.new;
                    setMessages((prev) => {
                        // Avoid duplicates if we already added it locally
                        if (prev.find(m => m.id === newMessage.id)) return prev;
                        // Remove optimistic duplicates based on content and time
                        const filtered = prev.filter(m => !(String(m.id).startsWith('temp-') && m.message === newMessage.message && m.sender_id === newMessage.sender_id));
                        return [...filtered, newMessage];
                    });

                    // Handle notification logic
                    if (newMessage.sender_id !== user?.id) {
                        if (!isAtBottom) {
                            setUnreadCount(prev => prev + 1);
                        } else {
                            setTimeout(() => scrollToBottom(), 50);
                        }
                    }
                }
            )
            .on(
                'broadcast',
                { event: 'typing' },
                (payload) => {
                    if (payload.payload.user_id !== user?.id) {
                        setIsTyping(true);
                        clearTimeout(window.typingTimeout);
                        window.typingTimeout = setTimeout(() => {
                            setIsTyping(false);
                        }, 3000);
                        setTimeout(() => scrollToBottom(), 50);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
            if (callTimerRef.current) clearInterval(callTimerRef.current);
            if (recordTimerRef.current) clearInterval(recordTimerRef.current);
            if (voicePlayTimerRef.current) clearInterval(voicePlayTimerRef.current);
        };
     
 
    }, [ticketId]);

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
        if (channelRef.current && e.target.value.trim().length > 0) {
            channelRef.current.send({
                type: 'broadcast',
                event: 'typing',
                payload: { user_id: user?.id }
            }).catch(() => { });
        }
    };

    // ─── Auto-scroll ─────────────────────────────────────────────────────
    const scrollToBottom = useCallback((smooth = true) => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({
                top: scrollContainerRef.current.scrollHeight,
                behavior: smooth ? 'smooth' : 'instant'
            });
        }
    }, []);

    const handleScroll = () => {
        const el = scrollContainerRef.current;
        if (!el) return;
        const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
        setIsAtBottom(atBottom);
        if (atBottom) setUnreadCount(0);
    };

    // ─── Send message ────────────────────────────────────────────────────
    const handleSend = async (e) => {
        e.preventDefault();
        if (!inputValue.trim() || !user) return;

        const content = inputValue.trim();
        const currentIsInternal = isInternal;

        // Optimistic UI update
        const tempMessage = {
            id: `temp-${Date.now()}`,
            ticket_id: ticketId,
            sender_id: user.id,
            sender_name: profile?.full_name || user.email,
            sender_role: profile?.role || 'user',
            message: content,
            is_internal: currentIsInternal,
            created_at: new Date().toISOString()
        };

        setMessages(prev => [...prev, tempMessage]);
        setInputValue('');
        setTimeout(() => scrollToBottom(), 50);

        try {
            if (currentIsInternal) {
                const { error } = await supabase
                    .from('internal_notes')
                    .insert([{
                        ticket_id: ticketId,
                        agent_id: user.id,
                        content: content
                    }]);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('ticket_messages')
                    .insert([{
                        ticket_id: ticketId,
                        sender_id: user.id,
                        sender_name: profile?.full_name || user.email,
                        sender_role: profile?.role || 'user',
                        message: content
                    }]);
                if (error) throw error;
            }
        } catch (err) {
            console.error("Error sending message:", err);
            setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
        }
    };

    // ─── Helpers ─────────────────────────────────────────────────────────
    const formatTime = (iso) => {
        try {
            return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch { return ''; }
    };

    const formatDate = (iso) => {
        try {
            const d = new Date(iso);
            const today = new Date();
            if (d.toDateString() === today.toDateString()) return 'Today';
            const yesterday = new Date(today);
            yesterday.setDate(today.getDate() - 1);
            if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
            return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
        } catch { return ''; }
    };

    // Voice note simulation helpers
    const startRecording = () => {
        setIsRecording(true);
        setRecordDuration(0);
        recordTimerRef.current = setInterval(() => {
            setRecordDuration(prev => prev + 1);
        }, 1000);
    };

    const stopRecording = async (shouldSave = true) => {
        setIsRecording(false);
        if (recordTimerRef.current) clearInterval(recordTimerRef.current);
        if (shouldSave && recordDuration > 0) {
            const durationStr = formatDuration(recordDuration);
            const content = `🎤 Voice message (${durationStr})`;
            const tempMessage = {
                id: `temp-${Date.now()}`,
                ticket_id: ticketId,
                sender_id: user.id,
                sender_name: profile?.full_name || user.email,
                sender_role: profile?.role || 'user',
                message: content,
                is_internal: false,
                created_at: new Date().toISOString()
            };

            setMessages(prev => [...prev, tempMessage]);
            setTimeout(() => scrollToBottom(), 50);

            try {
                const { error } = await supabase
                    .from('ticket_messages')
                    .insert([{
                        ticket_id: ticketId,
                        sender_id: user.id,
                        sender_name: profile?.full_name || user.email,
                        sender_role: profile?.role || 'user',
                        message: content
                    }]);
                if (error) throw error;
            } catch (err) {
                console.error("Error sending voice message:", err);
                setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
            }
        }
    };

    const playVoiceNote = (msgId, durationStr) => {
        if (playingVoiceId === msgId) {
            setPlayingVoiceId(null);
            if (voicePlayTimerRef.current) clearInterval(voicePlayTimerRef.current);
            return;
        }

        if (voicePlayTimerRef.current) clearInterval(voicePlayTimerRef.current);
        setPlayingVoiceId(msgId);

        const parts = durationStr.split(':');
        const totalSecs = parseInt(parts[0] || '0') * 60 + parseInt(parts[1] || '0');
        let currentSecs = voiceProgress[msgId] ? (voiceProgress[msgId] / 100) * totalSecs : 0;

        voicePlayTimerRef.current = setInterval(() => {
            currentSecs += 0.25;
            const percentage = Math.min((currentSecs / totalSecs) * 100, 100);
            
            setVoiceProgress(prev => ({
                ...prev,
                [msgId]: percentage
            }));

            if (percentage >= 100) {
                setPlayingVoiceId(null);
                clearInterval(voicePlayTimerRef.current);
                setVoiceProgress(prev => ({
                    ...prev,
                    [msgId]: 0
                }));
            }
        }, 250);
    };

    const handleCallPress = (type) => {
        setActiveCall(type);
        setCallStatus('Ringing...');
        setCallDuration(0);
        setIsMuted(false);
        setIsSpeakerOn(true);

        setTimeout(() => {
            setCallStatus('Connected');
            callTimerRef.current = setInterval(() => {
                setCallDuration(prev => prev + 1);
            }, 1000);
        }, 2000);
    };

    const endCall = () => {
        setActiveCall(null);
        if (callTimerRef.current) clearInterval(callTimerRef.current);
    };

    const formatDuration = (sec) => {
        const mins = Math.floor(sec / 60);
        const secs = sec % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const getTickColor = (msg) => {
        if (String(msg.id).startsWith('temp-')) return '#9ca3af'; // sending / unsaved
        // Double blue ticks if any admin/AI replied after this message
        const hasAdminReply = messages.some(
            m => m.created_at &&
                 new Date(m.created_at) > new Date(msg.created_at) &&
                 (m.sender_role === 'admin' || m.sender_role === 'super_admin' || m.sender_role === 'ai')
        );
        if (hasAdminReply) return '#38bdf8'; // WhatsApp active blue ticks!
        return '#9ca3af'; // Grey double-ticks!
    };

    const grouped = [];
    let lastDate = null;
    messages.forEach((msg) => {
        const date = formatDate(msg.created_at);
        if (date !== lastDate) {
            grouped.push({ type: 'divider', label: date });
            lastDate = date;
        }
        grouped.push({ type: 'message', data: msg });
    });

    return (
        <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #f0fdf4', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
            
            {/* Pulsing Dot Styles */}
            <style>{`
                @keyframes pulse {
                    0% { opacity: 0.3; }
                    50% { opacity: 1; }
                    100% { opacity: 0.3; }
                }
                .pulse-dot {
                    animation: pulse 1.2s infinite;
                }
            `}</style>

            {/* Header */}
            <div style={{ padding: '12px 20px', borderBottom: '1px solid #f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h2 style={{ fontSize: '11px', color: '#9ca3af', letterSpacing: '0.1em', fontWeight: 600, textTransform: 'uppercase', margin: 0 }}>
                        AI ASSISTANT
                    </h2>
                </div>

                <div className="flex items-center gap-4" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {isStaff && (
                        <div style={{ display: 'flex', alignItems: 'center', background: 'transparent', gap: '4px' }}>
                            <button
                                type="button"
                                onClick={() => setIsInternal(false)}
                                style={{ padding: '4px 12px', fontSize: '10px', fontWeight: 700, borderRadius: '8px', cursor: 'pointer', border: 'none', transition: 'all 0.2s', ...( !isInternal ? { background: '#0f1f12', color: '#ffffff' } : { background: 'transparent', color: '#6b7280' } ) }}
                            >
                                PUBLIC
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsInternal(true)}
                                style={{ padding: '4px 12px', fontSize: '10px', fontWeight: 700, borderRadius: '8px', cursor: 'pointer', border: 'none', transition: 'all 0.2s', ...( isInternal ? { background: '#0f1f12', color: '#ffffff' } : { background: 'transparent', color: '#6b7280' } ) }}
                            >
                                INTERNAL
                            </button>
                        </div>
                    )}

                    {/* WhatsApp Call Header Buttons */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                            type="button"
                            onClick={() => handleCallPress('Audio')}
                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px', color: '#374151' }}
                            className="hover:text-emerald-600 transition-colors"
                        >
                            <Phone size={18} />
                        </button>
                        <button
                            type="button"
                            onClick={() => handleCallPress('Video')}
                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px', color: '#374151' }}
                            className="hover:text-emerald-600 transition-colors"
                        >
                            <Video size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto px-5 py-4 space-y-1 bg-white"
            >
                {loading ? (
                    <div className="h-full flex flex-col items-center justify-center">
                        <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
                    </div>
                ) : grouped.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center py-16">
                        <Bot className="w-10 h-10 text-slate-200 mb-3" />
                        <p className="text-sm font-medium text-slate-400 italic">No messages yet.</p>
                    </div>
                ) : (
                    grouped.map((item, i) => {
                        if (item.type === 'divider') {
                            return (
                                <div key={`div-${i}`} className="flex items-center gap-3 py-2">
                                    <div className="flex-1 h-px bg-slate-100" />
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</span>
                                    <div className="flex-1 h-px bg-slate-100" />
                                </div>
                            );
                        }

                        const msg = item.data;
                        const isMe = msg.sender_id === user?.id;
                        const isAdmin = msg.sender_role === 'admin' || msg.sender_role === 'super_admin';
                        const isVoiceNote = msg.message && msg.message.startsWith('🎤 Voice message');
                        let voiceDuration = "0:00";
                        if (isVoiceNote) {
                            const match = msg.message.match(/\((.*?)\)/);
                            if (match) voiceDuration = match[1];
                        }

                        return (
                            <div key={msg.id || i} className={`flex gap-2.5 ${isMe ? 'justify-end' : 'justify-start'} group py-1`}>
                                {!isMe && (
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-auto mb-1 shadow-sm
                                        ${isAdmin ? 'bg-indigo-600' : 'bg-slate-200 border border-slate-300'}`}>
                                        {isAdmin ? <ShieldCheck size={13} className="text-white" /> : <User size={13} className="text-slate-500" />}
                                    </div>
                                )}

                                <div className={`max-w-[80%] flex flex-col gap-1 ${isMe ? 'items-end' : 'items-start'}`}>
                                    <div className={`flex items-center gap-2 px-1`}>
                                        <span className={`text-[9px] font-black uppercase tracking-widest ${msg.is_internal ? 'text-amber-600' : 'text-slate-400'}`}>
                                            {msg.is_internal ? '🔒 Internal Note' : (isMe ? 'You' : msg.sender_name || (isAdmin ? 'Support ' : 'User'))}
                                        </span>
                                        <span className="text-[8px] font-bold text-slate-300">
                                            {formatTime(msg.created_at)}
                                        </span>
                                        {isMe && (
                                            <span style={{ marginLeft: '4px' }}>
                                                {String(msg.id).startsWith('temp-') ? (
                                                    <Check size={11} className="text-slate-300" />
                                                ) : (
                                                    <CheckCheck size={11} style={{ color: getTickColor(msg) }} />
                                                )}
                                            </span>
                                        )}
                                    </div>

                                    <div style={{
                                        padding: '14px 18px', fontSize: '13px', lineHeight: 1.5,
                                        ...(!isMe && !msg.is_internal ? {
                                            background: '#f0fdf4', color: '#0f1f12', borderRadius: '14px', border: '1px solid #d1fae5'
                                        } : msg.is_internal ? {
                                            background: '#fef3c7', color: '#92400e', borderRadius: '14px', border: '1px solid #fde68a'
                                        } : {
                                            background: '#0f1f12', color: '#ffffff', borderRadius: '14px'
                                        })
                                    }}>
                                        {isVoiceNote ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '220px' }}>
                                                <button
                                                    type="button"
                                                    onClick={() => playVoiceNote(msg.id, voiceDuration)}
                                                    style={{ width: '32px', height: '32px', borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.15)', color: isMe ? '#ffffff' : '#0f1f12', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                                >
                                                    {playingVoiceId === msg.id ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" style={{ marginLeft: '2px' }} />}
                                                </button>
                                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                    {/* Waveform bars */}
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px', height: '18px' }}>
                                                        {[8, 14, 18, 10, 6, 12, 16, 10, 14, 20, 12, 8, 14, 18, 10, 8, 12, 6, 14, 8].map((barHeight, idx) => {
                                                            const barProgress = (idx / 20) * 100;
                                                            const isPlayed = (voiceProgress[msg.id] || 0) >= barProgress;
                                                            return (
                                                                <div
                                                                    key={idx}
                                                                    style={{
                                                                        width: '2px',
                                                                        borderRadius: '1px',
                                                                        height: `${barHeight}px`,
                                                                        background: isPlayed
                                                                            ? (isMe ? '#34d399' : '#0f1f12')
                                                                            : (isMe ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.15)')
                                                                    }}
                                                                />
                                                            );
                                                        })}
                                                    </div>
                                                    <span style={{ fontSize: '9px', fontWeight: 600, opacity: 0.8 }}>
                                                        {playingVoiceId === msg.id 
                                                            ? formatDuration(Math.round(((voiceProgress[msg.id] || 0) / 100) * (parseInt(voiceDuration.split(':')[0] || '0') * 60 + parseInt(voiceDuration.split(':')[1] || '0'))))
                                                            : voiceDuration
                                                        }
                                                    </span>
                                                </div>
                                            </div>
                                        ) : (
                                            msg.message
                                        )}
                                    </div>
                                </div>

                                {isMe && (
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-auto mb-1 shadow-sm
                                        ${isAdmin ? 'bg-indigo-600' : 'bg-emerald-100 border border-emerald-200'}`}>
                                        {isAdmin ? <ShieldCheck size={13} className="text-white" /> : <User size={13} className="text-emerald-700" />}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
                {isTyping && (
                    <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest italic py-1 px-2 animate-pulse">
                        <Loader2 className="w-3 h-3 animate-spin" /> Someone is typing...
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div style={{ padding: '16px 20px', borderTop: '1px solid #f0fdf4', background: '#ffffff' }}>
                {isRecording ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#f9fafb', border: '1.5px dashed #f87171', borderRadius: '12px', padding: '10px 16px', fontSize: '13px' }}>
                        <div className="pulse-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} />
                        <span style={{ flex: 1, color: '#ef4444', fontWeight: 700 }}>Recording {formatDuration(recordDuration)}</span>
                        <button
                            type="button"
                            onClick={() => stopRecording(false)}
                            style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '11px', fontWeight: 700 }}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={() => stopRecording(true)}
                            style={{ background: '#ef4444', border: 'none', color: '#ffffff', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                            <Send size={10} />
                            Send
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSend} className="flex gap-3">
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputValue}
                            onChange={handleInputChange}
                            placeholder="Type your message..."
                            style={{ flex: 1, background: '#f9fafb', border: '1.5px solid #e5e7eb', borderRadius: '12px', padding: '10px 16px', fontSize: '13px', outline: 'none' }}
                            className="focus:border-emerald-500 transition-colors"
                        />
                        <button
                            type="button"
                            onClick={startRecording}
                            style={{ padding: '10px', background: 'rgba(0,0,0,0.05)', color: '#374151', borderRadius: '10px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            className="active:scale-95 transition-transform"
                        >
                            <Mic size={16} />
                        </button>
                        <button
                            type="submit"
                            disabled={!inputValue.trim() || !user}
                            style={{ padding: '10px 20px', background: '#16a34a', color: '#ffffff', borderRadius: '10px', fontWeight: 600, fontSize: '12px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                            className="active:scale-95 transition-transform disabled:opacity-50"
                        >
                            {isInternal ? <ShieldCheck size={14} /> : <Send size={14} />}
                            <span className="hidden sm:inline">{isInternal ? 'Note' : 'Send'}</span>
                        </button>
                    </form>
                )}
            </div>

            {/* High-Fidelity Call Overlay Modal */}
            {activeCall && (
                <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, background: '#0b132b', color: '#ffffff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '40px 20px', zIndex: 99999 }}>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', opacity: 0.6 }}>
                        <Shield size={12} className="text-emerald-500" />
                        <span style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '0.1em' }}>SECURE END-TO-END ENCRYPTED</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
                        <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 900, boxShadow: '0 10px 25px rgba(22,163,74,0.3)' }}>
                            {(ticketId || 'A')[0].toUpperCase()}
                        </div>
                        <h3 style={{ fontSize: '20px', fontWeight: 800, margin: 0 }}>Support Desk Call</h3>
                        <span style={{ fontSize: '13px', opacity: 0.7 }}>
                            {callStatus === 'Connected' ? formatDuration(callDuration) : callStatus}
                        </span>
                    </div>

                    {/* Web Video call screen camera mock */}
                    {activeCall === 'Video' && (
                        <div style={{ width: '100%', height: '140px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ width: '40px', height: '60px', borderRadius: '8px', background: '#1d2d44', border: '1px solid rgba(255,255,255,0.1)', position: 'absolute', bottom: '12px', right: '12px' }} />
                            <span style={{ fontSize: '10px', opacity: 0.4 }}>Camera active stream</span>
                        </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px' }}>
                        <button
                            type="button"
                            onClick={() => setIsMuted(!isMuted)}
                            style={{ width: '48px', height: '48px', borderRadius: '50%', border: 'none', background: isMuted ? '#ffffff' : 'rgba(255,255,255,0.08)', color: isMuted ? '#0b132b' : '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                            {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
                        </button>
                        
                        <button
                            type="button"
                            onClick={endCall}
                            style={{ width: '48px', height: '48px', borderRadius: '50%', border: 'none', background: '#ef4444', color: '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                            <Phone size={18} style={{ transform: 'rotate(135deg)' }} />
                        </button>

                        <button
                            type="button"
                            onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                            style={{ width: '48px', height: '48px', borderRadius: '50%', border: 'none', background: isSpeakerOn ? '#ffffff' : 'rgba(255,255,255,0.08)', color: isSpeakerOn ? '#16a34a' : '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                            <Volume2 size={18} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TicketChat;
