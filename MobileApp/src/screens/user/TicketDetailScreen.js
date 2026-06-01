import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet, View, Text, TextInput, TouchableOpacity,
  FlatList, KeyboardAvoidingView, Platform, ActivityIndicator,
  StatusBar, Alert, Modal, Image, ScrollView, Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { COLORS, SHADOWS } from '../../styles/theme';
import { 
  ArrowLeft, Send, User, Bot, Mic, Phone, Video, 
  Info, Smile, Paperclip, X, CheckCheck, Shield, Sparkles, 
  Globe, Hash, Calendar, Star, Play, Pause, Check, Volume2, MicOff, CameraOff
} from 'lucide-react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

const SUGGESTIONS = {
  Software: ['Request escalation to L2', 'Reset work password', 'MFA verified, thank you!', 'Resolved, please close.'],
  Hardware: ['Order delivery check', 'Report physical damage', 'Schedule diagnostic', 'Resolved!'],
  Network: ['Latency test ping', 'Reset VPN credentials', 'Firewall bypass request', 'Resolved, thanks!'],
  Access: ['Update AD permissions', 'MFA code override key', 'Access verified successfully', 'Resolved!'],
  Default: ['Urgent escalation target', 'Verify SLA breach timer', 'AI suggested resolutions', 'Resolved, thank you!']
};

