import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  LayoutDashboard, Monitor, LogOut, Menu, X,
  ShieldCheck, ChevronRight
} from 'lucide-react';

const nav = [
  { to: '/',         label: 'Dashboard',  icon: LayoutDashboard, end: true },
  { to: '/machines', label: 'Machines',   icon: Monitor },
];

export default function Layout() {
  const { email, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(true);

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950">
      {/* Sidebar */}
      <aside className={`${open ? 'w-60' : 'w-16'} flex-shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-300`}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-800">
          <div className="w-8 h-8 flex-shrink-0 rounded-lg bg-brand-600 flex items-center justify-center">
            <ShieldCheck size={18} className="text-white" />
          </div>
          {open && (
            <div className="min-w-0">
              <p className="text-sm font-bold text-white truncate">PharmaPlus</p>
              <p className="text-xs text-slate-400 truncate">Developer Panel</p>
            </div>
          )}
          <button
            onClick={() => setOpen(p => !p)}
            className="ml-auto p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            {open ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-1">
          {nav.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to} to={to} end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-brand-600/20 text-brand-400 border border-brand-600/30'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <Icon size={18} className="flex-shrink-0" />
              {open && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User info */}
        <div className="border-t border-slate-800 p-3">
          {open ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-brand-700 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                {email?.[0]?.toUpperCase() || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white truncate">{email}</p>
                <p className="text-xs text-slate-500">Admin</p>
              </div>
              <button onClick={handleLogout} className="p-1.5 rounded hover:bg-red-900/40 text-slate-400 hover:text-red-400 transition-colors" title="Logout">
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <button onClick={handleLogout} className="w-full flex justify-center p-2 rounded hover:bg-red-900/40 text-slate-400 hover:text-red-400 transition-colors" title="Logout">
              <LogOut size={18} />
            </button>
          )}
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
