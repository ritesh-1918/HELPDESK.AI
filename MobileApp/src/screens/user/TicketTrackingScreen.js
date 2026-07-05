import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, CheckCircle2, Clock, Sparkles, MessageSquare, ShieldCheck } from 'lucide-react-native';
import { supabase } from '../../lib/supabase';
import { COLORS, SHADOWS } from '../../styles/theme';

const TicketTrackingScreen = ({ route }) => {
  const { ticketId } = route.params || {};
  const navigation = useNavigation();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTicket();
    
    // Subscribe to changes
    const channel = supabase
      .channel(`ticket_tracking:${ticketId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'tickets',
        filter: `id=eq.${ticketId}`
      }, (payload) => {
        setTicket(payload.new);
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [ticketId]);

  const fetchTicket = async () => {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('id', ticketId)
      .single();
    
    if (!error) setTicket(data);
    setLoading(false);
  };

  const Step = ({ title, description, time, isCompleted, isCurrent, icon: Icon, isLast }) => (
    <View style={styles.stepContainer}>
      <View style={styles.leftColumn}>
        <View style={[
          styles.iconCircle,
          isCompleted ? styles.completedCircle : isCurrent ? styles.currentCircle : styles.pendingCircle
        ]}>
          <Icon size={20} color={isCompleted || isCurrent ? COLORS.white : COLORS.textMuted} />
        </View>
        {!isLast && <View style={[styles.connector, isCompleted && styles.completedConnector]} />}
      </View>
      <View style={styles.stepContent}>
        <Text style={[styles.stepTitle, isCurrent && styles.currentTitle]}>{title}</Text>
        <Text style={styles.stepDescription}>{description}</Text>
        {time && <Text style={styles.stepTime}>{time}</Text>}
      </View>
    </View>
  );

  const getStatusSteps = () => {
    const steps = [
      {
        id: 'submitted',
        title: 'Request Submitted',
        description: 'Your request has been successfully received by the system.',
        icon: Clock,
        isCompleted: true
      },
      {
        id: 'ai_analyzed',
        title: 'AI Analysis',
        description: 'HelpDesk.ai is analyzing and categorizing your request.',
        icon: Sparkles,
        isCompleted: ticket?.status !== 'pending' || !!ticket?.category,
        isCurrent: ticket?.status === 'pending' && !ticket?.category
      },
      {
        id: 'in_progress',
        title: 'In Progress',
        description: 'An IT support specialist is working on your request.',
        icon: MessageSquare,
        isCompleted: ticket?.status === 'resolved',
        isCurrent: ticket?.status === 'in_progress' || ticket?.status === 'pending_human'
      },
      {
        id: 'resolved',
        title: 'Resolved',
        description: 'The issue has been resolved. Please check the resolution details.',
        icon: ShieldCheck,
        isCompleted: ticket?.status === 'resolved',
        isCurrent: false,
        isLast: true
      }
    ];
    return steps;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Tracking Status</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.ticketCard}>
            <Text style={styles.ticketId}>ID: #{ticketId?.slice(0, 8).toUpperCase()}</Text>
            <Text style={styles.ticketSubject}>{ticket?.subject}</Text>
            <View style={[styles.statusBadge, { backgroundColor: (ticket?.status === 'resolved' ? COLORS.success : COLORS.warning) + '15' }]}>
              <Text style={[styles.statusText, { color: ticket?.status === 'resolved' ? COLORS.success : COLORS.warning }]}>
                {ticket?.status?.toUpperCase()}
              </Text>
            </View>
          </View>

          <View style={styles.timelineContainer}>
            <Text style={styles.sectionTitle}>Process Timeline</Text>
            {getStatusSteps().map((step, index) => (
              <Step key={step.id} {...step} />
            ))}
          </View>

          <TouchableOpacity 
            style={styles.chatBtn}
            onPress={() => navigation.navigate('TicketDetail', { ticketId })}
          >
            <MessageSquare size={20} color={COLORS.white} />
            <Text style={styles.chatBtnText}>Go to Discussion</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    ...SHADOWS.soft
  },
  backBtn: { padding: 8 },
  title: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  content: { padding: 20 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  ticketCard: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 24,
    marginBottom: 24,
    ...SHADOWS.soft,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)'
  },
  ticketId: { fontSize: 12, fontWeight: '700', color: COLORS.textMuted, marginBottom: 8 },
  ticketSubject: { fontSize: 20, fontWeight: '800', color: COLORS.text, marginBottom: 12 },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 100 },
  statusText: { fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  timelineContainer: { backgroundColor: COLORS.white, padding: 24, borderRadius: 24, ...SHADOWS.soft },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text, marginBottom: 24 },
  stepContainer: { flexDirection: 'row', gap: 16 },
  leftColumn: { alignItems: 'center', width: 40 },
  iconCircle: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', zIndex: 1 },
  completedCircle: { backgroundColor: COLORS.success },
  currentCircle: { backgroundColor: COLORS.primary },
  pendingCircle: { backgroundColor: COLORS.surfaceDark },
  connector: { width: 2, flex: 1, backgroundColor: COLORS.surfaceDark, marginVertical: 4 },
  completedConnector: { backgroundColor: COLORS.success },
  stepContent: { flex: 1, paddingBottom: 32 },
  stepTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textMuted, marginBottom: 4 },
  currentTitle: { color: COLORS.primary },
  stepDescription: { fontSize: 14, color: COLORS.textLight, lineHeight: 20 },
  stepTime: { fontSize: 11, color: COLORS.textMuted, marginTop: 4, fontWeight: '600' },
  chatBtn: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginTop: 24,
    ...SHADOWS.medium
  },
  chatBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '800' }
});

export default TicketTrackingScreen;
