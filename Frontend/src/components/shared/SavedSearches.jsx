import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bookmark, BookmarkPlus, ChevronDown, Trash2, Loader2, X } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import useAuthStore from '../../store/authStore';

/**
 * SavedSearches — lets users save and reload named filter sets.
 *
 * Props:
 *  - currentFilters  Object: current active filter state
 *  - onLoad(filters) Callback when a saved search is selected
 */
const SavedSearches = ({ currentFilters, onLoad }) => {
    const { user } = useAuthStore();
    const [searches, setSearches]     = useState([]);
    const [dropdownOpen, setDropdown] = useState(false);
    const [modalOpen, setModal]       = useState(false);
    const [saving, setSaving]         = useState(false);
    const [name, setName]             = useState('');
    const [nameError, setNameError]   = useState('');
    const dropdownRef                 = useRef(null);
    const nameInputRef                = useRef(null);

    const hasActiveFilters = Object.values(currentFilters).some(v => v !== undefined && v !== '');

    // Load saved searches from Supabase
    const loadSearches = useCallback(async () => {
        if (!user?.id) return;
        const { data, error } = await supabase
            .from('saved_searches')
            .select('id, name, filters, created_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
        if (!error) setSearches(data || []);
    }, [user?.id]);

    useEffect(() => {
        loadSearches();
    }, [loadSearches]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClick = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    // Focus name input when modal opens
    useEffect(() => {
        if (modalOpen) {
            setTimeout(() => nameInputRef.current?.focus(), 50);
        }
    }, [modalOpen]);

    const handleSave = async (e) => {
        e.preventDefault();
        const trimmed = name.trim();
        if (!trimmed) {
            setNameError('Name is required');
            return;
        }
        if (trimmed.length > 60) {
            setNameError('Name must be 60 characters or fewer');
            return;
        }
        setSaving(true);
        const { error } = await supabase.from('saved_searches').insert({
            user_id: user.id,
            name:    trimmed,
            filters: currentFilters,
        });
        setSaving(false);
        if (error) {
            setNameError('Failed to save. Please try again.');
            return;
        }
        setModal(false);
        setName('');
        setNameError('');
        await loadSearches();
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        await supabase.from('saved_searches').delete().eq('id', id);
        setSearches(prev => prev.filter(s => s.id !== id));
    };

    const handleLoad = (filters) => {
        onLoad(filters);
        setDropdown(false);
    };

    return (
        <>
            <div className="flex items-center gap-2">
                {/* Saved Searches Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        id="saved-searches-toggle"
                        onClick={() => setDropdown(o => !o)}
                        aria-haspopup="listbox"
                        aria-expanded={dropdownOpen}
                        title="Saved Searches"
                        className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:border-slate-300 hover:bg-white transition-all"
                    >
                        <Bookmark className="w-4 h-4 text-amber-500" />
                        <span className="hidden sm:inline">Saved</span>
                        {searches.length > 0 && (
                            <span className="bg-amber-100 text-amber-700 text-[10px] font-black rounded-full px-1.5 py-0.5">
                                {searches.length}
                            </span>
                        )}
                        <ChevronDown className="w-3.5 h-3.5" />
                    </button>

                    {dropdownOpen && (
                        <div
                            role="listbox"
                            aria-label="Saved searches"
                            className="absolute right-0 top-full mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
                        >
                            <div className="px-4 py-3 border-b border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    Saved Searches
                                </p>
                            </div>

                            {searches.length === 0 ? (
                                <div className="py-8 px-4 text-center">
                                    <Bookmark className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                                    <p className="text-sm text-slate-400 font-medium">No saved searches yet.</p>
                                    <p className="text-xs text-slate-300 mt-0.5">Apply filters then save them for quick reuse.</p>
                                </div>
                            ) : (
                                <ul className="py-1 max-h-60 overflow-y-auto">
                                    {searches.map(s => (
                                        <li
                                            key={s.id}
                                            role="option"
                                            aria-selected={false}
                                            onClick={() => handleLoad(s.filters)}
                                            className="flex items-center justify-between px-4 py-2.5 hover:bg-emerald-50 cursor-pointer group transition-colors"
                                        >
                                            <span className="text-sm font-semibold text-slate-700 group-hover:text-emerald-700 truncate max-w-[200px]">
                                                {s.name}
                                            </span>
                                            <button
                                                onClick={(e) => handleDelete(e, s.id)}
                                                aria-label={`Delete saved search "${s.name}"`}
                                                className="p-1 text-slate-300 hover:text-red-500 transition-colors shrink-0 ml-2"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}
                </div>

                {/* Save Current Search */}
                {hasActiveFilters && (
                    <button
                        id="save-search-btn"
                        onClick={() => setModal(true)}
                        title="Save current search"
                        className="flex items-center gap-1.5 px-3 py-2.5 bg-amber-50 border border-amber-200 text-amber-700 text-sm font-bold rounded-xl hover:bg-amber-100 transition-all"
                    >
                        <BookmarkPlus className="w-4 h-4" />
                        <span className="hidden sm:inline">Save</span>
                    </button>
                )}
            </div>

            {/* ── Save Search Modal ── */}
            {modalOpen && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="save-search-modal-title"
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={(e) => { if (e.target === e.currentTarget) setModal(false); }}
                >
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-4">
                            <h2 id="save-search-modal-title" className="text-base font-black text-slate-900">
                                Save Search
                            </h2>
                            <button
                                onClick={() => setModal(false)}
                                aria-label="Close"
                                className="text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label htmlFor="saved-search-name" className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">
                                    Search Name
                                </label>
                                <input
                                    id="saved-search-name"
                                    ref={nameInputRef}
                                    type="text"
                                    value={name}
                                    onChange={(e) => { setName(e.target.value); setNameError(''); }}
                                    placeholder="e.g. High-priority network tickets"
                                    maxLength={60}
                                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                                />
                                {nameError && (
                                    <p className="text-xs text-red-500 font-medium mt-1">{nameError}</p>
                                )}
                            </div>

                            <div className="flex items-center gap-3 pt-1">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 disabled:opacity-60 transition-all"
                                >
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <BookmarkPlus className="w-4 h-4" />}
                                    {saving ? 'Saving…' : 'Save Search'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setModal(false)}
                                    className="px-4 py-2.5 bg-slate-100 text-slate-600 dark:text-slate-400 text-sm font-bold rounded-xl hover:bg-slate-200 transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default SavedSearches;
