import React, { useEffect, useState } from 'react';
import { CheckCircle2, Phone, MapPin, User, Clock, Hash, Store, Search } from 'lucide-react';
import { machinesApi } from '../api/client.js';
import PageHeader from '../components/PageHeader.jsx';
import { formatDistanceToNow, format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export default function ApprovedTrialsPage() {
  const navigate = useNavigate();
  const [machines, setMachines] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search,  setSearch]    = useState('');

  async function load() {
    setLoading(true);
    try {
      const { ok, data } = await machinesApi.list({ status: 'trial', limit: 100 });
      if (ok) setMachines(data.machines || []);
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  const filtered = machines.filter(m =>
    !search || m.shop_name?.toLowerCase().includes(search.toLowerCase()) ||
    m.phone?.includes(search) || m.city?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <PageHeader icon={CheckCircle2} title="Approved Trials" subtitle="Pharmacies currently on 7-day free trial" color="emerald" onRefresh={load} loading={loading}>
        <span className="text-sm font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
          {machines.length} Active
        </span>
      </PageHeader>

      {/* Search */}
      <div className="relative mb-5">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, phone, city..."
          className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-sky-200 border-t-sky-500 rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <Empty icon={CheckCircle2} color="emerald" title="No Active Trials" desc="Approved trial pharmacies will appear here." />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map(m => {
            const daysLeft = m.license_expiry ? Math.ceil((m.license_expiry - Date.now()) / 86400000) : null;
            return (
              <div key={m.hwid} className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md hover:border-emerald-200 transition-all cursor-pointer" onClick={() => navigate(`/machines/${encodeURIComponent(m.hwid)}`)}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                      <Store size={18} className="text-emerald-500" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{m.shop_name}</p>
                      {m.owner_name && <p className="text-xs text-slate-500">{m.owner_name}</p>}
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${
                    daysLeft !== null && daysLeft <= 2 ? 'bg-red-50 text-red-600 border border-red-200' :
                    daysLeft !== null && daysLeft <= 4 ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                    'bg-emerald-50 text-emerald-600 border border-emerald-200'
                  }`}>
                    {daysLeft !== null ? `${daysLeft}d left` : 'Trial'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-3 text-xs text-slate-500">
                  {m.phone && <span className="flex items-center gap-1"><Phone size={11} />{m.phone}</span>}
                  {m.city  && <span className="flex items-center gap-1"><MapPin size={11} />{m.city}</span>}
                  {m.license_expiry && <span className="flex items-center gap-1"><Clock size={11} />Expires {format(new Date(m.license_expiry), 'dd MMM')}</span>}
                  {m.last_seen && <span className="flex items-center gap-1"><User size={11} />{formatDistanceToNow(new Date(m.last_seen), { addSuffix: true })}</span>}
                </div>
                <div className="bg-slate-50 rounded-lg px-3 py-1.5">
                  <code className="text-xs text-slate-500 font-mono">{m.hwid?.slice(0, 24)}...</code>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Empty({ icon: Icon, color, title, desc }) {
  const c = { emerald: 'bg-emerald-50 border-emerald-100 text-emerald-400', sky: 'bg-sky-50 border-sky-100 text-sky-400' };
  return (
    <div className="bg-white border border-slate-200 rounded-2xl py-16 text-center">
      <div className={`w-14 h-14 border rounded-2xl flex items-center justify-center mx-auto mb-3 ${c[color]}`}>
        <Icon size={24} />
      </div>
      <p className="font-semibold text-slate-700">{title}</p>
      <p className="text-sm text-slate-400 mt-1">{desc}</p>
    </div>
  );
}
