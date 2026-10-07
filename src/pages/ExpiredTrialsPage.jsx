import React, { useEffect, useState } from 'react';
import { Clock, Phone, MapPin, Store, Search, CheckCircle2, Hash } from 'lucide-react';
import { machinesApi } from '../api/client.js';
import PageHeader from '../components/PageHeader.jsx';
import { formatDistanceToNow, format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export default function ExpiredTrialsPage() {
  const navigate  = useNavigate();
  const [machines, setMachines] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [actioning, setActioning] = useState(null);
  const [toast, setToast] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const { ok, data } = await machinesApi.list({ status: 'inactive', limit: 200 });
      if (ok) {
        const now = Date.now();
        const expired = (data.machines || []).filter(m => m.license_expiry && m.license_expiry < now);
        setMachines(expired);
      }
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  function showToast(msg, type = 'success') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function handleAuthorize(hwid, days) {
    setActioning(hwid);
    try {
      const { ok, data } = await machinesApi.authorize(hwid, days);
      if (ok) { showToast(`✅ ${days ? `${days}-day license` : 'Permanent license'} granted!`); load(); }
      else showToast(data.error || 'Failed', 'error');
    } finally { setActioning(null); }
  }

  const filtered = machines.filter(m =>
    !search || m.shop_name?.toLowerCase().includes(search.toLowerCase()) ||
    m.phone?.includes(search) || m.city?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl shadow-xl text-sm font-medium border ${
          toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
        }`}>{toast.msg}</div>
      )}

      <PageHeader icon={Clock} title="Expired Trials" subtitle="Trial expired — no license purchased yet" color="amber" onRefresh={load} loading={loading}>
        <span className="text-sm font-semibold px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
          {machines.length} Expired
        </span>
      </PageHeader>

      <div className="relative mb-5">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
          className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-sky-200 border-t-sky-500 rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl py-16 text-center">
          <div className="w-14 h-14 bg-amber-50 border border-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Clock size={24} className="text-amber-400" />
          </div>
          <p className="font-semibold text-slate-700">No Expired Trials</p>
          <p className="text-sm text-slate-400 mt-1">Pharmacies with expired trials will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(m => {
            const expiredAgo = formatDistanceToNow(new Date(m.license_expiry), { addSuffix: true });
            return (
              <div key={m.hwid} className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 hover:shadow-md transition-all">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center flex-shrink-0">
                    <Store size={20} className="text-amber-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    {/* Name + expired badge — wrap on mobile */}
                    <div className="flex flex-wrap items-start gap-2 mb-2">
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 break-words">{m.shop_name}</p>
                        {m.owner_name && <p className="text-xs text-slate-500 mt-0.5">{m.owner_name}</p>}
                      </div>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-50 text-red-600 border border-red-200 flex-shrink-0 whitespace-nowrap">
                        Expired {expiredAgo}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-slate-500 mb-3">
                      {m.phone && <span className="flex items-center gap-1"><Phone size={11} />{m.phone}</span>}
                      {m.city  && <span className="flex items-center gap-1"><MapPin size={11} />{m.city}</span>}
                    </div>
                    <div className="bg-slate-50 rounded-lg px-3 py-1.5 mb-3">
                      <code className="text-xs text-slate-500 font-mono break-all">{m.hwid}</code>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-slate-400 font-medium">Convert to license:</span>
                      {[30, 90, 365].map(d => (
                        <button key={d} onClick={() => handleAuthorize(m.hwid, d)} disabled={actioning === m.hwid}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-sky-200 bg-sky-50 hover:bg-sky-100 text-sky-700 disabled:opacity-50 transition-colors">
                          {actioning === m.hwid ? '...' : d === 365 ? '1yr' : `${d}d`}
                        </button>
                      ))}
                      <button onClick={() => navigate(`/machines/${encodeURIComponent(m.hwid)}`)} className="ml-auto text-xs text-sky-600 hover:text-sky-700 font-medium">
                        View →
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
