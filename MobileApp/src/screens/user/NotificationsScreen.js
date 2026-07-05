import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { COLORS, SHADOWS } from '../../styles/theme';
import { Bell, Sparkles, MessageSquare, AlertCircle, Info, CheckCircle2 } from 'lucide-react-native';

const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        if (error.code === 'PGRST205') {
          console.warn('Notifications table not found in Supabase. Showing empty state.');
          setNotifications([]);
          return;
        }
        throw error;
      }
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Subscribe to new notifications
    const channel = supabase
      .channel('public:notifications')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'notifications' 
      }, (payload) => {
        setNotifications(prev => [payload.new, ...prev]);
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const markAsRead = async (id) => {
    try {
      await supabase
        .from('notifications')
        .update({ is_unread: false })
        .eq('id', id);
      
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_unread: false } : n)
      );
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'ai_update': return Sparkles;
      case 'message': return MessageSquare;
      case 'status_change': return CheckCircle2;
      case 'alert': return AlertCircle;
      default: return Bell;
    }
  };

  const getColor = (type) => {
    switch (type) {
      case 'ai_update': return COLORS.primary;
      case 'alert': return '#ef4444';
      case 'status_change': return COLORS.success;
      default: return COLORS.textMuted;
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(date).toLocaleDateString();
  };

  const NotificationItem = ({ item }) => {
    const Icon = getIcon(item.type);
    const color = getColor(item.type);
    
    return (
      <TouchableOpacity 
        style={[styles.notificationCard, item.is_unread && styles.unreadCard]}
        onPress={() => markAsRead(item.id)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
          <Icon size={20} color={color} />
        </View>
        <View style={styles.notificationContent}>
          <Text style={styles.notificationTitle}>{item.title}</Text>
          <Text style={styles.notificationMessage} numberOfLines={2}>{item.message}</Text>
          <Text style={styles.notificationTime}>{formatTime(item.created_at)}</Text>
        </View>
        {item.is_unread && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchNotifications(); }} />}
        >
          {notifications.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Bell size={60} color={COLORS.border} strokeWidth={1} />
              <Text style={styles.emptyText}>No notifications yet</Text>
            </View>
          ) : (
            notifications.map((item) => (
              <NotificationItem key={item.id} item={item} />
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
    backgroundColor: COLORS.background,
  },
  headerTitle: { fontSize: 32, fontWeight: '900', color: COLORS.text, letterSpacing: -1 },
  scrollContent: { padding: 24, paddingBottom: 120 },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
    ...SHADOWS.soft
  },
  unreadCard: {
    backgroundColor: COLORS.primaryLight + '20',
    borderColor: COLORS.primaryLight
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16
  },
  notificationContent: { flex: 1, justifyContent: 'center' },
  notificationTitle: { fontSize: 16, fontWeight: '800', color: COLORS.text, marginBottom: 4 },
  notificationMessage: { fontSize: 14, color: COLORS.textLight, lineHeight: 20, marginBottom: 8 },
  notificationTime: { fontSize: 12, color: COLORS.textMuted, fontWeight: '600' },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
    marginTop: 6
  },
  emptyContainer: { alignItems: 'center', marginTop: 100, gap: 16 },
  emptyText: { fontSize: 16, color: COLORS.textMuted, fontWeight: '600' }
});

export default NotificationsScreen;
