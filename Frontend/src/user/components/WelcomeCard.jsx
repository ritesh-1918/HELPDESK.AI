import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, ListTodo, Sparkles } from 'lucide-react';

const WelcomeCard = ({ userName = "Ritesh" }) => {
    const navigate = useNavigate();

    return (
        <div
            id="tour-welcome"
            className="relative overflow-hidden bg-white dark:bg-slate-900 border-l-2 border-green-600 rounded-[20px] shadow-sm dark:shadow-slate-950/50 p-10 md:p-12"
        >
            {/* Badge */}
            <div className="mb-4">
                <span className="inline-flex items-center gap-1.5 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800/30 rounded-full px-3.5 py-1 text-[11px] font-semibold tracking-wider uppercase">
                    <Sparkles size={12} className="fill-green-600 dark:fill-green-400" />
                    AI-Enhanced Support
                </span>
            </div>

            {/* Heading */}
            <h2 className="font-syne text-[34px] font-extrabold text-slate-900 dark:text-white leading-tight tracking-tight mb-2">
                Welcome back, {userName}
            </h2>

            {/* Description */}
            <p className="text-gray-500 dark:text-gray-400 text-[15px] max-w-[520px] mb-7 leading-relaxed">
                Our AI assistant is ready to help you. Most issues are analyzed and resolved in under 5 minutes.
            </p>

            {/* Buttons */}
            <div className="flex flex-wrap gap-3">
                <button
                    id="tour-create-ticket"
                    onClick={() => navigate('/create-ticket')}
                    className="inline-flex items-center gap-2 bg-gradient-to-br from-green-600 to-green-500 text-white rounded-xl px-6 py-3 font-semibold text-sm shadow-lg shadow-green-600/20 hover:scale-[1.02] transition-transform active:scale-95"
                >
                    <PlusCircle size={18} />
                    Report New Issue
                </button>
                <button
                    onClick={() => navigate('/my-tickets')}
                    className="inline-flex items-center gap-2 bg-white dark:bg-slate-800 text-green-700 dark:text-green-400 border-1.5 border-green-100 dark:border-green-900/50 rounded-xl px-6 py-3 font-semibold text-sm hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                >
                    <ListTodo size={18} />
                    View My Tickets
                </button>
            </div>
        </div>
    );
};

export default WelcomeCard;
