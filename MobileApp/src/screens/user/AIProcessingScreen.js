import React, { useEffect, useState, useRef } from 'react';
import {
  StyleSheet, View, Text, TouchableOpacity, Animated,
  ActivityIndicator, ScrollView, StatusBar, Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { supabase } from '../../lib/supabase';
import { COLORS, SHADOWS } from '../../styles/theme';
import { 
  BrainCircuit, Sparkles, CheckCircle2, AlertCircle, 
  ArrowRight, ShieldCheck, Zap, BarChart3, Clock, XCircle
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import axios from 'axios';
import { decode } from 'base64-arraybuffer';

const BACKEND_URL = 'https://ritesh19180-ai-helpdesk-api.hf.space';

// ─── Premium Neural Orbit Component ────────────────────────────────────────
const NeuralOrbit = ({ radius, duration, color, opacity = 1 }) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const rotate = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const size = radius * 2;

  return (
    <Animated.View
      style={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: radius,
        borderWidth: 1.5,
        borderColor: color,
        borderStyle: 'dashed',
        opacity,
        transform: [{ rotate }],
      }}
    >
      {/* Orbit node */}
      <View style={{
        position: 'absolute',
        top: -5,
        left: radius - 5,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: color,
        shadowColor: color,
        shadowOpacity: 0.9,
        shadowRadius: 8,
        elevation: 8,
      }} />
    </Animated.View>
  );
};

// ─── Step Item ──────────────────────────────────────────────────────────────
const StepItem = ({ title, index, currentStep }) => {
  const isCompleted = currentStep > index;
  const isActive = currentStep === index;
  const isPending = currentStep < index;
  const scaleAnim = useRef(new Animated.Value(isPending ? 1 : 1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isActive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
          Animated.timing(glowAnim, { toValue: 0.4, duration: 800, useNativeDriver: true }),
        ])
      ).start();
      Animated.spring(scaleAnim, { toValue: 1.02, damping: 12, useNativeDriver: true }).start();
    }
    if (isCompleted) {
      Animated.spring(scaleAnim, { toValue: 1, damping: 15, useNativeDriver: true }).start();
    }
  }, [isActive, isCompleted]);

  return (
    <Animated.View style={[
      styles.stepItem,
      isActive && styles.stepItemActive,
      isCompleted && styles.stepItemCompleted,
      isPending && styles.stepItemPending,
      { transform: [{ scale: scaleAnim }] },
    ]}>
      <View style={styles.stepIconWrap}>
        {isCompleted ? (
          <CheckCircle2 size={18} color="#34d399" strokeWidth={2.5} />
        ) : isActive ? (
          <Animated.View style={{ opacity: glowAnim.interpolate({ inputRange: [0.4, 1], outputRange: [0.7, 1] }) }}>
            <ActivityIndicator size="small" color="#818cf8" />
          </Animated.View>
        ) : (
          <View style={styles.stepDot} />
        )}
      </View>
      <Text style={[
        styles.stepText,
        isActive && styles.stepTextActive,
        isCompleted && styles.stepTextCompleted,
        isPending && styles.stepTextPending,
      ]}>
        {title}
      </Text>
      {isActive && (
        <Animated.View style={[styles.stepPing, { opacity: glowAnim }]} />
      )}
    </Animated.View>
  );
};

