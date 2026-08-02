/**
 * Live Chat Panel Component
 * 
 * Real-time chat interface for ticket conversations using WebSocket.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Loader2, AlertCircle, CheckCheck, User } from 'lucide-react';

const LiveChatPanel = ({ ticketId, token, currentUserId, currentUserName }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [error, setError] = useState(null);
  
  const wsRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttempts = useRef(0);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getWebSocketUrl = () => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = process.env.REACT_APP_API_URL 
      ? process.env.REACT_APP_API_URL.replace(/^https?:\/\//, '')
      : window.location.host;
    return `${protocol}//${host}/ws/chat/${ticketId}?token=${encodeURIComponent(token)}`;
  };

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      const wsUrl = getWebSocketUrl();
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('[Chat] Connected to ticket:', ticketId);
        setIsConnected(true);
        setError(null);
        reconnectAttempts.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          switch (message.type) {
            case 'chat_history':
              setMessages(message.messages || []);
              break;
            
            case 'chat_message':
              setMessages(prev => [...prev, {
                id: Date.now(),
                user_id: message.sender_id,
                user_name: message.sender_name,
                content: message.message,
                created_at: message.timestamp
              }]);
              
              // Remove from typing indicators
              setTypingUsers(prev => {
                const next = new Set(prev);
                next.delete(message.sender_id);
                return next;
              });
              break;
            
            case 'message_sent':
              // Message sent confirmation
              break;
            
            case 'user_typing':
              if (message.is_typing) {
                setTypingUsers(prev => new Set(prev).add(message.user_id));
                // Clear typing indicator after 3 seconds
                setTimeout(() => {
                  setTypingUsers(prev => {
                    const next = new Set(prev);
                    next.delete(message.user_id);
                    return next;
                  });
                }, 3000);
              } else {
                setTypingUsers(prev => {
                  const next = new Set(prev);
                  next.delete(message.user_id);
                  return next;
                });
              }
              break;
            
            default:
              console.log('[Chat] Unknown message type:', message.type);
          }
        } catch (err) {
          console.error('[Chat] Parse error:', err);
        }
      };

      ws.onerror = (error) => {
        console.error('[Chat] Error:', error);
        setError('Connection error occurred');
      };

      ws.onclose = (event) => {
        console.log('[Chat] Disconnected:', event.code, event.reason);
        setIsConnected(false);
        wsRef.current = null;

        // Attempt reconnection
        if (reconnectAttempts.current < 5) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 10000);
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current += 1;
            connect();
          }, delay);
        }
      };

      wsRef.current = ws;
    } catch (err) {
      console.error('[Chat] Connection error:', err);
      setError(err.message);
    }
  }, [ticketId, token]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect]);

  const sendMessage = () => {
    if (!inputMessage.trim() || !isConnected) return;

    const message = {
      type: 'message',
      content: inputMessage.trim(),
      timestamp: Date.now()
    };

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      
      // Optimistically add message to UI
      setMessages(prev => [...prev, {
        id: Date.now(),
        user_id: currentUserId,
        user_name: currentUserName,
        content: inputMessage.trim(),
        created_at: new Date().toISOString()
      }]);
      
      setInputMessage('');
      stopTyping();
    }
  };

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'typing', is_typing: true }));
      }
    }

    // Reset typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 3000);
  };

  const stopTyping = () => {
    if (isTyping) {
      setIsTyping(false);
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'typing', is_typing: false }));
      }
    }
  };

  const handleInputChange = (e) => {
    setInputMessage(e.target.value);
    handleTyping();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            Live Chat
          </span>
        </div>
        {!isConnected && (
          <span className="text-xs text-red-600 dark:text-red-400">
            Reconnecting...
          </span>
        )}
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
          <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.user_id === currentUserId;
            return (
              <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
                  <div className={`flex items-center space-x-2 mb-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    {!isOwn && <User className="w-4 h-4 text-gray-400" />}
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {msg.user_name}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {formatTime(msg.created_at)}
                    </span>
                  </div>
                  <div
                    className={`rounded-lg p-3 ${
                      isOwn
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
        
        {/* Typing Indicators */}
        {typingUsers.size > 0 && (
          <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm italic">Someone is typing...</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-end space-x-2">
          <textarea
            value={inputMessage}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            disabled={!isConnected}
            className="flex-1 resize-none rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
            rows={1}
          />
          <button
            onClick={sendMessage}
            disabled={!isConnected || !inputMessage.trim()}
            className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            title="Send message (Enter)"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Press Enter to send, Shift+Enter for new line
        </div>
      </div>
    </div>
  );
};

export default LiveChatPanel;
