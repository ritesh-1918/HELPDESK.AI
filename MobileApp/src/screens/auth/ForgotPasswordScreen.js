import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet, View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator,
  ScrollView, StatusBar, Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../../lib/supabase';
import { COLORS, SHADOWS } from '../../styles/theme';
import { Mail, KeyRound, Lock, ShieldCheck, ArrowRight, ArrowLeft, CheckCircle2, Eye, EyeOff } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useNotification } from '../../components/NotificationProvider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TOTAL_STEPS = 3;

const StepIndicator = ({ currentStep }) => (
  <View style={styles.stepRow}>
    {[1, 2, 3].map((s) => (
      <View key={s} style={styles.stepItem}>
        <View style={[styles.stepDot, currentStep >= s && styles.stepDotActive, currentStep > s && styles.stepDotDone]}>
          {currentStep > s
            ? <CheckCircle2 size={14} color="#fff" />
            : <Text style={[styles.stepNum, currentStep >= s && styles.stepNumActive]}>{s}</Text>}
        </View>
        {s < 3 && <View style={[styles.stepLine, currentStep > s && styles.stepLineActive]} />}
      </View>
    ))}
  </View>
);

const ForgotPasswordScreen = () => {
  const navigation = useNavigation();
  const { success, error: notifyError, info } = useNotification();
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // OTP countdown timer (15 minutes)
  const [timeLeft, setTimeLeft] = useState(900);
  const [timerExpired, setTimerExpired] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  // Animate on step change
  const animateStep = () => {
    fadeAnim.setValue(0);
    slideAnim.setValue(20);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
  };

  // Timer for step 2
  useEffect(() => {
    if (step !== 2) return;
    setTimerExpired(false);
    setTimeLeft(900);
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setTimerExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [step]);

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const goToStep = (n) => {
    setStep(n);
    animateStep();
  };

  // Step 1: Send OTP
  const handleSendOtp = async () => {
    if (!email) { notifyError('Email Required', 'Please enter your email address.'); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      info('Code Sent', `Check your email for the 6-digit recovery code.`);
      goToStep(2);
    } catch (err) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      notifyError('Failed to Send', err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) { notifyError('Invalid Code', 'Please enter the 6-digit code.'); return; }
    if (timerExpired) { notifyError('Code Expired', 'Please request a new code.'); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({ email, token: otp, type: 'recovery' });
      if (error) throw error;
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      info('Code Verified', 'Now set your new password.');
      goToStep(3);
    } catch (err) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      notifyError('Invalid Code', 'The code is wrong or expired. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Update Password
  const handleUpdatePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      notifyError('Weak Password', 'Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      success('Password Updated!', 'You can now sign in with your new password.');
      goToStep(4);
    } catch (err) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      notifyError('Update Failed', err.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  // Step 4: Success
  if (step === 4) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.bgBlob1} />
        <View style={styles.successWrap}>
          <View style={styles.successIcon}>
            <ShieldCheck size={48} color={COLORS.primary} />
          </View>
          <Text style={styles.successTitle}>Password Updated!</Text>
          <Text style={styles.successMsg}>Your password has been successfully changed. You can now sign in with your new credentials.</Text>
          <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('Login')} activeOpacity={0.85}>
            <Text style={styles.btnText}>Back to Login</Text>
            <ArrowRight size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.bgBlob1} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={[styles.scroll, { paddingTop: Math.max(insets.top + 16, 60) }]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {/* Back Button */}
          <TouchableOpacity style={styles.backBtn} onPress={() => step === 1 ? navigation.goBack() : goToStep(step - 1)}>
            <ArrowLeft size={20} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>
              {step === 1 && 'Enter your email to receive a recovery code'}
              {step === 2 && 'Enter the 6-digit code sent to your email'}
              {step === 3 && 'Create a strong new password'}
            </Text>
          </View>

          {/* Step Indicator */}
          <StepIndicator currentStep={step} />

          {/* Card */}
          <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

            {/* Step 1 */}
            {step === 1 && (
              <>
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
                      autoFocus
                    />
                  </View>
                </View>
                <TouchableOpacity style={styles.btn} onPress={handleSendOtp} disabled={loading} activeOpacity={0.85}>
                  {loading ? <ActivityIndicator color="#fff" /> : (
                    <>
                      <Text style={styles.btnText}>Send Recovery Code</Text>
                      <ArrowRight size={20} color="#fff" />
                    </>
                  )}
                </TouchableOpacity>
              </>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <>
                <View style={styles.otpInfo}>
                  <Mail size={20} color={COLORS.primary} />
                  <Text style={styles.otpInfoText}>Sent to <Text style={{ color: '#fff', fontWeight: '700' }}>{email}</Text></Text>
                </View>

                <View style={styles.field}>
                  <View style={styles.labelRow}>
                    <Text style={styles.label}>6-DIGIT CODE</Text>
                    <Text style={[styles.timer, timerExpired && styles.timerExpired]}>
                      {timerExpired ? 'EXPIRED' : formatTime(timeLeft)}
                    </Text>
                  </View>
                  <View style={styles.inputRow}>
                    <KeyRound size={18} color="rgba(255,255,255,0.4)" style={{ marginRight: 10 }} />
                    <TextInput
                      style={[styles.input, styles.otpInput]}
                      placeholder="••••••"
                      placeholderTextColor="rgba(255,255,255,0.3)"
                      value={otp}
                      onChangeText={setOtp}
                      keyboardType="number-pad"
                      maxLength={6}
                      autoFocus
                    />
                  </View>
                </View>

                <TouchableOpacity style={styles.btn} onPress={handleVerifyOtp} disabled={loading || timerExpired} activeOpacity={0.85}>
                  {loading ? <ActivityIndicator color="#fff" /> : (
                    <>
                      <Text style={styles.btnText}>Verify Code</Text>
                      <ArrowRight size={20} color="#fff" />
                    </>
                  )}
                </TouchableOpacity>

                {timerExpired && (
                  <TouchableOpacity style={styles.resendBtn} onPress={() => goToStep(1)}>
                    <Text style={styles.resendText}>Resend Code</Text>
                  </TouchableOpacity>
                )}
              </>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <>
                <View style={styles.field}>
                  <Text style={styles.label}>NEW PASSWORD</Text>
                  <View style={styles.inputRow}>
                    <Lock size={18} color="rgba(255,255,255,0.4)" style={{ marginRight: 10 }} />
                    <TextInput
                      style={styles.input}
                      placeholder="Min 6 characters"
                      placeholderTextColor="rgba(255,255,255,0.3)"
                      value={newPassword}
                      onChangeText={setNewPassword}
                      secureTextEntry={!showPassword}
                      autoFocus
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff size={18} color="rgba(255,255,255,0.4)" /> : <Eye size={18} color="rgba(255,255,255,0.4)" />}
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity style={styles.btn} onPress={handleUpdatePassword} disabled={loading} activeOpacity={0.85}>
                  {loading ? <ActivityIndicator color="#fff" /> : (
                    <>
                      <Text style={styles.btnText}>Update Password</Text>
                      <ShieldCheck size={20} color="#fff" />
                    </>
                  )}
                </TouchableOpacity>
              </>
            )}

          </Animated.View>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b1120' },
  bgBlob1: { position: 'absolute', top: -120, right: -80, width: 300, height: 300, borderRadius: 150, backgroundColor: COLORS.primary + '20' },
  scroll: { flexGrow: 1, padding: 28 },
  backBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.07)', justifyContent: 'center', alignItems: 'center', marginBottom: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.09)' },
  header: { marginBottom: 32 },
  title: { fontSize: 30, fontWeight: '900', color: '#fff', letterSpacing: -0.8 },
  subtitle: { fontSize: 15, color: 'rgba(255,255,255,0.45)', marginTop: 8, lineHeight: 22 },
  // Step Indicator
  stepRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 32 },
  stepItem: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  stepDot: { width: 32, height: 32, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.08)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  stepDotActive: { backgroundColor: COLORS.primary + '30', borderColor: COLORS.primary + '60' },
  stepDotDone: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  stepNum: { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.35)' },
  stepNumActive: { color: COLORS.primary },
  stepLine: { flex: 1, height: 2, backgroundColor: 'rgba(255,255,255,0.08)', marginHorizontal: 6 },
  stepLineActive: { backgroundColor: COLORS.primary },
  // Card
  card: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 28, padding: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.09)', gap: 18 },
  field: { gap: 8 },
  label: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.45)', letterSpacing: 1.2 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 16, paddingHorizontal: 14, height: 56, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  input: { flex: 1, fontSize: 15, color: '#fff' },
  otpInput: { fontSize: 22, fontWeight: '700', letterSpacing: 8 },
  btn: { backgroundColor: COLORS.primary, height: 60, borderRadius: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, ...SHADOWS.medium },
  btnText: { color: '#fff', fontSize: 17, fontWeight: '800' },
  // OTP Step
  otpInfo: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: COLORS.primary + '15', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: COLORS.primary + '30' },
  otpInfoText: { fontSize: 14, color: 'rgba(255,255,255,0.6)' },
  timer: { fontSize: 13, fontWeight: '800', color: COLORS.primary, letterSpacing: 1 },
  timerExpired: { color: '#ef4444' },
  resendBtn: { alignItems: 'center', paddingVertical: 4 },
  resendText: { color: COLORS.primary, fontWeight: '700', fontSize: 15 },
  // Success
  successWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, gap: 20 },
  successIcon: { width: 100, height: 100, borderRadius: 30, backgroundColor: COLORS.primary + '20', justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.primary + '50' },
  successTitle: { fontSize: 26, fontWeight: '900', color: '#fff', textAlign: 'center' },
  successMsg: { fontSize: 15, color: 'rgba(255,255,255,0.55)', textAlign: 'center', lineHeight: 26 },
});

export default ForgotPasswordScreen;
