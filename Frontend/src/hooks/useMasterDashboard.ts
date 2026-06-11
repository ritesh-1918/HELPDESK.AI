import { useState, useEffect, useCallback, useRef } from 'react';
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
    const mountedRef = useRef(true);

    const fetchStats = useCallback(async () => {
        try {
            const data = await masterAdminService.fetchPlatformStats();
            if (mountedRef.current) setStats(data);
        } catch (err) {
            console.error("Dashboard stats error:", err);
        } finally {
            if (mountedRef.current) setLoading(false);
        }
    }, []);

    useEffect(() => {
        mountedRef.current = true;
        return () => { mountedRef.current = false; };
    }, []);

    useEffect(() => {
        fetchStats();

        const channel = masterAdminService.subscribeToVitals(() => {
            if (mountedRef.current) fetchStats();
        });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchStats]);

    return { stats, loading };
}