// ─── Main Screen ────────────────────────────────────────────────────────────
const AIProcessingScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { text, image_base64, image_text } = route.params;

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { label: "Initializing AI Core", icon: "🧠" },
    { label: "Scanning for OCR Data", icon: "🔍" },
    { label: "Neural Classification", icon: "⚡" },
    { label: "Searching Knowledge Base", icon: "📚" },
    { label: "Extracting Technical Entities", icon: "🔗" },
    { label: "Checking for Duplicates", icon: "🛡️" },
  ];
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const brainGlowAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    // Brain pulsing glow
    Animated.loop(
      Animated.sequence([
        Animated.timing(brainGlowAnim, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(brainGlowAnim, { toValue: 0.5, duration: 1400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
    analyzeTicket();
  }, []);

  // Advance step on a timer
  useEffect(() => {
    let stepTimer;
    if (loading && currentStep < steps.length) {
      stepTimer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        // Animate progress bar
        Animated.timing(progressAnim, {
          toValue: (currentStep + 1) / steps.length,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }).start();
      }, 900);
    }
    return () => clearTimeout(stepTimer);
  }, [currentStep, loading]);

  const analyzeTicket = async (retries = 3) => {
    try {
      setError(null);
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase.from('profiles').select('company').eq('id', user.id).single();

      const response = await axios.post(`${BACKEND_URL}/ai/analyze_ticket`, {
        text,
        image_base64: image_base64 || "",
        image_text: image_text || "",
        user_id: user?.id,
        company: profile?.company || 'Default'
      });
      
      setResult(response.data);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      if (err.response?.status === 503 && retries > 0) {
        setTimeout(() => analyzeTicket(retries - 1), 4000);
        return;
      }
      console.error('AI Analysis Error:', err);
      setError(err.response?.status === 503 
        ? 'The AI engine is waking up. Please wait a moment and try again.'
        : (err.message || 'AI engine is currently busy. Please try again.'));
      setLoading(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  // Switch loading → result when steps + API both done
  useEffect(() => {
    if (currentStep === steps.length && result) {
      const timer = setTimeout(() => {
        setLoading(false);
        Animated.parallel([
          Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
          Animated.spring(scaleAnim, { toValue: 1, damping: 12, useNativeDriver: true }),
        ]).start();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [currentStep, result]);

  const handleConfirm = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('User session expired. Please log in again.');

      const { data: profile } = await supabase
        .from('profiles')
        .select('company, company_id')
        .eq('id', user.id)
        .single();

      let imageUrl = null;
      if (image_base64) {
        try {
          const fileExt = 'jpg';
          const fileName = `${user.id}-ticket-${Date.now()}.${fileExt}`;
          const { error: uploadError } = await supabase.storage
            .from('profile-pics')
            .upload(fileName, decode(image_base64), {
              contentType: `image/${fileExt}`,
              upsert: true
            });
          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('profile-pics')
            .getPublicUrl(fileName);
          imageUrl = publicUrl;
        } catch (storageErr) {
          console.warn('Failed to upload ticket screenshot:', storageErr);
        }
      }

      const hours = result.priority === 'Critical' ? 4 : result.priority === 'High' ? 12 : result.priority === 'Medium' ? 24 : 72;
      const breachDate = new Date();
      breachDate.setHours(breachDate.getHours() + hours);
      const slaBreachAt = breachDate.toISOString();

      const savePayload = {
        user_id: user.id,
        subject: result.summary || "New Support Request",
        description: text,
        category: result.category || "General",
        subcategory: result.subcategory || "General",
        priority: result.priority || "Low",
        assigned_team: result.assigned_team || "IT Support",
        status: result.auto_resolve ? 'resolved' : 'pending',
        auto_resolve: result.auto_resolve || false,
        is_duplicate: result.is_duplicate || false,
        confidence: result.confidence || 0.0,
        image_url: imageUrl,
        company: profile?.company || null,
        company_id: profile?.company_id || null,
        is_potential_duplicate: result.is_potential_duplicate || false,
        parent_ticket_id: result.parent_ticket_id || null,
        sla_breach_at: slaBreachAt,
        routing_confidence: result.confidence || 0.0,
        metadata: {
          confidence: result.confidence || 0.0,
          entities: result.entities || [],
          decision_factors: result.decision_factors || [],
          ocr_text: result.ocr_text || "",
          image_description: result.image_description || "",
          solution_steps: result.solution_steps || [],
          needs_review: result.needs_review || false,
          routing_confidence: result.confidence || 0.0,
        },
      };

      const res = await axios.post(`${BACKEND_URL}/tickets/save`, savePayload);

      if (res.data?.ticket_id) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        navigation.reset({
          index: 0,
          routes: [
            { name: 'MainTabs' },
            { name: 'TicketTracking', params: { ticketId: res.data.ticket_id } }
          ],
        });
      } else {
        throw new Error("Failed to save ticket via backend API.");
      }
    } catch (err) {
      console.error('Final Submission Error:', err);
      let errorMsg = 'Unknown error';
      if (err.response?.data?.detail) {
        if (typeof err.response.data.detail === 'string') {
          errorMsg = err.response.data.detail;
        } else if (Array.isArray(err.response.data.detail)) {
          errorMsg = err.response.data.detail.map(d => `${d.loc?.join('.') || 'field'}: ${d.msg}`).join(', ');
        } else {
          errorMsg = JSON.stringify(err.response.data.detail);
        }
      } else if (err.message) {
        errorMsg = err.message;
      }
      setError('Failed to create ticket: ' + errorMsg);
      setLoading(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  // ─── Loading Screen ────────────────────────────────────────────────────
  if (loading && !result) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" />

        {/* Neural Orbit Visualization */}
        <View style={styles.orbitWrap}>
          {/* Orbits */}
          <NeuralOrbit radius={90} duration={6000} color="rgba(129,140,248,0.35)" opacity={0.9} />
          <NeuralOrbit radius={64} duration={4200} color="rgba(52,211,153,0.45)" opacity={0.85} />
          <NeuralOrbit radius={42} duration={2800} color="rgba(251,191,36,0.4)" opacity={0.8} />

          {/* Core glow rings */}
          <Animated.View style={[styles.glowRing, styles.glowRingOuter, {
            opacity: brainGlowAnim.interpolate({ inputRange: [0.5, 1], outputRange: [0.15, 0.35] }),
            transform: [{ scale: brainGlowAnim.interpolate({ inputRange: [0.5, 1], outputRange: [0.95, 1.05] }) }]
          }]} />
          <Animated.View style={[styles.glowRing, styles.glowRingInner, {
            opacity: brainGlowAnim.interpolate({ inputRange: [0.5, 1], outputRange: [0.25, 0.55] }),
          }]} />

          {/* Brain icon */}
          <Animated.View style={[styles.brainCore, {
            opacity: brainGlowAnim,
            transform: [{ scale: brainGlowAnim.interpolate({ inputRange: [0.5, 1], outputRange: [0.97, 1.03] }) }]
          }]}>
            <BrainCircuit size={40} color="#818cf8" strokeWidth={1.5} />
          </Animated.View>
        </View>

        {/* Title */}
        <View style={styles.loadingHeader}>
          <Text style={styles.loadingTitle}>Neural Processing</Text>
          <Text style={styles.loadingSubtitle}>HelpDesk.ai is orchestrating your request</Text>
        </View>

        {/* Step List */}
        <View style={styles.stepsList}>
          {steps.map((step, i) => (
            <StepItem key={i} title={step.label} index={i} currentStep={currentStep} />
          ))}
        </View>

        {/* Progress bar */}
        <View style={styles.progressBarBg}>
          <Animated.View style={[styles.progressBarFill, {
            width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] })
          }]} />
        </View>
        <Text style={styles.progressLabel}>
          {currentStep < steps.length ? `Step ${currentStep + 1} of ${steps.length}` : 'Finalizing…'}
        </Text>
      </SafeAreaView>
    );
  }

  // ─── Error Screen ──────────────────────────────────────────────────────
  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <StatusBar barStyle="light-content" />
        <View style={styles.errorIconWrap}>
          <AlertCircle size={48} color="#f87171" strokeWidth={1.5} />
        </View>
        <Text style={styles.errorTitle}>Analysis Failed</Text>
        <Text style={styles.errorSubtitle}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.retryText}>← Edit & Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // ─── Result Review Screen ──────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <View style={styles.aiBadge}>
            <Sparkles size={14} color={COLORS.primary} />
            <Text style={styles.aiBadgeText}>AI INSIGHTS GENERATED</Text>
          </View>
          <Text style={styles.title}>Review AI Analysis</Text>
          <Text style={styles.subtitle}>Our neural engine has parsed your request. Please confirm the details below.</Text>
        </View>

        <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.resultItem}>
            <Text style={styles.label}>Summary</Text>
            <Text style={styles.value}>{result.summary}</Text>
          </View>

          {result.needs_review && (
            <View style={styles.reviewBanner}>
              <AlertCircle size={16} color="#f59e0b" />
              <Text style={styles.reviewBannerText}>Low confidence — please verify details before submitting.</Text>
            </View>
          )}

          <View style={styles.row}>
            <View style={[styles.resultItem, { flex: 1 }]}>
              <Text style={styles.label}>Category</Text>
              <View style={styles.tag}>
                <BarChart3 size={14} color={COLORS.primary} />
                <Text style={styles.tagText}>{result.category}</Text>
              </View>
            </View>
            <View style={[styles.resultItem, { flex: 1 }]}>
              <Text style={styles.label}>Priority</Text>
              <View style={[styles.tag, { backgroundColor: result.priority === 'Critical' ? '#fee2e2' : result.priority === 'High' ? '#fef3c7' : '#f0fdf4' }]}>
                <Clock size={14} color={result.priority === 'Critical' ? COLORS.error : result.priority === 'High' ? '#f59e0b' : '#16a34a'} />
                <Text style={[styles.tagText, { color: result.priority === 'Critical' ? COLORS.error : result.priority === 'High' ? '#f59e0b' : '#16a34a' }]}>
                  {result.priority}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.resultItem}>
            <Text style={styles.label}>Assigned Team</Text>
            <View style={styles.tag}>
              <ShieldCheck size={14} color={COLORS.primary} />
              <Text style={styles.tagText}>{result.assigned_team}</Text>
            </View>
          </View>

          {result.ocr_text ? (
            <View style={styles.resultItem}>
              <Text style={styles.label}>Extracted Text (OCR)</Text>
              <Text style={styles.ocrValue} numberOfLines={3}>{result.ocr_text}</Text>
            </View>
          ) : null}

          <View style={styles.confidenceRow}>
            <Zap size={14} color={COLORS.success} />
            <Text style={styles.confidenceText}>
              Analysis Confidence: {Math.round(result.confidence * 100)}%
            </Text>
          </View>
        </Animated.View>

        <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : (
            <>
              <Text style={styles.confirmText}>Confirm & Create Ticket</Text>
              <CheckCircle2 size={20} color="#fff" />
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.cancelBtn} 
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.goBack();
          }}
        >
          <Text style={styles.cancelText}>Edit Request</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: 24 },

  // ─── Loading ───────────────────────────────────────────────────────────
  loadingContainer: {
    flex: 1,
    backgroundColor: '#060d1a',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },
  orbitWrap: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 36,
  },
  glowRing: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: '#6366f1',
  },
  glowRingOuter: { width: 90, height: 90 },
  glowRingInner: { width: 52, height: 52 },
  brainCore: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: 'rgba(99,102,241,0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(129,140,248,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366f1',
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 12,
  },
  loadingHeader: { alignItems: 'center', marginBottom: 32, gap: 6 },
  loadingTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -0.5,
  },
  loadingSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '500',
    textAlign: 'center',
  },
  stepsList: { width: '100%', gap: 10, marginBottom: 32 },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: 'rgba(255,255,255,0.03)',
    position: 'relative',
    overflow: 'hidden',
  },
  stepItemActive: {
    backgroundColor: 'rgba(99,102,241,0.1)',
    borderColor: 'rgba(129,140,248,0.3)',
  },
  stepItemCompleted: {
    backgroundColor: 'rgba(52,211,153,0.07)',
    borderColor: 'rgba(52,211,153,0.2)',
  },
  stepItemPending: { opacity: 0.35 },
  stepPing: {
    position: 'absolute',
    right: 14,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#818cf8',
    shadowColor: '#818cf8',
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 6,
  },
  stepIconWrap: { width: 24, alignItems: 'center' },
  stepDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  stepText: { flex: 1, fontSize: 14, color: 'rgba(255,255,255,0.3)', fontWeight: '600' },
  stepTextActive: { color: '#c7d2fe', fontWeight: '800' },
  stepTextCompleted: { color: '#6ee7b7', fontWeight: '700' },
  stepTextPending: { color: 'rgba(255,255,255,0.25)' },
  progressBarBg: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: '#6366f1',
    shadowColor: '#6366f1',
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  progressLabel: {
    marginTop: 10,
    fontSize: 12,
    color: 'rgba(255,255,255,0.3)',
    fontWeight: '600',
    letterSpacing: 0.3,
  },

  // ─── Error ────────────────────────────────────────────────────────────
  errorContainer: {
    flex: 1,
    backgroundColor: '#060d1a',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    gap: 16,
  },
  errorIconWrap: {
    width: 90,
    height: 90,
    borderRadius: 28,
    backgroundColor: 'rgba(239,68,68,0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(239,68,68,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorTitle: { fontSize: 22, fontWeight: '900', color: '#fff', textAlign: 'center' },
  errorSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.45)', textAlign: 'center', lineHeight: 22 },
  retryBtn: {
    marginTop: 8,
    backgroundColor: '#6366f1',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
  },
  retryText: { color: '#fff', fontWeight: '800', fontSize: 15 },

  // ─── Result ───────────────────────────────────────────────────────────
  header: { marginBottom: 28 },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    alignSelf: 'flex-start',
    marginBottom: 14,
  },
  aiBadgeText: { fontSize: 10, fontWeight: '900', color: COLORS.primary, letterSpacing: 1 },
  title: { fontSize: 28, fontWeight: '900', color: COLORS.text, letterSpacing: -0.5 },
  subtitle: { fontSize: 15, color: COLORS.textMuted, marginTop: 8, lineHeight: 22 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    ...SHADOWS.medium,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
    marginBottom: 28,
    gap: 4,
  },
  reviewBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fffbeb',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  reviewBannerText: { flex: 1, fontSize: 13, fontWeight: '600', color: '#92400e', lineHeight: 18 },
  resultItem: { marginBottom: 18 },
  row: { flexDirection: 'row', gap: 16, marginBottom: 4 },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  value: { fontSize: 16, fontWeight: '800', color: COLORS.text, lineHeight: 24 },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  tagText: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
  ocrValue: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    backgroundColor: COLORS.background,
    padding: 12,
    borderRadius: 12,
  },
  confidenceRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  confidenceText: { fontSize: 13, fontWeight: '700', color: COLORS.success },
  confirmBtn: {
    backgroundColor: COLORS.primary,
    height: 64,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    ...SHADOWS.medium,
  },
  confirmText: { color: '#fff', fontSize: 18, fontWeight: '800' },
  cancelBtn: {
    marginTop: 14,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    marginBottom: 40,
  },
  cancelText: { color: COLORS.textLight, fontSize: 16, fontWeight: '700' },
});

export default AIProcessingScreen;
