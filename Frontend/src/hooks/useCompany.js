import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

export const useCompany = (companyId) => {
    const [company, setCompany] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchCompany = useCallback(async () => {
        if (!companyId) return;
        setLoading(true);
        setError(null);
        try {
            const { data, error: err } = await supabase
                .from('companies')
                .select('*')
                .eq('id', companyId)
                .single();
                
            if (err) throw err;
            setCompany(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [companyId]);

    useEffect(() => {
        fetchCompany();
    }, [fetchCompany]);

    const updateCompany = async (updates) => {
        if (!companyId) return { error: 'No company ID provided' };
        try {
            const { data, error } = await supabase
                .from('companies')
                .update(updates)
                .eq('id', companyId)
                .select()
                .single();
                
            if (error) throw error;
            setCompany(data);
            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        }
    };

    return { company, loading, error, refetch: fetchCompany, updateCompany };
};
