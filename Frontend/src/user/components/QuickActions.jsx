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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            {actions.map((action, index) => (
                <div
                    key={index}
                    onClick={() => handleActionClick(action)}
                    onMouseEnter={() => setHoveredIdx(index)}
                    onMouseLeave={() => setHoveredIdx(null)}
                    style={{
                        background: '#fff',
                        borderRadius: '20px',
                        border: `1px solid ${hoveredIdx === index ? '#86efac' : '#e7f5ee'}`,
                        boxShadow: hoveredIdx === index ? '0 12px 32px rgba(0,0,0,0.1)' : '0 2px 12px rgba(0,0,0,0.05)',
                        padding: '28px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        transform: hoveredIdx === index ? 'translateY(-6px)' : 'translateY(0)',
                    }}
                >
                    <div style={{
                        width: '48px', height: '48px', borderRadius: '14px', padding: '12px',
                        background: action.iconBg, display: 'flex', alignItems: 'center',
                        justifyContent: 'center', marginBottom: '16px', color: action.iconColor,
                    }}>
                        <action.icon size={24} />
                    </div>

                    <h3 style={{ fontSize: '17px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>{action.title}</h3>
                    <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.6, marginBottom: '20px' }}>
                        {action.description}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#16a34a', fontWeight: 600, fontSize: '13px' }}>
                        Start Request →
                    </div>
                </div>
            ))}
        </div>
    );
};

export default QuickActions;

