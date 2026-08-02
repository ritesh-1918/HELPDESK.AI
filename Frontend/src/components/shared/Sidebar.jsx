/**
 * Sidebar.jsx — Navigation sidebar with smooth hover color transitions (0.3s ease-in-out)
 * Resolves issue #3871
 */

import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Ticket,
  Users,
  Settings,
  BarChart2,
  ShieldCheck,
  BookOpen,
  Bell,
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Tickets', to: '/tickets', icon: Ticket },
  { label: 'Users', to: '/admin/users', icon: Users },
  { label: 'Analytics', to: '/admin/analytics', icon: BarChart2 },
  { label: 'Knowledge Base', to: '/admin/knowledge-base', icon: BookOpen },
  { label: 'Notifications', to: '/admin/notifications', icon: Bell },
  { label: 'Security', to: '/admin/security', icon: ShieldCheck },
  { label: 'Settings', to: '/admin/settings', icon: Settings },
];

export default function Sidebar() {
  return (
    <aside className="h-screen w-64 bg-white dark:bg-slate-900 border-r border-gray-100 dark:border-slate-800 flex flex-col py-6 px-4 shadow-sm">
      {/* Logo */}
      <div className="flex items-center gap-2 px-2 mb-8">
        <img src="/favicon.png" alt="HelpDesk.ai" className="w-8 h-8 object-contain" />
        <span className="font-black text-lg tracking-tight text-emerald-700 dark:text-emerald-400 italic uppercase">
          HelpDesk.ai
        </span>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold',
                /* Smooth hover transition — 0.3s ease-in-out (issue #3871) */
                'transition-colors duration-300 ease-in-out',
                isActive
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                  : 'text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400',
              ].join(' ')
            }
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="pt-4 border-t border-gray-100 dark:border-slate-800">
        <p className="text-xs text-gray-400 dark:text-slate-500 px-3">
          © 2026 HelpDesk.ai
        </p>
      </div>
    </aside>
  );
}