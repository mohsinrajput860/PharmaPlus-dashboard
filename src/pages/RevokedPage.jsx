import React, { useEffect, useState } from 'react';
import { ShieldOff, Phone, MapPin, Search, CheckCircle2 } from 'lucide-react';
import { machinesApi } from '../api/client.js';
import PageHeader from '../components/PageHeader.jsx';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export default function RevokedPage() {
  const navigate = useNavigate();
  const [machines, setMachines] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [actioning, setActioning] = useState(null);
  const [toast, setToast] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const { ok, data } = await machinesApi.list({ status: 'revoked', limit: 200 });
      if (ok) setMachines(data.machines || []);
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  function showToast(msg, type = 'success') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function handleRestore(hwid, days) {
    setActioning(hwid);
    try {
      const { ok, data } = await machinesApi.authorize(hwid, days);
      if (ok) { showToast('✅ License restored!'); load(); }
      else showToast(data.error || 'Failed', 'error');
    } finally { setActioning(null); }
  }

  const filtered = machines.filter(m =>
    !search ||
    m.shop_name?.toLowerCase().includes(search.toLowerCase()) ||
    m.phone?.includes(search)
  );

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl shadow-xl text-sm font-medium border ${
          toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
        }`}>{toast.msg}</div>
      )}

      <PageHeader icon={ShieldOff} title="Revoked Licenses" subtitle="Pharmacies with revoked access" color="red" onRefresh={load} loading={loading}>
        <span className="text-sm font-semibold px-3 py-1.5 rounded-full bg-red-50 text-red-700 border border-red-200">
          {machines.length} Revoked
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
          <div className="w-14 h-14 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 size={24} className="text-emerald-400" />
          </div>
          <p className="font-semibold text-slate-700">No Revoked Licenses</p>
          <p className="text-sm text-slate-400 mt-1">Revoked machines will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(m => (
            <div key={m.hwid} className="bg-white border border-red-100 rounded-2xl p-5 hover:shadow-md transition-all">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0">
                  <ShieldOff size={18} className="text-red-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="font-bold text-slate-800">{m.shop_name}</p>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-50 text-red-600 border border-red-200 flex-shrink-0">Revoked</span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-slate-500 mb-3">
                    {m.owner_name && <span>{m.owner_name}</span>}
                    {m.phone && <span className="flex items-center gap-1"><Phone size={11} />{m.phone}</span>}
                    {m.city  && <span className="flex items-center gap-1"><MapPin size={11} />{m.city}</span>}
                    {m.last_seen && <span>{formatDistanceToNow(new Date(m.last_seen), { addSuffix: true })}</span>}
                  </div>
                  <div className="bg-slate-50 rounded-lg px-3 py-1.5 mb-3">
                    <code className="text-xs text-slate-500 font-mono break-all">{m.hwid}</code>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-slate-400">Restore:</span>
                    {[30, 90, 365].map(d => (
                      <button key={d} onClick={() => handleRestore(m.hwid, d)} disabled={actioning === m.hwid}
                        className="px-3 py-1 text-xs font-semibold rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 disabled:opacity-50 transition-colors">
                        {actioning === m.hwid ? '...' : d === 365 ? '1 Year' : `${d}d`}
                      </button>
                    ))}
                    <button onClick={() => navigate(`/machines/${encodeURIComponent(m.hwid)}`)} className="ml-auto text-xs text-sky-600 hover:text-sky-700 font-medium">
                      Full Control →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
