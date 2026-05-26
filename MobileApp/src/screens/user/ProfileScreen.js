import React, { useState, useEffect } from 'react';
import {
  StyleSheet, View, Text, TextInput, TouchableOpacity,
  ScrollView, StatusBar, ActivityIndicator, Modal, Alert, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { COLORS, SHADOWS } from '../../styles/theme';
import {
  User, Mail, Building2, ShieldCheck, Calendar, Ticket, Zap,
  Lock, LogOut, ChevronRight, Pencil, Check, X, Phone, Briefcase,
  ArrowUpRight, Eye, EyeOff, Camera,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';
import { useFocusEffect } from '@react-navigation/native';
import { useNotification } from '../../components/NotificationProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileScreen = () => {
  const { success, error: notifyError } = useNotification();

  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ full_name: '', job_title: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const fetchAll = React.useCallback(async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;
      setUser(authUser);

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (profileData) {
        setProfile(profileData);
        setFormData({
          full_name: profileData.full_name || '',
          job_title: profileData.job_title || '',
          phone: profileData.phone || '',
        });
      }

      const { data: ticketData } = await supabase
        .from('tickets')
        .select('*')
        .eq('user_id', authUser.id);
      setTickets(ticketData || []);
    } catch (e) {
      console.error('Profile fetch error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchAll();
    }, [fetchAll])
  );

  const handleAvatarPress = () => {
    Alert.alert(
      'Profile Photo',
      'Choose an option to update your profile photo',
      [
        { text: 'Upload New Photo', onPress: uploadAvatar },
        { 
          text: 'Remove Photo', 
          onPress: removeAvatar, 
          style: 'destructive' 
        },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const removeAvatar = async () => {
    setUploading(true);
    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_picture: null })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setProfile({ ...profile, profile_picture: null });
      success('Success', 'Profile picture removed!');
      fetchAll();
    } catch (e) {
      console.error('Avatar Removal Error:', e);
      notifyError('Failed to Remove', e.message);
    } finally {
      setUploading(false);
    }
  };

  const uploadAvatar = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions?.Images || 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true, 
      });

      if (result.canceled) return;

      setUploading(true);
      const photo = result.assets[0];
      
      const fileExt = photo.uri.split('.').pop().toLowerCase();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;

      // Use base64 for more reliable upload on mobile
      const { error: uploadError } = await supabase.storage
        .from('profile-pics')
        .upload(fileName, decode(photo.base64), {
          contentType: `image/${fileExt}`,
          upsert: true
        });

      if (uploadError) {
        if (uploadError.message.includes('bucket not found')) {
          throw new Error('Supabase Storage bucket "profile-pics" not found. Please create a public bucket named "profile-pics" in your Supabase dashboard.');
        }
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('profile-pics')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_picture: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setProfile({ ...profile, profile_picture: publicUrl });
      success('Success', 'Profile picture updated!');
      fetchAll(); // Refresh everything
    } catch (e) {
      console.error('Avatar Upload Error:', e);
      notifyError('Upload Failed', e.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.full_name.trim()) {
      notifyError('Invalid', 'Name cannot be empty.');
      return;
    }
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name.trim(),
          job_title: formData.job_title.trim(),
          phone: formData.phone.trim(),
        })
        .eq('id', profile.id)
        .select()
        .single();

      if (error) throw error;
      setProfile(data);
      setIsEditing(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      success('Profile Updated', 'Your details have been saved.');
    } catch (e) {
      notifyError('Save Failed', e.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!newPassword || newPassword.length < 6) {
      notifyError('Weak Password', 'Must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      notifyError('Mismatch', 'Passwords do not match.');
      return;
    }
    setPasswordLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      success('Password Updated', 'Your new password is now active.');
      setShowPasswordModal(false);
      setNewPassword('');
      setConfirmPassword('');
    } catch (e) {
      notifyError('Failed', e.message);
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      // Forcefully wipe all Supabase session keys from AsyncStorage first to trigger instant navigation resetting
      const keys = await AsyncStorage.getAllKeys();
      const supabaseKeys = keys.filter(k => k.startsWith('sb-') || k.includes('supabase'));
      for (const key of supabaseKeys) {
        await AsyncStorage.removeItem(key);
      }
      await supabase.auth.signOut();
    } catch (e) {
      console.warn("Logout error, forcing full wipe:", e);
      await AsyncStorage.clear();
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase()
    : (profile?.email?.[0] || 'U').toUpperCase();

  const ticketsCreated = tickets.length;
  const ticketsResolved = tickets.filter(t => t.status === 'resolved').length;
  const ticketsActive = tickets.filter(t => t.status !== 'resolved').length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerLabel}>ACCOUNT</Text>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <TouchableOpacity style={styles.avatarContainer} onPress={handleAvatarPress} disabled={uploading}>
            {profile?.profile_picture ? (
              <Image source={{ uri: profile.profile_picture }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
            )}
            <View style={styles.cameraIcon}>
              {uploading ? <ActivityIndicator size="small" color="#fff" /> : <Camera size={14} color="#fff" />}
            </View>
          </TouchableOpacity>

          {!isEditing ? (
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{profile?.full_name || 'User'}</Text>
              <View style={styles.metaRow}>
                <Mail size={14} color={COLORS.textMuted} />
                <Text style={styles.metaText}>{profile?.email}</Text>
              </View>
              {profile?.job_title ? (
                <View style={styles.metaRow}>
                  <Briefcase size={14} color={COLORS.textMuted} />
                  <Text style={styles.metaText}>{profile.job_title}</Text>
                </View>
              ) : null}
              {profile?.phone ? (
                <View style={styles.metaRow}>
                  <Phone size={14} color={COLORS.textMuted} />
                  <Text style={styles.metaText}>{profile.phone}</Text>
                </View>
              ) : null}
              <TouchableOpacity style={styles.editBtn} onPress={() => setIsEditing(true)}>
                <Pencil size={14} color={COLORS.primary} />
                <Text style={styles.editBtnText}>Edit Profile</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.editForm}>
              <View style={styles.editField}>
                <Text style={styles.editLabel}>FULL NAME</Text>
                <TextInput
                  style={styles.editInput}
                  value={formData.full_name}
                  onChangeText={(v) => setFormData({ ...formData, full_name: v })}
                  placeholder="Your full name"
                />
              </View>
              <View style={styles.editField}>
                <Text style={styles.editLabel}>JOB TITLE</Text>
                <TextInput
                  style={styles.editInput}
                  value={formData.job_title}
                  onChangeText={(v) => setFormData({ ...formData, job_title: v })}
                  placeholder="e.g. Software Engineer"
                />
              </View>
              <View style={styles.editField}>
                <Text style={styles.editLabel}>PHONE</Text>
                <TextInput
                  style={styles.editInput}
                  value={formData.phone}
                  onChangeText={(v) => setFormData({ ...formData, phone: v })}
                  placeholder="+91 00000 00000"
                  keyboardType="phone-pad"
                />
              </View>
              <View style={styles.editActions}>
                <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
                  {saving ? <ActivityIndicator size="small" color="#fff" /> : (
                    <>
                      <Check size={16} color="#fff" />
                      <Text style={styles.saveBtnText}>Save</Text>
                    </>
                  )}
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsEditing(false)}>
                  <X size={16} color={COLORS.textLight} />
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Account Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoCardTitle}>Account Details</Text>
          <InfoRow icon={Building2} label="Company" value={profile?.company || '—'} />
          <InfoRow icon={ShieldCheck} label="Role" value={profile?.role?.toUpperCase() || 'USER'} valueColor={COLORS.primary} />
          <InfoRow icon={Calendar} label="Joined" value={profile?.created_at ? new Date(profile.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : '—'} />
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <StatMini icon={Ticket} value={ticketsCreated} label="Total" />
          <StatMini icon={Zap} value={ticketsResolved} label="Resolved" color={COLORS.success} />
          <StatMini icon={ArrowUpRight} value={ticketsActive} label="Active" color="#f59e0b" />
        </View>

        {/* Settings */}
        <View style={styles.settingsCard}>
          <TouchableOpacity style={styles.settingItem} onPress={() => setShowPasswordModal(true)}>
            <View style={[styles.settingIcon, { backgroundColor: '#dbeafe' }]}>
              <Lock size={18} color="#3b82f6" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingTitle}>Change Password</Text>
              <Text style={styles.settingDesc}>Update your security credentials</Text>
            </View>
            <ChevronRight size={18} color={COLORS.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.settingItem, { borderBottomWidth: 0 }]} onPress={handleLogout}>
            <View style={[styles.settingIcon, { backgroundColor: '#fef2f2' }]}>
              <LogOut size={18} color="#ef4444" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.settingTitle, { color: '#ef4444' }]}>Sign Out</Text>
              <Text style={styles.settingDesc}>End your current session</Text>
            </View>
            <ChevronRight size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        <Text style={styles.version}>HelpDesk.ai Mobile v1.0.0</Text>
      </ScrollView>

      {/* Password Modal */}
      <Modal visible={showPasswordModal} transparent animationType="fade" onRequestClose={() => setShowPasswordModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Lock size={20} color={COLORS.primary} />
              <Text style={styles.modalTitle}>Change Password</Text>
              <TouchableOpacity onPress={() => setShowPasswordModal(false)}>
                <X size={22} color={COLORS.textLight} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.editField}>
                <Text style={styles.editLabel}>NEW PASSWORD</Text>
                <View style={styles.passRow}>
                  <TextInput
                    style={[styles.editInput, { flex: 1 }]}
                    placeholder="Min 6 characters"
                    secureTextEntry={!showPass}
                    value={newPassword}
                    onChangeText={setNewPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                    {showPass ? <EyeOff size={18} color={COLORS.textMuted} /> : <Eye size={18} color={COLORS.textMuted} />}
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.editField}>
                <Text style={styles.editLabel}>CONFIRM PASSWORD</Text>
                <TextInput
                  style={styles.editInput}
                  placeholder="Repeat password"
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
              </View>

              <TouchableOpacity
                style={[styles.saveBtn, { width: '100%', height: 52 }]}
                onPress={handlePasswordChange}
                disabled={passwordLoading}
              >
                {passwordLoading ? <ActivityIndicator color="#fff" /> : (
                  <>
                    <ShieldCheck size={18} color="#fff" />
                    <Text style={styles.saveBtnText}>Update Password</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const InfoRow = ({ icon: Icon, label, value, valueColor }) => (
  <View style={styles.infoRow}>
    <View style={styles.infoLeft}>
      <Icon size={16} color={COLORS.textMuted} />
      <Text style={styles.infoLabel}>{label}</Text>
    </View>
    <Text style={[styles.infoValue, valueColor && { color: valueColor }]}>{value}</Text>
  </View>
);

const StatMini = ({ icon: Icon, value, label, color = COLORS.primary }) => (
  <View style={styles.statMini}>
    <Icon size={18} color={color} />
    <Text style={styles.statMiniValue}>{value}</Text>
    <Text style={styles.statMiniLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  scrollContent: { padding: 24, paddingBottom: 120 },
  // Header
  header: { marginBottom: 24 },
  headerLabel: { fontSize: 11, fontWeight: '800', color: COLORS.textMuted, letterSpacing: 1.5, marginBottom: 4 },
  headerTitle: { fontSize: 30, fontWeight: '900', color: COLORS.text, letterSpacing: -0.8 },
  // Profile Card
  profileCard: {
    backgroundColor: '#fff', borderRadius: 28, padding: 24,
    ...SHADOWS.soft, borderWidth: 1, borderColor: 'rgba(0,0,0,0.03)', marginBottom: 20,
  },
  avatarContainer: {
    width: 84, height: 84, borderRadius: 28,
    backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center',
    marginBottom: 20, ...SHADOWS.medium, position: 'relative'
  },
  avatarImage: { width: '100%', height: '100%', borderRadius: 28 },
  avatarPlaceholder: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  cameraIcon: {
    position: 'absolute', bottom: -4, right: -4,
    width: 28, height: 28, borderRadius: 10,
    backgroundColor: COLORS.primary, borderWidth: 2, borderColor: '#fff',
    justifyContent: 'center', alignItems: 'center'
  },
  avatarText: { fontSize: 32, fontWeight: '900', color: '#fff' },
  profileInfo: { gap: 8 },
  profileName: { fontSize: 24, fontWeight: '900', color: COLORS.text, marginBottom: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  metaText: { fontSize: 13, fontWeight: '600', color: COLORS.textLight },
  editBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12,
    alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 8,
    backgroundColor: COLORS.primaryLight, borderRadius: 12, borderWidth: 1, borderColor: COLORS.primary + '30',
  },
  editBtnText: { fontSize: 13, fontWeight: '700', color: COLORS.primary },
  // Edit form
  editForm: { gap: 14 },
  editField: { gap: 6 },
  editLabel: { fontSize: 10, fontWeight: '800', color: COLORS.textMuted, letterSpacing: 1.2 },
  editInput: {
    backgroundColor: COLORS.background, borderRadius: 14, paddingHorizontal: 16,
    height: 48, fontSize: 15, fontWeight: '600', color: COLORS.text,
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)',
  },
  editActions: { flexDirection: 'row', gap: 10, marginTop: 6 },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: COLORS.primary, paddingHorizontal: 20, height: 44, borderRadius: 14,
    ...SHADOWS.medium,
  },
  saveBtnText: { fontSize: 14, fontWeight: '800', color: '#fff' },
  cancelBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 16, height: 44, borderRadius: 14,
    borderWidth: 1.5, borderColor: 'rgba(0,0,0,0.08)',
  },
  cancelBtnText: { fontSize: 14, fontWeight: '700', color: COLORS.textLight },
  // Info card
  infoCard: {
    backgroundColor: '#fff', borderRadius: 24, padding: 20,
    ...SHADOWS.soft, borderWidth: 1, borderColor: 'rgba(0,0,0,0.03)', marginBottom: 20,
  },
  infoCardTitle: { fontSize: 16, fontWeight: '800', color: COLORS.text, marginBottom: 16 },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.04)',
  },
  infoLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  infoLabel: { fontSize: 13, fontWeight: '700', color: COLORS.textLight },
  infoValue: { fontSize: 13, fontWeight: '700', color: COLORS.text, maxWidth: '55%', textAlign: 'right' },
  // Stats
  statsRow: {
    flexDirection: 'row', gap: 12, marginBottom: 20,
  },
  statMini: {
    flex: 1, backgroundColor: '#fff', borderRadius: 20, padding: 16,
    alignItems: 'center', gap: 6, ...SHADOWS.soft,
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.03)',
  },
  statMiniValue: { fontSize: 22, fontWeight: '900', color: COLORS.text },
  statMiniLabel: { fontSize: 11, fontWeight: '700', color: COLORS.textMuted },
  // Settings
  settingsCard: {
    backgroundColor: '#fff', borderRadius: 24, overflow: 'hidden',
    ...SHADOWS.soft, borderWidth: 1, borderColor: 'rgba(0,0,0,0.03)', marginBottom: 20,
  },
  settingItem: {
    flexDirection: 'row', alignItems: 'center', padding: 18, gap: 14,
    borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.04)',
  },
  settingIcon: { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  settingTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: 2 },
  settingDesc: { fontSize: 12, fontWeight: '600', color: COLORS.textMuted },
  version: { textAlign: 'center', fontSize: 12, fontWeight: '600', color: COLORS.textMuted, marginTop: 10 },
  // Password Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
  modalSheet: { backgroundColor: '#fff', borderRadius: 28, overflow: 'hidden' },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text, flex: 1, marginLeft: 10 },
  modalBody: { padding: 24, gap: 18 },
  passRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
});

export default ProfileScreen;
