import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Helper: match a ticket by either `ticket_id` or `id` field.
 * Handles cases where backend returns different ID field names.
 */
const matchesTicketId = (ticket, targetId) =>
    ticket.ticket_id === targetId || ticket.id === targetId;

/**
 * Helper: sort tickets by created_at descending (newest first).
 * Falls back to insertion order if created_at is missing.
 */
const sortByNewest = (tickets) =>
    [...tickets].sort((a, b) => {
        const dateA = a.created_at || a.createdAt || '';
        const dateB = b.created_at || b.createdAt || '';
        return dateB.localeCompare(dateA);
    });

const useTicketStore = create(
    persist(
        (set, get) => ({
            aiTicket: null,
            activeTicket: null,
            autoResolvedTickets: [],
            tickets: [],
            notifications: [],
            setAITicket: (data) => set({ aiTicket: data }),
            setActiveTicket: (ticket) => set({ activeTicket: ticket }),
            addAutoResolvedTicket: (record) => set((state) => ({
                autoResolvedTickets: [...state.autoResolvedTickets, record]
            })),
            addNotification: (notification) => set((state) => ({
                notifications: [
                    {
                        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
                        timestamp: new Date().toISOString(),
                        read: false,
                        ...notification
                    },
                    ...(state.notifications || [])
                ]
            })),
            /**
             * Add a new ticket. Prepends to list (newest first).
             * Deduplicates: if a ticket with the same id already exists, merges instead.
             */
            addTicket: (ticket) => set((state) => {
                const existing = state.tickets.find(t => matchesTicketId(t, ticket.ticket_id || ticket.id));
                if (existing) {
                    // Merge with existing to avoid duplicates
                    return {
                        tickets: sortByNewest(
                            state.tickets.map(t =>
                                matchesTicketId(t, ticket.ticket_id || ticket.id)
                                    ? { ...t, ...ticket }
                                    : t
                            )
                        )
                    };
                }
                return {
                    tickets: sortByNewest([ticket, ...state.tickets])
                };
            }),
            /**
             * Bulk-set tickets (e.g. after fetching from API).
             * Replaces all tickets and sorts newest-first.
             */
            setTickets: (tickets) => set({
                tickets: sortByNewest(tickets)
            }),
            /**
             * Update a ticket by id. Matches using both ticket_id and id fields.
             * Also updates activeTicket if it matches.
             */
            updateTicket: (ticketId, updates) => set((state) => {
                const updatedTickets = state.tickets.map(t =>
                    matchesTicketId(t, ticketId) ? { ...t, ...updates } : t
                );
                const shouldUpdateActive = state.activeTicket && matchesTicketId(state.activeTicket, ticketId);

                return {
                    tickets: sortByNewest(updatedTickets),
                    activeTicket: shouldUpdateActive ? { ...state.activeTicket, ...updates } : state.activeTicket
                };
            }),
            /**
             * Remove a ticket by id. Clears activeTicket if it was the removed one.
             */
            removeTicket: (ticketId) => set((state) => ({
                tickets: state.tickets.filter(t => !matchesTicketId(t, ticketId)),
                activeTicket: matchesTicketId(state.activeTicket || {}, ticketId)
                    ? null
                    : state.activeTicket
            })),
            /**
             * Append a message to a ticket's message thread.
             */
            appendMessage: (ticketId, message) => set((state) => {
                const updatedTickets = state.tickets.map(t =>
                    matchesTicketId(t, ticketId)
                        ? { ...t, messages: [...(t.messages || []), message] }
                        : t
                );
                const shouldUpdateActive = state.activeTicket && matchesTicketId(state.activeTicket, ticketId);

                return {
                    tickets: updatedTickets,
                    activeTicket: shouldUpdateActive
                        ? { ...state.activeTicket, messages: [...(state.activeTicket?.messages || []), message] }
                        : state.activeTicket
                };
            }),
            /**
             * Append an internal note to a ticket.
             */
            appendNote: (ticketId, note) => set((state) => {
                const updatedTickets = state.tickets.map(t =>
                    matchesTicketId(t, ticketId)
                        ? { ...t, internal_notes: [...(t.internal_notes || []), note] }
                        : t
                );
                const shouldUpdateActive = state.activeTicket && matchesTicketId(state.activeTicket, ticketId);

                return {
                    tickets: updatedTickets,
                    activeTicket: shouldUpdateActive
                        ? { ...state.activeTicket, internal_notes: [...(state.activeTicket?.internal_notes || []), note] }
                        : state.activeTicket
                };
            }),
            markNotificationsRead: () => set((state) => ({
                notifications: (state.notifications || []).map(n => ({ ...n, read: true }))
            })),
            clearTicket: () => set({ aiTicket: null, activeTicket: null, autoResolvedTickets: [] }),
        }),
        {
            name: 'ticket-storage',
        }
    )
);

// Listen for storage changes from other tabs to keep the queue in sync
window.addEventListener('storage', () => {
    useTicketStore.persist.rehydrate();
});

export default useTicketStore;
