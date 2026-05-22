import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Inbox,
    Users,
    BarChart3,
    UserCircle,
    Settings,
    LogOut,
    Activity,
    ChevronLeft,
    ChevronRight,
    Clock
} from 'lucide-react';
import useAuthStore from '../../store/authStore';

const AdminSidebar = ({ isMobile, onClose, isCollapsed, onToggleCollapse }) => {
    const navItems = [
        { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
        { label: 'Tickets', path: '/admin/tickets', icon: Inbox },
        { label: 'Users', path: '/admin/users', icon: Users },
        { label: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
        { label: 'Profile', path: '/admin/profile', icon: UserCircle },
        { label: 'SLA Monitor', path: '/admin/sla', icon: Clock },
    ];

    const { logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const showLabels = isMobile || !isCollapsed;

    return (
        <aside 
            className={`${isMobile ? 'w-full h-full' : 'fixed left-0 top-0 h-full'} z-40 transition-all duration-300 overflow-hidden flex flex-col`}
            style={{
                width: isMobile ? '100%' : (isCollapsed ? '80px' : '260px'),
                background: '#ffffff',
                borderRight: '1px solid #f0fdf4',
                boxShadow: '2px 0 12px rgba(0,0,0,0.04)'
            }}
        >
            {/* Logo Section */}
            <div className="p-6 border-b border-gray-50 flex items-center" style={{ justifyContent: showLabels ? 'space-between' : 'center', padding: isCollapsed && !isMobile ? '24px 16px' : '24px 32px' }}>
                <div className="flex items-center gap-3">
                    <img 
                        src="/favicon.png" 
                        alt="HelpDesk.ai Logo" 
                        style={{ 
                            height: showLabels ? '32px' : '32px', 
                            width: showLabels ? 'auto' : '32px',
                            objectFit: 'contain',
                            borderRadius: showLabels ? '0' : '8px'
                        }} 
                    />
                    {showLabels && (
                        <div className="animate-in fade-in duration-500 flex flex-col justify-center">
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">Admin Console</p>
                        </div>
                    )}
                </div>
                {!isMobile && onToggleCollapse && (
                    <button
                        onClick={onToggleCollapse}
                        style={{
                            background: '#f0fdf4', border: '1px solid #d1fae5',
                            borderRadius: '8px', padding: '4px', cursor: 'pointer',
                            color: '#15803d', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', transition: 'all 0.2s ease',
                            position: isCollapsed ? 'absolute' : 'relative',
                            right: isCollapsed ? '-12px' : 'auto',
                            top: isCollapsed ? '28px' : 'auto',
                            zIndex: 50, boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
                        }}
                        className="hover:bg-emerald-100"
                    >
                        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                    </button>
                )}
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 px-3 py-8 space-y-1.5 overflow-y-auto custom-scrollbar">
                {showLabels && (
                    <p style={{ fontSize: '10px', letterSpacing: '0.14em', color: '#9ca3af', fontWeight: 600, paddingLeft: '14px', marginBottom: '16px' }} className="uppercase">
                        CORE MODULES
                    </p>
                )}
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={isMobile ? onClose : undefined}
                        style={({ isActive }) => ({
                            display: 'flex', alignItems: 'center', gap: '12px',
                            borderRadius: '10px', padding: isCollapsed && !isMobile ? '10px' : '9px 14px',
                            color: isActive ? '#15803d' : '#6b7280',
                            background: isActive ? '#f0fdf4' : 'transparent',
                            fontWeight: isActive ? 600 : 500,
                            textDecoration: 'none', transition: 'all 0.2s ease',
                            justifyContent: isCollapsed && !isMobile ? 'center' : 'flex-start'
                        })}
                        className="group hover:bg-gray-50 relative"
                    >
                        <item.icon size={20} className="shrink-0 transition-transform group-hover:scale-110" />
                        {showLabels && (
                            <span className="text-sm tracking-tight truncate animate-in fade-in slide-in-from-left-2 duration-300">
                                {item.label}
                            </span>
                        )}
                        {/* Tooltip for collapsed mode */}
                        {isCollapsed && !isMobile && (
                            <div className="absolute left-full ml-3 bg-gray-900 text-white text-xs py-1.5 px-3 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap shadow-lg" style={{ top: '50%', transform: 'translateY(-50%)' }}>
                                {item.label}
                            </div>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Bottom Profile / Logout Shortcut */}
            <div className="p-4 border-t border-gray-50 space-y-1.5 pb-8 flex flex-col items-stretch">
                <NavLink
                    to="/admin/settings"
                    onClick={isMobile ? onClose : undefined}
                    style={({ isActive }) => ({
                        display: 'flex', alignItems: 'center', gap: '12px',
                        borderRadius: '10px', padding: isCollapsed && !isMobile ? '10px' : '9px 14px',
                        color: isActive ? '#15803d' : '#6b7280',
                        background: isActive ? '#f0fdf4' : 'transparent',
                        fontWeight: isActive ? 600 : 500,
                        textDecoration: 'none', transition: 'all 0.2s ease',
                        justifyContent: isCollapsed && !isMobile ? 'center' : 'flex-start'
                    })}
                    className="group hover:bg-gray-50"
                >
                    <Settings size={20} className="shrink-0 group-hover:rotate-45 transition-transform duration-300" />
                    {showLabels && <span className="text-sm tracking-tight animate-in fade-in duration-300">Settings</span>}
                </NavLink>

                <button
                    onClick={handleLogout}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        borderRadius: '10px', padding: isCollapsed && !isMobile ? '10px' : '9px 14px',
                        color: '#6b7280', background: 'transparent',
                        fontWeight: 500, border: 'none', cursor: 'pointer',
                        transition: 'all 0.2s ease', width: '100%',
                        justifyContent: isCollapsed && !isMobile ? 'center' : 'flex-start'
                    }}
                    className="group hover:bg-red-50 hover:text-red-600"
                >
                    <LogOut size={20} className="shrink-0 group-hover:translate-x-1 transition-transform" />
                    {showLabels && <span className="text-sm tracking-tight animate-in fade-in duration-300">Logout</span>}
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;
