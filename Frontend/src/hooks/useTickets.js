import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

export const useTickets = (companyId = null, userId = null) => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchTickets = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            let query = supabase.from('tickets').select('*').order('created_at', { ascending: false });
            
            if (companyId) {
                query = query.eq('company_id', companyId);
            }
            if (userId) {
                query = query.eq('user_id', userId);
            }

            const { data, error: err } = await query;
            if (err) throw err;
            setTickets(data || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [companyId, userId]);

    useEffect(() => {
        fetchTickets();
    }, [fetchTickets]);

    const createTicket = async (ticketData) => {
        try {
            const { data, error } = await supabase.from('tickets').insert([ticketData]).select();
            if (error) throw error;
            setTickets(prev => [data[0], ...prev]);
            return { data: data[0], error: null };
        } catch (error) {
            return { data: null, error };
        }
    };

    const updateTicket = async (ticketId, updates) => {
        try {
            const { data, error } = await supabase.from('tickets').update(updates).eq('id', ticketId).select();
            if (error) throw error;
            setTickets(prev => prev.map(t => t.id === ticketId ? data[0] : t));
            return { data: data[0], error: null };
        } catch (error) {
            return { data: null, error };
        }
    };

    return { tickets, loading, error, refetch: fetchTickets, createTicket, updateTicket };
};
