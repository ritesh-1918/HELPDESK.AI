import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import NotificationToast from '../../user/components/NotificationToast';

/**
 * AdminLayout Component
 * Master framework for the administrative zone.
 * Enforces a fixed-sidebar architecture with a centered, high-density content terminal.
 */
const AdminLayout = () => {
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    return (
        <div className="flex h-screen bg-[#f8faf9] overflow-hidden font-sans">
            {/* Master Navigation Column (Responsive) */}
            <div 
                className={`hidden md:block flex-shrink-0 relative z-40 transition-all duration-300`}
                style={{ width: isSidebarCollapsed ? '80px' : '260px' }}
            >
                <AdminSidebar isCollapsed={isSidebarCollapsed} onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
            </div>

            {/* Viewport Execution Layer */}
            <div className="flex-1 flex flex-col min-w-0 relative h-full">
                {/* Global Command Header */}
                <AdminHeader 
                    onMobileNavToggle={() => setIsMobileNavOpen(!isMobileNavOpen)} 
                    isSidebarCollapsed={isSidebarCollapsed}
                    onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                />

                {/* Operational Workspace */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto custom-scrollbar relative">
                    {/* Centered Payload Container */}
                    <div className="max-w-[1280px] w-full mx-auto px-6 md:px-10 py-8 md:py-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">
                        <Outlet />
                    </div>
                </main>
            </div>

            {/* Real-time System Notifications */}
            <NotificationToast />

            {/* Mobile Nav Overlay (Emergency protocols) */}
            {isMobileNavOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 lg:hidden flex transition-opacity duration-300"
                    onClick={() => setIsMobileNavOpen(false)}
                >
                    <div
                        className="w-[85%] max-w-[280px] h-full shadow-2xl animate-in slide-in-from-left duration-300"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <AdminSidebar isMobile={true} onClose={() => setIsMobileNavOpen(false)} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminLayout;
