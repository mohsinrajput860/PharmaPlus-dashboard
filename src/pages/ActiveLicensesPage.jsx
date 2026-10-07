import React, { useEffect, useState } from 'react';
import { Monitor, Phone, MapPin, Clock, Search, Crown, Infinity } from 'lucide-react';
import { machinesApi } from '../api/client.js';
import PageHeader from '../components/PageHeader.jsx';
import { formatDistanceToNow, format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export default function ActiveLicensesPage() {
  const navigate = useNavigate();
  const [machines, setMachines] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [filter,   setFilter]   = useState('all');

  async function load() {
    setLoading(true);
    try {
      const { ok, data } = await machinesApi.list({ status: 'active', limit: 200 });
      if (ok) setMachines(data.machines || []);
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  const filtered = machines.filter(m => {
    const matchSearch = !search ||
      m.shop_name?.toLowerCase().includes(search.toLowerCase()) ||
      m.owner_name?.toLowerCase().includes(search.toLowerCase()) ||
      m.phone?.includes(search) ||
      m.city?.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === 'all' ? true :
      filter === 'permanent' ? m.is_permanent :
      !m.is_permanent;
    return matchSearch && matchFilter;
  });

  const permanent = machines.filter(m => m.is_permanent).length;
  const timed     = machines.filter(m => !m.is_permanent).length;

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <PageHeader icon={Monitor} title="Active Pharmacies" subtitle="All pharmacies with active licenses" color="sky" onRefresh={load} loading={loading}>
        <span className="text-sm font-semibold px-3 py-1.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
          {machines.length} Active
        </span>
      </PageHeader>

      {/* Summary cards — always 3 columns */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-5">
        <SummaryCard icon={Monitor}  label="Total Active"   value={machines.length} color="sky" />
        <SummaryCard icon={Infinity} label="Permanent"      value={permanent}        color="emerald" />
        <SummaryCard icon={Clock}    label="Timed License"  value={timed}            color="amber" />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, owner, phone, city..."
            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20" />
        </div>
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1">
          {['all','permanent','timed'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors whitespace-nowrap ${
                filter === f ? 'bg-sky-500 text-white' : 'text-slate-500 hover:bg-slate-50'
              }`}>
              {f}
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
          <Monitor size={28} className="text-slate-300 mx-auto mb-3" />
          <p className="font-semibold text-slate-700">No Active Pharmacies</p>
          <p className="text-sm text-slate-400 mt-1">Active licensed pharmacies will appear here.</p>
        </div>
      ) : (
        <>
          {/* ── Desktop Table ── */}
          <div className="hidden sm:block bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-100">
                  <tr>
                    <th className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider px-5 py-3.5">Pharmacy</th>
                    <th className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider px-5 py-3.5 hidden md:table-cell">Owner</th>
                    <th className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider px-5 py-3.5 hidden lg:table-cell">Phone</th>
                    <th className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider px-5 py-3.5 hidden lg:table-cell">City</th>
                    <th className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider px-5 py-3.5">License</th>
                    <th className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider px-5 py-3.5 hidden md:table-cell">Last Seen</th>
                    <th className="px-5 py-3.5"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map(m => {
                    const daysLeft = m.license_expiry && !m.is_permanent
                      ? Math.ceil((m.license_expiry - Date.now()) / 86400000) : null;
                    return (
                      <tr key={m.hwid} onClick={() => navigate(`/machines/${encodeURIComponent(m.hwid)}`)}
                        className="hover:bg-sky-50/50 cursor-pointer transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center flex-shrink-0">
                              <Monitor size={14} className="text-sky-500" />
                            </div>
                            <p className="text-sm font-semibold text-slate-800 truncate max-w-[150px]">{m.shop_name}</p>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-slate-600 hidden md:table-cell">{m.owner_name || '—'}</td>
                        <td className="px-5 py-3.5 text-sm text-slate-600 hidden lg:table-cell">{m.phone || '—'}</td>
                        <td className="px-5 py-3.5 text-sm text-slate-600 hidden lg:table-cell">{m.city || '—'}</td>
                        <td className="px-5 py-3.5">
                          {m.is_permanent ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                              <Infinity size={11} /> Permanent
                            </span>
                          ) : (
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                              daysLeft !== null && daysLeft <= 7 ? 'bg-amber-50 text-amber-600 border border-amber-200' : 'bg-sky-50 text-sky-600 border border-sky-200'
                            }`}>
                              {daysLeft !== null ? `${daysLeft}d left` : format(new Date(m.license_expiry), 'dd MMM yy')}
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-xs text-slate-400 hidden md:table-cell">
                          {m.last_seen ? formatDistanceToNow(new Date(m.last_seen), { addSuffix: true }) : '—'}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <span className="text-xs text-sky-500 font-medium">View →</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Mobile Card List ── */}
          <div className="sm:hidden space-y-3">
            {filtered.map(m => {
              const daysLeft = m.license_expiry && !m.is_permanent
                ? Math.ceil((m.license_expiry - Date.now()) / 86400000) : null;
              return (
                <div key={m.hwid} onClick={() => navigate(`/machines/${encodeURIComponent(m.hwid)}`)}
                  className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm cursor-pointer hover:shadow-md transition-all">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center flex-shrink-0">
                        <Monitor size={15} className="text-sky-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{m.shop_name}</p>
                        {m.owner_name && <p className="text-xs text-slate-500">{m.owner_name}</p>}
                      </div>
                    </div>
                    {m.is_permanent ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex-shrink-0">
                        <Infinity size={10} /> Perm
                      </span>
                    ) : daysLeft !== null ? (
                      <span className={`text-xs font-bold px-2 py-1 rounded-full flex-shrink-0 ${
                        daysLeft <= 7 ? 'bg-amber-50 text-amber-600 border border-amber-200' : 'bg-sky-50 text-sky-600 border border-sky-200'
                      }`}>
                        {daysLeft < 0 ? 'Expired' : `${daysLeft}d`}
                      </span>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                    {m.phone && <span className="flex items-center gap-1"><Phone size={11} />{m.phone}</span>}
                    {m.city  && <span className="flex items-center gap-1"><MapPin size={11} />{m.city}</span>}
                    {m.last_seen && <span className="flex items-center gap-1"><Clock size={11} />{formatDistanceToNow(new Date(m.last_seen), { addSuffix: true })}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, color }) {
  const c = {
    sky:     'bg-sky-50 border-sky-200 text-sky-600',
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-600',
    amber:   'bg-amber-50 border-amber-200 text-amber-600',
  };
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 flex flex-col items-center gap-2 text-center">
      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl border flex items-center justify-center flex-shrink-0 ${c[color]}`}>
        <Icon size={16} />
      </div>
      <div className="min-w-0 w-full">
        <p className="text-xs text-slate-500 leading-tight truncate">{label}</p>
        <p className="text-xl sm:text-2xl font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );
}
