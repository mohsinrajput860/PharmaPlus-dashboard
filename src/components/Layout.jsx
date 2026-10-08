import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  LayoutDashboard, LogOut, Menu, X,
  Bell, CheckCircle2, Clock, ShieldOff,
  Monitor, AlertTriangle, Users,
  Gift, ChevronDown, ChevronUp, Tag
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
      { to: '/trial-requests',  label: 'Received Requests', icon: Bell },
      { to: '/trial-approved',  label: 'Approved Trials',   icon: CheckCircle2 },
      { to: '/trial-expired',   label: 'Expired Trials',    icon: Clock },
    ]
  },
  {
    section: 'License',
    color: 'sky',
    items: [
      { to: '/active',          label: 'Active Pharmacies', icon: Monitor },
      { to: '/expiring-soon',   label: 'Expiring Soon',     icon: AlertTriangle },
      { to: '/all-machines',    label: 'All Machines',      icon: Users },
      { to: '/revoked',         label: 'Revoked',           icon: ShieldOff },
    ]
  },
  {
    section: 'Settings',
    color: 'violet',
    items: [
      { to: '/pricing', label: 'Pricing & Packages', icon: Tag },
    ]
  },
];

const SECTION_COLORS = {
  emerald: 'text-emerald-600',
  sky:     'text-sky-600',
  violet:  'text-violet-600',
};

export default function Layout() {
  const { email, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openSections, setOpenSections] = useState({ 'Free Trial': true, 'License': true, 'Settings': true });

  function toggleSection(section) {
    setOpenSections(p => ({ ...p, [section]: !p[section] }));
  }

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  function closeMobile() {
    setMobileOpen(false);
  }

  // Shared sidebar nav content
  function SidebarContent({ mobile = false }) {
    return (
      <>
        {/* Logo */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-slate-200 flex-shrink-0">
          {(!collapsed || mobile) ? (
            <img
              src="/nameimage/pharmaplus.png"
              alt="PharmaPlus"
              onClick={() => { if (!mobile) setCollapsed(true); }}
              className={`h-32 w-auto object-contain ${!mobile ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
            />
          ) : (
            <img
              src="/logo/pharmapluslogo.png"
              alt="PharmaPlus"
              onClick={() => setCollapsed(false)}
              className="w-8 h-8 object-contain cursor-pointer hover:opacity-80 transition-opacity"
            />
          )}
          {mobile && (
            <button onClick={closeMobile} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors">
              <X size={18} />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
          {NAV.map(({ section, color, items }) => (
            <div key={section}>
              {(!collapsed || mobile) && (
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

              {(section === 'Overview' || openSections[section] || (collapsed && !mobile)) && (
                <ul className="space-y-0.5">
                  {items.map(({ to, label, icon: Icon, end }) => (
                    <li key={to}>
                      <NavLink
                        to={to} end={end}
                        title={(collapsed && !mobile) ? label : undefined}
                        onClick={mobile ? closeMobile : undefined}
                        className={({ isActive }) =>
                          `flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                            (collapsed && !mobile) ? 'justify-center' : ''
                          } ${
                            isActive
                              ? 'bg-sky-50 text-sky-600 border border-sky-100'
                              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                          }`
                        }
                      >
                        <Icon size={17} className="flex-shrink-0" />
                        {(!collapsed || mobile) && <span className="truncate">{label}</span>}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              )}

              {section !== 'Settings' && (!collapsed || mobile) && (
                <div className="my-2 border-t border-slate-100" />
              )}
            </div>
          ))}
        </nav>

        {/* User footer */}
        <div className="border-t border-slate-200 p-3 flex-shrink-0">
          {(!collapsed || mobile) ? (
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
      </>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">

      {/* ── Desktop Sidebar ──────────────────────────────────────────────────── */}
      <aside className={`hidden md:flex ${collapsed ? 'w-16' : 'w-64'} flex-shrink-0 bg-white border-r border-slate-200 flex-col transition-all duration-300 shadow-sm`}>
        <SidebarContent />
      </aside>

      {/* ── Mobile Overlay ───────────────────────────────────────────────────── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeMobile}
          />
          {/* Drawer */}
          <aside className="absolute left-0 top-0 h-full w-72 bg-white shadow-2xl flex flex-col z-50">
            <SidebarContent mobile={true} />
          </aside>
        </div>
      )}

      {/* ── Main Content ─────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile top bar */}
        <header className="md:hidden flex items-center gap-3 px-4 h-14 bg-white border-b border-slate-200 flex-shrink-0 shadow-sm">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <Menu size={20} />
          </button>
          <img src="/logo/pharmapluslogo.png" alt="PharmaPlus" className="w-7 h-7 object-contain" />
          <span className="text-sm font-bold text-slate-800">PharmaPlus</span>
        </header>

        <main className="flex-1 overflow-y-auto bg-slate-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
