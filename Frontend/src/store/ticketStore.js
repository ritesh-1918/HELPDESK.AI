import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useTicketStore = create(
    persist(
        (set) => ({
            aiTicket: null,
            activeTicket: null,
            autoResolvedTickets: [], // For analytics
            tickets: [], // Global queue for admins
            notifications: [], // User notifications
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
            addTicket: (ticket) => set((state) => {
                return {
                    tickets: [...state.tickets, ticket]
                };
            }),
            upsertTicket: (ticket) => set((state) => {
                const ticketId = ticket?.id ?? ticket?.ticket_id;
                if (!ticketId) return state;

                const exists = state.tickets.some(t => (t.id ?? t.ticket_id) === ticketId);
                const tickets = exists
                    ? state.tickets.map(t => (t.id ?? t.ticket_id) === ticketId ? { ...t, ...ticket } : t)
                    : [ticket, ...state.tickets];
                const shouldUpdateActive = (state.activeTicket?.id ?? state.activeTicket?.ticket_id) === ticketId;

                return {
                    tickets,
                    activeTicket: shouldUpdateActive ? { ...state.activeTicket, ...ticket } : state.activeTicket
                };
            }),
            removeTicket: (ticketId) => set((state) => ({
                tickets: state.tickets.filter(t => (t.id ?? t.ticket_id) !== ticketId),
                activeTicket: (state.activeTicket?.id ?? state.activeTicket?.ticket_id) === ticketId
                    ? null
                    : state.activeTicket
            })),
            updateTicket: (ticketId, updates) => set((state) => {
// eslint-disable-next-line no-unused-vars
                const existingTicket = state.tickets.find(t => t.ticket_id === ticketId);
                const updatedTickets = state.tickets.map(t => t.ticket_id === ticketId ? { ...t, ...updates } : t);
                const shouldUpdateActive = state.activeTicket?.ticket_id === ticketId;




                return {
                    tickets: updatedTickets,
                    activeTicket: shouldUpdateActive ? { ...state.activeTicket, ...updates } : state.activeTicket
                };
            }),

            removeTicket: (ticketId) => set((state) => ({
    tickets: state.tickets.filter(t => t.ticket_id !== ticketId),
    activeTicket: state.activeTicket?.ticket_id === ticketId
        ? null
        : state.activeTicket
})),
            appendMessage: (ticketId, message) => set((state) => {
                const updatedTickets = state.tickets.map(t =>
                    t.ticket_id === ticketId
                        ? { ...t, messages: [...(t.messages || []), message] }
                        : t
                );
                const shouldUpdateActive = state.activeTicket?.ticket_id === ticketId;

                return {
                    tickets: updatedTickets,
                    activeTicket: shouldUpdateActive
                        ? { ...state.activeTicket, messages: [...(state.activeTicket?.messages || []), message] }
                        : state.activeTicket
                };
            }),
            appendNote: (ticketId, note) => set((state) => {
                const updatedTickets = state.tickets.map(t =>
                    t.ticket_id === ticketId
                        ? { ...t, internal_notes: [...(t.internal_notes || []), note] }
                        : t
                );
                const shouldUpdateActive = state.activeTicket?.ticket_id === ticketId;

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
            name: 'ticket-storage', // unique name for localStorage key
        }
    )
);

// Listen for storage changes from other tabs to keep the queue in sync
// Listen for storage changes from other tabs to keep the queue in sync
window.addEventListener('storage', () => {
    // Force rehydration on any storage change to catch updates reliably
    useTicketStore.persist.rehydrate();
});

export default useTicketStore;
