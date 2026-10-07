import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  LayoutDashboard, LogOut, ChevronLeft, ChevronRight,
  Bell, CheckCircle2, Clock, ShieldOff,
  Monitor, AlertTriangle, Users,
  Gift, ChevronDown, ChevronUp
} from 'lucide-react';

// ── Navigation Structure ───────────────────────────────────────────────────────
const NAV = [
  {
    section: 'Overview',
    items: [
      { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
    ]
  },
  {
    section: 'Free Trial',
    color: 'emerald',
    items: [
      { to: '/trial-requests',  label: 'Received Requests', icon: Bell,         badge: 'pending' },
      { to: '/trial-approved',  label: 'Approved Trials',   icon: CheckCircle2 },
      { to: '/trial-expired',   label: 'Expired Trials',    icon: Clock },
    ]
  },
  {
    section: 'License',
    color: 'sky',
    items: [
      { to: '/active',          label: 'Active Pharmacies', icon: Monitor },
      { to: '/expiring-soon',   label: 'Expiring Soon',     icon: AlertTriangle, badge: 'expiring' },
      { to: '/all-machines',    label: 'All Machines',      icon: Users },
      { to: '/revoked',         label: 'Revoked',           icon: ShieldOff },
    ]
  },
];

const SECTION_COLORS = {
  emerald: 'text-emerald-600',
  sky:     'text-sky-600',
};

export default function Layout() {
  const { email, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [openSections, setOpenSections] = useState({ 'Free Trial': true, 'License': true });

  function toggleSection(section) {
    setOpenSections(p => ({ ...p, [section]: !p[section] }));
  }

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">

      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside className={`${collapsed ? 'w-16' : 'w-64'} flex-shrink-0 bg-white border-r border-slate-200 flex flex-col transition-all duration-300 shadow-sm`}>

        {/* Logo — click to toggle sidebar */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-slate-200">
          {collapsed ? (
            <img
              src="/logo/pharmapluslogo.png"
              alt="PharmaPlus"
              onClick={() => setCollapsed(false)}
              className="w-10 h-10 object-contain cursor-pointer hover:opacity-80 transition-opacity"
            />
          ) : (
            <img
              src="/nameimage/pharmaplus.png"
              alt="PharmaPlus"
              onClick={() => setCollapsed(true)}
              className="h-44 w-auto object-contain flex-1 cursor-pointer hover:opacity-80 transition-opacity"
            />
          )}
          <button
            onClick={() => setCollapsed(p => !p)}
            className="ml-2 p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0"
          >
            {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
          {NAV.map(({ section, color, items }) => (
            <div key={section}>
              {/* Section header */}
              {!collapsed && (
                <button
                  onClick={() => section !== 'Overview' && toggleSection(section)}
                  className={`w-full flex items-center justify-between px-2 py-1.5 mb-1 ${
                    section === 'Overview' ? 'cursor-default' : 'cursor-pointer hover:bg-slate-50 rounded-lg'
                  }`}
                >
                  <span className={`text-xs font-bold uppercase tracking-wider ${
                    color ? SECTION_COLORS[color] : 'text-slate-400'
                  }`}>
                    {section}
                  </span>
                  {section !== 'Overview' && (
                    openSections[section]
                      ? <ChevronUp size={13} className="text-slate-400" />
                      : <ChevronDown size={13} className="text-slate-400" />
                  )}
                </button>
              )}

              {/* Nav items */}
              {(section === 'Overview' || openSections[section] || collapsed) && (
                <ul className="space-y-0.5">
                  {items.map(({ to, label, icon: Icon, end }) => (
                    <li key={to}>
                      <NavLink
                        to={to} end={end}
                        title={collapsed ? label : undefined}
                        className={({ isActive }) =>
                          `flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                            collapsed ? 'justify-center' : ''
                          } ${
                            isActive
                              ? 'bg-sky-50 text-sky-600 border border-sky-100'
                              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                          }`
                        }
                      >
                        <Icon size={17} className="flex-shrink-0" />
                        {!collapsed && <span className="truncate">{label}</span>}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              )}

              {/* Section divider */}
              {section !== 'License' && !collapsed && (
                <div className="my-2 border-t border-slate-100" />
              )}
            </div>
          ))}
        </nav>

        {/* User footer */}
        <div className="border-t border-slate-200 p-3">
          {/* MA Dev Studio branding */}
          {!collapsed && (
            <div className="flex items-center gap-2 mb-2 px-1">
              <img src="/logo/madevstudio.png" alt="MA Dev Studio" className="h-5 object-contain opacity-60" />
            </div>
          )}
          {!collapsed ? (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                {email?.[0]?.toUpperCase() || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-700 truncate">{email}</p>
                <p className="text-xs text-slate-400">Admin</p>
              </div>
              <button onClick={handleLogout} title="Logout" className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <button onClick={handleLogout} title="Logout" className="w-full flex justify-center p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
              <LogOut size={17} />
            </button>
          )}
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto bg-slate-50">
        <Outlet />
      </main>
    </div>
  );
}
