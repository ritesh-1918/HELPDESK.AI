export const formatTicketId = (uuid) => {
    if (!uuid) return '';
    // If it's already a short string, return as is
    if (String(uuid).length <= 8) return uuid;
    // Otherwise, grab the first segment of the UUID and uppercase it
    return String(uuid).split('-')[0].toUpperCase();
};
