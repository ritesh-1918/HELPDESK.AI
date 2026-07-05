import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet, View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator,
  ScrollView, StatusBar, Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../../lib/supabase';
import { COLORS, SHADOWS } from '../../styles/theme';
import {
  Mail, Lock, User, Building2, Phone, Globe, Eye, EyeOff,
  ArrowRight, ArrowLeft, CheckCircle2, Shield,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useNotification } from '../../components/NotificationProvider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const AdminSignupScreen = () => {
  const navigation = useNavigation();
  const { success, error: notifyError } = useNotification();
  const insets = useSafeAreaInsets();

  // Admin personal fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Company fields
  const [companyName, setCompanyName] = useState('');
  const [companyDomain, setCompanyDomain] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleAdminSignup = async () => {
    if (!fullName || !email || !password || !confirmPassword || !companyName) {
      notifyError('Missing Fields', 'Please fill in all required fields.');
      return;
    }
    if (password.length < 6) {
      notifyError('Weak Password', 'Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      notifyError('Password Mismatch', 'Passwords do not match.');
      return;
    }

    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      // 1. Create the company first
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .insert([{
          name: companyName,
          domain: companyDomain || null,
          phone: companyPhone || null,
          status: 'pending_approval',
        }])
        .select()
        .single();

      if (companyError) throw companyError;

      // 2. Sign up the admin user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: 'admin',
            company: companyName,
            company_id: company.id,
          },
        },
      });

      if (error) throw error;

      // 3. Create admin_requests row for approval
      if (data.user) {
        await supabase.from('admin_requests').insert([{
          user_id: data.user.id,
          company_id: company.id,
          status: 'pending',
        }]).catch(() => {}); // Non-fatal if table doesn't exist yet
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      success('Application Submitted!', 'A master admin will review your request shortly.');
      setSubmitted(true);
    } catch (err) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      notifyError('Signup Failed', err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Success screen
  if (submitted) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.bgBlob1} />
        <View style={styles.successWrap}>
          <View style={styles.successIcon}>
            <Shield size={48} color={COLORS.primary} />
          </View>
          <Text style={styles.successTitle}>Application Submitted!</Text>
          <Text style={styles.successMsg}>
            We sent a verification email to{'\n'}
            <Text style={{ color: '#fff', fontWeight: '700' }}>{email}</Text>
            {'\n\n'}Once verified, a master admin will review and approve your company registration.
          </Text>
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
      <View style={styles.bgBlob2} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={[styles.scroll, { paddingTop: Math.max(insets.top + 16, 60) }]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {/* Back */}
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <ArrowLeft size={20} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.badge}>
              <Shield size={14} color={COLORS.primary} />
              <Text style={styles.badgeText}>ADMIN REGISTRATION</Text>
            </View>
            <Text style={styles.title}>Register Company</Text>
            <Text style={styles.subtitle}>Set up your company and admin account for HelpDesk.ai</Text>
          </View>

          {/* Company Section */}
          <Animated.View style={[styles.section, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <Text style={styles.sectionTitle}>🏢 Company Details</Text>

            <View style={styles.field}>
              <Text style={styles.label}>COMPANY NAME *</Text>
              <View style={styles.inputRow}>
                <Building2 size={18} color="rgba(255,255,255,0.4)" style={{ marginRight: 10 }} />
                <TextInput style={styles.input} placeholder="Acme Corporation" placeholderTextColor="rgba(255,255,255,0.3)" value={companyName} onChangeText={setCompanyName} />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>COMPANY DOMAIN (optional)</Text>
              <View style={styles.inputRow}>
                <Globe size={18} color="rgba(255,255,255,0.4)" style={{ marginRight: 10 }} />
                <TextInput style={styles.input} placeholder="acme.com" placeholderTextColor="rgba(255,255,255,0.3)" value={companyDomain} onChangeText={setCompanyDomain} autoCapitalize="none" keyboardType="url" />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>COMPANY PHONE (optional)</Text>
              <View style={styles.inputRow}>
                <Phone size={18} color="rgba(255,255,255,0.4)" style={{ marginRight: 10 }} />
                <TextInput style={styles.input} placeholder="+1 555 000 0000" placeholderTextColor="rgba(255,255,255,0.3)" value={companyPhone} onChangeText={setCompanyPhone} keyboardType="phone-pad" />
              </View>
            </View>
          </Animated.View>

          {/* Admin Section */}
          <Animated.View style={[styles.section, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <Text style={styles.sectionTitle}>👤 Admin Account</Text>

            <View style={styles.field}>
              <Text style={styles.label}>FULL NAME *</Text>
              <View style={styles.inputRow}>
                <User size={18} color="rgba(255,255,255,0.4)" style={{ marginRight: 10 }} />
                <TextInput style={styles.input} placeholder="John Smith" placeholderTextColor="rgba(255,255,255,0.3)" value={fullName} onChangeText={setFullName} />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>WORK EMAIL *</Text>
              <View style={styles.inputRow}>
                <Mail size={18} color="rgba(255,255,255,0.4)" style={{ marginRight: 10 }} />
                <TextInput style={styles.input} placeholder="john@acme.com" placeholderTextColor="rgba(255,255,255,0.3)" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>PASSWORD *</Text>
              <View style={styles.inputRow}>
                <Lock size={18} color="rgba(255,255,255,0.4)" style={{ marginRight: 10 }} />
                <TextInput style={styles.input} placeholder="Min 6 characters" placeholderTextColor="rgba(255,255,255,0.3)" value={password} onChangeText={setPassword} secureTextEntry={!showPassword} />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={18} color="rgba(255,255,255,0.4)" /> : <Eye size={18} color="rgba(255,255,255,0.4)" />}
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>CONFIRM PASSWORD *</Text>
              <View style={styles.inputRow}>
                <Lock size={18} color="rgba(255,255,255,0.4)" style={{ marginRight: 10 }} />
                <TextInput style={styles.input} placeholder="Repeat password" placeholderTextColor="rgba(255,255,255,0.3)" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={!showConfirmPassword} />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? <EyeOff size={18} color="rgba(255,255,255,0.4)" /> : <Eye size={18} color="rgba(255,255,255,0.4)" />}
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.btn} onPress={handleAdminSignup} disabled={loading} activeOpacity={0.85}>
              {loading ? <ActivityIndicator color="#fff" /> : (
                <>
                  <Text style={styles.btnText}>Submit Application</Text>
                  <Shield size={20} color="#fff" />
                </>
              )}
            </TouchableOpacity>

            <Text style={styles.disclaimer}>
              After submission, a master admin will review and approve your company registration. This may take up to 24 hours.
            </Text>
          </Animated.View>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b1120' },
  bgBlob1: { position: 'absolute', top: -120, right: -80, width: 300, height: 300, borderRadius: 150, backgroundColor: COLORS.primary + '20' },
  bgBlob2: { position: 'absolute', bottom: -80, left: -80, width: 240, height: 240, borderRadius: 120, backgroundColor: '#8b5cf618' },
  scroll: { flexGrow: 1, padding: 28, gap: 24 },
  backBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.07)', justifyContent: 'center', alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.09)' },
  header: { gap: 10, marginBottom: 8 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.primary + '15', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, alignSelf: 'flex-start', borderWidth: 1, borderColor: COLORS.primary + '30' },
  badgeText: { fontSize: 11, fontWeight: '800', color: COLORS.primary, letterSpacing: 1.2 },
  title: { fontSize: 30, fontWeight: '900', color: '#fff', letterSpacing: -0.8 },
  subtitle: { fontSize: 15, color: 'rgba(255,255,255,0.45)', lineHeight: 22 },
  section: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 28, padding: 22, borderWidth: 1, borderColor: 'rgba(255,255,255,0.09)', gap: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#fff', marginBottom: 4 },
  field: { gap: 8 },
  label: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.45)', letterSpacing: 1.2 },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 16, paddingHorizontal: 14, height: 56, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  input: { flex: 1, fontSize: 15, color: '#fff' },
  btn: { backgroundColor: COLORS.primary, height: 60, borderRadius: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 4, ...SHADOWS.medium },
  btnText: { color: '#fff', fontSize: 17, fontWeight: '800' },
  disclaimer: { fontSize: 13, color: 'rgba(255,255,255,0.35)', textAlign: 'center', lineHeight: 20 },
  // Success
  successWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, gap: 20 },
  successIcon: { width: 100, height: 100, borderRadius: 30, backgroundColor: COLORS.primary + '20', justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.primary + '50' },
  successTitle: { fontSize: 26, fontWeight: '900', color: '#fff', textAlign: 'center' },
  successMsg: { fontSize: 15, color: 'rgba(255,255,255,0.55)', textAlign: 'center', lineHeight: 26 },
});

export default AdminSignupScreen;
