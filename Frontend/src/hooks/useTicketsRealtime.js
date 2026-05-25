import { useEffect, useMemo, useState } from 'react';

import { supabase } from '../lib/supabaseClient';
import useTicketStore from '../store/ticketStore';
import {
    applyTicketRealtimePayload,
    getTicketRecordId,
} from '../utils/ticketRealtimeReducer';

const makeChannelName = (baseName, company) => {
    const safeCompany = company ? String(company).replace(/[^a-zA-Z0-9_-]/g, '_') : 'all';
    return `${baseName}_${safeCompany}`;
};

const useTicketsRealtime = ({
    company,
    enabled = true,
    onTicketsChange,
    onInsert,
    shouldInclude,
    channelName = 'tickets_realtime',
} = {}) => {
    const [lastChangedTicketId, setLastChangedTicketId] = useState(null);

    const realtimeFilter = useMemo(() => {
        return company ? `company=eq.${company}` : undefined;
    }, [company]);

    useEffect(() => {
        if (!enabled || !onTicketsChange) return undefined;

        let clearHighlightTimer;
        const channel = supabase
            .channel(makeChannelName(channelName, company))
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'tickets',
                    ...(realtimeFilter ? { filter: realtimeFilter } : {}),
                },
                (payload) => {
                    const ticket = payload.new || payload.old;
                    const ticketId = getTicketRecordId(ticket);

                    onTicketsChange((currentTickets) => (
                        applyTicketRealtimePayload(currentTickets, payload, { shouldInclude })
                    ));

                    const ticketStore = useTicketStore.getState();
                    if (payload.eventType === 'DELETE') {
                        ticketStore.removeTicket(ticketId);
                    } else if (payload.new) {
                        ticketStore.upsertTicket(payload.new);
                    }

                    if (payload.eventType === 'INSERT' && payload.new && onInsert) {
                        onInsert(payload.new);
                    }

                    if (ticketId) {
                        setLastChangedTicketId(ticketId);
                        window.clearTimeout(clearHighlightTimer);
                        clearHighlightTimer = window.setTimeout(() => {
                            setLastChangedTicketId(null);
                        }, 3500);
                    }
                },
            )
            .subscribe();

        return () => {
            window.clearTimeout(clearHighlightTimer);
            supabase.removeChannel(channel);
        };
    }, [channelName, company, enabled, onInsert, onTicketsChange, realtimeFilter, shouldInclude]);

    return { lastChangedTicketId };
};

export default useTicketsRealtime;
