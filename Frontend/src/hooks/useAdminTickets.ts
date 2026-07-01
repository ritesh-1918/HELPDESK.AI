import { useState, useEffect, useCallback } from 'react';
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

    const fetchInitialData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            if (profile?.company) {
                const agentsData = await ticketService.fetchCompanyAgents(profile.company);
                setAgents(agentsData);
            }
            const ticketsData = await ticketService.fetchAdminTickets({
                company: profile?.role === 'admin' ? profile?.company : undefined,
                ...filters
            });
            setTickets(ticketsData);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [filters, profile]);

    useEffect(() => {
        fetchInitialData();
        
        const channel = ticketService.subscribeToCompanyTickets(
            profile?.company,
            {
                onInsert: (newTicket: any) => {
                    setTickets(prev => [newTicket, ...prev]);
                    showToast(`New Incident Reported: #${newTicket.id}`, "success");
                },
                onUpdate: (updatedTicket: any) => {
                    setTickets(prev => prev.map(t => t.id === updatedTicket.id ? { ...t, ...updatedTicket } : t));
                },
                onDelete: (deletedTicket: any) => {
                    setTickets(prev => prev.filter(t => t.id !== deletedTicket.id));
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
