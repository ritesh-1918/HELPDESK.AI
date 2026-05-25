export const getTicketRecordId = (ticket) => ticket?.id ?? ticket?.ticket_id ?? null;

const defaultShouldInclude = () => true;

export const applyTicketRealtimePayload = (
    tickets,
    payload,
    { shouldInclude = defaultShouldInclude } = {},
) => {
    const currentTickets = Array.isArray(tickets) ? tickets : [];
    const eventType = payload?.eventType;
    const nextTicket = payload?.new;
    const oldTicket = payload?.old;
    const targetTicket = nextTicket || oldTicket;
    const targetId = getTicketRecordId(targetTicket);

    if (!eventType || !targetId) return currentTickets;

    if (eventType === 'DELETE') {
        return currentTickets.filter((ticket) => getTicketRecordId(ticket) !== targetId);
    }

    if (!nextTicket || !shouldInclude(nextTicket)) {
        return currentTickets.filter((ticket) => getTicketRecordId(ticket) !== targetId);
    }

    const exists = currentTickets.some((ticket) => getTicketRecordId(ticket) === targetId);
    if (!exists) {
        return [nextTicket, ...currentTickets];
    }

    return currentTickets.map((ticket) => (
        getTicketRecordId(ticket) === targetId
            ? { ...ticket, ...nextTicket }
            : ticket
    ));
};
