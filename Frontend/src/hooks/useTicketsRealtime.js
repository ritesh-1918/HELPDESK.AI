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

const REALTIME_EVENTS = new Set(['INSERT', 'UPDATE', 'DELETE']);

const isRecord = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const isValidTicketRealtimePayload = (payload) => {
    if (!isRecord(payload) || !REALTIME_EVENTS.has(payload.eventType)) {
        return false;
    }

    if (payload.eventType === 'DELETE') {
        return isRecord(payload.old);
    }

    return isRecord(payload.new);
};

const warnMalformedRealtimePayload = (payload, error) => {
    console.warn('useTicketsRealtime: ignored malformed realtime payload', {
        payload,
        error: error instanceof Error ? error.message : error,
    });
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
                    if (!isValidTicketRealtimePayload(payload)) {
                        warnMalformedRealtimePayload(payload);
                        return;
                    }

                    try {
                        const ticket = payload.new || payload.old;
                        const ticketId = getTicketRecordId(ticket);
                        if (!ticketId) {
                            warnMalformedRealtimePayload(payload, 'Missing ticket ID');
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
                    } catch (error) {
                        warnMalformedRealtimePayload(payload, error);
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
