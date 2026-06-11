import { useState, useEffect, useCallback, useRef } from 'react';
import { ticketService } from '../services/ticketService';
import useAuthStore from '../store/authStore';
import useToastStore from '../store/toastStore';
import { supabase } from '../lib/supabaseClient'; // Only used for removeChannel, but ideally abstract that too.

export function useAdminTickets(filters: any) {
    const profile = useAuthStore((state: any) => state.profile);
    const showToast = useToastStore((state: any) => state.showToast);

    const [tickets, setTickets] = useState<any[]>([]);
    const [agents, setAgents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isUpdating, setIsUpdating] = useState<string | null>(null);
    const mountedRef = useRef(true);

    const fetchInitialData = useCallback(async () => {
        if (mountedRef.current) setLoading(true);
        if (mountedRef.current) setError(null);
        try {
            if (profile?.company) {
                const agentsData = await ticketService.fetchCompanyAgents(profile.company);
                if (mountedRef.current) setAgents(agentsData);
            }
            const ticketsData = await ticketService.fetchAdminTickets({
                company: profile?.role === 'admin' ? profile?.company : undefined,
                ...filters
            });
            if (mountedRef.current) setTickets(ticketsData);
        } catch (err: any) {
            if (mountedRef.current) setError(err.message);
        } finally {
            if (mountedRef.current) setLoading(false);
        }
    }, [filters, profile]);

    useEffect(() => {
        mountedRef.current = true;
        return () => { mountedRef.current = false; };
    }, []);

    useEffect(() => {
        fetchInitialData();

        const channel = ticketService.subscribeToCompanyTickets(
            profile?.company,
            {
                onInsert: (newTicket: any) => {
                    if (mountedRef.current) setTickets(prev => [newTicket, ...prev]);
                    showToast(`New Incident Reported: #${newTicket.id}`, "success");
                },
                onUpdate: (updatedTicket: any) => {
                    if (mountedRef.current) setTickets(prev => prev.map(t => t.id === updatedTicket.id ? { ...t, ...updatedTicket } : t));
                },
                onDelete: (deletedTicket: any) => {
                    if (mountedRef.current) setTickets(prev => prev.filter(t => t.id !== deletedTicket.id));
                }
            }
        );

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchInitialData, profile, showToast]);

    const handleUpdateTicket = async (id: string, updates: any) => {
        setIsUpdating(id);
        try {
            await ticketService.updateTicket(id, updates);
            setTickets(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
            showToast("System synchronization successful.", "success");
        } catch (err: any) {
            showToast("Update failed: " + err.message, "error");
        } finally {
            setIsUpdating(null);
        }
    };

    return { tickets, agents, loading, error, isUpdating, handleUpdateTicket, retry: fetchInitialData };
}