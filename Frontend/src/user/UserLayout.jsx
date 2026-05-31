import React from 'react';
import { Outlet } from 'react-router-dom';
import TopNav from './components/TopNav';
import NotificationToast from './components/NotificationToast';

const UserLayout = () => {
    return (
        <div className="bg-[#f6f8f7] h-screen flex flex-col text-slate-900 transition-colors duration-200 antialiased font-sans">
            <TopNav />
            <div className="flex-1 overflow-y-auto">
                <Outlet />
            </div>

            {/* Global real-time notifications popup */}
            <NotificationToast />
        </div>
    );
};

export default UserLayout;
