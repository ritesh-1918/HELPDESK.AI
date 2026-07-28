import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Home, ShieldCheck, Clock, Briefcase } from 'lucide-react';
import useTicketStore from '../../store/ticketStore';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

function Resolved() {
  const { aiTicket, addAutoResolvedTicket } = useTicketStore();
  const navigate = useNavigate();
  const [isInitializing, setIsInitializing] = useState(true);
  const [displayRecord, setDisplayRecord] = useState(null);
  const hasAdded = React.useRef(false);

  useEffect(() => {
    if (!aiTicket) {
      navigate('/create-ticket');
      return;
    }

    if (!hasAdded.current) {
      const record = {
        resolution_id: Math.floor(100000 + Math.random() * 900000),
        summary: aiTicket.summary,
        category: aiTicket.category,
        resolution_type: 'Automatic',
        resolved_at: new Date().toISOString(),
      };
      addAutoResolvedTicket(record);

      setDisplayRecord(record);
      hasAdded.current = true;
    }
    setIsInitializing(false);
  }, [aiTicket, navigate, addAutoResolvedTicket]);

  if (isInitializing || !displayRecord) {
    return (
      <div className='min-h-screen bg-white flex flex-col items-center justify-center'>
        <CheckCircle2 className='w-16 h-16 text-emerald-600 animate-bounce mb-4' />
        <h2 className='text-xl font-bold text-gray-900'>Finalizing resolution...</h2>
      </div>
    );
  }

  return (
    <main className='flex-1 w-full max-w-[1100px] mx-auto px-6 py-10 flex flex-col gap-8'>
      <div className='w-full flex flex-col items-center justify-center min-h-[60vh]'>
        <div className='w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-8 shadow-inner ring-8 ring-emerald-50'>
          <CheckCircle2 size={48} className='text-emerald-600' />
        </div>

        <h1 className='text-4xl font-black text-gray-900 mb-2 text-center tracking-tight'>
          Your issue was resolved automatically
        </h1>
        <p className='text-gray-500 text-lg font-medium mb-12 text-center max-w-lg leading-relaxed'>
          No ticket was required. Our AI-guided system successfully addressed your request in
          real-time.
        </p>

        <Card className='w-full overflow-hidden border-none shadow-xl shadow-emerald-900/5 mb-10'>
          <CardHeader className='bg-emerald-900 px-8 py-4 text-white flex items-center justify-between'>
            <CardTitle className='flex items-center gap-2'>
              <ShieldCheck size={18} className='text-emerald-400' />
              <span className='text-xs font-bold uppercase tracking-widest'>
                Resolution Audit Record
              </span>
            </CardTitle>
            <span className='text-emerald-400 font-mono text-sm leading-none pt-0.5'>
              #{displayRecord.resolution_id}
            </span>
          </CardHeader>
          <CardContent className='p-8 bg-white grid grid-cols-1 md:grid-cols-2 gap-8'>
            <div className='space-y-6'>
              <div>
                <label className='text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-2'>
                  Category
                </label>
                <div className='flex items-center gap-2 font-bold text-gray-800'>
                  <Briefcase size={16} className='text-emerald-600' />
                  {displayRecord.category}
                </div>
              </div>
              <div>
                <label className='text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-2'>
                  Resolution Type
                </label>
                <div className='inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-black border border-emerald-100 uppercase tracking-tight'>
                  {displayRecord.resolution_type}
                </div>
              </div>
            </div>
            <div className='space-y-6'>
              <div>
                <label className='text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-2'>
                  Time Resolved
                </label>
                <div className='flex items-center gap-2 font-bold text-gray-800'>
                  <Clock size={16} className='text-emerald-600' />
                  {new Date(displayRecord.resolved_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
              <div>
                <label className='text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-2'>
                  Status
                </label>
                <div className='text-emerald-600 font-black text-sm uppercase tracking-tight flex items-center gap-1.5'>
                  <div className='w-2 h-2 bg-emerald-600 rounded-full animate-pulse'></div>
                  Completed & Closed
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className='flex flex-col sm:flex-row gap-4 w-full justify-center'>
          <button
            onClick={() => navigate('/dashboard')}
            className='px-10 py-4 bg-emerald-600 text-white font-black rounded-2xl shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 uppercase tracking-wide text-sm'
          >
            <Home size={18} />
            Back to Dashboard
          </button>
          <button
            onClick={() => {
              sessionStorage.removeItem('currentUser');
              navigate('/');
            }}
            className='px-10 py-4 bg-white text-gray-700 border border-gray-200 font-bold rounded-2xl hover:bg-gray-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2 uppercase tracking-wide text-sm'
          >
            Sign Out
          </button>
        </div>
      </div>
    </main>
  );
}

export default Resolved;
