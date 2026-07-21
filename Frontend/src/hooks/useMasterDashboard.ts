import { useState, useEffect } from 'react';
import { masterAdminService } from '../services/masterAdminService';
import { supabase } from '../lib/supabaseClient';

export function useMasterDashboard() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalAdmins: 0,
        totalCompanies: 0,
        pendingRequests: 0
    });
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            const data = await masterAdminService.fetchPlatformStats();
            setStats(data);
        } catch (err) {
            console.error("Dashboard stats error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
        
        const channel = masterAdminService.subscribeToVitals(fetchStats);

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    return { stats, loading };
}
