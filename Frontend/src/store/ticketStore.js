import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Module-scoped state for the real-time socket so it survives store rehydration.
let _socket = null;
let _socketCompanyId = null;
let _reconnectTimer = null;
let _reconnectAttempt = 0;
let _shouldReconnect = false;

const _resolveWsBase = () => {
    const httpBase = import.meta?.env?.VITE_API_BASE || 'http://localhost:8000';
    return httpBase.replace(/^http/i, 'ws');
};

const _scheduleReconnect = (companyId, store) => {
    if (!_shouldReconnect || _reconnectTimer) return;
    const delay = Math.min(30000, 1000 * Math.pow(2, _reconnectAttempt));
    _reconnectAttempt += 1;
    _reconnectTimer = setTimeout(() => {
        _reconnectTimer = null;
        store.getState().connectSocket(companyId);
    }, delay);
};

const useTicketStore = create(
    persist(
        (set) => ({
            aiTicket: null,
            activeTicket: null,
            autoResolvedTickets: [], // For analytics
            tickets: [], // Global queue for admins
            notifications: [], // User notifications
            socketStatus: 'disconnected', // 'connecting' | 'connected' | 'disconnected'
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
            connectSocket: (companyId) => {
                if (!companyId || typeof window === 'undefined') return;
                if (_socket && _socketCompanyId === companyId &&
                    (_socket.readyState === WebSocket.OPEN || _socket.readyState === WebSocket.CONNECTING)) {
                    return;
                }
                if (_socket) {
                    try { _socket.close(); } catch (_) { /* noop */ }
                }
                _socketCompanyId = companyId;
                _shouldReconnect = true;
                set({ socketStatus: 'connecting' });
                const url = `${_resolveWsBase()}/ws/tickets/${encodeURIComponent(companyId)}`;
                const ws = new WebSocket(url);
                _socket = ws;
                ws.onopen = () => {
                    _reconnectAttempt = 0;
                    set({ socketStatus: 'connected' });
                };
                ws.onmessage = (event) => {
                    let payload;
                    try { payload = JSON.parse(event.data); } catch (_) { return; }
                    // Heartbeat: reply to server pings so the connection isn't evicted.
                    if (payload?.type === 'ping') {
                        try { ws.send(JSON.stringify({ type: 'pong' })); } catch (_) { /* noop */ }
                        return;
                    }
                };
                ws.onclose = () => {
                    set({ socketStatus: 'disconnected' });
                    if (_socket === ws) _socket = null;
                    _scheduleReconnect(companyId, useTicketStore);
                };
                ws.onerror = () => {
                    try { ws.close(); } catch (_) { /* noop */ }
                };
            },
            disconnectSocket: () => {
                _shouldReconnect = false;
                if (_reconnectTimer) {
                    clearTimeout(_reconnectTimer);
                    _reconnectTimer = null;
                }
                if (_socket) {
                    try { _socket.close(); } catch (_) { /* noop */ }
                    _socket = null;
                }
                _socketCompanyId = null;
                _reconnectAttempt = 0;
                set({ socketStatus: 'disconnected' });
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
