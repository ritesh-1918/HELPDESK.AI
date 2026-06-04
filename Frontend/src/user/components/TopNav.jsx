import React, { useState } from 'react';
import { Box, MessageSquare, Menu, X, LogOut, User as UserIcon, BookOpen } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import NotificationPopover from "./NotificationPopover";
import ThemeToggle from "../../components/shared/ThemeToggle";
import useAuthStore from "../../store/authStore";

const TopNav = () => {
    const navigate = useNavigate();
    const { profile, logout } = useAuthStore();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const initials = profile?.full_name
        ? profile.full_name[0].toUpperCase()
        : profile?.email
            ? profile.email[0].toUpperCase()
            : 'U';

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="w-full bg-white dark:bg-slate-950 border-b border-gray-200 dark:border-slate-800 sticky top-0 z-50">
            <div className="max-w-[1100px] mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
                {/* Left: Logo */}
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
                    <div className="flex items-center justify-center overflow-hidden">
                        <img src="/favicon.png" alt="HELPDESK.AI Logo" className="w-7 h-7 object-contain" />
                    </div>
                    <h1 className="text-xl font-black tracking-tighter text-gray-900 dark:text-white italic">HELPDESK.AI</h1>
                </div>

                {/* Center: Navigation Links */}
                <nav className="hidden md:flex items-center gap-8">
                    <Link className="text-sm font-semibold text-gray-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors" to="/dashboard">Dashboard</Link>
                    <Link className="text-sm font-semibold text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors" to="/my-tickets">My Tickets</Link>
                    <Link className="text-sm font-semibold text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors" to="/help">Help</Link>
                    <Link className="text-sm font-semibold text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors" to="/docs">Documentation</Link>
                </nav>

                {/* Right: Actions */}
                <div className="flex items-center gap-3">
                    <ThemeToggle />
                    <NotificationPopover />

                    <div className="h-6 w-px bg-white/[0.08] hidden sm:block" />

                    <div className="hidden md:block">
                        <Avatar
                            onClick={() => navigate('/profile')}
                            className="size-9 border border-white/10 cursor-pointer hover:border-emerald-500/50 transition-all ring-offset-slate-950 hover:ring-2 hover:ring-emerald-500/20"
                        >
                            <AvatarImage src={profile?.profile_picture} />
                            <AvatarFallback className="bg-slate-950 font-black text-emerald-400 text-[10px] uppercase">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                    </div>

                    {/* Mobile menu toggle */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden p-2 text-gray-600 focus:outline-none dark:text-slate-200"
                    >
                        {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div className="md:hidden bg-white dark:bg-slate-950 border-t border-gray-100 dark:border-slate-800 absolute w-full shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-6 py-8 space-y-6">
                        <div className="flex items-center gap-4 border-b border-gray-50 dark:border-slate-800 pb-6">
                            <Avatar className="size-12 border border-gray-100 dark:border-slate-700">
                                <AvatarImage src={profile?.profile_picture} />
                                <AvatarFallback className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-black">{initials}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-bold text-gray-900 dark:text-white">{profile?.full_name}</p>
                                <p className="text-xs text-gray-400 dark:text-slate-500 font-medium">{profile?.email}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 text-lg font-bold text-gray-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">
                                <Box size={20} className="text-gray-400 dark:text-slate-500" /> Dashboard
                            </Link>
                            <Link to="/my-tickets" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 text-lg font-bold text-gray-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">
                                <MessageSquare size={20} className="text-gray-400 dark:text-slate-500" /> My Tickets
                            </Link>
                            <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 text-lg font-bold text-gray-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">
                                <UserIcon size={20} className="text-gray-400 dark:text-slate-500" /> My Profile
                            </Link>
                            <Link to="/docs" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 text-lg font-bold text-gray-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">
                                <BookOpen size={20} className="text-gray-400 dark:text-slate-500" /> Documentation
                            </Link>
                            <div className="flex items-center justify-between">
                                <span className="text-lg font-bold text-gray-700 dark:text-slate-300">Theme</span>
                                <ThemeToggle />
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-50 dark:border-slate-800">
                            <button
                                onClick={handleLogout}
                                className="w-full py-4 bg-gray-50 dark:bg-slate-900 rounded-2xl flex items-center justify-center gap-2 text-red-600 dark:text-red-400 font-bold active:scale-95 transition-all"
                            >
                                <LogOut size={18} /> Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};

export default TopNav;
