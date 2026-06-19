/**
 * Export utilities for tickets — CSV and PDF.
 * Used by AdminTickets.jsx for data export.
 */

/**
 * Download data as a CSV file.
 * @param {Array<Object>} tickets - Array of ticket objects
 * @param {string} filename - Output filename (without extension)
 */
export function downloadCSV(tickets, filename = 'tickets-export') {
  if (!tickets?.length) {
    throw new Error('No tickets available to export');
  }

  const headers = [
    'Ticket ID',
    'Subject',
    'Summary',
    'Description',
    'Category',
    'Priority',
    'Status',
    'Assigned Team',
    'Assigned Agent',
    'Requester Name',
    'Requester Email',
    'SLA Status',
    'Confidence',
    'Created At',
    'Updated At',
    'Resolved At',
    'Company',
  ];

  const rows = tickets.map((t) => [
    t.ticket_id || t.id || '',
    t.title || t.subject || t.summary || '',
    t.summary || '',
    t.description || '',
    t.category || '',
    t.priority || '',
    t.status || '',
    t.assigned_team || '',
    getAssignedAgentName(t),
    t.creator?.full_name || t.profiles?.full_name || t.requester_name || '',
    t.creator?.email || t.profiles?.email || t.user_email || '',
    t.sla_status || (t.sla_breach ? 'breached' : ''),
    formatConfidence(t.confidence),
    formatExportDate(t.created_at || t.createdAt),
    formatExportDate(t.updated_at || t.updatedAt),
    formatExportDate(t.resolved_at || t.resolvedAt),
    t.company_name || t.company || '',
  ]);

  // Build CSV content
  const escape = (v) => {
    const raw = String(v ?? '');
    const s = /^[=+\-@]/.test(raw) ? `'${raw}` : raw;
    return /[,"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };

  const csvContent = [
    headers.map(escape).join(','),
    ...rows.map((row) => row.map(escape).join(',')),
  ].join('\n');

  // Trigger download
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const el = document.createElement('a');
  el.href = url;
  el.download = `${filename}.csv`;
  document.body.appendChild(el);
  el.click();
  document.body.removeChild(el);
  URL.revokeObjectURL(url);
}

function getAssignedAgentName(ticket) {
  return (
    ticket.assignee?.full_name ||
    ticket.assigned_to ||
    ticket.assigned_agent ||
    ticket.agent_name ||
    ''
  );
}

function formatConfidence(confidence) {
  if (confidence === null || confidence === undefined || confidence === '') return '';
  const numericConfidence = Number(confidence);
  if (Number.isNaN(numericConfidence)) return String(confidence);
  return `${Math.round(numericConfidence * 100)}%`;
}

function formatExportDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toISOString();
}

/**
 * Generate a simple printable HTML view of a ticket (for PDF-like print).
 * @param {Object} ticket - Single ticket object
 * @returns {string} HTML content suitable for window.print()
 */
export function generateTicketPrintHTML(ticket) {
  if (!ticket) return '';
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Ticket ${ticket.ticket_id || ticket.id || ''}</title>
<style>
  body { font-family: system-ui, -apple-system, sans-serif; padding: 2rem; color: #1a1a1a; }
  h1 { font-size: 1.5rem; border-bottom: 2px solid #2563eb; padding-bottom: 0.5rem; }
  .field { margin: 1rem 0; }
  .label { font-weight: 600; color: #6b7280; font-size: 0.875rem; text-transform: uppercase; }
  .value { font-size: 1rem; margin-top: 0.25rem; }
  .footer { margin-top: 2rem; font-size: 0.75rem; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 0.5rem; }
</style>
</head>
<body>
  <h1>Ticket Report</h1>
  <div class="field"><div class="label">Ticket ID</div><div class="value">${escapeHTML(ticket.ticket_id || ticket.id || '')}</div></div>
  <div class="field"><div class="label">Title</div><div class="value">${escapeHTML(ticket.title || ticket.subject || '')}</div></div>
  <div class="field"><div class="label">Category</div><div class="value">${escapeHTML(ticket.category || '')}</div></div>
  <div class="field"><div class="label">Priority</div><div class="value">${escapeHTML(ticket.priority || '')}</div></div>
  <div class="field"><div class="label">Status</div><div class="value">${escapeHTML(ticket.status || '')}</div></div>
  <div class="field"><div class="label">Assigned To</div><div class="value">${escapeHTML(ticket.assigned_to || ticket.assigned_agent || ticket.agent_name || 'Unassigned')}</div></div>
  <div class="field"><div class="label">Created At</div><div class="value">${escapeHTML(ticket.created_at || ticket.createdAt || '')}</div></div>
  <div class="field"><div class="label">Resolved At</div><div class="value">${escapeHTML(ticket.resolved_at || ticket.resolvedAt || 'N/A')}</div></div>
  <div class="field"><div class="label">Company</div><div class="value">${escapeHTML(ticket.company_name || ticket.company || '')}</div></div>
  <div class="footer">Generated by HELPDESK.AI on ${new Date().toLocaleDateString()}</div>
  <script>window.print();window.close();</script>
</body>
</html>`;
}

function escapeHTML(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * Export a single ticket as a printable window.
 * @param {Object} ticket - The ticket object
 */
export function printTicket(ticket) {
  if (!ticket) return;
  const win = window.open('', '_blank', 'noopener,noreferrer');
  if (!win) return;
  win.document.write(generateTicketPrintHTML(ticket));
  win.document.close();
}