const TicketDetailScreen = ({ route }) => {
  const { ticketId } = route.params || {};
  const navigation = useNavigation();
  const flatListRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [ticket, setTicket] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // Simulated call state
  const [activeCall, setActiveCall] = useState(null); // 'Audio' | 'Video' | null
  const [callDuration, setCallDuration] = useState(0);
  const [callStatus, setCallStatus] = useState('Ringing...'); // 'Ringing...' | 'Connected'
  const callTimerRef = useRef(null);

  // Voice recording simulation state
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const recordTimerRef = useRef(null);

  // Dialog and emoji reactions state
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [reactions, setReactions] = useState({});
  const [selectedMessageId, setSelectedMessageId] = useState(null);

  // Call options state
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isCameraOff, setIsCameraOff] = useState(false);

  // Voice playback simulation state
  const [playingVoiceId, setPlayingVoiceId] = useState(null);
  const [voiceProgress, setVoiceProgress] = useState({});
  const voicePlayTimerRef = useRef(null);

  // Pulse animation for recording dot
  const pulseAnim = useRef(new Animated.Value(1)).current;
  // Recording pulse animation loop
  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.3,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording]);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      const initialize = async () => {
        try {
          if (isMounted) setLoading(true);
          const { data: { user } } = await supabase.auth.getUser();
          if (isMounted) setCurrentUser(user);
          
          await Promise.all([
            fetchTicketDetails(),
            fetchMessages()
          ]);
        } catch (err) {
          console.error("Initialization error:", err);
        } finally {
          if (isMounted) setLoading(false);
        }
      };

      initialize();

      // Set up real-time subscription for messages
      const channel = supabase
        .channel(`ticket_messages_user:${ticketId}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'ticket_messages',
          filter: `ticket_id=eq.${ticketId}`
        }, (payload) => {
          setMessages(prev => {
            if (prev.some(m => m.id === payload.new.id)) return prev;
            return [...prev, payload.new];
          });
          setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 150);
        })
        .subscribe();

      return () => {
        isMounted = false;
        supabase.removeChannel(channel);
        if (callTimerRef.current) clearInterval(callTimerRef.current);
        if (recordTimerRef.current) clearInterval(recordTimerRef.current);
        if (voicePlayTimerRef.current) clearInterval(voicePlayTimerRef.current);
      };
    }, [ticketId])
  );
  const fetchTicketDetails = async () => {
    const { data, error } = await supabase
      .from('tickets')
      .select(`
        *,
        assignee:profiles!tickets_assigned_agent_id_fkey(full_name, email, profile_picture)
      `)
      .eq('id', ticketId)
      .single();
    
    if (!error) {
      setTicket(data);
    } else {
      // Fallback
      const { data: fallbackData } = await supabase
        .from('tickets')
        .select('*')
        .eq('id', ticketId)
        .single();
      setTicket(fallbackData);
    }
  };

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('ticket_messages')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (textToSend = null) => {
    const messageContent = (textToSend || newMessage).trim();
    if (!messageContent) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!textToSend) setNewMessage('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
      
      const { error } = await supabase
        .from('ticket_messages')
        .insert({
          ticket_id: ticketId,
          sender_id: user.id,
          sender_name: profile?.full_name || 'User',
          message: messageContent,
          sender_role: 'user'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleMicPress = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      "Voice Telemetry Stream",
      "Corporate voice message routing is online. Do you want to initialize the voice note recorder?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Record Mock", 
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            sendMessage("🎤 [Voice telemetry note recorded and routed successfully]");
          } 
        }
      ]
    );
  };

  // Dynamic active grey-to-blue checkmark ticks color resolver
  const getTickColor = (msg) => {
    if (!msg.created_at) return "#9ca3af"; // local / unsaved
    
    // A message gets blue ticks if:
    // 1. There is an admin or AI reply sent AFTER this message.
    const hasAdminReply = messages.some(
      m => m.created_at && 
           new Date(m.created_at) > new Date(msg.created_at) && 
           (m.sender_role === 'admin' || m.sender_role === 'ai')
    );
    
    // 2. The ticket is marked as resolved or closed.
    const isCompleted = ticket?.status === 'resolved' || ticket?.status === 'closed';
    
    if (hasAdminReply || isCompleted) {
      return "#38bdf8"; // WhatsApp Blue tick!
    }
    return "#8e8e93"; // WhatsApp Grey double-ticks!
  };

  const playVoiceNote = (msgId, durationStr) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setActiveCall(type);
    setCallStatus('Ringing...');
    setCallDuration(0);
    setIsMuted(false);
    setIsCameraOff(false);
    setIsSpeakerOn(true);

    // Simulate connection after 2 seconds
    setTimeout(() => {
      setCallStatus('Connected');
      callTimerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }, 2000);
  };

  const endCall = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setActiveCall(null);
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
    }
  };

  const startRecording = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsRecording(true);
    setRecordDuration(0);
    recordTimerRef.current = setInterval(() => {
      setRecordDuration(prev => prev + 1);
    }, 1000);
  };

  const stopRecording = (shouldSave = true) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsRecording(false);
    if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current);
    }
    if (shouldSave && recordDuration > 0) {
      sendMessage(`🎤 Voice message (${formatDuration(recordDuration)})`);
    }
  };

  const formatDuration = (sec) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleReactionPress = (msgId, emoji) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setReactions(prev => ({
      ...prev,
      [msgId]: prev[msgId] === emoji ? null : emoji
    }));
    setSelectedMessageId(null);
  };

  // Group messages dynamically by Date Separator Bars (TODAY / YESTERDAY / Date)
  const getGroupedMessages = useCallback(() => {
    const grouped = [];
    let lastDateStr = null;

    messages.forEach((msg) => {
      if (!msg.created_at) return;
      const date = new Date(msg.created_at);
      const dateStr = date.toDateString();

      if (dateStr !== lastDateStr) {
        let label = date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        if (dateStr === today) {
          label = 'TODAY';
        } else if (dateStr === yesterday) {
          label = 'YESTERDAY';
        }
        grouped.push({ id: `date-${dateStr}`, isDateSeparator: true, text: label });
        lastDateStr = dateStr;
      }
      grouped.push(msg);
    });

    return grouped;
  }, [messages]);

  const renderMessage = ({ item }) => {
    if (item.isDateSeparator) {
      return (
        <View style={styles.dateSeparator}>
          <View style={styles.dateSeparatorLine} />
          <View style={styles.dateSeparatorBadge}>
            <Text style={styles.dateSeparatorText}>{item.text}</Text>
          </View>
          <View style={styles.dateSeparatorLine} />
        </View>
      );
    }

    const isUser = item.sender_role === 'user';
    const isAI = item.sender_role === 'ai' || item.sender_id === '00000000-0000-0000-0000-000000000000';
    const messageReaction = reactions[item.id];
    const isOverlayActive = selectedMessageId === item.id;

    return (
      <View style={styles.bubbleRow}>
        <TouchableOpacity
          onLongPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setSelectedMessageId(item.id);
          }}
          onPress={() => {
            if (selectedMessageId) setSelectedMessageId(null);
          }}
          activeOpacity={0.9}
          style={[
            styles.messageBubble,
            isUser ? styles.userBubble : styles.adminBubble,
            isAI && styles.aiBubble,
            messageReaction && { marginBottom: 24 } // Extra spacing for reactions
          ]}
        >
          {/* Bubble Tail */}
          <View style={[styles.bubbleTail, isUser ? styles.userBubbleTail : styles.adminBubbleTail]} />

          {!isUser && (
            <View style={styles.senderHeader}>
              {isAI ? <Bot size={13} color="#8b5cf6" /> : <User size={13} color={COLORS.textLight} />}
              <Text style={[styles.senderName, isAI && { color: '#8b5cf6' }]}>
                {isAI ? 'AI Assistant' : item.sender_name || 'Support'}
              </Text>
            </View>
          )}

          {(() => {
            const isVoiceNote = item.message && item.message.startsWith('🎤 Voice message');
            let voiceDuration = "0:00";
            if (isVoiceNote) {
              const match = item.message.match(/\((.*?)\)/);
              if (match) voiceDuration = match[1];
            }
            if (isVoiceNote) {
              return (
                <View style={styles.voiceNoteContainer}>
                  <TouchableOpacity
                    onPress={() => playVoiceNote(item.id, voiceDuration)}
                    style={styles.voicePlayBtn}
                  >
                    {playingVoiceId === item.id ? (
                      <Pause size={16} color={isUser ? '#075e54' : COLORS.primary} fill={isUser ? '#075e54' : COLORS.primary} />
                    ) : (
                      <Play size={16} color={isUser ? '#075e54' : COLORS.primary} fill={isUser ? '#075e54' : COLORS.primary} />
                    )}
                  </TouchableOpacity>
                  
                  <View style={styles.voiceWaveContainer}>
                    <View style={styles.voiceWaveform}>
                      {[8, 14, 18, 10, 6, 12, 20, 14, 10, 16, 22, 12, 8, 14, 18, 10, 6, 12, 16, 8].map((barHeight, idx) => {
                        const barProgress = (idx / 20) * 100;
                        const isPlayed = (voiceProgress[item.id] || 0) >= barProgress;
                        return (
                          <View
                            key={idx}
                            style={[
                              styles.voiceWaveBar,
                              { 
                                height: barHeight, 
                                backgroundColor: isPlayed 
                                  ? (isUser ? '#075e54' : COLORS.primary) 
                                  : (isUser ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.1)') 
                              }
                            ]}
                          />
                        );
                      })}
                    </View>
                    <View style={styles.voiceProgressTextRow}>
                      <Text style={styles.voiceDurationText}>
                        {playingVoiceId === item.id 
                          ? formatDuration(Math.round(((voiceProgress[item.id] || 0) / 100) * (parseInt(voiceDuration.split(':')[0] || '0') * 60 + parseInt(voiceDuration.split(':')[1] || '0'))))
                          : voiceDuration
                        }
                      </Text>
                    </View>
                  </View>
                </View>
              );
            }
            return (
              <Text style={[styles.messageText, isUser && styles.userMessageText]}>
                {item.message}
              </Text>
            );
          })()}

          <View style={styles.bubbleFooter}>
            <Text style={[styles.messageTime, isUser && styles.userTimeText]}>
              {item.created_at 
                ? new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }
            </Text>
            {isUser && (
              item.created_at ? (
                <CheckCheck size={14} color={getTickColor(item)} style={{ marginLeft: 4 }} />
              ) : (
                <Check size={14} color="#9ca3af" style={{ marginLeft: 4 }} />
              )
            )}
          </View>

          {/* Floating Emoji Badge */}
          {messageReaction && (
            <View style={[styles.reactionBadge, isUser ? styles.userReaction : styles.adminReaction]}>
              <Text style={styles.reactionText}>{messageReaction}</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Instagram style popover emoji bar */}
        {isOverlayActive && (
          <View style={[styles.reactionOverlay, isUser ? styles.alignRightOverlay : styles.alignLeftOverlay]}>
            {['❤️', '👍', '😂', '😮', '😢', '🙏'].map(emoji => (
              <TouchableOpacity 
                key={emoji} 
                style={styles.reactionOption}
                onPress={() => handleReactionPress(item.id, emoji)}
              >
                <Text style={styles.reactionOptionText}>{emoji}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={() => setSelectedMessageId(null)} style={styles.closeOverlayBtn}>
              <X size={14} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const activeCategory = ticket?.category || 'Default';
  const sugList = SUGGESTIONS[activeCategory] || SUGGESTIONS.Default;
  const isUserTyping = newMessage.trim().length > 0;
  const assigneeName = ticket?.assignee?.full_name || 'AI Helpdesk Support';

  const getStatusColor = (status) => {
    const s = (status || '').toLowerCase().trim();
    if (s === 'open') return '#3b82f6';
    if (s === 'in progress' || s === 'in_progress') return '#f59e0b';
    if (s === 'resolved') return '#10b981';
    if (s === 'closed') return '#6b7280';
    return '#ef4444'; // critical or default
  };
  const statusColor = getStatusColor(ticket?.status);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" />

      {/* Header (WhatsApp Profile Action bar style) */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color={COLORS.text} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.headerInfoTouch}
          onPress={() => setShowInfoModal(true)}
          activeOpacity={0.7}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{assigneeName[0].toUpperCase()}</Text>
          </View>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {assigneeName}
            </Text>
            <View style={styles.statusRow}>
              <View style={styles.pulseDot} />
              <Text style={styles.statusText}>active sync</Text>
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => handleCallPress('Audio')} style={styles.headerActionBtn}>
            <Phone size={20} color={COLORS.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleCallPress('Video')} style={styles.headerActionBtn}>
            <Video size={20} color={COLORS.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowInfoModal(true)} style={styles.headerActionBtn}>
            <Info size={20} color={COLORS.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* WhatsApp Wallpaper container */}
      <View style={styles.wallpaperBg}>
        {/* Subtle grid elements mock doodle wallpaper */}
        <View style={styles.gridOverlay} />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 80}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={getGroupedMessages()}
              keyExtractor={(item) => item.id}
              renderItem={renderMessage}
              contentContainerStyle={styles.messagesList}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>Conversation initiated. Send a security report or resolution inquiry.</Text>
                </View>
              }
            />
          )}

          {/* Quick suggestions scroll pills */}
          {!loading && sugList.length > 0 && (
            <View style={styles.suggestionsContainer}>
              <FlatList
                data={sugList}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.suggestionsScroll}
                keyExtractor={(item, index) => String(index)}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.suggestionPill}
                    onPress={() => sendMessage(item)}
                  >
                    <Text style={styles.suggestionText}>{item}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}

          {/* Input container footer */}
          <View style={styles.inputContainer}>
            {isRecording ? (
              <View style={styles.recordingCard}>
                <Animated.View style={[styles.pulseRecDot, { opacity: pulseAnim }]} />
                <Text style={styles.recordingTimerText}>Recording {formatDuration(recordDuration)}</Text>
                <TouchableOpacity onPress={() => stopRecording(false)} style={styles.cancelRecBtn}>
                  <Text style={styles.cancelRecText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => stopRecording(true)} style={styles.sendRecBtn}>
                  <Send size={18} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.inputCard}>
                <TouchableOpacity style={styles.inputIconBtn}>
                  <Smile size={22} color={COLORS.textMuted} />
                </TouchableOpacity>
                
                <TextInput
                  style={styles.input}
                  placeholder="Type your reply..."
                  placeholderTextColor="rgba(0,0,0,0.3)"
                  value={newMessage}
                  onChangeText={setNewMessage}
                  multiline
                />

                <TouchableOpacity style={styles.inputIconBtn}>
                  <Paperclip size={20} color={COLORS.textMuted} />
                </TouchableOpacity>
              </View>
            )}

            {/* Dynamic Action Button WhatsApp feel */}
            {!isRecording && (
              isUserTyping ? (
                <TouchableOpacity 
                  style={styles.actionBtn} 
                  onPress={() => sendMessage()}
                  activeOpacity={0.8}
                >
                  <Send size={20} color="#fff" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity 
                  style={[styles.actionBtn, { backgroundColor: COLORS.primary }]} 
                  onPress={startRecording}
                  activeOpacity={0.8}
                >
                  <Mic size={20} color="#fff" />
                </TouchableOpacity>
              )
            )}
          </View>
        </KeyboardAvoidingView>
      </View>

      {/* Info Sheets Modal Overlay */}
      <Modal
        visible={showInfoModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowInfoModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalSheetHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={[styles.avatar, { width: 44, height: 44 }]}>
                  <Text style={styles.avatarText}>{assigneeName[0].toUpperCase()}</Text>
                </View>
                <View>
                  <Text style={styles.modalSheetTitle} numberOfLines={1}>{ticket?.subject || 'Ticket Details'}</Text>
                  <Text style={styles.modalSheetSubtitle}>#{ticketId?.slice(0, 8).toUpperCase()}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setShowInfoModal(false)} style={styles.closeBtn}>
                <X size={20} color={COLORS.textLight} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalSheetBody} showsVerticalScrollIndicator={false}>
              
              {/* Image Evidence (if exists) */}
              {(ticket?.image_url || ticket?.metadata?.capturedFileBase64) && (
                <View style={styles.modalSection}>
                  <Text style={styles.sectionTitle}>VISUAL TELEMETRY EVIDENCE</Text>
                  <View style={styles.imageWrap}>
                    <Image 
                      source={{ uri: ticket.image_url || ticket.metadata.capturedFileBase64 }} 
                      style={styles.modalImage}
                      resizeMode="cover"
                    />
                  </View>
                </View>
              )}

              <Text style={styles.sectionTitle}>INCIDENT PARAMETERS</Text>
              
              <View style={styles.metaCard}>
                <View style={styles.metaRow}>
                  <Hash size={14} color={COLORS.textMuted} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.metaLabel}>TICKET STATUS</Text>
                    <Text style={[styles.metaValue, { color: statusColor, fontWeight: '900' }]}>
                      {(ticket?.status || 'PENDING').toUpperCase()}
                    </Text>
                  </View>
                </View>

                <View style={styles.metaRow}>
                  <Shield size={14} color={COLORS.textMuted} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.metaLabel}>PRIORITY SCALE</Text>
                    <Text style={[styles.metaValue, { color: ticket?.priority?.toLowerCase() === 'critical' ? '#ef4444' : '#15803d' }]}>
                      {(ticket?.priority || 'Medium').toUpperCase()}
                    </Text>
                  </View>
                </View>

                <View style={[styles.metaRow, { borderBottomWidth: 0 }]}>
                  <Calendar size={14} color={COLORS.textMuted} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.metaLabel}>REPORTED TIMESTAMP</Text>
                    <Text style={styles.metaValue}>
                      {ticket?.created_at ? new Date(ticket.created_at).toLocaleString() : '—'}
                    </Text>
                  </View>
                </View>
              </View>

              <Text style={styles.sectionTitle}>AI CLASSIFICATIONS</Text>
              
              <View style={styles.aiTelemetryCard}>
                <View style={styles.aiTelemetryHeader}>
                  <Sparkles size={16} color="#8b5cf6" />
                  <Text style={styles.aiTelemetryTitle}>RAG Neural Telemetry</Text>
                </View>
                <View style={styles.telemetryRow}>
                  <Text style={styles.telemetryLabel}>Predicted Category</Text>
                  <Text style={styles.telemetryValue}>{ticket?.category || 'General'}</Text>
                </View>
                <View style={styles.telemetryRow}>
                  <Text style={styles.telemetryLabel}>Sub-Category</Text>
                  <Text style={styles.telemetryValue}>{ticket?.subcategory || 'General Inquiry'}</Text>
                </View>
                <View style={[styles.telemetryRow, { borderBottomWidth: 0, paddingBottom: 0 }]}>
                  <Text style={styles.telemetryLabel}>RAG Match Score</Text>
                  <Text style={[styles.telemetryValue, { color: '#8b5cf6', fontWeight: '955' }]}>
                    {((ticket?.confidence || 0.85) * 100).toFixed(0)}% Accuracy
                  </Text>
                </View>
              </View>

              <Text style={styles.sectionTitle}>ENVIRONMENT SIGNATURE</Text>
              
              <View style={styles.metaCard}>
                <View style={styles.metaRow}>
                  <Globe size={14} color={COLORS.textMuted} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.metaLabel}>IP ADDRESS</Text>
                    <Text style={styles.metaValue}>{ticket?.metadata?.env_metadata?.ip || '127.0.0.1'}</Text>
                  </View>
                </View>
                <View style={[styles.metaRow, { borderBottomWidth: 0, paddingBottom: 0 }]}>
                  <Bot size={14} color={COLORS.textMuted} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.metaLabel}>USER CLIENT SIGNATURE</Text>
                    <Text style={[styles.metaValue, { fontSize: 11, lineHeight: 14 }]} numberOfLines={2}>
                      {ticket?.metadata?.env_metadata?.user_agent || 'Neural Mobile Client'}
                    </Text>
                  </View>
                </View>
              </View>

            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Premium WhatsApp simulated calling overlay */}
      <Modal
        visible={!!activeCall}
        animationType="slide"
        transparent={false}
        onRequestClose={endCall}
      >
        <View style={styles.callScreenContainer}>
          <StatusBar barStyle="light-content" />
          <View style={styles.callScreenHeader}>
            <Shield size={16} color="rgba(255,255,255,0.4)" />
            <Text style={styles.secureCallText}>SECURE END-TO-END ENCRYPTED</Text>
          </View>

          <View style={styles.callScreenInfo}>
            <View style={styles.callAvatarWrap}>
              <Text style={styles.callAvatarText}>{assigneeName[0].toUpperCase()}</Text>
            </View>
            <Text style={styles.callContactName}>{assigneeName}</Text>
            <Text style={styles.callStatusLabel}>
              {callStatus === 'Connected' ? formatDuration(callDuration) : callStatus}
            </Text>
          </View>

          {/* Video mock view */}
          {activeCall === 'Video' && (
            <View style={styles.videoMockContainer}>
              <View style={styles.selfVideoMock} />
            </View>
          )}

          <View style={styles.callScreenControls}>
            <TouchableOpacity 
              style={[styles.callControlBtn, isMuted && styles.activeControlBtn]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setIsMuted(!isMuted);
              }}
            >
              {isMuted ? <MicOff size={24} color={COLORS.primary} /> : <Mic size={24} color="#ffffff" />}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.callControlBtn, { backgroundColor: '#ef4444' }]} 
              onPress={endCall}
            >
              <Phone size={24} color="#ffffff" style={{ transform: [{ rotate: '135deg' }] }} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.callControlBtn, isSpeakerOn && styles.activeControlBtn]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setIsSpeakerOn(!isSpeakerOn);
              }}
            >
              <Volume2 size={24} color={isSpeakerOn ? COLORS.primary : "#ffffff"} />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  
  // Header Style WhatsApp
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    height: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    zIndex: 999
  },
  backBtn: { padding: 6 },
  headerInfoTouch: { flex: 1, flexDirection: 'row', alignItems: 'center', marginHorizontal: 4 },
  avatar: { 
    width: 38, 
    height: 38, 
    borderRadius: 19, 
    backgroundColor: COLORS.primary, 
    justifyContent: 'center', 
    alignItems: 'center',
    marginRight: 10,
    ...SHADOWS.soft
  },
  avatarText: { fontSize: 16, fontWeight: '900', color: '#fff' },
  headerContent: { flex: 1, gap: 1 },
  headerTitle: { fontSize: 16, fontWeight: '900', color: COLORS.text, letterSpacing: -0.2 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  pulseDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#22c55e' },
  statusText: { fontSize: 10, fontWeight: '700', color: '#15803d', textTransform: 'uppercase' },

  headerActions: { flexDirection: 'row', alignItems: 'center' },
  headerActionBtn: { padding: 10 },

  // WhatsApp Doodle Wallpaper Background
  wallpaperBg: { flex: 1, backgroundColor: '#efeae2', position: 'relative' },
  gridOverlay: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, opacity: 0.015, backgroundColor: 'transparent', borderWidth: 0.5, borderColor: '#000' },
  
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  messagesList: { padding: 16, paddingBottom: 20 },

  // Group Separator Date Headers
  dateSeparator: { flexDirection: 'row', alignItems: 'center', marginVertical: 14, paddingHorizontal: 10 },
  dateSeparatorLine: { flex: 1, height: 1, backgroundColor: 'rgba(0,0,0,0.06)' },
  dateSeparatorBadge: { backgroundColor: 'rgba(255,255,255,0.85)', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8, marginHorizontal: 12, ...SHADOWS.soft },
  dateSeparatorText: { fontSize: 9.5, fontWeight: '800', color: COLORS.textLight, letterSpacing: 0.5, textTransform: 'uppercase' },

  bubbleRow: { position: 'relative' },

  // Message Speech Bubble curved style
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 16,
    marginBottom: 12,
    position: 'relative',
    ...SHADOWS.soft
  },
  bubbleTail: { position: 'absolute', top: 0, width: 8, height: 10, backgroundColor: 'transparent' },
  userBubbleTail: { right: -6, borderTopLeftRadius: 0, borderTopColor: COLORS.primary, borderLeftWidth: 6, borderLeftColor: COLORS.primary, borderBottomRightRadius: 6, borderBottomWidth: 6, borderBottomColor: 'transparent' },
  adminBubbleTail: { left: -6, borderTopRightRadius: 0, borderTopColor: '#fff', borderRightWidth: 6, borderRightColor: '#fff', borderBottomLeftRadius: 6, borderBottomWidth: 6, borderBottomColor: 'transparent' },

  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#d9fdd3', // Premium WhatsApp green bubble hex!
    borderTopRightRadius: 0
  },
  adminBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#ffffff', // Premium WhatsApp white bubble hex!
    borderTopLeftRadius: 0,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)'
  },
  aiBubble: {
    backgroundColor: '#f5f0ff',
    borderColor: '#dcd0ff',
    borderWidth: 1
  },
  senderHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4, gap: 4 },
  senderName: { fontSize: 10, fontWeight: '800', color: COLORS.textMuted },
  messageText: { fontSize: 14.5, color: '#303030', lineHeight: 20, fontWeight: '500' },
  userMessageText: { color: '#303030' },
  
  bubbleFooter: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-end', marginTop: 4 },
  messageTime: { fontSize: 9.5, color: COLORS.textMuted, fontWeight: '600' },
  userTimeText: { color: COLORS.textMuted },

  // Emoji Reactions badges
  reactionBadge: {
    position: 'absolute',
    bottom: -14,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99,
    ...SHADOWS.soft
  },
  userReaction: { right: 8 },
  adminReaction: { left: 8 },
  reactionText: { fontSize: 12 },

  // Instagram Style Reaction popover overlay
  reactionOverlay: {
    position: 'absolute',
    top: -50,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 6,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    zIndex: 9999,
    gap: 8,
    ...SHADOWS.soft
  },
  alignRightOverlay: { right: 10 },
  alignLeftOverlay: { left: 10 },
  reactionOption: { padding: 4 },
  reactionOptionText: { fontSize: 20 },
  closeOverlayBtn: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#f3f4f6', justifyContent: 'center', alignItems: 'center', marginLeft: 4 },

  // Suggestions scroll pills
  suggestionsContainer: { backgroundColor: 'transparent', paddingVertical: 8, zIndex: 10 },
  suggestionsScroll: { paddingHorizontal: 16, gap: 8 },
  suggestionPill: { 
    backgroundColor: '#fff', 
    paddingHorizontal: 14, 
    paddingVertical: 8, 
    borderRadius: 100, 
    borderWidth: 1.5, 
    borderColor: '#e5e7eb',
    ...SHADOWS.soft 
  },
  suggestionText: { fontSize: 12, fontWeight: '700', color: COLORS.textLight },

  // Premium input containers
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'transparent',
    gap: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 10
  },
  inputCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 12,
    height: 48,
    ...SHADOWS.soft
  },
  inputIconBtn: { padding: 8 },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    paddingHorizontal: 6,
    maxHeight: 80
  },
  actionBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
    shadowColor: COLORS.primary
  },

  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 },
  emptyText: { textAlign: 'center', color: COLORS.textMuted, fontSize: 13.5, fontWeight: '600', paddingHorizontal: 40 },

  // Sliding sheet modal info styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: { 
    backgroundColor: '#fff', 
    borderTopLeftRadius: 32, 
    borderTopRightRadius: 32, 
    padding: 24, 
    maxHeight: '80%',
    ...SHADOWS.soft 
  },
  modalSheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)', marginBottom: 20 },
  modalSheetTitle: { fontSize: 16, fontWeight: '950', color: COLORS.text, maxWidth: 200 },
  modalSheetSubtitle: { fontSize: 11, fontWeight: '700', color: COLORS.textMuted, marginTop: 2 },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#f3f4f6', justifyContent: 'center', alignItems: 'center' },

  modalSheetBody: { gap: 18, paddingBottom: 32 },
  sectionTitle: { fontSize: 10.5, fontWeight: '800', color: COLORS.textMuted, letterSpacing: 1.2 },

  modalSection: {},
  imageWrap: { borderRadius: 16, overflow: 'hidden', height: 180, backgroundColor: '#f3f4f6', borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
  modalImage: { width: '100%', height: '100%' },

  metaCard: { backgroundColor: '#f8faf9', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 4, borderWidth: 1, borderColor: 'rgba(0,0,0,0.03)' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.04)' },
  metaLabel: { fontSize: 9.5, fontWeight: '800', color: COLORS.textMuted, letterSpacing: 0.5 },
  metaValue: { fontSize: 12.5, fontWeight: '700', color: COLORS.text, marginTop: 2 },

  // AI Insights
  aiTelemetryCard: { backgroundColor: '#f5f0ff', borderWidth: 1.5, borderColor: '#dcd0ff', borderRadius: 20, padding: 16 },
  aiTelemetryHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  aiTelemetryTitle: { fontSize: 12, fontWeight: '900', color: '#8b5cf6', textTransform: 'uppercase', letterSpacing: 0.5 },
  telemetryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(139,92,246,0.1)' },
  telemetryLabel: { fontSize: 12, fontWeight: '600', color: COLORS.textLight },
  telemetryValue: { fontSize: 12, fontWeight: '800', color: COLORS.text },

  // Simulated calling style sheet
  callScreenContainer: { flex: 1, backgroundColor: '#07121e', justifyContent: 'space-between', paddingVertical: 40, paddingHorizontal: 20 },
  callScreenHeader: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, opacity: 0.8 },
  secureCallText: { fontSize: 10, fontWeight: '800', color: 'rgba(255,255,255,0.5)', letterSpacing: 1 },
  callScreenInfo: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 14, marginTop: 40 },
  callAvatarWrap: { width: 120, height: 120, borderRadius: 60, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', elevation: 8, ...SHADOWS.medium },
  callAvatarText: { fontSize: 48, fontWeight: '900', color: '#ffffff' },
  callContactName: { fontSize: 24, fontWeight: '950', color: '#ffffff', textAlign: 'center' },
  callStatusLabel: { fontSize: 14, fontWeight: '700', color: 'rgba(255,255,255,0.6)', letterSpacing: 0.5 },
  videoMockContainer: { width: '100%', height: 260, borderRadius: 24, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', marginVertical: 20, justifyContent: 'center', alignItems: 'center' },
  selfVideoMock: { width: 90, height: 130, borderRadius: 16, backgroundColor: '#1c2d42', position: 'absolute', bottom: 16, right: 16, borderStyle: 'solid', borderWidth: 2, borderColor: 'rgba(255,255,255,0.1)' },
  callScreenControls: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 28, marginBottom: 20 },
  callControlBtn: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.08)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },

  // Pulse voice recording styles
  recordingCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 16,
    height: 48,
    gap: 12,
    ...SHADOWS.soft
  },
  pulseRecDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ef4444'
  },
  recordingTimerText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '800',
    color: '#ef4444'
  },
  cancelRecBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#f3f4f6'
  },
  cancelRecText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted
  },
  sendRecBtn: {
    padding: 8
  },

  // Custom interactive caller styling
  activeControlBtn: {
    backgroundColor: '#ffffff',
    borderColor: '#ffffff'
  },

  // Voice Note message rendering styles
  voiceNoteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: 220,
    paddingVertical: 4
  },
  voicePlayBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.06)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  voiceWaveContainer: {
    flex: 1,
    gap: 4
  },
  voiceWaveform: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    height: 24
  },
  voiceWaveBar: {
    width: 3,
    borderRadius: 1.5
  },
  voiceProgressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  voiceDurationText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted
  }
});

export default TicketDetailScreen;
