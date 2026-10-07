import React, { useEffect, useState } from 'react';
import { AlertTriangle, Phone, MapPin, Clock, Search, CheckCircle2 } from 'lucide-react';
import { machinesApi } from '../api/client.js';
import PageHeader from '../components/PageHeader.jsx';
import { formatDistanceToNow, format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export default function ExpiringSoonPage() {
  const navigate = useNavigate();
  const [machines, setMachines] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [range,    setRange]    = useState(7);
  const [actioning, setActioning] = useState(null);
  const [toast, setToast] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const { ok, data } = await machinesApi.list({ status: 'active', limit: 200 });
      if (ok) {
        const now = Date.now();
        const soon = (data.machines || []).filter(m =>
          !m.is_permanent && m.license_expiry &&
          m.license_expiry > now &&
          m.license_expiry - now <= range * 86400000
        );
        soon.sort((a, b) => a.license_expiry - b.license_expiry);
        setMachines(soon);
      }
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [range]);

  function showToast(msg, type = 'success') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function handleExtend(hwid, days) {
    setActioning(hwid + days);
    try {
      const { ok, data } = await machinesApi.authorize(hwid, days);
      if (ok) { showToast(`✅ Extended by ${days} days!`); load(); }
      else showToast(data.error || 'Failed', 'error');
    } finally { setActioning(null); }
  }

  const filtered = machines.filter(m =>
    !search ||
    m.shop_name?.toLowerCase().includes(search.toLowerCase()) ||
    m.phone?.includes(search) ||
    m.city?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl shadow-xl text-sm font-medium border ${
          toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
        }`}>{toast.msg}</div>
      )}

      <PageHeader icon={AlertTriangle} title="Expiring Soon" subtitle="Licenses that need renewal" color="amber" onRefresh={load} loading={loading}>
        <span className={`text-sm font-semibold px-3 py-1.5 rounded-full ${
          machines.length > 0 ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-slate-100 text-slate-500 border border-slate-200'
        }`}>
          {machines.length} Expiring
        </span>
      </PageHeader>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20" />
        </div>
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 overflow-x-auto">
          <span className="text-xs text-slate-400 px-2 flex-shrink-0">Within:</span>
          {[3, 7, 14, 30].map(d => (
            <button key={d} onClick={() => setRange(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                range === d ? 'bg-amber-500 text-white' : 'text-slate-500 hover:bg-slate-50'
              }`}>
              {d}d
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-sky-200 border-t-sky-500 rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl py-16 text-center">
          <div className="w-14 h-14 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 size={24} className="text-emerald-400" />
          </div>
          <p className="font-semibold text-slate-700">All Clear!</p>
          <p className="text-sm text-slate-400 mt-1">No licenses expiring within {range} days.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(m => {
            const daysLeft = Math.ceil((m.license_expiry - Date.now()) / 86400000);
            const isUrgent = daysLeft <= 3;
            return (
              <div key={m.hwid} className={`bg-white border rounded-2xl p-4 sm:p-5 hover:shadow-md transition-all ${
                isUrgent ? 'border-red-200 bg-red-50/30' : 'border-amber-200 bg-amber-50/20'
              }`}>
                <div className="flex items-start gap-3 sm:gap-4">
                  {/* Days left badge */}
                  <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex flex-col items-center justify-center flex-shrink-0 font-bold ${
                    isUrgent ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                  }`}>
                    <span className="text-xl sm:text-2xl leading-none">{daysLeft}</span>
                    <span className="text-xs">days</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    {/* Name + expiry date — stacked on mobile */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-2">
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 truncate">{m.shop_name}</p>
                        {m.owner_name && <p className="text-xs text-slate-500 mt-0.5">{m.owner_name}</p>}
                      </div>
                      <span className="text-xs text-slate-400 sm:flex-shrink-0">
                        Expires {format(new Date(m.license_expiry), 'dd MMM yyyy')}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-slate-500 mt-2 mb-3">
                      {m.phone && <span className="flex items-center gap-1"><Phone size={11} />{m.phone}</span>}
                      {m.city  && <span className="flex items-center gap-1"><MapPin size={11} />{m.city}</span>}
                      {m.last_seen && <span className="flex items-center gap-1"><Clock size={11} />Last seen {formatDistanceToNow(new Date(m.last_seen), { addSuffix: true })}</span>}
                    </div>
                    {/* Quick extend */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-slate-400 font-medium">Quick extend:</span>
                      {[30, 90, 180, 365].map(d => (
                        <button key={d} onClick={() => handleExtend(m.hwid, d)}
                          disabled={actioning !== null}
                          className="px-3 py-1 text-xs font-semibold rounded-lg border border-sky-200 bg-sky-50 hover:bg-sky-100 text-sky-700 disabled:opacity-50 transition-colors">
                          {actioning === m.hwid + d ? '...' : d === 365 ? '1yr' : `+${d}d`}
                        </button>
                      ))}
                      <button onClick={() => navigate(`/machines/${encodeURIComponent(m.hwid)}`)}
                        className="ml-auto text-xs text-sky-600 hover:text-sky-700 font-medium">
                        Full Control →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
