import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Search, X, Filter, ChevronDown, ChevronUp, Calendar,
    SlidersHorizontal,
} from 'lucide-react';

/**
 * AdvancedSearchBar — shared component for ticket search across user & admin portals.
 *
 * Props:
 *  - filters         Object: { q, status, priority, category, dateFrom, dateTo, sort }
 *  - onChange(filters) Callback when any filter changes
 *  - onClear()         Callback to reset all filters
 *  - statusOptions     Array of { value, label }
 *  - categoryOptions   Array of { value, label }
 *  - priorityOptions   Array of { value, label }
 *  - sortOptions       Array of { value, label }
 *  - placeholder       Search input placeholder text
 *  - debounceMs        Debounce delay in ms (default 300)
 *  - children          Optional slot rendered inside the toolbar row
 */
const AdvancedSearchBar = ({
    filters = {},
    onChange,
    onClear,
    statusOptions = [],
    categoryOptions = [],
    priorityOptions = [],
    sortOptions = [],
    placeholder = 'Search tickets…',
    debounceMs = 300,
    children,
}) => {
    const [localQ, setLocalQ] = useState(filters.q || '');
    const [panelOpen, setPanelOpen] = useState(false);
    const debounceRef = useRef(null);
    const searchInputRef = useRef(null);
    const filtersRef = useRef(filters);

    // Keep filtersRef current to avoid stale closure in handleQChange
    useEffect(() => { filtersRef.current = filters; }, [filters]);

    // Sync external filter.q → local input (e.g. URL param changes)
    useEffect(() => {
        setLocalQ(filters.q || '');
    }, [filters.q]);

    // Debounced propagation of q changes
    const handleQChange = useCallback((value) => {
        setLocalQ(value);
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            onChange({ ...filtersRef.current, q: value || undefined });
        }, debounceMs);
    }, [onChange, debounceMs]);

    // Keyboard shortcuts: "/" to focus, Escape to clear
    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
            if (e.key === 'Escape' && document.activeElement === searchInputRef.current) {
                searchInputRef.current?.blur();
                handleQChange('');
            }
        };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [handleQChange]);

    // Cleanup debounce on unmount
    useEffect(() => () => clearTimeout(debounceRef.current), []);

    const handleFilterChange = (key, value) => {
        onChange({ ...filters, [key]: value || undefined });
    };

    // Compute active filter pills (exclude sort and q — q is shown in search bar)
    const activePills = [
        filters.status    && { key: 'status',    label: `Status: ${filters.status}` },
        filters.priority  && { key: 'priority',  label: `Priority: ${filters.priority}` },
        filters.category  && { key: 'category',  label: `Category: ${filters.category}` },
        filters.dateFrom  && { key: 'dateFrom',  label: `From: ${filters.dateFrom}` },
        filters.dateTo    && { key: 'dateTo',    label: `To: ${filters.dateTo}` },
    ].filter(Boolean);

    const removeFilter = (key) => {
        const next = { ...filters };
        delete next[key];
        onChange(next);
    };

    const hasActiveFilters = activePills.length > 0 || filters.q;

    return (
        <div className="space-y-3">
            {/* ── Toolbar Row ── */}
            <div className="flex flex-col md:flex-row gap-3">
                {/* Search Input */}
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors pointer-events-none" />
                    <input
                        id="ticket-search-input"
                        ref={searchInputRef}
                        type="text"
                        value={localQ}
                        onChange={(e) => handleQChange(e.target.value)}
                        placeholder={placeholder}
                        aria-label="Search tickets"
                        className="w-full pl-11 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all"
                    />
                    {/* Clear search */}
                    {localQ && (
                        <button
                            onClick={() => handleQChange('')}
                            aria-label="Clear search"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                    {/* "/" shortcut hint */}
                    {!localQ && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-300 border border-slate-200 rounded px-1.5 py-0.5 pointer-events-none">
                            /
                        </span>
                    )}
                </div>

                {/* Filter Toggle */}
                <button
                    id="ticket-filter-toggle"
                    onClick={() => setPanelOpen(p => !p)}
                    aria-expanded={panelOpen}
                    aria-controls="ticket-filter-panel"
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-bold transition-all ${
                        panelOpen || activePills.length > 0
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                            : 'bg-slate-50 border-slate-200 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                >
                    <SlidersHorizontal className="w-4 h-4" />
                    Filters
                    {activePills.length > 0 && (
                        <span className="bg-emerald-600 text-white text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center">
                            {activePills.length}
                        </span>
                    )}
                    {panelOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {/* Sort */}
                {sortOptions.length > 0 && (
                    <select
                        id="ticket-sort-select"
                        value={filters.sort || 'created_at:desc'}
                        onChange={(e) => handleFilterChange('sort', e.target.value)}
                        aria-label="Sort tickets"
                        className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer"
                    >
                        {sortOptions.map(o => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                    </select>
                )}

                {/* Extra slot (e.g. Save Search button) */}
                {children}
            </div>

            {/* ── Collapsible Filter Panel ── */}
            {panelOpen && (
                <div
                    id="ticket-filter-panel"
                    role="region"
                    aria-label="Advanced filters"
                    className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl animate-in fade-in slide-in-from-top-2 duration-200"
                >
                    {/* Status */}
                    {statusOptions.length > 0 && (
                        <div className="flex flex-col gap-1">
                            <label htmlFor="filter-status" className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                Status
                            </label>
                            <select
                                id="filter-status"
                                value={filters.status || ''}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                                className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                            >
                                <option value="">All Statuses</option>
                                {statusOptions.map(o => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Priority */}
                    {priorityOptions.length > 0 && (
                        <div className="flex flex-col gap-1">
                            <label htmlFor="filter-priority" className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                Priority
                            </label>
                            <select
                                id="filter-priority"
                                value={filters.priority || ''}
                                onChange={(e) => handleFilterChange('priority', e.target.value)}
                                className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                            >
                                <option value="">All Priorities</option>
                                {priorityOptions.map(o => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Category */}
                    {categoryOptions.length > 0 && (
                        <div className="flex flex-col gap-1">
                            <label htmlFor="filter-category" className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                Category
                            </label>
                            <select
                                id="filter-category"
                                value={filters.category || ''}
                                onChange={(e) => handleFilterChange('category', e.target.value)}
                                className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                            >
                                <option value="">All Categories</option>
                                {categoryOptions.map(o => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Date From */}
                    <div className="flex flex-col gap-1">
                        <label htmlFor="filter-date-from" className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> From
                        </label>
                        <input
                            id="filter-date-from"
                            type="date"
                            value={filters.dateFrom || ''}
                            onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                            className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                        />
                    </div>

                    {/* Date To */}
                    <div className="flex flex-col gap-1">
                        <label htmlFor="filter-date-to" className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> To
                        </label>
                        <input
                            id="filter-date-to"
                            type="date"
                            value={filters.dateTo || ''}
                            onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                            className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                        />
                    </div>
                </div>
            )}

            {/* ── Active Filter Pills ── */}
            {activePills.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active:</span>
                    {activePills.map(pill => (
                        <span
                            key={pill.key}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-full"
                        >
                            {pill.label}
                            <button
                                onClick={() => removeFilter(pill.key)}
                                aria-label={`Remove ${pill.label} filter`}
                                className="hover:text-emerald-900 transition-colors"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </span>
                    ))}
                    {hasActiveFilters && (
                        <button
                            onClick={onClear}
                            className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors ml-1"
                        >
                            Clear all
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdvancedSearchBar;
