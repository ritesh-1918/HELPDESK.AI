import React, { useState } from 'react';
import { Download, FileText, FileSpreadsheet, Loader2 } from 'lucide-react';
import { exportTicketsToCSV, exportTicketsToPDF } from '../../utils/ticketExport';

/**
 * Export action buttons for the admin ticket view.
 * Renders CSV + PDF download buttons in the toolbar.
 */
const ExportButtons = ({ tickets = [], filename = 'helpdesk-tickets' }) => {
    const [exporting, setExporting] = useState(null); // 'csv' | 'pdf' | null

    const handleCSV = async () => {
        if (exporting) return;
        setExporting('csv');
        try {
            exportTicketsToCSV(tickets, filename);
        } finally {
            setTimeout(() => setExporting(null), 600);
        }
    };

    const handlePDF = async () => {
        if (exporting) return;
        setExporting('pdf');
        try {
            await exportTicketsToPDF(tickets, filename);
        } catch (err) {
            console.error('PDF export failed:', err);
        } finally {
            setExporting(null);
        }
    };

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={handleCSV}
                disabled={!!exporting || tickets.length === 0}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[11px] font-black uppercase tracking-widest text-slate-600 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                title="Export tickets as CSV"
            >
                {exporting === 'csv' ? (
                    <Loader2 size={14} className="animate-spin" />
                ) : (
                    <FileSpreadsheet size={14} />
                )}
                CSV
            </button>

            <button
                onClick={handlePDF}
                disabled={!!exporting || tickets.length === 0}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[11px] font-black uppercase tracking-widest text-slate-600 hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                title="Export tickets as PDF"
            >
                {exporting === 'pdf' ? (
                    <Loader2 size={14} className="animate-spin" />
                ) : (
                    <FileText size={14} />
                )}
                PDF
            </button>
        </div>
    );
};

export default ExportButtons;
