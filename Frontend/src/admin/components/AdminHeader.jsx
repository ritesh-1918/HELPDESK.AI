import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, Menu, User, ChevronDown, Settings, LogOut, UserCircle, X, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NotificationPopover from '../../user/components/NotificationPopover';
import useAuthStore from '../../store/authStore';
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";

/**
 * AdminHeader Component
 * Refined 64px header for the administrative console.
 * Features a solid white background, specific search placeholder, 
 * and a functional avatar dropdown menu.
 */
const AdminHeader = ({ onMobileNavToggle, isSidebarCollapsed, onToggleSidebar }) => {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const dropdownRef = useRef(null);
    const searchRef = useRef(null);
    const navigate = useNavigate();
    const { logout, profile: adminProfile } = useAuthStore();
    const initials = adminProfile?.full_name ? adminProfile.full_name.split(' ').map(n => n[0]).join('').toUpperCase() : 'AD';

    const handleSearchKeyDown = (e) => {
        if (e.key === 'Enter' && searchQuery.trim()) {
            navigate(`/admin/tickets?q=${encodeURIComponent(searchQuery.trim())}`);
            searchRef.current?.blur();
        } else if (e.key === 'Escape') {
            setSearchQuery('');
            searchRef.current?.blur();
        }
    };

    const handleSearchClear = () => {
        setSearchQuery('');
        searchRef.current?.focus();
    };

    // Handle clicks outside of dropdown to close it
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 px-6 md:px-10 flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
                {/* Mobile Menu Toggle */}
                <button
                    onClick={onMobileNavToggle}
                    className="lg:hidden p-2 hover:bg-slate-50 rounded-xl text-slate-500 transition-colors"
                >
                    <Menu size={20} />
                </button>

                {/* Desktop Sidebar Toggle */}
                {onToggleSidebar && (
                    <button
                        onClick={onToggleSidebar}
                        className="hidden md:flex p-2 hover:bg-emerald-50 rounded-xl text-slate-400 hover:text-emerald-600 transition-all"
                        title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    >
                        {isSidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
                    </button>
                )}

                {/* Primary Search Terminal */}
                <div className="flex-1 max-w-xl relative hidden md:block">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                    <input
                        ref={searchRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleSearchKeyDown}
                        placeholder="Search tickets, users… (press Enter)"
                        className="w-full bg-slate-50/50 border border-slate-200 rounded-xl pl-11 pr-9 py-2 text-sm font-medium tracking-tight focus:outline-none focus:ring-4 focus:ring-emerald-600/5 focus:border-emerald-600 focus:bg-white transition-all text-slate-600 placeholder:text-slate-400"
                    />
                    {searchQuery && (
                        <button
                            onClick={handleSearchClear}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                            tabIndex={-1}
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>
            </div>

            {/* Header Operations */}
            <div className="flex items-center gap-4 lg:gap-6">
                {/* Communications Hub */}
                <div className="relative border-r border-slate-200 pr-4 lg:pr-6 hidden sm:block">
                    <NotificationPopover isAdmin={true} />
                </div>

                {/* Identity Access & Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center gap-3 hover:bg-slate-50 p-1 rounded-2xl border border-transparent hover:border-slate-100 transition-all group"
                    >
                        <Avatar className="w-8 h-8 rounded-lg shadow-md group-hover:scale-105 transition-transform">
                            <AvatarImage src={adminProfile?.profile_picture} className="object-cover" />
                            <AvatarFallback className="bg-slate-900 text-white font-black text-xs rounded-lg">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                        <div className="hidden lg:block text-left">
                            <div className="flex items-center gap-1">
                                <p className="text-xs font-black text-slate-900 tracking-tight leading-none italic uppercase">Admin</p>
                                <ChevronDown size={12} className={`text-slate-400 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
                            </div>
                        </div>
                    </button>

                    {/* Dropdown Menu */}
                    {isProfileOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/50 py-2 animate-in fade-in zoom-in-95 duration-200">
                            <button
                                onClick={() => { navigate('/admin/profile'); setIsProfileOpen(false); }}
                                className="w-full flex items-center gap-3 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-emerald-600 transition-colors"
                            >
                                <UserCircle size={16} /> Profile
                            </button>
                            <button
                                onClick={() => { navigate('/admin/settings'); setIsProfileOpen(false); }}
                                className="w-full flex items-center gap-3 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-emerald-600 transition-colors"
                            >
                                <Settings size={16} /> Settings
                            </button>
                            <div className="my-1 border-t border-slate-100"></div>
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 transition-colors"
                            >
                                <LogOut size={16} /> Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default AdminHeader;
