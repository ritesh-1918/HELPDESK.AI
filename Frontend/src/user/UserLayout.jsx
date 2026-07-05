import React from 'react';
import { Outlet } from 'react-router-dom';
import TopNav from './components/TopNav';
import NotificationToast from './components/NotificationToast';

const UserLayout = () => {
    return (
        <div className="bg-[#f6f8f7] min-h-screen flex flex-col text-slate-900 transition-colors duration-200 antialiased font-sans">
            <TopNav />
            {/* The routed content like Dashboard or CreateTicket will render here */}
            <Outlet />

            {/* Global real-time notifications popup */}
            <NotificationToast />
        </div>
    );
};

export default UserLayout;
