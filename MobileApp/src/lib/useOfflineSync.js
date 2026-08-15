import { useState, useEffect, useCallback, useRef } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { supabase } from './supabase';
import {
  initDB,
  cacheTickets,
  getCachedTickets,
  cacheTicketDetail,
  getCachedTicketDetail,
  cacheTicketMessages,
  getCachedTicketMessages,
  cacheNotifications,
  getCachedNotifications,
  cacheProfile,
  getCachedProfile,
} from './database';

export const useOfflineSync = (type, options = {}) => {
  const { ticketId = null } = options;
  const [data, setData] = useState(null);
  const [isOffline, setIsOffline] = useState(false);
  const [isSyncing, setIsSyncing] = useState(true);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const fetchOnline = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    if (type === 'profile') {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (profileData) await cacheProfile(profileData);
      return profileData;
    }

    if (type === 'tickets') {
      const { data: ticketData } = await supabase
        .from('tickets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      const tickets = ticketData || [];
      await cacheTickets(tickets);
      return tickets;
    }

    if (type === 'ticketDetail' && ticketId) {
      const { data } = await supabase
        .from('tickets')
        .select('*')
        .eq('id', ticketId)
        .single();
      if (data) await cacheTicketDetail(data);
      return data;
    }

    if (type === 'ticketMessages' && ticketId) {
      const { data } = await supabase
        .from('ticket_messages')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });
      const messages = data || [];
      await cacheTicketMessages(messages);
      return messages;
    }

    if (type === 'notifications') {
      const { data: { user: u } } = await supabase.auth.getUser();
      if (!u) return [];
      const { data: notifData } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', u.id)
        .order('created_at', { ascending: false });
      const notifs = notifData || [];
      await cacheNotifications(notifs);
      return notifs;
    }

    if (type === 'unreadCount') {
      const { data: { user: u } } = await supabase.auth.getUser();
      if (!u) return 0;
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', u.id)
        .eq('read', false);
      return count || 0;
    }

    return null;
  }, [type, ticketId]);

  const fetchOffline = useCallback(async () => {
    if (type === 'profile') {
      const { data: { user } } = await supabase.auth.getUser();
      return user ? await getCachedProfile(user.id) : null;
    }
    if (type === 'tickets') return await getCachedTickets();
    if (type === 'ticketDetail' && ticketId) return await getCachedTicketDetail(ticketId);
    if (type === 'ticketMessages' && ticketId) return await getCachedTicketMessages(ticketId);
    if (type === 'notifications') return await getCachedNotifications();
    return null;
  }, [type, ticketId]);

  const refresh = useCallback(async () => {
    if (!mountedRef.current) return;
    setIsSyncing(true);
    try {
      const netState = await NetInfo.fetch();
      const offline = !netState.isConnected;
      if (mountedRef.current) setIsOffline(offline);

      let result;
      if (!offline) {
        result = await fetchOnline();
      } else {
        result = await fetchOffline();
      }

      if (mountedRef.current) setData(result);
    } catch (err) {
      console.error(`OfflineSync(${type}) error:`, err);
      try {
        const cached = await fetchOffline();
        if (mountedRef.current) {
          setData(cached);
          setIsOffline(true);
        }
      } catch (cacheErr) {
        console.error(`OfflineSync(${type}) cache fallback error:`, cacheErr);
      }
    } finally {
      if (mountedRef.current) setIsSyncing(false);
    }
  }, [type, fetchOnline, fetchOffline]);

  useEffect(() => {
    initDB().then(() => refresh());

    const unsubscribe = NetInfo.addEventListener((state) => {
      const offline = !state.isConnected;
      setIsOffline(offline);
      if (!offline) refresh();
    });

    return () => unsubscribe();
  }, [refresh]);

  return { data, isOffline, isSyncing, refresh };
};
