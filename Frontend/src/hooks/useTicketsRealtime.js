import { useEffect, useMemo, useState } from 'react';

import { supabase } from '../lib/supabaseClient';
import useAuthStore from '../store/authStore';
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
                    try {
                        if (!payload || typeof payload !== 'object') {
                            throw new Error('Invalid socket payload format: expected object');
                        }

                        const ticket = payload.new || payload.old;
                        if (!ticket || typeof ticket !== 'object') {
                            console.warn('Realtime payload missing ticket data, ignoring.', payload);
                            return;
                        }

                        const ticketId = getTicketRecordId(ticket);
                        if (!ticketId) {
                            console.warn('Realtime payload missing ticket ID, ignoring.', payload);
                            return;
                        }

                        onTicketsChange((currentTickets) => (
                            applyTicketRealtimePayload(currentTickets, payload, { shouldInclude })
                        ));

                        const ticketStore = useTicketStore.getState();
                        const { user } = useAuthStore.getState();
                        if (payload.eventType === 'DELETE') {
                            ticketStore.removeTicket(ticketId);
                        } else if (payload.new) {
                            ticketStore.upsertTicket(payload.new);
                            // Create notification for ticket updates from other users
                            if (payload.eventType === 'UPDATE' && user && payload.new.user_id !== user.id) {
                                ticketStore.addNotification({
                                    type: 'message',
                                    ticketId: payload.new.ticket_id || ticketId,
                                    title: 'Ticket Updated',
                                    message: `Ticket "${payload.new.subject || 'Unknown'}" has been updated.`
                                });
                            }
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
                    } catch (err) {
                        console.error('Caught error processing realtime notification payload:', err);
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
