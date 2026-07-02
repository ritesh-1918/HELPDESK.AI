import React, { useState } from 'react';
import { formatTicketId } from '../../../utils/format';
import { ShieldAlert, AlertCircle, Clock, CheckCircle2, User } from 'lucide-react';
import { formatTimelineDate } from '../../../utils/dateUtils';

const STATUS_COLUMNS = [
    { id: 'open', label: 'Open', color: 'border-slate-200 bg-slate-50/50' },
    { id: 'in progress', label: 'In Progress', color: 'border-blue-200 bg-blue-50/50' },
    { id: 'resolved', label: 'Resolved', color: 'border-emerald-200 bg-emerald-50/50' },
    { id: 'closed', label: 'Closed', color: 'border-slate-200 bg-slate-100' },
];

const KanbanBoard = ({ tickets, onUpdateTicket, isUpdating }) => {
    const [draggedTicket, setDraggedTicket] = useState(null);
    const [dragOverColumn, setDragOverColumn] = useState(null);

    const handleDragStart = (e, ticket) => {
        setDraggedTicket(ticket);
        e.dataTransfer.effectAllowed = 'move';
        // Hide the default drag image or keep it default. We keep default.
        e.dataTransfer.setData('text/plain', ticket.id);
        
        // Add a small delay to allow the drag image to be generated before adding visual dragging state to original
        setTimeout(() => {
            const el = document.getElementById(`ticket-${ticket.id}`);
            if (el) el.style.opacity = '0.5';
        }, 0);
    };

    const handleDragEnd = (e, ticket) => {
        setDraggedTicket(null);
        setDragOverColumn(null);
        const el = document.getElementById(`ticket-${ticket.id}`);
        if (el) el.style.opacity = '1';
    };

    const handleDragOver = (e, columnId) => {
        e.preventDefault(); // Necessary to allow dropping
        e.dataTransfer.dropEffect = 'move';
        if (dragOverColumn !== columnId) {
            setDragOverColumn(columnId);
        }
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setDragOverColumn(null);
    };

    const handleDrop = (e, columnId) => {
        e.preventDefault();
        setDragOverColumn(null);
        
        const ticketId = e.dataTransfer.getData('text/plain');
        if (!ticketId || !draggedTicket) return;
        
        if (draggedTicket.status !== columnId) {
            onUpdateTicket(ticketId, { status: columnId });
        }
    };

    const getPriorityStyle = (priority) => {
        const p = String(priority || '').toLowerCase();
        if (p === 'high' || p === 'critical') return 'text-red-600 bg-red-100';
        if (p === 'medium') return 'text-amber-600 bg-amber-100';
        if (p === 'low') return 'text-emerald-600 bg-emerald-100';
        return 'text-slate-600 bg-slate-200';
    };

    return (
        <div className="flex h-[calc(100vh-250px)] min-h-[500px] overflow-x-auto overflow-y-hidden p-6 gap-6 items-start bg-slate-50/50">
            {STATUS_COLUMNS.map(column => {
                const columnTickets = tickets.filter(t => String(t.status || '').toLowerCase() === column.id);
                const isOver = dragOverColumn === column.id;

                return (
                    <div
                        key={column.id}
                        onDragOver={(e) => handleDragOver(e, column.id)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, column.id)}
                        className={`flex flex-col w-80 shrink-0 h-full max-h-full rounded-2xl border-2 transition-colors duration-200 ${
                            isOver ? 'border-indigo-400 bg-indigo-50/30 shadow-inner' : column.color
                        }`}
                    >
                        {/* Column Header */}
                        <div className="flex items-center justify-between p-4 border-b border-black/5 bg-white/50 rounded-t-2xl">
                            <h3 className="font-black text-sm uppercase tracking-widest text-slate-700">{column.label}</h3>
                            <span className="bg-white text-slate-500 text-[10px] font-bold px-2 py-1 rounded-lg shadow-sm border border-slate-100">
                                {columnTickets.length}
                            </span>
                        </div>

                        {/* Drop Zone / Cards List */}
                        <div className="flex-1 overflow-y-auto p-3 space-y-3 relative">
                            {columnTickets.map(ticket => (
                                <div
                                    key={ticket.id}
                                    id={`ticket-${ticket.id}`}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, ticket)}
                                    onDragEnd={(e) => handleDragEnd(e, ticket)}
                                    className={`bg-white rounded-xl p-4 border border-slate-200 shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing transition-all ${
                                        isUpdating === ticket.id ? 'opacity-50 pointer-events-none animate-pulse' : ''
                                    }`}
                                >
                                    <div className="flex justify-between items-start mb-2 gap-2">
                                        <span className="font-mono text-[10px] text-indigo-500 font-bold bg-indigo-50 px-2 py-1 rounded">
                                            #{formatTicketId(ticket.id)}
                                        </span>
                                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded ${getPriorityStyle(ticket.priority)}`}>
                                            {ticket.priority || 'Unassigned'}
                                        </span>
                                    </div>
                                    
                                    <h4 className="text-xs font-bold text-slate-800 leading-tight mb-3 line-clamp-2">
                                        {ticket.subject || 'No Subject'}
                                    </h4>

                                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100">
                                        <div className="flex items-center gap-1.5 text-slate-500">
                                            {ticket.assignee ? (
                                                <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center shrink-0 overflow-hidden" title={`Assigned to ${ticket.assignee.full_name}`}>
                                                    {ticket.assignee.profile_picture ? (
                                                        <img src={ticket.assignee.profile_picture} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-[8px] font-bold text-slate-600">{ticket.assignee.full_name.charAt(0)}</span>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="w-5 h-5 rounded-full bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center shrink-0" title="Unassigned">
                                                    <User size={10} className="text-slate-400" />
                                                </div>
                                            )}
                                        </div>
                                        <span className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
                                            <Clock size={10} />
                                            {formatTimelineDate(ticket.created_at)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {columnTickets.length === 0 && !isOver && (
                                <div className="h-full flex items-center justify-center text-center p-4 text-slate-400 text-xs font-medium border-2 border-dashed border-slate-200 rounded-xl m-1">
                                    No tickets
                                </div>
                            )}
                            {isOver && (
                                <div className="absolute inset-x-3 bottom-3 top-3 border-2 border-dashed border-indigo-400 rounded-xl bg-indigo-50/50 pointer-events-none transition-all" />
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default KanbanBoard;
