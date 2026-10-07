import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { statsApi, machinesApi, trialRequestsApi } from '../api/client.js';
import {
  Monitor, CheckCircle2, Clock, ShieldOff, AlertTriangle,
  RefreshCw, Bell, Activity, Gift, ChevronRight,
  Phone, MapPin, Check, X, TrendingUp, Users
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [stats,     setStats]     = useState(null);
  const [trialReqs, setTrialReqs] = useState([]);
  const [expiring,  setExpiring]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [actioning, setActioning] = useState(null);
  const [toast,     setToast]     = useState(null);

  async function load() {
    setLoading(true);
    try {
      const [sRes, tRes, eRes] = await Promise.all([
        statsApi.get(),
        trialRequestsApi.list('pending'),
        machinesApi.list({ status: 'active', limit: 100 }),
      ]);
      if (sRes.ok) setStats(sRes.data.stats);
      if (tRes.ok) setTrialReqs(tRes.data.requests || []);
      if (eRes.ok) {
        const now = Date.now();
        const soon = (eRes.data.machines || []).filter(m =>
          !m.is_permanent && m.license_expiry &&
          m.license_expiry > now &&
          m.license_expiry - now <= 7 * 86400000
        ).sort((a, b) => a.license_expiry - b.license_expiry).slice(0, 5);
        setExpiring(soon);
      }
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  function showToast(msg, type = 'success') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function handleTrialAction(id, action) {
    setActioning(id + action);
    try {
      const fn = action === 'approve' ? trialRequestsApi.approve : trialRequestsApi.reject;
      const { ok } = await fn(id);
      if (ok) {
        showToast(action === 'approve' ? '✅ Trial approved!' : '❌ Request rejected.');
        setTrialReqs(p => p.filter(r => r.id !== id));
        load();
      }
    } finally { setActioning(null); }
  }

  if (loading && !stats) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-10 h-10 border-2 border-sky-200 border-t-sky-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl shadow-xl text-sm font-medium border ${
          toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
        }`}>{toast.msg}</div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">PharmaPlus license management</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-3 py-2 sm:px-4 rounded-xl border border-slate-200 bg-white text-sm text-slate-600 hover:bg-slate-50 shadow-sm transition-colors">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* ── FREE TRIAL SECTION ─────────────────────────────────────────────── */}
      <SectionLabel icon={Gift} label="Free Trial" color="emerald" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
        <StatCard label="Pending Requests" value={stats?.pending_trial_requests ?? 0}
          color="amber" icon={Bell} onClick={() => navigate('/trial-requests')}
          urgent={stats?.pending_trial_requests > 0} />
        <StatCard label="Active Trials" value={stats?.trial ?? 0}
          color="emerald" icon={CheckCircle2} onClick={() => navigate('/trial-approved')} />
        <StatCard label="Expired Trials" value={0}
          color="slate" icon={Clock} onClick={() => navigate('/trial-expired')} />
        <StatCard label="New (7 days)" value={stats?.recent_reg_7d ?? 0}
          color="sky" icon={TrendingUp} sub="Fresh installs" />
      </div>

      {/* Pending Requests panel */}
      {trialReqs.length > 0 && (
        <div className="bg-white border border-amber-200 rounded-2xl mb-6 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b border-amber-100 bg-amber-50/60">
            <h3 className="text-sm font-bold text-amber-800 flex items-center gap-2">
              <Bell size={15} className="text-amber-500" />
              {trialReqs.length} Pending Request{trialReqs.length > 1 ? 's' : ''}
            </h3>
            <button onClick={() => navigate('/trial-requests')} className="text-xs text-amber-600 font-semibold hover:text-amber-700">
              View All →
            </button>
          </div>
          <div className="divide-y divide-slate-50">
            {trialReqs.slice(0, 3).map(req => (
              <div key={req.id} className="px-4 sm:px-5 py-3 sm:py-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center flex-shrink-0">
                    <Bell size={16} className="text-amber-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{req.shop_name || 'Unknown Store'}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs text-slate-500">
                      {req.phone && <span className="flex items-center gap-1"><Phone size={11} />{req.phone}</span>}
                      {req.city  && <span className="flex items-center gap-1"><MapPin size={11} />{req.city}</span>}
                      <span>{formatDistanceToNow(new Date(req.created_at), { addSuffix: true })}</span>
                    </div>
                  </div>
                </div>
                {/* Action buttons on separate row on mobile */}
                <div className="flex items-center gap-2 mt-3 ml-12">
                  <button onClick={() => handleTrialAction(req.id, 'approve')} disabled={actioning !== null}
                    className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg disabled:opacity-50 transition-colors">
                    {actioning === req.id + 'approve' ? <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" /> : <Check size={12} />}
                    Approve
                  </button>
                  <button onClick={() => handleTrialAction(req.id, 'reject')} disabled={actioning !== null}
                    className="flex items-center gap-1 px-3 py-1.5 border border-red-200 bg-red-50 hover:bg-red-100 text-red-500 text-xs font-semibold rounded-lg disabled:opacity-50 transition-colors">
                    <X size={12} /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── LICENSE SECTION ───────────────────────────────────────────────── */}
      <SectionLabel icon={Monitor} label="License" color="sky" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
        <StatCard label="Active Pharmacies" value={stats?.active ?? 0}
          color="sky" icon={CheckCircle2} onClick={() => navigate('/active')} />
        <StatCard label="Expiring Soon" value={stats?.expiring_soon ?? 0}
          color="amber" icon={AlertTriangle} onClick={() => navigate('/expiring-soon')}
          urgent={stats?.expiring_soon > 0} />
        <StatCard label="Revoked" value={stats?.revoked ?? 0}
          color="red" icon={ShieldOff} onClick={() => navigate('/revoked')} />
        <StatCard label="Total Machines" value={stats?.total ?? 0}
          color="slate" icon={Users} onClick={() => navigate('/all-machines')} />
      </div>

      {/* Bottom two-col */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Expiring Soon */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 sm:px-5 py-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <AlertTriangle size={15} className="text-amber-500" />
              Expiring Within 7 Days
            </h3>
            <button onClick={() => navigate('/expiring-soon')} className="text-xs text-sky-600 font-semibold hover:text-sky-700 flex items-center gap-0.5">
              View All <ChevronRight size={13} />
            </button>
          </div>
          {expiring.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-center px-5">
              <CheckCircle2 size={24} className="text-emerald-400 mb-2" />
              <p className="text-sm font-medium text-slate-600">All clear!</p>
              <p className="text-xs text-slate-400">No licenses expiring soon.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {expiring.map(m => {
                const d = Math.ceil((m.license_expiry - Date.now()) / 86400000);
                return (
                  <div key={m.hwid} onClick={() => navigate(`/machines/${encodeURIComponent(m.hwid)}`)}
                    className="flex items-center gap-3 px-4 sm:px-5 py-3.5 hover:bg-slate-50 cursor-pointer transition-colors">
                    <div className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center flex-shrink-0 font-bold text-xs ${
                      d <= 2 ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-amber-50 text-amber-600 border border-amber-200'
                    }`}>
                      <span className="text-base leading-none">{d}</span>
                      <span>days</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{m.shop_name}</p>
                      <p className="text-xs text-slate-400 truncate">{m.phone || m.city || '—'}</p>
                    </div>
                    <ChevronRight size={15} className="text-slate-300 flex-shrink-0" />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 sm:px-5 py-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Activity size={15} className="text-sky-500" />
              Quick Stats
            </h3>
          </div>
          <div className="p-4 sm:p-5 space-y-3">
            {[
              { label: 'Active in last 24 hours', value: stats?.active_24h ?? 0, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'New registrations (7d)',  value: stats?.recent_reg_7d ?? 0, color: 'text-sky-600', bg: 'bg-sky-50' },
              { label: 'Inactive machines',       value: stats?.inactive ?? 0, color: 'text-slate-600', bg: 'bg-slate-100' },
              { label: 'Total machines ever',     value: stats?.total ?? 0, color: 'text-sky-700', bg: 'bg-sky-50' },
            ].map(({ label, value, color, bg }) => (
              <div key={label} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-sm text-slate-600 truncate mr-3">{label}</span>
                <span className={`text-lg font-bold flex-shrink-0 ${color} ${bg} px-3 py-0.5 rounded-lg`}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ icon: Icon, label, color }) {
  const c = { emerald: 'text-emerald-600 border-emerald-200 bg-emerald-50', sky: 'text-sky-600 border-sky-200 bg-sky-50' };
  return (
    <div className={`flex items-center gap-2 mb-3 px-3 py-1.5 rounded-xl border w-fit ${c[color]}`}>
      <Icon size={14} />
      <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
    </div>
  );
}

function StatCard({ label, value, color, icon: Icon, onClick, sub, urgent }) {
  const colors = {
    sky:     { bg: 'bg-sky-50',     border: 'border-sky-200',     icon: 'text-sky-500',     val: 'text-sky-700'     },
    emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', icon: 'text-emerald-500', val: 'text-emerald-700' },
    amber:   { bg: 'bg-amber-50',   border: 'border-amber-200',   icon: 'text-amber-500',   val: 'text-amber-700'   },
    red:     { bg: 'bg-red-50',     border: 'border-red-200',     icon: 'text-red-500',     val: 'text-red-700'     },
    slate:   { bg: 'bg-slate-50',   border: 'border-slate-200',   icon: 'text-slate-500',   val: 'text-slate-700'   },
  };
  const c = colors[color] || colors.slate;
  return (
    <div onClick={onClick} className={`bg-white border rounded-2xl p-4 sm:p-5 shadow-sm cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all ${
      urgent ? 'border-amber-300 bg-amber-50/30' : 'border-slate-200'
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${c.bg} ${c.border}`}>
          <Icon size={17} className={c.icon} />
        </div>
        {urgent && value > 0 && (
          <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse" />
        )}
      </div>
      <p className={`text-2xl sm:text-3xl font-bold ${c.val}`}>{value}</p>
      <p className="text-xs text-slate-500 mt-1 font-medium leading-tight">{label}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  );
}
