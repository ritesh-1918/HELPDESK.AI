import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabaseClient';
import useToastStore from '../../store/toastStore';
import {
  Bug,
  Search,
  Filter,
  Clock,
  User,
  ChevronRight,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Eye,
  X,
  Camera,
  BrainCircuit,
  ShieldAlert,
  Trash2,
  Terminal,
} from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';

const MasterBugReports = () => {
  const { addToast } = useToastStore();
  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedBug, setSelectedBug] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');

  const fetchBugs = async () => {
    setLoading(true);
    try {
      const { data, error: sbError } = await supabase
        .from('bug_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (sbError) throw sbError;
      setBugs(data || []);
    } catch (err) {
      console.error('Fetch bugs error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBugs();

    // Real-time subscription
    const channel = supabase
      .channel('bug_reports_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bug_reports' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setBugs((prev) => [payload.new, ...prev]);
          addToast('New System Bug Logged!', 'success');
        } else if (payload.eventType === 'UPDATE') {
          setBugs((prev) => prev.map((b) => (b.id === payload.new.id ? payload.new : b)));
        } else if (payload.eventType === 'DELETE') {
          setBugs((prev) => prev.filter((b) => b.id === payload.old.id));
        }
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const updateBugStatus = async (id, newStatus) => {
    try {
      const { error: upError } = await supabase
        .from('bug_reports')
        .update({ status: newStatus })
        .eq('id', id);

      if (upError) throw upError;
      addToast(`Issue status: ${newStatus.toUpperCase()}`, 'success');
    } catch (err) {
      addToast('Sync failed: ' + err.message, 'error');
    }
  };

  const deleteBug = async (id) => {
    if (!window.confirm('Permanently wipe this bug report from the system?')) return;
    try {
      const { error: delError } = await supabase.from('bug_reports').delete().eq('id', id);

      if (delError) throw delError;
      addToast('Record purged.', 'success');
      if (selectedBug?.id === id) setSelectedBug(null);
    } catch (err) {
      addToast('Purge failed: ' + err.message, 'error');
    }
  };

  const filteredBugs = useMemo(() => {
    return bugs.filter((bug) => {
      const matchesSearch =
        (bug.bug_title || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
        (bug.description || '').toLowerCase().includes((searchQuery || '').toLowerCase());
      const matchesStatus =
        statusFilter === 'All' ||
        (bug.status || '').toLowerCase() === (statusFilter || '').toLowerCase();
      const matchesSeverity = severityFilter === 'All' || bug.severity === severityFilter;
      return matchesSearch && matchesStatus && matchesSeverity;
    });
  }, [bugs, searchQuery, statusFilter, severityFilter]);

  const getSeverityStyle = (s) => {
    switch (s) {
      case 'Critical':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'High':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'Medium':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      default:
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
    }
  };

  const getStatusStyle = (s) => {
    switch (s?.toLowerCase()) {
      case 'resolved':
        return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
      case 'investigating':
        return 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30';
      case 'fixed':
        return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
      default:
        return 'bg-white/5 text-slate-400 border border-white/10';
    }
  };

  return (
    <div className='space-y-8 animate-in fade-in duration-700 pb-20'>
      {/* Header */}
      <div className='flex flex-col md:flex-row md:items-end justify-between gap-6'>
        <div>
          <div className='flex items-center gap-3 mb-1'>
            <Terminal className='w-5 h-5 text-indigo-400' />
            <span className='text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]'>
              Platform Integrity
            </span>
          </div>
          <h1 className='text-4xl font-black text-white tracking-tighter italic uppercase flex items-center gap-4'>
            <Bug className='text-indigo-500 w-10 h-10' />
            Bug Radar
          </h1>
          <p className='text-sm font-bold text-slate-500 mt-2'>
            Superuser override:{' '}
            <span className='text-white'>{filteredBugs.length} system vulnerabilities</span>{' '}
            tracked.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className='bg-white/[0.02] backdrop-blur-xl p-6 rounded-[2rem] border border-white/5 shadow-2xl grid grid-cols-1 md:grid-cols-3 gap-6'>
        <div className='relative group'>
          <Search className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors w-5 h-5' />
          <input
            type='text'
            placeholder='Scan reports for keywords...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all text-white placeholder:text-slate-600'
          />
        </div>
        <div className='space-y-1'>
          <label className='text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1'>
            Status Protocol
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className='w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-300 focus:outline-none focus:border-indigo-500/50 cursor-pointer'
          >
            <option value='All' className='bg-slate-900'>
              All Statuses
            </option>
            <option value='Open' className='bg-slate-900'>
              Open
            </option>
            <option value='Investigating' className='bg-slate-900'>
              Investigating
            </option>
            <option value='Fixed' className='bg-slate-900'>
              Fixed
            </option>
            <option value='Resolved' className='bg-slate-900'>
              Resolved
            </option>
          </select>
        </div>
        <div className='space-y-1'>
          <label className='text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1'>
            Threat Level
          </label>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className='w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-300 focus:outline-none focus:border-indigo-500/50 cursor-pointer'
          >
            <option value='All' className='bg-slate-900'>
              All Severities
            </option>
            <option value='Critical' className='bg-slate-900 text-red-400'>
              Critical
            </option>
            <option value='High' className='bg-slate-900 text-orange-400'>
              High
            </option>
            <option value='Medium' className='bg-slate-900 text-yellow-400'>
              Medium
            </option>
            <option value='Low' className='bg-slate-900 text-indigo-400'>
              Low
            </option>
          </select>
        </div>
      </div>

      {/* Data Grid */}
      <div className='bg-white/[0.01] backdrop-blur-3xl rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden min-h-[400px]'>
        {loading ? (
          <div className='flex items-center justify-center h-[400px]'>
            <Loader2 className='w-10 h-10 text-indigo-500 animate-spin' />
          </div>
        ) : filteredBugs.length === 0 ? (
          <div className='flex flex-col items-center justify-center h-[400px] text-slate-600'>
            <div className='w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center mb-4'>
              <Bug size={40} className='opacity-20' />
            </div>
            <p className='font-black uppercase tracking-[0.3em] text-[10px]'>
              Perimeter Clear: No Bugs Found
            </p>
          </div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full border-collapse'>
              <thead>
                <tr className='bg-white/5 border-b border-white/5'>
                  <th className='px-8 py-6 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]'>
                    Priority
                  </th>
                  <th className='px-8 py-6 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]'>
                    Description
                  </th>
                  <th className='px-8 py-6 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]'>
                    Module
                  </th>
                  <th className='px-8 py-6 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]'>
                    Status
                  </th>
                  <th className='px-8 py-6 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]'>
                    Log Date
                  </th>
                  <th className='px-8 py-6 text-center text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]'>
                    Terminal
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-white/5'>
                {filteredBugs.map((bug) => (
                  <tr
                    key={bug.id}
                    className='hover:bg-white/[0.03] transition-all group border-b border-white/[0.02]'
                  >
                    <td className='px-8 py-6'>
                      <span
                        className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase border ${getSeverityStyle(bug.severity)}`}
                      >
                        {bug.severity}
                      </span>
                    </td>
                    <td className='px-8 py-6'>
                      <div className='flex flex-col'>
                        <span className='text-sm font-bold text-white group-hover:text-indigo-300 transition-colors uppercase tracking-tight'>
                          {bug.bug_title}
                        </span>
                        <span className='text-[10px] text-slate-500 truncate max-w-[250px] font-medium leading-relaxed italic'>
                          "{bug.description}"
                        </span>
                      </div>
                    </td>
                    <td className='px-8 py-6'>
                      <span className='text-[10px] font-black text-indigo-400/60 uppercase tracking-widest'>
                        {bug.category}
                      </span>
                    </td>
                    <td className='px-8 py-6'>
                      <select
                        value={bug.status || 'open'}
                        onChange={(e) => updateBugStatus(bug.id, e.target.value)}
                        className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border-none outline-none cursor-pointer transition-all ${getStatusStyle(bug.status)}`}
                      >
                        <option value='open' className='bg-slate-900'>
                          Open
                        </option>
                        <option value='investigating' className='bg-slate-900'>
                          Investigating
                        </option>
                        <option value='fixed' className='bg-slate-900'>
                          Fixed
                        </option>
                        <option value='resolved' className='bg-slate-900'>
                          Resolved
                        </option>
                      </select>
                    </td>
                    <td className='px-8 py-6'>
                      <span className='text-[10px] font-bold text-slate-600 font-mono tracking-tighter'>
                        {new Date(bug.created_at).toLocaleString()}
                      </span>
                    </td>
                    <td className='px-8 py-6 text-center'>
                      <div className='flex items-center justify-center gap-3'>
                        <button
                          onClick={() => setSelectedBug(bug)}
                          className='w-10 h-10 bg-white/5 text-indigo-400 rounded-xl hover:bg-indigo-500 hover:text-white transition-all shadow-xl border border-white/5 flex items-center justify-center group/btn'
                        >
                          <Eye
                            size={16}
                            className='group-hover/btn:scale-110 transition-transform'
                          />
                        </button>
                        <button
                          onClick={() => deleteBug(bug.id)}
                          className='w-10 h-10 bg-white/0 text-slate-700 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all flex items-center justify-center'
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Deep-Dive Modal (Master Dark Theme) */}
      <AnimatePresence>
        {selectedBug && (
          <div className='fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto'>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedBug(null)}
              className='fixed inset-0 bg-black/80 backdrop-blur-md'
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className='bg-[#0a0a0f] rounded-[3rem] shadow-[0_0_100px_rgba(79,70,229,0.15)] w-full max-w-5xl relative z-[101] my-auto border border-white/5 flex flex-col max-h-[92vh] overflow-hidden'
            >
              {/* Modal Header */}
              <div className='p-10 border-b border-white/5 flex items-center justify-between shrink-0 bg-white/[0.02]'>
                <div className='flex items-center gap-6'>
                  <div className='w-16 h-16 bg-indigo-500/10 border border-indigo-500/20 rounded-3xl flex items-center justify-center'>
                    <Bug className='w-10 h-10 text-indigo-400' />
                  </div>
                  <div>
                    <div className='flex items-center gap-3 mb-2'>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border ${getSeverityStyle(selectedBug.severity)}`}
                      >
                        {selectedBug.severity} Threat
                      </span>
                      <span className='text-[10px] font-black text-indigo-500/60 font-mono tracking-widest'>
                        TRACE_ID: {selectedBug.id.slice(0, 12)}
                      </span>
                    </div>
                    <h2 className='text-3xl font-black text-white tracking-tighter uppercase italic italic'>
                      {selectedBug.bug_title}
                    </h2>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedBug(null)}
                  className='p-4 hover:bg-white/5 rounded-2xl transition-all border border-transparent hover:border-white/10 group'
                >
                  <X className='w-6 h-6 text-slate-500 group-hover:text-white' />
                </button>
              </div>

              {/* Modal Content */}
              <div className='p-10 overflow-y-auto customize-scrollbar space-y-10 bg-[#0a0a0f]'>
                <div className='grid grid-cols-1 lg:grid-cols-5 gap-10'>
                  {/* Primary Info */}
                  <div className='lg:col-span-3 space-y-10'>
                    <section className='space-y-4'>
                      <h3 className='text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-3'>
                        <div className='w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]'></div>
                        Vulnerability Intel
                      </h3>
                      <div className='bg-white/5 border border-white/5 p-8 rounded-[2rem] space-y-6'>
                        <div>
                          <p className='text-[10px] font-black text-indigo-400/50 uppercase mb-2'>
                            Observation
                          </p>
                          <p className='text-lg text-slate-200 leading-relaxed font-semibold'>
                            {selectedBug.description}
                          </p>
                        </div>
                        {selectedBug.steps_to_reproduce && (
                          <div className='pt-4 border-t border-white/5'>
                            <p className='text-[10px] font-black text-indigo-400/50 uppercase mb-3'>
                              Replication Path
                            </p>
                            <div className='bg-black/40 p-5 rounded-2xl border border-white/5 font-mono text-xs text-slate-400 whitespace-pre-line leading-relaxed'>
                              {selectedBug.steps_to_reproduce}
                            </div>
                          </div>
                        )}
                        <div className='grid grid-cols-2 gap-6 pt-4'>
                          <div className='bg-emerald-500/5 border border-emerald-500/10 p-5 rounded-2xl'>
                            <p className='text-[10px] font-black text-emerald-500/60 uppercase mb-1'>
                              Expected Matrix
                            </p>
                            <p className='text-sm text-emerald-100 font-bold'>
                              {selectedBug.expected_result || 'NO_DATA'}
                            </p>
                          </div>
                          <div className='bg-red-500/5 border border-red-500/10 p-5 rounded-2xl'>
                            <p className='text-[10px] font-black text-red-500/60 uppercase mb-1'>
                              Observed Output
                            </p>
                            <p className='text-sm text-red-100 font-bold'>
                              {selectedBug.actual_result || 'SYSTEM_FAILURE'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </section>

                    {/* AI Diagnostics (Dark Themed) */}
                    <section className='bg-indigo-600 rounded-[2.5rem] p-10 text-white shadow-[0_20px_60px_rgba(79,70,229,0.3)] relative overflow-hidden group'>
                      <div className='absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-white/20 transition-all duration-1000'></div>
                      <div className='relative z-10'>
                        <h3 className='text-xs font-black uppercase tracking-[0.4em] mb-6 flex items-center gap-3 text-indigo-100'>
                          <BrainCircuit className='w-6 h-6 animate-pulse' />
                          Neural Diagnostic Engine
                        </h3>
                        <div className='space-y-6'>
                          <div className='bg-black/20 backdrop-blur-md p-6 rounded-3xl border border-white/20'>
                            <p className='text-[10px] font-black text-indigo-200 uppercase mb-3'>
                              Root Cause Synthesis
                            </p>
                            <p className='text-lg font-bold text-white leading-relaxed italic'>
                              "
                              {selectedBug.diagnostic_data?.ai_probable_cause ||
                                'AI Engine re-scanning metadata...'}
                              "
                            </p>
                          </div>
                          <div className='flex flex-wrap gap-4 text-[11px] font-black'>
                            <div className='bg-white/10 px-4 py-2 rounded-xl flex items-center gap-2 border border-white/10 uppercase tracking-widest'>
                              <ShieldAlert className='w-4 h-4 text-indigo-200' />
                              {selectedBug.diagnostic_data?.console_errors?.length || 0} Error Flags
                            </div>
                            <div className='bg-white/10 px-4 py-2 rounded-xl flex items-center gap-2 border border-white/10 lowercase'>
                              <ExternalLink className='w-4 h-4 text-indigo-200' />
                              {selectedBug.diagnostic_data?.url || '/root'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>
                  </div>

                  {/* Secondary Info */}
                  <div className='lg:col-span-2 space-y-10'>
                    <section className='space-y-4'>
                      <h3 className='text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-3'>
                        <Camera className='w-5 h-5 text-indigo-400' />
                        Visual Capture
                      </h3>
                      {selectedBug.diagnostic_data?.screenshot_base64 ? (
                        <div className='relative group rounded-[2rem] overflow-hidden border-4 border-white/5 shadow-2xl bg-black flex items-center justify-center p-2'>
                          <img
                            src={selectedBug.diagnostic_data.screenshot_base64}
                            alt='Vulnerability Capture'
                            className='w-full h-auto max-h-[500px] object-contain rounded-2xl'
                          />
                          <div className='absolute inset-0 bg-indigo-900/0 group-hover:bg-indigo-900/60 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 backdrop-blur-sm'>
                            <button
                              onClick={() =>
                                window.open(selectedBug.diagnostic_data.screenshot_base64, '_blank')
                              }
                              className='px-8 py-3 bg-white text-slate-900 text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-2xl hover:scale-105 transition-transform'
                            >
                              Inspect Raw Frame
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className='bg-white/[0.02] rounded-[2rem] border-2 border-dashed border-white/10 h-64 flex flex-col items-center justify-center text-slate-600'>
                          <Camera size={48} className='mb-4 opacity-10' />
                          <p className='text-[10px] font-black uppercase tracking-widest text-slate-500'>
                            No Visual Data
                          </p>
                        </div>
                      )}
                    </section>

                    <section className='space-y-4'>
                      <h3 className='text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-3'>
                        <Clock className='w-5 h-5 text-indigo-400' />
                        Telemetry Dump
                      </h3>
                      <div className='bg-black/40 border border-white/5 rounded-[2rem] p-8 font-mono text-[11px] space-y-3'>
                        <div className='flex items-center justify-between py-2 border-b border-white/[0.02]'>
                          <span className='text-slate-500 uppercase tracking-widest'>
                            OS/Engine:
                          </span>
                          <span className='text-indigo-400/80 truncate ml-4 max-w-[150px]'>
                            {selectedBug.diagnostic_data?.browser || 'UNKNOWN'}
                          </span>
                        </div>
                        <div className='flex items-center justify-between py-2 border-b border-white/[0.02]'>
                          <span className='text-slate-500 uppercase tracking-widest'>
                            Resolution:
                          </span>
                          <span className='text-slate-300'>
                            {selectedBug.diagnostic_data?.screen || 'HID_SPEC'}
                          </span>
                        </div>
                        {selectedBug.contact_permission && (
                          <div className='mt-6 flex items-center gap-3 bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20'>
                            <CheckCircle2 size={20} className='text-emerald-400 shrink-0' />
                            <span className='text-[10px] font-black text-emerald-400 uppercase tracking-tighter leading-tight'>
                              Follow-up Contact Authorized by User
                            </span>
                          </div>
                        )}
                      </div>
                    </section>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style
        dangerouslySetInnerHTML={{
          __html: `
                .customize-scrollbar::-webkit-scrollbar { width: 8px; }
                .customize-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .customize-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; border: 2px solid transparent; background-clip: padding-box; }
                .customize-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.1); }
            `,
        }}
      />
    </div>
  );
};

export default MasterBugReports;
