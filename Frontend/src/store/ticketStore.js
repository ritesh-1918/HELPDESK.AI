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
            ws: null,
            connectWebSocket: (companyId, backendUrl) => {
                const state = useTicketStore.getState();
                if (state.ws) {
                    state.ws.close();
                }

                const wsBase = backendUrl.replace(/^http/, 'ws');
                const wsUrl = `${wsBase}/ws/${companyId}`;
                console.log(`[WS Store] Connecting to: ${wsUrl}`);

                const socket = new WebSocket(wsUrl);
                let reconnectTimeout;
                let isClosed = false;

                socket.onopen = () => {
                    console.log('[WS Store] Connected to real-time sync server');
                };

                socket.onmessage = (event) => {
                    if (event.data === 'ping') {
                        socket.send('pong');
                        return;
                    }

                    try {
                        const message = JSON.parse(event.data);
                        console.log('[WS Store] Received event:', message);
                        if (message.event === 'INSERT') {
                            useTicketStore.getState().addTicket(message.record);
                        } else if (message.event === 'UPDATE') {
                            useTicketStore.getState().updateTicket(message.record.ticket_id, message.record);
                        } else if (message.event === 'DELETE') {
                            useTicketStore.getState().removeTicket(message.record.ticket_id);
                        }
                    } catch (e) {
                        console.error('[WS Store] Error parsing message:', e);
                    }
                };

                socket.onclose = () => {
                    if (isClosed) return;
                    console.warn('[WS Store] Connection closed. Reconnecting in 5 seconds...');
                    reconnectTimeout = setTimeout(() => {
                        useTicketStore.getState().connectWebSocket(companyId, backendUrl);
                    }, 5000);
                };

                socket.onerror = (err) => {
                    console.error('[WS Store] Socket error:', err);
                    socket.close();
                };

                set({
                    ws: {
                        close: () => {
                            isClosed = true;
                            socket.close();
                            if (reconnectTimeout) clearTimeout(reconnectTimeout);
                        }
                    }
                });
            },
            disconnectWebSocket: () => {
                const state = useTicketStore.getState();
                if (state.ws) {
                    state.ws.close();
                    set({ ws: null });
                }
            },
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
