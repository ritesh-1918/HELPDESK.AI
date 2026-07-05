import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet, View, Text, TouchableOpacity, ScrollView,
  ActivityIndicator, RefreshControl, StatusBar, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../../lib/supabase';
import { COLORS, SHADOWS } from '../../styles/theme';
import {
  Plus, Ticket, Clock, CheckCircle2, Activity, ChevronRight,
  Zap, TrendingUp, BarChart3,
} from 'lucide-react-native';

const DashboardScreen = () => {
  const navigation = useNavigation();
  const [profile, setProfile] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [unreadCount, setUnreadCount] = useState(0);

  const fetchData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (profileData) setProfile(profileData);

      // Fetch tickets
      const { data: ticketData } = await supabase
        .from('tickets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setTickets(ticketData || []);

      // Fetch unread notifications count
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('read', false);
      setUnreadCount(count || 0);

    } catch (e) {
      console.error('Dashboard fetch error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { 
    fetchData(); 

    // Subscribe to ticket changes
    const ticketsChannel = supabase
      .channel('dashboard_tickets')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'tickets' 
      }, () => fetchData())
      .subscribe();

    // Subscribe to notifications changes
    const notificationsChannel = supabase
      .channel('dashboard_notifications')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'notifications' 
      }, () => fetchData())
      .subscribe();

    return () => {
      supabase.removeChannel(ticketsChannel);
      supabase.removeChannel(notificationsChannel);
    };
  }, [fetchData]);

  const onRefresh = () => { setRefreshing(true); fetchData(); };

  const totalTickets = tickets.length;
  const activeTickets = tickets.filter(t => t.status !== 'resolved').length;
  const resolvedTickets = tickets.filter(t => t.status === 'resolved').length;
  const aiResolved = tickets.filter(t =>
    t.status?.includes('auto') || (t.status === 'resolved' && t.category)
  ).length;

  const recentTickets = tickets.slice(0, 3);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getStatusColor = (status) => {
    if (status === 'resolved') return COLORS.success;
    if (status === 'in_progress') return '#3b82f6';
    return '#f59e0b';
  };

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.userName}>{profile?.full_name || 'User'}</Text>
          </View>
          <Image
            source={require('../../../assets/logo_v1.png')}
            style={styles.headerLogo}
            resizeMode="contain"
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.actionItem} 
            onPress={() => navigation.navigate('KnowledgeBase')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#f0f9ff' }]}>
              <BarChart3 size={20} color="#0284c7" />
            </View>
            <Text style={styles.actionLabel}>Help Center</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionItem} 
            onPress={() => navigation.navigate('Notifications')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#fff7ed' }]}>
              <Zap size={20} color="#f59e0b" />
              {unreadCount > 0 && (
                <View style={styles.notifBadge}>
                  <Text style={styles.notifBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                </View>
              )}
            </View>
            <Text style={styles.actionLabel}>Alerts</Text>
          </TouchableOpacity>
        </View>

        {/* Report Ticket CTA */}
        <TouchableOpacity
          style={styles.ctaCard}
          onPress={() => navigation.navigate('CreateTicket')}
          activeOpacity={0.9}
        >
          <View style={styles.ctaContent}>
            <View style={styles.ctaIconWrap}>
              <Plus size={28} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.ctaTitle}>Report New Ticket</Text>
              <Text style={styles.ctaDesc}>Describe your issue — AI will categorize it instantly</Text>
            </View>
          </View>
          <ChevronRight size={22} color="rgba(255,255,255,0.6)" />
        </TouchableOpacity>

        {/* Insights */}
        <View style={styles.sectionHeader}>
          <BarChart3 size={18} color={COLORS.primary} />
          <Text style={styles.sectionTitle}>Insights</Text>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={[styles.statIconWrap, { backgroundColor: COLORS.primaryLight }]}>
              <Ticket size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.statValue}>{totalTickets}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIconWrap, { backgroundColor: '#fef3c7' }]}>
              <Activity size={20} color="#f59e0b" />
            </View>
            <Text style={styles.statValue}>{activeTickets}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIconWrap, { backgroundColor: '#dcfce7' }]}>
              <CheckCircle2 size={20} color={COLORS.success} />
            </View>
            <Text style={styles.statValue}>{resolvedTickets}</Text>
            <Text style={styles.statLabel}>Resolved</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIconWrap, { backgroundColor: '#dbeafe' }]}>
              <Zap size={20} color="#3b82f6" />
            </View>
            <Text style={styles.statValue}>{aiResolved}</Text>
            <Text style={styles.statLabel}>AI Resolved</Text>
          </View>
        </View>

        {/* Recent tickets */}
        <View style={styles.sectionHeader}>
          <Clock size={18} color={COLORS.primary} />
          <Text style={styles.sectionTitle}>Recent Tickets</Text>
          {tickets.length > 3 && (
            <TouchableOpacity onPress={() => navigation.navigate('Tickets')} style={{ marginLeft: 'auto' }}>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          )}
        </View>

        {recentTickets.length === 0 ? (
          <View style={styles.emptyState}>
            <Ticket size={40} color={COLORS.textMuted} strokeWidth={1.2} />
            <Text style={styles.emptyTitle}>No Tickets Yet</Text>
            <Text style={styles.emptyMsg}>Tap "Report New Ticket" above to get started</Text>
          </View>
        ) : (
          recentTickets.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.ticketCard}
              onPress={() => navigation.navigate('TicketTracking', { ticketId: item.id })}
              activeOpacity={0.8}
            >
              <View style={[styles.ticketStripe, { backgroundColor: getStatusColor(item.status) }]} />
              <View style={styles.ticketBody}>
                <View style={styles.ticketHeader}>
                  <Text style={styles.ticketSubject} numberOfLines={1}>{item.subject || 'Untitled'}</Text>
                  <View style={[styles.ticketBadge, { backgroundColor: getStatusColor(item.status) + '15' }]}>
                    <Text style={[styles.ticketBadgeText, { color: getStatusColor(item.status) }]}>
                      {item.status?.toUpperCase() || 'PENDING'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.ticketDate}>
                  {new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  scrollContent: { paddingBottom: 120 },
  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 24, paddingTop: 16, paddingBottom: 20,
  },
  greeting: { fontSize: 14, fontWeight: '600', color: COLORS.textLight, marginBottom: 4 },
  userName: { fontSize: 28, fontWeight: '900', color: COLORS.text, letterSpacing: -0.8 },
  headerLogo: { width: 44, height: 44, borderRadius: 14 },
  // Quick Actions
  quickActions: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, marginBottom: 20 },
  actionItem: { 
    flex: 1, backgroundColor: '#fff', borderRadius: 20, padding: 12, 
    flexDirection: 'row', alignItems: 'center', gap: 12, ...SHADOWS.soft,
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.03)'
  },
  actionIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  actionLabel: { fontSize: 13, fontWeight: '700', color: COLORS.text },
  notifBadge: { 
    position: 'absolute', 
    top: -4, 
    right: -4, 
    minWidth: 18, 
    height: 18, 
    borderRadius: 9, 
    backgroundColor: '#ef4444', 
    borderWidth: 1.5, 
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 2
  },
  notifBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '900',
    textAlign: 'center'
  },
  // CTA
  ctaCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.primary, marginHorizontal: 20, borderRadius: 24,
    padding: 20, marginBottom: 28, ...SHADOWS.medium,
  },
  ctaContent: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 16 },
  ctaIconWrap: {
    width: 52, height: 52, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center',
  },
  ctaTitle: { fontSize: 17, fontWeight: '800', color: '#fff', marginBottom: 4 },
  ctaDesc: { fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: '600', lineHeight: 18 },
  // Section
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 24, marginBottom: 16,
  },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  viewAll: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
  // Stats
  statsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, gap: 12, marginBottom: 28,
  },
  statCard: {
    width: '47%', backgroundColor: '#fff', borderRadius: 22, padding: 18,
    ...SHADOWS.soft, borderWidth: 1, borderColor: 'rgba(0,0,0,0.03)',
  },
  statIconWrap: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
  statValue: { fontSize: 28, fontWeight: '900', color: COLORS.text, marginBottom: 2 },
  statLabel: { fontSize: 12, fontWeight: '700', color: COLORS.textMuted },
  // Tickets
  ticketCard: {
    flexDirection: 'row', backgroundColor: '#fff', borderRadius: 20, marginHorizontal: 20,
    marginBottom: 12, overflow: 'hidden', ...SHADOWS.soft, borderWidth: 1, borderColor: 'rgba(0,0,0,0.03)',
  },
  ticketStripe: { width: 5 },
  ticketBody: { flex: 1, padding: 18 },
  ticketHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  ticketSubject: { fontSize: 15, fontWeight: '800', color: COLORS.text, flex: 1, marginRight: 10 },
  ticketBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100 },
  ticketBadgeText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  ticketDate: { fontSize: 12, fontWeight: '600', color: COLORS.textMuted },
  // Empty
  emptyState: { alignItems: 'center', paddingTop: 40, paddingBottom: 20, gap: 10, marginHorizontal: 20 },
  emptyTitle: { fontSize: 17, fontWeight: '800', color: COLORS.text },
  emptyMsg: { fontSize: 13, color: COLORS.textLight, textAlign: 'center' },
});

export default DashboardScreen;
