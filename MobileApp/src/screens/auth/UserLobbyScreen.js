import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet, View, Text, TouchableOpacity, ScrollView,
  StatusBar, ActivityIndicator, Animated, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { COLORS, SHADOWS } from '../../styles/theme';
import { Clock, LogOut, ShieldAlert, CheckCircle2, MessageSquare, User, Building2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

const UserLobbyScreen = () => {
  const [profile, setProfile] = useState(null);
  const [status, setStatus] = useState('pending_approval');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [loading, setLoading] = useState(true);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();

    // Pulse animation for pending indicator
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  // Fetch profile
  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (data) {
        setProfile(data);
        setStatus(data.status);
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  // Real-time subscription + polling
  useEffect(() => {
    if (!profile?.id) return;

    const channel = supabase
      .channel(`profile-lobby-${profile.id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'profiles',
        filter: `id=eq.${profile.id}`,
      }, (payload) => {
        const newStatus = payload.new.status;
        setStatus(newStatus);
        if (newStatus === 'active') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setIsTransitioning(true);
        }
      })
      .subscribe();

    // Polling backup every 30 seconds
    const poll = setInterval(async () => {
      const { data } = await supabase
        .from('profiles')
        .select('status')
        .eq('id', profile.id)
        .single();
      if (data && data.status !== status) {
        setStatus(data.status);
        if (data.status === 'active') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setIsTransitioning(true);
        }
      }
    }, 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(poll);
    };
  }, [profile?.id, status]);

  const handleLogout = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await supabase.auth.signOut();
  };

  const handleWhatsApp = () => {
    const adminPhone = '918464931322';
    const msg = `Hey Ritesh, I just verified my email and I want you to approve this email address. I registered to ${profile?.company || 'my company'}. My email is: ${profile?.email}`;
    Linking.openURL(`https://wa.me/${adminPhone}?text=${encodeURIComponent(msg)}`);
  };

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <StatusBar barStyle="dark-content" />
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // Transitioning to dashboard (auto-redirect handled by App.js session listener)
  if (isTransitioning) {
    return (
      <View style={styles.loadingWrap}>
        <StatusBar barStyle="dark-content" />
        <Animated.View style={[styles.transitionCard, { opacity: fadeAnim }]}>
          <View style={styles.approvedIcon}>
            <CheckCircle2 size={48} color={COLORS.primary} />
          </View>
          <Text style={styles.approvedTitle}>Account Approved!</Text>
          <Text style={styles.approvedMsg}>Redirecting to your dashboard...</Text>
          <ActivityIndicator color={COLORS.primary} style={{ marginTop: 16 }} />
        </Animated.View>
      </View>
    );
  }

  // Rejected state
  if (status === 'rejected') {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.centerWrap}>
          <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
            <View style={styles.rejectedIcon}>
              <ShieldAlert size={40} color="#ef4444" />
            </View>
            <Text style={styles.rejectedTitle}>Registration Declined</Text>
            <Text style={styles.rejectedMsg}>
              Unfortunately, your request to join your company has been declined by an administrator.
            </Text>
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <LogOut size={18} color={COLORS.textLight} />
              <Text style={styles.logoutText}>Return to Login</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </SafeAreaView>
    );
  }

  // Pending approval state (default)
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.centerWrap} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.card, { opacity: fadeAnim }]}>

          {/* Pulsing clock icon */}
          <Animated.View style={[styles.pendingIcon, { transform: [{ scale: pulseAnim }] }]}>
            <Clock size={40} color="#f59e0b" />
          </Animated.View>

          <Text style={styles.pendingTitle}>Email Verified!</Text>
          <Text style={styles.pendingMsg}>
            Your account is verified. We've notified your company administrators at{' '}
            <Text style={{ fontWeight: '800', color: COLORS.text }}>{profile?.company || 'your company'}</Text>.
            {'\n'}You will be notified once your account is approved.
          </Text>

          {/* Info card */}
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>ACCOUNT</Text>
              <Text style={styles.infoValue}>{profile?.full_name || 'User'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>EMAIL</Text>
              <Text style={styles.infoValue} numberOfLines={1}>{profile?.email}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>COMPANY</Text>
              <Text style={styles.infoValue}>{profile?.company || '—'}</Text>
            </View>
            <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.infoLabel}>STATUS</Text>
              <View style={styles.statusBadge}>
                <View style={styles.pulseDot} />
                <Text style={styles.statusText}>Pending Review</Text>
              </View>
            </View>
          </View>

          {/* WhatsApp button */}
          <TouchableOpacity style={styles.waBtn} onPress={handleWhatsApp} activeOpacity={0.85}>
            <MessageSquare size={20} color="#fff" />
            <Text style={styles.waBtnText}>Request Approval via WhatsApp</Text>
          </TouchableOpacity>
          <Text style={styles.waHint}>Opens a direct chat with the admin</Text>

          {/* Logout */}
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <LogOut size={18} color={COLORS.textLight} />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>

        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8faf9' },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8faf9' },
  centerWrap: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 32,
    padding: 32,
    alignItems: 'center',
    ...SHADOWS.soft,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  // Pending
  pendingIcon: {
    width: 80, height: 80, borderRadius: 20,
    backgroundColor: '#fffbeb', borderWidth: 1.5, borderColor: '#fde68a',
    justifyContent: 'center', alignItems: 'center', marginBottom: 24,
  },
  pendingTitle: { fontSize: 24, fontWeight: '900', color: COLORS.text, marginBottom: 12 },
  pendingMsg: { fontSize: 14, color: COLORS.textLight, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  // Info card
  infoCard: {
    width: '100%', backgroundColor: '#f8faf9', borderRadius: 20,
    padding: 16, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(0,0,0,0.04)',
  },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.04)',
  },
  infoLabel: { fontSize: 10, fontWeight: '800', color: COLORS.textMuted, letterSpacing: 1.5 },
  infoValue: { fontSize: 13, fontWeight: '700', color: COLORS.text, maxWidth: '60%', textAlign: 'right' },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)',
  },
  pulseDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#f59e0b' },
  statusText: { fontSize: 11, fontWeight: '800', color: '#d97706' },
  // WhatsApp
  waBtn: {
    width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 12, backgroundColor: '#25D366', height: 56, borderRadius: 18,
    ...SHADOWS.medium, shadowColor: '#25D366',
  },
  waBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  waHint: { fontSize: 11, color: COLORS.textMuted, marginTop: 8, marginBottom: 20 },
  // Logout
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 12, paddingHorizontal: 20,
    borderRadius: 14, borderWidth: 1.5, borderColor: 'rgba(0,0,0,0.08)',
  },
  logoutText: { fontSize: 14, fontWeight: '700', color: COLORS.textLight },
  // Rejected
  rejectedIcon: {
    width: 80, height: 80, borderRadius: 20,
    backgroundColor: '#fef2f2', borderWidth: 1.5, borderColor: '#fecaca',
    justifyContent: 'center', alignItems: 'center', marginBottom: 24,
  },
  rejectedTitle: { fontSize: 22, fontWeight: '900', color: COLORS.text, marginBottom: 12 },
  rejectedMsg: { fontSize: 14, color: COLORS.textLight, textAlign: 'center', lineHeight: 22, marginBottom: 28 },
  // Approved transition
  transitionCard: { alignItems: 'center', gap: 16 },
  approvedIcon: {
    width: 100, height: 100, borderRadius: 30,
    backgroundColor: '#f0fdf4', borderWidth: 2, borderColor: '#bbf7d0',
    justifyContent: 'center', alignItems: 'center',
  },
  approvedTitle: { fontSize: 26, fontWeight: '900', color: COLORS.text },
  approvedMsg: { fontSize: 15, color: COLORS.textLight },
});

export default UserLobbyScreen;
