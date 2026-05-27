/**
 * Ticket Export Utilities
 * Provides CSV and PDF export functionality for admin ticket management.
 * Uses jsPDF (loaded dynamically) for PDF and native Blob API for CSV.
 */

/**
 * Convert ticket data to CSV string and trigger download.
 */
export const exportTicketsToCSV = (tickets, filename = 'helpdesk-tickets') => {
    if (!tickets || tickets.length === 0) return;

    const headers = [
        'Ticket ID',
        'Subject',
        'Description',
        'Category',
        'Priority',
        'Status',
        'Assigned Team',
        'Assigned Agent',
        'Created By',
        'Creator Email',
        'AI Confidence',
        'Created At',
        'Updated At',
    ];

    const escapeCSV = (val) => {
        const str = val == null ? '' : String(val);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    };

    const rows = tickets.map((t) => [
        t.ticket_id || t.id,
        t.subject || t.summary || '',
        t.description || '',
        t.category || '',
        t.priority || '',
        t.status || '',
        t.assigned_team || '',
        t.assignee?.full_name || '',
        t.creator?.full_name || t.profiles?.full_name || '',
        t.creator?.email || t.profiles?.email || '',
        t.confidence != null ? `${(t.confidence * 100).toFixed(1)}%` : '',
        t.created_at || '',
        t.updated_at || '',
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map((r) => r.map(escapeCSV).join(',')),
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    downloadBlob(blob, `${filename}.csv`);
};

/**
 * Generate a PDF report of tickets using jsPDF and trigger download.
 * Dynamically imports jsPDF + jspdf-autotable to keep initial bundle lean.
 */
export const exportTicketsToPDF = async (tickets, filename = 'helpdesk-tickets') => {
    if (!tickets || tickets.length === 0) return;

    const [{ default: jsPDF }, autoTableModule] = await Promise.all([
        import('jspdf'),
        import('jspdf-autotable'),
    ]);

    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    // Title
    doc.setFontSize(18);
    doc.setTextColor(22, 163, 74); // emerald-600
    doc.text('HELPDESK.AI — Ticket Export', 14, 18);

    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 25);
    doc.text(`Total tickets: ${tickets.length}`, 14, 30);

    // Table data
    const tableHeaders = [
        'ID',
        'Subject',
        'Category',
        'Priority',
        'Status',
        'Team',
        'Agent',
        'Created By',
        'Confidence',
        'Created',
    ];

    const tableRows = tickets.map((t) => [
        t.ticket_id || t.id,
        truncate(t.subject || t.summary || '', 40),
        t.category || '',
        (t.priority || '').toUpperCase(),
        (t.status || '').toUpperCase(),
        t.assigned_team || '',
        t.assignee?.full_name || '',
        t.creator?.full_name || t.profiles?.full_name || '',
        t.confidence != null ? `${(t.confidence * 100).toFixed(0)}%` : '—',
        formatDate(t.created_at),
    ]);

    autoTableModule.default(doc, {
        startY: 35,
        head: [tableHeaders],
        body: tableRows,
        styles: { fontSize: 7, cellPadding: 2 },
        headStyles: {
            fillColor: [22, 163, 74],
            textColor: 255,
            fontStyle: 'bold',
            fontSize: 7.5,
        },
        alternateRowStyles: { fillColor: [240, 253, 244] },
        margin: { left: 14, right: 14 },
    });

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(7);
        doc.setTextColor(148, 163, 184);
        doc.text(
            `Page ${i} of ${pageCount} — HELPDESK.AI`,
            doc.internal.pageSize.getWidth() / 2,
            doc.internal.pageSize.getHeight() - 8,
            { align: 'center' }
        );
    }

    doc.save(`${filename}.pdf`);
};

// ── helpers ──────────────────────────────────────────────────────

function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function truncate(str, len) {
    return str.length > len ? str.slice(0, len) + '…' : str;
}

function formatDate(iso) {
    if (!iso) return '—';
    try {
        return new Date(iso).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    } catch {
        return iso;
    }
}
