import { supabase } from '../lib/supabaseClient';

export const masterAdminService = {
  fetchPlatformStats: async () => {
    const [uRes, aRes, cRes, rRes] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'user'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'admin'),
      supabase.from('companies').select('*', { count: 'exact', head: true }),
      supabase.from('admin_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending')
    ]);

    return {
      totalUsers: uRes.count || 0,
      totalAdmins: aRes.count || 0,
      totalCompanies: cRes.count || 0,
      pendingRequests: rRes.count || 0
    };
  },

  subscribeToVitals: (onUpdate: any) => {
    return supabase.channel('dashboard_vitals')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, onUpdate)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'companies' }, onUpdate)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'admin_requests' }, onUpdate)
      .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
              console.log("Dashboard real-time connected.");
          }
      });
  }
};
