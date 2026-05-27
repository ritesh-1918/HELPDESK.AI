import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, ListTodo, Sparkles } from 'lucide-react';

const WelcomeCard = ({ userName = "Ritesh" }) => {
    const navigate = useNavigate();

    return (
        <div
            id="tour-welcome"
            className="bg-white dark:bg-gray-800 border-l-2 border-emerald-600 rounded-[20px] shadow-sm p-10 md:p-12 relative overflow-hidden transition-colors duration-200"
        >
            {/* Badge */}
            <div style={{ marginBottom: '16px' }}>
                <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    background: '#EDFAF3', color: '#16a34a', border: '1px solid #bbf7d0',
                    borderRadius: '100px', fontSize: '11px', fontWeight: 600,
                    letterSpacing: '0.08em', padding: '5px 14px',
                }}>
                    <Sparkles size={12} style={{ fill: '#16a34a' }} />
                    AI-Enhanced Support
                </span>
            </div>

            {/* Heading */}
            <h2 className="font-['Syne'] text-3xl md:text-[34px] font-extrabold text-[#0f1f12] dark:text-white tracking-tight mb-2">
                Welcome back, {userName}
            </h2>

            {/* Description */}
            <p className="text-gray-500 dark:text-gray-300 text-[15px] max-w-[520px] mb-7 leading-relaxed">
                Our AI assistant is ready to help you. Most issues are analyzed and resolved in under 5 minutes.
            </p>

            {/* Buttons */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                <button
                    id="tour-create-ticket"
                    onClick={() => navigate('/create-ticket')}
                    className="inline-flex items-center gap-2 bg-gradient-to-br from-emerald-600 to-green-500 text-white rounded-xl px-6 py-3 font-semibold text-sm shadow-[0_4px_16px_rgba(34,160,69,0.3)] hover:-translate-y-0.5 transition-transform"
                >
                    <PlusCircle size={18} />
                    Report New Issue
                </button>
                <button
                    onClick={() => navigate('/my-tickets')}
                    className="inline-flex items-center gap-2 bg-white dark:bg-gray-800 text-green-700 dark:text-green-400 border-[1.5px] border-emerald-100 dark:border-gray-700 rounded-xl px-6 py-3 font-semibold text-sm hover:bg-emerald-50 dark:hover:bg-gray-700 transition-colors"
                >
                    <ListTodo size={18} />
                    View My Tickets
                </button>
            </div>
        </div>
    );
};

export default WelcomeCard;

