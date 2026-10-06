import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { statsApi, machinesApi } from '../api/client.js';
import StatCard from '../components/StatCard.jsx';
import Badge from '../components/Badge.jsx';
import {
  Monitor, CheckCircle2, Clock, ShieldOff, AlertTriangle,
  RefreshCw, UserPlus, Activity, Eye
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [stats,   setStats]   = useState(null);
  const [recent,  setRecent]  = useState([]);
  const [expiring,setExpiring]= useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const [sRes, mRes, eRes] = await Promise.all([
        statsApi.get(),
        machinesApi.list({ limit: 6 }),
        machinesApi.list({ status: 'active', limit: 20 }),
      ]);
      if (sRes.ok) setStats(sRes.data.stats);
      if (mRes.ok) setRecent(mRes.data.machines || []);
      // Filter expiring within 7 days
      if (eRes.ok) {
        const now = Date.now();
        const soon = (eRes.data.machines || []).filter(m =>
          !m.is_permanent && m.license_expiry && m.license_expiry - now < 7 * 86400000 && m.license_expiry > now
        );
        setExpiring(soon);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-slate-400 text-sm">Loading dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto animate-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-0.5">PharmaPlus license management overview</p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-300 hover:bg-slate-700 transition-colors"
        >
          <RefreshCw size={15} />
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Monitor}       label="Total Machines"  value={stats.total}         color="blue"   onClick={() => navigate('/machines')} />
          <StatCard icon={CheckCircle2}  label="Active"          value={stats.active}        color="green"  onClick={() => navigate('/machines?status=active')} />
          <StatCard icon={Clock}         label="Trial"           value={stats.trial}         color="purple" onClick={() => navigate('/machines?status=trial')} />
          <StatCard icon={ShieldOff}     label="Revoked"         value={stats.revoked}       color="red"    onClick={() => navigate('/machines?status=revoked')} />
          <StatCard icon={AlertTriangle} label="Expiring (7d)"   value={stats.expiring_soon} color="amber"  sub="Needs renewal soon" />
          <StatCard icon={Activity}      label="Active (24h)"    value={stats.active_24h}    color="blue"   sub="Opened app today" />
          <StatCard icon={UserPlus}      label="New (7 days)"    value={stats.recent_reg_7d} color="green"  sub="Fresh installs" />
          <StatCard icon={Monitor}       label="Inactive"        value={stats.inactive}      color="slate"  onClick={() => navigate('/machines?status=inactive')} />
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Machines */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
            <h2 className="text-sm font-semibold text-white">Recent Machines</h2>
            <button onClick={() => navigate('/machines')} className="text-xs text-brand-400 hover:text-brand-300">View all →</button>
          </div>
          <div className="divide-y divide-slate-800/60">
            {recent.length === 0 && (
              <p className="text-slate-500 text-sm p-5">No machines registered yet.</p>
            )}
            {recent.map(m => (
              <div
                key={m.hwid}
                onClick={() => navigate(`/machines/${encodeURIComponent(m.hwid)}`)}
                className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-800/40 cursor-pointer transition-colors"
              >
                <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0">
                  <Monitor size={16} className="text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{m.shop_name}</p>
                  <p className="text-xs text-slate-500 truncate font-mono">{m.hwid?.slice(0, 20)}...</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge status={m.status} />
                  {m.last_seen && (
                    <p className="text-xs text-slate-600">
                      {formatDistanceToNow(new Date(m.last_seen), { addSuffix: true })}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Expiring Soon */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <AlertTriangle size={15} className="text-amber-400" />
              Expiring Soon
            </h2>
            <span className="text-xs bg-amber-500/15 border border-amber-500/30 text-amber-400 px-2 py-0.5 rounded-full">
              {expiring.length} stores
            </span>
          </div>
          <div className="divide-y divide-slate-800/60">
            {expiring.length === 0 && (
              <p className="text-slate-500 text-sm p-5">No licenses expiring within 7 days.</p>
            )}
            {expiring.map(m => {
              const daysLeft = Math.ceil((m.license_expiry - Date.now()) / 86400000);
              return (
                <div
                  key={m.hwid}
                  onClick={() => navigate(`/machines/${encodeURIComponent(m.hwid)}`)}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-800/40 cursor-pointer transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
                    <Clock size={16} className="text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{m.shop_name}</p>
                    <p className="text-xs text-slate-500">{m.city || 'Unknown city'}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`text-sm font-bold ${daysLeft <= 2 ? 'text-red-400' : 'text-amber-400'}`}>
                      {daysLeft}d left
                    </p>
                    <button
                      onClick={e => { e.stopPropagation(); navigate(`/machines/${encodeURIComponent(m.hwid)}`); }}
                      className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1 mt-0.5"
                    >
                      <Eye size={11} /> Renew
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
