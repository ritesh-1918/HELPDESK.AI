import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, ListTodo, Sparkles } from 'lucide-react';

const WelcomeCard = ({ userName = "Ritesh" }) => {
    const navigate = useNavigate();

    return (
        <div
            id="tour-welcome"
            style={{
                background: '#ffffff',
                borderLeft: '2px solid #22a045',
                borderRadius: '20px',
                boxShadow: '0 2px 24px rgba(0,0,0,0.06)',
                padding: '40px 48px',
                position: 'relative',
                overflow: 'hidden',
            }}
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
            <h2 style={{
                fontFamily: 'Syne, sans-serif', fontSize: '34px', fontWeight: 800,
                color: '#0f1f12', letterSpacing: '-0.025em', margin: '0 0 8px 0',
            }}>
                Welcome back, {userName}
            </h2>

            {/* Description */}
            <p style={{ color: '#6b7280', fontSize: '15px', maxWidth: '520px', margin: '0 0 28px 0', lineHeight: 1.6 }}>
                Our AI assistant is ready to help you. Most issues are analyzed and resolved in under 5 minutes.
            </p>

            {/* Buttons */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                <button
                    id="tour-create-ticket"
                    onClick={() => navigate('/create-ticket')}
                    style={{
                        display: 'inline-flex', alignItems: 'center', gap: '8px',
                        background: 'linear-gradient(135deg, #16a34a, #22c55e)', color: '#fff',
                        borderRadius: '12px', padding: '12px 24px', fontWeight: 600,
                        fontSize: '14px', border: 'none', cursor: 'pointer',
                        boxShadow: '0 4px 16px rgba(34,160,69,0.3)', transition: 'transform 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    <PlusCircle size={18} />
                    Report New Issue
                </button>
                <button
                    onClick={() => navigate('/my-tickets')}
                    style={{
                        display: 'inline-flex', alignItems: 'center', gap: '8px',
                        background: '#fff', color: '#15803d',
                        border: '1.5px solid #d1fae5', borderRadius: '12px',
                        padding: '12px 24px', fontWeight: 600, fontSize: '14px',
                        cursor: 'pointer', transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f0fdf4'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
                >
                    <ListTodo size={18} />
                    View My Tickets
                </button>
            </div>
        </div>
    );
};

export default WelcomeCard;

