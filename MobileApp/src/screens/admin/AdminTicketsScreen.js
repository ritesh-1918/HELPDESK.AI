import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet, View, Text, FlatList, TextInput, TouchableOpacity,
  ActivityIndicator, RefreshControl, StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { supabase } from '../../lib/supabase';
import { COLORS, SHADOWS } from '../../styles/theme';
import { Search, ChevronRight, AlertCircle, Clock, CheckCircle2, SlidersHorizontal, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

const FILTER_TABS = [
  { id: 'all', label: 'All Queue' },
  { id: 'pending', label: 'Open / Pending' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'resolved', label: 'Resolved' },
  { id: 'closed', label: 'Closed' }
];

const AdminTicketsScreen = () => {
  const navigation = useNavigation();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const fetchTickets = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('company')
        .eq('id', user.id)
        .single();

      let query = supabase
        .from('tickets')
        .select(`
          *,
          creator:profiles!tickets_user_id_fkey(full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (profile?.company) {
        query = query.eq('company', profile.company);
      }

      const { data, error } = await query;
      if (error) {
        // Safe fallback without profiles relation if needed
        const { data: fallbackData } = await supabase
          .from('tickets')
          .select('*')
          .eq('company', profile?.company)
          .order('created_at', { ascending: false });
        setTickets(fallbackData || []);
      } else {
        setTickets(data || []);
      }
    } catch (e) {
      console.error('Fetch admin tickets queue error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Fetch when screen focuses
  useFocusEffect(
    useCallback(() => {
      fetchTickets();
    }, [fetchTickets])
  );

  const onRefresh = () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    fetchTickets();
  };

  const getFilteredTickets = () => {
    let filtered = tickets;

    // Filter by tab with self-healing DB status mapping
    if (activeFilter !== 'all') {
      filtered = filtered.filter(t => {
        const rawStatus = String(t.status || '').toLowerCase().trim();
        
        if (activeFilter === 'pending') {
          return rawStatus === 'pending' || rawStatus === 'open' || rawStatus === 'pending_human';
        }
        if (activeFilter === 'in_progress') {
          return rawStatus === 'in progress' || rawStatus === 'in_progress';
        }
        if (activeFilter === 'resolved') {
          return rawStatus === 'resolved' || rawStatus === 'auto_resolved' || rawStatus.includes('resolv');
        }
        if (activeFilter === 'closed') {
          return rawStatus === 'closed';
        }
        return rawStatus === activeFilter.toLowerCase();
      });
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(t => 
        t.subject?.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q) ||
        t.category?.toLowerCase().includes(q) ||
        t.priority?.toLowerCase().includes(q) ||
        t.creator?.full_name?.toLowerCase().includes(q) ||
        String(t.id).includes(q)
      );
    }

    return filtered;
  };

  const getStatusColor = (status) => {
    const rawStatus = String(status || '').toLowerCase().trim();
    if (rawStatus.includes('resolv') || rawStatus === 'closed') {
      return COLORS.success;
    }
    if (rawStatus === 'in progress' || rawStatus === 'in_progress') {
      return '#3b82f6'; // Blue
    }
    return '#fbbf24'; // Yellow
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + ' ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  };

  const renderTicketItem = ({ item }) => {
    const statusColor = getStatusColor(item.status);
    const creatorName = item.creator?.full_name || 'System User';
    
    return (
      <TouchableOpacity 
        style={styles.ticketCard}
        onPress={() => {
          Haptics.selectionAsync();
          navigation.navigate('AdminTicketDetail', { ticketId: item.id });
        }}
        activeOpacity={0.8}
      >
        <View style={[styles.statusStripe, { backgroundColor: statusColor }]} />
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={styles.creatorInfo}>
              <Text style={styles.creatorName}>{creatorName}</Text>
              <Text style={styles.ticketDate}>{formatTime(item.created_at)}</Text>
            </View>
            <View style={[styles.priorityBadge, { backgroundColor: item.priority?.toLowerCase() === 'critical' ? '#fee2e2' : item.priority?.toLowerCase() === 'high' ? '#fef3c7' : '#f0fdf4' }]}>
              <Text style={[styles.priorityText, { color: item.priority?.toLowerCase() === 'critical' ? '#ef4444' : item.priority?.toLowerCase() === 'high' ? '#d97706' : '#16a34a' }]}>
                {(item.priority || 'Low').toUpperCase()}
              </Text>
            </View>
          </View>

          <Text style={styles.subjectText} numberOfLines={1}>{item.subject}</Text>
          <Text style={styles.descSnippet} numberOfLines={2}>{item.description}</Text>

          <View style={styles.cardFooter}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{(item.category || 'General').toUpperCase()}</Text>
            </View>
            
            <View style={styles.footerRight}>
              {item.auto_resolve && (
                <View style={styles.aiBadge}>
                  <Text style={styles.aiBadgeText}>AI AUTO</Text>
                </View>
              )}
              <View style={[styles.statusBadge, { backgroundColor: statusColor + '12' }]}>
                <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                <Text style={[styles.statusText, { color: statusColor }]}>
                  {String(item.status || 'PENDING').replace('_', ' ').toUpperCase()}
                </Text>
              </View>
            </View>
          </View>
        </View>
        <ChevronRight size={18} color={COLORS.textMuted} style={{ marginRight: 16 }} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Incident Queue</Text>
        <View style={styles.activePill}>
          <View style={styles.pulseDot} />
          <Text style={styles.activePillText}>LIVE FEED</Text>
        </View>
      </View>

      {/* Search Section */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Search size={18} color={COLORS.textMuted} />
          <TextInput
            style={styles.input}
            placeholder="Search by subject, description, category, user..."
            placeholderTextColor="rgba(0,0,0,0.3)"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearchBtn}>
              <X size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Tabs scrollbar */}
      <View style={styles.tabWrapper}>
        <FlatList
          data={FILTER_TABS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.tabScroll}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.tabItem, activeFilter === item.id && styles.activeTabItem]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveFilter(item.id);
              }}
            >
              <Text style={[styles.tabLabel, activeFilter === item.id && styles.activeTabLabel]}>{item.label}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Queue list */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={getFilteredTickets()}
          keyExtractor={(item) => item.id}
          renderItem={renderTicketItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          RefreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <AlertCircle size={48} color={COLORS.textMuted} strokeWidth={1} />
              <Text style={styles.emptyText}>No tickets match your filters</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 16 },
  title: { fontSize: 28, fontWeight: '900', color: COLORS.text, letterSpacing: -0.8 },
  activePill: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 6, 
    backgroundColor: '#f0fdf4', 
    borderWidth: 1, 
    borderColor: '#bbf7d0', 
    borderRadius: 100, 
    paddingHorizontal: 12, 
    paddingVertical: 5 
  },
  pulseDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#22c55e' },
  activePillText: { fontSize: 9, fontWeight: '800', color: '#15803d', letterSpacing: 0.5 },
  
  // Search
  searchSection: { paddingHorizontal: 20, marginBottom: 12 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 16, paddingHorizontal: 16, height: 52,
    ...SHADOWS.soft, borderWidth: 1, borderColor: 'rgba(0,0,0,0.03)'
  },
  input: { flex: 1, marginLeft: 10, fontSize: 14, fontWeight: '600', color: COLORS.text },
  clearSearchBtn: { padding: 4 },

  // Tabs scroll
  tabWrapper: { marginBottom: 12 },
  tabScroll: { paddingHorizontal: 20, gap: 8 },
  tabItem: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 100, backgroundColor: '#fff', borderWidth: 1, borderColor: 'rgba(0,0,0,0.02)', ...SHADOWS.soft },
  activeTabItem: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  tabLabel: { fontSize: 13, fontWeight: '700', color: COLORS.textLight },
  activeTabLabel: { color: '#fff' },

  // List Cards
  list: { paddingHorizontal: 20, paddingBottom: 120 },
  ticketCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#fff', 
    borderRadius: 24, 
    marginBottom: 12, 
    overflow: 'hidden', 
    borderWidth: 1, 
    borderColor: 'rgba(0,0,0,0.03)', 
    ...SHADOWS.soft 
  },
  statusStripe: { width: 6, alignSelf: 'stretch' },
  cardContent: { flex: 1, padding: 18 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  creatorInfo: { gap: 1 },
  creatorName: { fontSize: 13, fontWeight: '800', color: COLORS.text },
  ticketDate: { fontSize: 11, color: COLORS.textMuted, fontWeight: '600' },
  priorityBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 100 },
  priorityText: { fontSize: 9, fontWeight: '800' },
  subjectText: { fontSize: 15, fontWeight: '800', color: COLORS.text, marginBottom: 4 },
  descSnippet: { fontSize: 13, color: COLORS.textLight, lineHeight: 18, marginBottom: 12 },
  
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  categoryBadge: { backgroundColor: '#f3f4f6', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 100 },
  categoryText: { fontSize: 10, fontWeight: '800', color: COLORS.textLight },
  
  footerRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  aiBadge: { backgroundColor: COLORS.primaryLight, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 100 },
  aiBadgeText: { fontSize: 9, fontWeight: '900', color: COLORS.primary },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 100, paddingHorizontal: 10, paddingVertical: 5 },
  statusDot: { width: 5, height: 5, borderRadius: 2.5 },
  statusText: { fontSize: 9, fontWeight: '800' },

  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 },
  emptyContainer: { alignItems: 'center', marginTop: 100, gap: 12 },
  emptyText: { fontSize: 15, color: COLORS.textMuted, fontWeight: '600' }
});

export default AdminTicketsScreen;
