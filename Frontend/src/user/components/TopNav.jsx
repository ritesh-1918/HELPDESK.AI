import React, { useState, useEffect } from 'react';
import { Bell, Box, CheckCircle2, MessageSquare, Menu, X, LogOut, User as UserIcon, Moon, Sun } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Button } from "../../components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover";
// eslint-disable-next-line no-unused-vars
import useTicketStore from "../../store/ticketStore";
// removed useNotificationStore
import NotificationPopover from "./NotificationPopover";
import useAuthStore from "../../store/authStore";

const TopNav = () => {
    const navigate = useNavigate();
    const { profile, logout } = useAuthStore();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('theme');
        if (saved === 'dark') {
            document.documentElement.classList.add('dark');
            setIsDark(true);
        }
    }, []);

    const toggleDark = () => {
        if (isDark) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        }
        setIsDark(!isDark);
    };

    const initials = profile?.full_name ? profile.full_name[0].toUpperCase() : (profile?.email ? profile.email[0].toUpperCase() : 'U');

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <header className="w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
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
                    <Link className="text-sm font-semibold text-gray-900 dark:text-gray-100 hover:text-emerald-600 transition-colors" to="/dashboard">Dashboard</Link>
                    <Link className="text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors" to="/my-tickets">My Tickets</Link>
                    <Link className="text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors" to="/help">Help</Link>
                </nav>

                {/* Right: Profile */}
                <div className="flex items-center gap-3">
                    {/* Dark Mode Toggle */}
                    <button
                        onClick={toggleDark}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        aria-label="Toggle dark mode"
                    >
                        {isDark ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-gray-600" />}
                    </button>

                    <NotificationPopover />
                    <div className="hidden md:block">
                        <Avatar
                            onClick={() => navigate('/profile')}
                            className="size-9 border border-gray-200 cursor-pointer hover:ring-2 hover:ring-emerald-500 hover:ring-offset-2 transition-all"
                        >
                            <AvatarImage src={profile?.profile_picture} />
                            <AvatarFallback className="bg-gray-100 font-bold text-gray-600 text-xs">{initials}</AvatarFallback>
                        </Avatar>
                    </div>
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden p-2 text-gray-600 dark:text-gray-300 focus:outline-none"
                    >
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700 absolute w-full shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-6 py-8 space-y-6">
                        <div className="flex items-center gap-4 border-b border-gray-50 dark:border-gray-700 pb-6">
                            <Avatar className="size-12 border border-gray-100">
                                <AvatarImage src={profile?.profile_picture} />
                                <AvatarFallback className="bg-emerald-50 text-emerald-700 font-black">{initials}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-bold text-gray-900 dark:text-white">{profile?.full_name}</p>
                                <p className="text-xs text-gray-400 font-medium">{profile?.email}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 text-lg font-bold text-gray-700 dark:text-gray-200 hover:text-emerald-700 transition-colors">
                                <Box size={20} className="text-gray-400" /> Dashboard
                            </Link>
                            <Link to="/my-tickets" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 text-lg font-bold text-gray-700 dark:text-gray-200 hover:text-emerald-700 transition-colors">
                                <MessageSquare size={20} className="text-gray-400" /> My Tickets
                            </Link>
                            <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 text-lg font-bold text-gray-700 dark:text-gray-200 hover:text-emerald-700 transition-colors">
                                <UserIcon size={20} className="text-gray-400" /> My Profile
                            </Link>
                            <Link
                                to="/docs"
                                onClick={() => setIsMenuOpen(false)}
                                className="flex items-center gap-3 text-lg font-bold text-gray-700 hover:text-emerald-700 transition-colors"
                            >
                                <BookOpen size={20} className="text-gray-400" /> Documentation
                            </Link>
                        </div>

                        <div className="pt-6 border-t border-gray-50 dark:border-gray-700">
                            <button
                                onClick={handleLogout}
                                className="w-full py-4 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center gap-2 text-red-600 font-bold active:scale-95 transition-all"
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