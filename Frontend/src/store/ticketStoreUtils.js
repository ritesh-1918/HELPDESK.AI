export const getTicketRecordId = (ticket) => ticket?.id ?? ticket?.ticket_id ?? null;

export const mergeTicketRecord = (existingTicket, nextTicket) => ({
    ...existingTicket,
    ...nextTicket,
});

export const upsertTicketInQueue = (tickets, nextTicket) => {
    const currentTickets = Array.isArray(tickets) ? tickets : [];
    const nextTicketId = getTicketRecordId(nextTicket);

    if (!nextTicketId) {
        return [nextTicket, ...currentTickets];
    }

    const existingIndex = currentTickets.findIndex(
        (ticket) => getTicketRecordId(ticket) === nextTicketId,
    );

    if (existingIndex === -1) {
        return [nextTicket, ...currentTickets];
    }

    return currentTickets.map((ticket, index) => (
        index === existingIndex ? mergeTicketRecord(ticket, nextTicket) : ticket
    ));
};

export const updateTicketInQueue = (tickets, ticketId, updates) => {
    const currentTickets = Array.isArray(tickets) ? tickets : [];

    return currentTickets.map((ticket) => (
        getTicketRecordId(ticket) === ticketId
            ? mergeTicketRecord(ticket, updates)
            : ticket
    ));
};

export const removeTicketFromQueue = (tickets, ticketId) => {
    const currentTickets = Array.isArray(tickets) ? tickets : [];
    return currentTickets.filter((ticket) => getTicketRecordId(ticket) !== ticketId);
};
