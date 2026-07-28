import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import useAuthStore from '../store/authStore';
import { Clock, LogOut, ShieldAlert, CheckCircle2 } from 'lucide-react';

/**
 * AdminLobby — Waiting room for verified admins pending master admin approval.
 * Route: /admin-lobby
 */
function AdminLobby() {
  const { profile, logout } = useAuthStore();
  const navigate = useNavigate();
  const [status, setStatus] = useState(profile?.status || 'pending_approval');
  const [isTransitioning, setIsTransitioning] = useState(false);

  const currentStatus = profile?.status || status;

  useEffect(() => {
    // If they are somehow here without being an admin, kick them out
    if (!profile || profile.role !== 'admin') {
      navigate('/login');
      return;
    }

    // If they are already active, send to dashboard
    if (currentStatus === 'active') {
      setIsTransitioning(true);
      const timer = setTimeout(() => navigate('/admin/dashboard'), 2000);
      return () => clearTimeout(timer);
    }

    // --- Real-time Subscription to profile changes ---
    const channel = supabase
      .channel(`profile-lobby-${profile.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${profile.id}`,
        },
        (payload) => {
          const newStatus = payload.new.status;
          setStatus(newStatus);

          // Force a store refresh in the background if needed
          useAuthStore.getState().getProfile(profile);

          if (newStatus === 'active') {
            setIsTransitioning(true);
            setTimeout(() => navigate('/admin/dashboard'), 2000);
          }
        }
      )
      .subscribe();

    // --- Polling backup (every 20 seconds) ---
    const pollInterval = setInterval(async () => {
      const data = await useAuthStore.getState().getProfile(profile);
      if (data?.status === 'active') {
        setIsTransitioning(true);
        setTimeout(() => navigate('/admin/dashboard'), 2000);
      }
    }, 20000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(pollInterval);
    };
  }, [profile, navigate, currentStatus]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getStatusText = () => {
    if (currentStatus === 'active') return 'Approved & Active';
    if (currentStatus === 'rejected') return 'Registration Declined';
    if (currentStatus === 'pending_email_verification') return 'Awaiting Email Verification';
    return 'Pending Master Admin Approval';
  };

  // eslint-disable-next-line no-unused-vars
  const getStatusColorClass = () => {
    if (currentStatus === 'active') return 'text-emerald-500 bg-emerald-500/20';
    if (currentStatus === 'rejected') return 'text-red-500 bg-red-500/20';
    return 'text-amber-500 bg-amber-500/20';
  };

  return (
    <div className='min-h-screen bg-[#050508] flex items-center justify-center p-6 font-sans relative overflow-hidden'>
      {/* Ambient glow */}
      <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none' />
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none"></div>

      <div className='w-full max-w-lg bg-white/[0.03] border border-white/[0.08] rounded-3xl p-6 sm:p-10 md:p-12 shadow-2xl backdrop-blur-xl relative z-10 text-center'>
        {isTransitioning ? (
          <div className='py-8 animate-in fade-in slide-in-from-bottom-4 duration-500'>
            <div className='w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(16,185,129,0.3)]'>
              <CheckCircle2 className='w-10 h-10 text-emerald-400' />
            </div>
            <h2 className='text-2xl font-bold text-white mb-2'>Account Approved!</h2>
            <p className='text-emerald-400 text-sm'>Redirecting to your dashboard...</p>
          </div>
        ) : status === 'rejected' ? (
          <div className='py-4'>
            <div className='w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6'>
              <ShieldAlert className='w-8 h-8 text-red-500' />
            </div>
            <h2 className='text-xl font-bold text-white mb-4'>Registration Declined</h2>
            <p className='text-slate-400 text-sm mb-8'>
              Unfortunately, your request to register a company has been declined by the system
              administrator.
            </p>
            <button
              onClick={handleLogout}
              className='px-6 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm hover:bg-white/10 transition'
            >
              Return to Login
            </button>
          </div>
        ) : (
          <>
            <div className='w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-6 relative'>
              {/* Pulsing ring */}
              <div className='absolute inset-0 border-2 border-amber-500 rounded-2xl animate-ping opacity-20'></div>
              <Clock className='w-8 h-8 text-amber-500' />
            </div>

            <h1 className='text-2xl font-bold text-white mb-2'>Email Verified!</h1>
            <p className='text-slate-400 text-sm mb-8 leading-relaxed'>
              Your registration request for{' '}
              <span className='text-white font-semibold'>{profile?.company || 'your company'}</span>{' '}
              has been sent to the Master Admin. You will receive an email once your account is
              approved.
            </p>

            <div className='bg-black/20 border border-white/5 rounded-2xl p-4 mb-8'>
              <div className='flex items-center justify-between mb-2'>
                <span className='text-xs text-slate-500 font-semibold uppercase tracking-wider'>
                  Account
                </span>
                <span className='text-sm font-medium text-white'>{profile?.full_name}</span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-xs text-slate-500 font-semibold uppercase tracking-wider'>
                  Status
                </span>
                <div className='flex items-center gap-2'>
                  <span
                    className={`w-2 h-2 rounded-full animate-pulse ${currentStatus === 'active' ? 'bg-emerald-500' : currentStatus === 'rejected' ? 'bg-red-500' : 'bg-amber-500'}`}
                  ></span>
                  <span
                    className={`text-sm font-medium ${currentStatus === 'active' ? 'text-emerald-500' : currentStatus === 'rejected' ? 'text-red-500' : 'text-amber-500'}`}
                  >
                    {getStatusText()}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className='flex items-center justify-center gap-2 w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all text-sm font-semibold'
            >
              <LogOut className='w-4 h-4' />
              Sign Out
            </button>
            <button
              onClick={handleLogout}
              className='mt-4 text-xs font-semibold text-slate-500 hover:text-white transition-colors underline underline-offset-4'
            >
              Not you? Go back
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default AdminLobby;
