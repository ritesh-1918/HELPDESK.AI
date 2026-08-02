import { supabase } from '../lib/supabaseClient';

export const ticketService = {
  fetchCompanyAgents: async (company: any) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, role')
      .eq('company', company)
      .in('role', ['admin', 'super_admin', 'agent']);
    if (error) throw error;
    return data || [];
  },

  fetchAdminTickets: async (filters: any) => {
    let query = supabase
      .from('tickets')
      .select(`
          *,
          creator:profiles!tickets_user_id_fkey(full_name, email, profile_picture),
          assignee:profiles!tickets_assigned_agent_id_fkey(full_name, email, profile_picture)
      `);

    if (filters.company) query = query.eq('company', filters.company);
    if (filters.status && filters.status !== 'All') query = query.eq('status', filters.status.toLowerCase());
    if (filters.category && filters.category !== 'All') query = query.eq('category', filters.category);
    if (filters.priority && filters.priority !== 'All') query = query.eq('priority', filters.priority.toLowerCase());
    if (filters.team && filters.team !== 'All') query = query.eq('assigned_team', filters.team);

    let { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.warn("Retrying fetch without relationship aliases...");
      const basicQuery = supabase.from('tickets').select('*, profiles(full_name, email)');
      const fallback = await basicQuery.eq('company', filters.company).order('created_at', { ascending: false });
      if (fallback.error) throw fallback.error;
      return fallback.data || [];
    }
    return data || [];
  },

  updateTicket: async (id: any, updates: any) => {
    const { data, error } = await supabase
      .from('tickets')
      .update(updates)
      .eq('id', id);
    if (error) throw error;
    return data;
  },

  submitCSATRating: async (ticketId: any, rating: any, comment: any) => {
    const { error } = await supabase
      .from('tickets')
      .update({
        csat_rating: rating,
        csat_comment: comment.trim() || null,
      })
      .eq('id', ticketId);
    if (error) throw error;
  },

  subscribeToCompanyTickets: (company: any, callbacks: any) => {
    return supabase
      .channel('admin_tickets_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tickets',
          filter: company ? `company=eq.${company}` : undefined
        },
        (payload) => {
          if (payload.eventType === 'INSERT') callbacks.onInsert?.(payload.new);
          else if (payload.eventType === 'UPDATE') callbacks.onUpdate?.(payload.new);
          else if (payload.eventType === 'DELETE') callbacks.onDelete?.(payload.old);
        }
      )
      .subscribe();
  }
};
