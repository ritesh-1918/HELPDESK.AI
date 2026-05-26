import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet, View, Text, TextInput, TouchableOpacity, Image,
  KeyboardAvoidingView, Platform, ActivityIndicator,
  ScrollView, StatusBar, Animated,
} from 'react-native';
import { supabase } from '../../lib/supabase';
import { COLORS, SHADOWS } from '../../styles/theme';
import { Lock, Mail, Eye, EyeOff, Zap, ArrowRight, ShieldCheck } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { useNotification } from '../../components/NotificationProvider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const LoginScreen = () => {
  const navigation = useNavigation();
  const { success, error: notifyError, info } = useNotification();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMagicLink, setIsMagicLink] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(logoScale, { toValue: 1, damping: 14, useNativeDriver: true }),
      Animated.timing(logoOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, delay: 250, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, delay: 250, useNativeDriver: true }),
    ]).start();
  }, []);

  const toggleMode = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsMagicLink(!isMagicLink);
    setMagicLinkSent(false);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      notifyError('Missing Fields', 'Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      // Fetch profile to check status
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profile?.status === 'pending_email_verification') {
        await supabase.auth.signOut();
        notifyError('Email Not Verified', 'Please verify your email before signing in.');
        return;
      }

      // Status routing is handled by App.js onAuthStateChange
      // For pending_approval → App.js routes to UserLobby
      // For rejected → App.js routes to UserLobby (which shows rejected state)
      // For active → App.js routes to MainTabs

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      success('Welcome back!', `Signed in as ${data.user.email}`);
    } catch (err) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      notifyError('Login Failed', err.message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!email) {
      notifyError('Email Required', 'Please enter your email address.');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
          emailRedirectTo: 'helpdeskai://login',
        },
      });
      if (error) throw error;
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setMagicLinkSent(true);
      info('Magic Link Sent', `Check your inbox at ${email}`);
    } catch (err) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      notifyError('Failed to Send', err.message || 'Could not send magic link.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    isMagicLink ? handleMagicLink() : handleLogin();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.bgBlob1} />
      <View style={styles.bgBlob2} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingTop: Math.max(insets.top + 20, 60) }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo */}
          <Animated.View style={[styles.header, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
            <View style={styles.logoWrap}>
              <Image source={require('../../../assets/logo_v1.png')} style={styles.logo} resizeMode="contain" />
            </View>
            <Text style={styles.title}>HelpDesk<Text style={{ color: COLORS.primary }}>.ai</Text></Text>
            <Text style={styles.subtitle}>
              {isMagicLink ? 'Sign in with a magic link — no password needed' : 'Welcome back, sign in to continue'}
            </Text>
          </Animated.View>

          {/* Card */}
          <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            {magicLinkSent ? (
              <View style={styles.sentState}>
                <View style={styles.sentIcon}>
                  <Mail size={36} color={COLORS.primary} />
                </View>
                <Text style={styles.sentTitle}>Check your email</Text>
                <Text style={styles.sentMsg}>
                  We sent a magic link to{'\n'}
                  <Text style={{ color: '#fff', fontWeight: '700' }}>{email}</Text>
                </Text>
                <TouchableOpacity onPress={() => { setMagicLinkSent(false); setEmail(''); }} style={styles.tryAgainBtn}>
                  <Text style={styles.tryAgainText}>Try another email</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {/* Email */}
                <View style={styles.field}>
                  <Text style={styles.label}>EMAIL ADDRESS</Text>
                  <View style={styles.inputRow}>
                    <Mail size={18} color="rgba(255,255,255,0.4)" style={{ marginRight: 10 }} />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your email"
                      placeholderTextColor="rgba(255,255,255,0.3)"
                      value={email}
                      onChangeText={setEmail}
                      autoCapitalize="none"
                      keyboardType="email-address"
                    />
                  </View>
                </View>

                {!isMagicLink && (
                  <View style={styles.field}>
                    <View style={styles.labelRow}>
                      <Text style={styles.label}>PASSWORD</Text>
                      <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                        <Text style={styles.forgotLink}>Forgot?</Text>
                      </TouchableOpacity>
                    </View>
                    <View style={styles.inputRow}>
                      <Lock size={18} color="rgba(255,255,255,0.4)" style={{ marginRight: 10 }} />
                      <TextInput
                        style={styles.input}
                        placeholder="Enter your password"
                        placeholderTextColor="rgba(255,255,255,0.3)"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                      />
                      <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff size={18} color="rgba(255,255,255,0.4)" /> : <Eye size={18} color="rgba(255,255,255,0.4)" />}
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                <TouchableOpacity style={styles.btn} onPress={handleSubmit} disabled={loading} activeOpacity={0.85}>
                  {loading ? <ActivityIndicator color="#fff" /> : (
                    <>
                      <Text style={styles.btnText}>{isMagicLink ? 'Send Magic Link' : 'Sign In'}</Text>
                      <ArrowRight size={20} color="#fff" />
                    </>
                  )}
                </TouchableOpacity>

                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>or</Text>
                  <View style={styles.dividerLine} />
                </View>

                <TouchableOpacity 
                  style={styles.magicLinkBtn} 
                  onPress={toggleMode} 
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={[COLORS.primary, '#0ea5e9']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.magicLinkGradient}
                  >
                    {isMagicLink ? <Lock size={18} color="#fff" /> : <Zap size={18} color="#fff" />}
                    <Text style={styles.magicLinkText}>
                      {isMagicLink ? 'Sign in with Password' : 'Sign in with Magic Link'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </>
            )}
          </Animated.View>

          {/* Footer */}
          <Animated.View style={[styles.footer, { opacity: fadeAnim, paddingBottom: insets.bottom + 40, gap: 12, flexDirection: 'column', alignItems: 'center' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                <Text style={styles.footerLink}>Create Account</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('AdminSignup')}>
              <Text style={styles.adminLink}>Register as Admin Agent / Company</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b1120' },
  bgBlob1: { position: 'absolute', top: -140, right: -80, width: 320, height: 320, borderRadius: 160, backgroundColor: COLORS.primary + '22' },
  bgBlob2: { position: 'absolute', bottom: -100, left: -100, width: 260, height: 260, borderRadius: 130, backgroundColor: '#3b82f622' },
  scroll: { flexGrow: 1, padding: 28, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 40 },
  logoWrap: { width: 90, height: 90, borderRadius: 26, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', marginBottom: 20, ...SHADOWS.medium },
  logo: { width: 56, height: 56 },
  title: { fontSize: 34, fontWeight: '900', color: '#fff', letterSpacing: -1 },
  subtitle: { fontSize: 15, color: 'rgba(255,255,255,0.5)', marginTop: 8, textAlign: 'center', lineHeight: 22 },
  card: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 28, padding: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.09)', gap: 18 },
  field: { gap: 8 },
  label: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.45)', letterSpacing: 1.2 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  forgotLink: { fontSize: 12, fontWeight: '700', color: COLORS.primary },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 16, paddingHorizontal: 14, height: 56, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  input: { flex: 1, fontSize: 15, color: '#fff' },
  btn: { backgroundColor: COLORS.primary, height: 60, borderRadius: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, ...SHADOWS.medium },
  btnText: { color: '#fff', fontSize: 17, fontWeight: '800' },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.1)' },
  dividerText: { color: 'rgba(255,255,255,0.35)', fontSize: 13, fontWeight: '600' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 40, flexWrap: 'wrap' },
  footerText: { color: 'rgba(255,255,255,0.45)', fontSize: 14 },
  footerLink: { color: COLORS.primary, fontSize: 14, fontWeight: '800' },
  adminLink: { color: 'rgba(255,255,255,0.3)', fontSize: 13, fontWeight: '600', textDecorationLine: 'underline' },
  magicLinkBtn: { height: 56, borderRadius: 18, overflow: 'hidden', ...SHADOWS.small },
  magicLinkGradient: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  magicLinkText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  sentState: { alignItems: 'center', gap: 16, paddingVertical: 20 },
  sentIcon: { width: 80, height: 80, borderRadius: 24, backgroundColor: COLORS.primary + '20', justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.primary + '40' },
  sentTitle: { fontSize: 22, fontWeight: '900', color: '#fff' },
  sentMsg: { fontSize: 15, color: 'rgba(255,255,255,0.55)', textAlign: 'center', lineHeight: 24 },
  tryAgainBtn: { marginTop: 8 },
  tryAgainText: { color: COLORS.primary, fontWeight: '700', fontSize: 15 },
});

export default LoginScreen;
