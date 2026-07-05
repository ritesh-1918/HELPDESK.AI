import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { ShieldX, LogOut, MailQuestion } from 'lucide-react';

const NotApproved = () => {
    const navigate = useNavigate();
    const { logout, profile } = useAuthStore();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const isUser = profile?.role === 'user';
    const message = isUser
        ? "Your account request was rejected by your company's administrator."
        : "Your admin registration request was rejected by the system administrator.";

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-8 md:p-12 text-center animate-in fade-in zoom-in duration-300">

                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-500 mx-auto mb-6 ring-8 ring-red-50/50">
                    <ShieldX size={40} />
                </div>

                <h1 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">Access Denied</h1>

                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 mb-8">
                    <p className="text-slate-600 text-sm font-medium leading-relaxed">
                        {message}
                    </p>
                </div>

                <div className="space-y-4">
                    <button
                        onClick={() => window.location.href = 'mailto:support@helpdesk.ai'}
                        className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20"
                    >
                        <MailQuestion size={18} />
                        Contact Support
                    </button>

                    <button
                        onClick={handleLogout}
                        className="w-full py-3.5 px-4 bg-white hover:bg-slate-50 text-slate-600 font-bold rounded-xl transition-all flex items-center justify-center gap-2 border border-slate-200"
                    >
                        <LogOut size={18} />
                        Sign Out
                    </button>
                </div>
            </div>

            <p className="mt-8 text-sm font-medium text-slate-400">
                HelpDesk.ai Security System
            </p>
        </div>
    );
};

export default NotApproved;
