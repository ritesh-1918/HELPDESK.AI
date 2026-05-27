import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Network, Laptop, ShieldCheck, ArrowRight } from 'lucide-react';

const actions = [
    {
        title: "Network Issues",
        description: "Connectivity problems, VPN access, and slow internet.",
        category: "Network",
        templateId: "vpn-connectivity",
        icon: Network,
        iconBg: '#EDFAF3',
        iconColor: '#16a34a',
    },
    {
        title: "Software Problems",
        description: "Application crashes, license issues, and installations.",
        category: "Software",
        templateId: "software-installation",
        icon: Laptop,
        iconBg: '#EEF2FF',
        iconColor: '#4f46e5',
    },
    {
        title: "Access Requests",
        description: "Permission changes, new account setup, and MFA.",
        category: "Access",
        templateId: "password-reset",
        icon: ShieldCheck,
        iconBg: '#F5F0FF',
        iconColor: '#7c3aed',
    }
];

const QuickActions = () => {
    const navigate = useNavigate();
    const [hoveredIdx, setHoveredIdx] = useState(null);

    const handleActionClick = (action) => {
        navigate('/create-ticket', { state: { templateId: action.templateId, prefilledCategory: action.category } });
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {actions.map((action, index) => (
                <div
                    key={index}
                    onClick={() => handleActionClick(action)}
                    onMouseEnter={() => setHoveredIdx(index)}
                    onMouseLeave={() => setHoveredIdx(null)}
                    className={`bg-white dark:bg-gray-800 rounded-[20px] p-7 cursor-pointer transition-all duration-300 transform ${
                        hoveredIdx === index 
                            ? 'border-green-300 dark:border-green-500 shadow-[0_12px_32px_rgba(0,0,0,0.1)] dark:shadow-[0_12px_32px_rgba(0,0,0,0.3)] -translate-y-1.5' 
                            : 'border-[#e7f5ee] dark:border-gray-700 shadow-[0_2px_12px_rgba(0,0,0,0.05)] translate-y-0'
                    } border`}
                >
                    <div style={{
                        width: '48px', height: '48px', borderRadius: '14px', padding: '12px',
                        background: action.iconBg, display: 'flex', alignItems: 'center',
                        justifyContent: 'center', marginBottom: '16px', color: action.iconColor,
                    }} className="dark:opacity-90">
                        <action.icon size={24} />
                    </div>

                    <h3 className="text-[17px] font-semibold text-gray-900 dark:text-white mb-2">{action.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-5">
                        {action.description}
                    </p>

                    <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold text-[13px]">
                        Start Request →
                    </div>
                </div>
            ))}
        </div>
    );
};

export default QuickActions;

