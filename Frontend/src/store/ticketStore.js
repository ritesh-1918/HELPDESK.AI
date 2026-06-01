import { create } from 'zustand';
import { createPersistedStore } from './persistenceMiddleware';

const useTicketStore = create(
    safePersist(
        (set) => ({
    persist(
        (set, get) => ({
            aiTicket: null,
            activeTicket: null,
            autoResolvedTickets: [], // For analytics
            tickets: [], // Global queue for admins
            notifications: [], // User notifications
            wsConnected: false, // WebSocket connection status

            setAITicket: (data) => set({ aiTicket: data }),
            setActiveTicket: (ticket) => set({ activeTicket: ticket }),

            setWsConnected: (connected) => set({ wsConnected: connected }),

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
                    tickets: [ticket, ...state.tickets]
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
                const existingTicket = state.tickets.find(t => (t.id ?? t.ticket_id) === ticketId);
                if (!existingTicket) return state;
                const updatedTickets = state.tickets.map(t => (t.id ?? t.ticket_id) === ticketId ? { ...t, ...updates } : t);
                const shouldUpdateActive = (state.activeTicket?.id ?? state.activeTicket?.ticket_id) === ticketId;
                return {
                    tickets: updatedTickets,
                    activeTicket: shouldUpdateActive ? { ...state.activeTicket, ...updates } : state.activeTicket
                };
            }),

            /**
             * Route an incoming WebSocket message to the correct store action.
             *
             * Call this from the component that owns the WebSocket connection
             * (e.g. AdminDashboard) whenever a message arrives.
             */
            handleWsMessage: (msg) => {
                if (!msg || !msg.type) return;

                const { type, event, ticket, ticket_id } = msg;

                switch (type) {
                    case "ticket_update": {
                        if (!ticket) break;
                        if (event === "created") {
                            // Avoid duplicates — use upsert
                            get().upsertTicket(ticket);
                        } else if (event === "updated") {
                            get().upsertTicket(ticket);
                        } else if (event === "deleted") {
                            get().removeTicket(ticket_id);
                        }
                        break;
                    }
                    default:
                        // Ignore unknown message types (e.g. heartbeat)
                        break;
                }
            },

            appendMessage: (ticketId, message) => set((state) => {
                const updatedTickets = state.tickets.map(t =>
                    (t.id ?? t.ticket_id) === ticketId
                        ? { ...t, messages: [...(t.messages || []), message] }
                        : t
                );
                const shouldUpdateActive = (state.activeTicket?.id ?? state.activeTicket?.ticket_id) === ticketId;

                return {
                    tickets: updatedTickets,
                    activeTicket: shouldUpdateActive
                        ? { ...state.activeTicket, messages: [...(state.activeTicket?.messages || []), message] }
                        : state.activeTicket
                };
            }),
            appendNote: (ticketId, note) => set((state) => {
                const updatedTickets = state.tickets.map(t =>
                    (t.id ?? t.ticket_id) === ticketId
                        ? { ...t, internal_notes: [...(t.internal_notes || []), note] }
                        : t
                );
                const shouldUpdateActive = (state.activeTicket?.id ?? state.activeTicket?.ticket_id) === ticketId;

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
            clearNotifications: () => set({ notifications: [] }),
        })
    )
);

// Listen for storage changes from other tabs to keep the queue in sync
window.addEventListener('storage', () => {
    // Force rehydration on any storage change to catch updates reliably
    useTicketStore.persist.rehydrate();
});

export default useTicketStore;
