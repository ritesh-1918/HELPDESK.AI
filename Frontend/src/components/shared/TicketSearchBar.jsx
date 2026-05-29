import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";
import useTicketStore from "../../store/ticketStore";

const TicketSearchBar = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { tickets } = useTicketStore();

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }
    const timer = setTimeout(() => {
      const q = query.toLowerCase();
      const filtered = tickets.filter(t =>
        t.ticket_id?.toString().includes(q) ||
        t.title?.toLowerCase().includes(q) ||
        t.summary?.toLowerCase().includes(q) ||
        t.category?.toLowerCase().includes(q) ||
        t.status?.toLowerCase().includes(q) ||
        t.assigned_team?.toLowerCase().includes(q)
      ).slice(0, 6);
      setResults(filtered);
      setIsOpen(filtered.length > 0);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, tickets]);

  const handleKeyDown = (e) => {
    if (!isOpen) return;
    if (e.key === "ArrowDown") setActiveIndex(i => Math.min(i + 1, results.length - 1));
    if (e.key === "ArrowUp") setActiveIndex(i => Math.max(i - 1, 0));
    if (e.key === "Enter" && activeIndex >= 0) {
      navigate(`/tickets/${results[activeIndex].ticket_id}`);
      setIsOpen(false);
      setQuery("");
    }
    if (e.key === "Escape") setIsOpen(false);
  };

  const handleSelect = (ticket) => {
    navigate(`/tickets/${ticket.ticket_id}`);
    setIsOpen(false);
    setQuery("");
  };

  const statusColors = {
    open: "bg-green-100 text-green-700",
    closed: "bg-gray-100 text-gray-600",
    in_progress: "bg-blue-100 text-blue-700",
    resolved: "bg-purple-100 text-purple-700",
  };

  return (
    <div className="relative w-full max-w-md" onBlur={() => setTimeout(() => setIsOpen(false), 150)}>
      <div className="relative flex items-center">
        <Search className="absolute left-3 w-4 h-4 text-slate-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setActiveIndex(-1); }}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder="Search tickets..."
          className="w-full pl-9 pr-8 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        {query && (
          <button onClick={() => { setQuery(""); setResults([]); setIsOpen(false); }} className="absolute right-3">
            <X className="w-3 h-3 text-slate-400 hover:text-slate-600" />
          </button>
        )}
      </div>
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
          {results.map((ticket, idx) => (
            <div
              key={ticket.ticket_id}
              onClick={() => handleSelect(ticket)}
              className={`flex items-center justify-between px-4 py-3 cursor-pointer border-b border-slate-50 last:border-0 ${activeIndex === idx ? "bg-indigo-50" : "hover:bg-slate-50"}`}
            >
              <div className="flex flex-col">
                <span className="text-xs font-black text-slate-400 uppercase">#{ticket.ticket_id}</span>
                <span className="text-sm font-medium text-slate-800 truncate max-w-[260px]">{ticket.title || ticket.summary}</span>
                <span className="text-xs text-slate-400">{ticket.category}</span>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-semibold ${statusColors[ticket.status] || "bg-gray-100 text-gray-600"}`}>
                {ticket.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TicketSearchBar;
