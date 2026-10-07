import React, { useEffect, useState, useCallback } from 'react';
import { Users, Search, Phone, MapPin, Clock, Monitor } from 'lucide-react';
import { machinesApi } from '../api/client.js';
import PageHeader from '../components/PageHeader.jsx';
import Badge from '../components/Badge.jsx';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate, useSearchParams } from 'react-router-dom';

const STATUS_OPTS = ['all', 'active', 'trial', 'inactive', 'revoked'];

export default function AllMachinesPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [machines, setMachines] = useState([]);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(true);
  const [search,  setSearch]    = useState('');
  const [status,  setStatus]    = useState(searchParams.get('status') || 'all');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: 200 };
      if (search.trim()) params.search = search.trim();
      if (status !== 'all') params.status = status;
      const { ok, data } = await machinesApi.list(params);
      if (ok) { setMachines(data.machines || []); setTotal(data.total || 0); }
    } finally { setLoading(false); }
  }, [search, status]);

  useEffect(() => { load(); }, [status]);
  useEffect(() => {
    const t = setTimeout(load, 400);
    return () => clearTimeout(t);
  }, [search]);

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <PageHeader icon={Users} title="All Machines" subtitle={`${total} total registered machines`} color="sky" onRefresh={load} loading={loading} />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, HWID, owner, city..."
            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20" />
        </div>
        {/* Status filter — single line, compact */}
        <div className="flex items-center gap-0.5 bg-white border border-slate-200 rounded-xl p-1">
          {STATUS_OPTS.map(s => (
            <button key={s} onClick={() => setStatus(s)}
              className={`flex-1 py-1.5 rounded-lg text-[11px] font-semibold capitalize transition-colors text-center ${
                status === s ? 'bg-sky-500 text-white' : 'text-slate-500 hover:bg-slate-50'
              }`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-sky-200 border-t-sky-500 rounded-full animate-spin" />
        </div>
      ) : machines.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl py-16 text-center">
          <Monitor size={28} className="text-slate-300 mx-auto mb-3" />
          <p className="font-semibold text-slate-700">No machines found</p>
          <p className="text-sm text-slate-400 mt-1">Try adjusting your search or filter.</p>
        </div>
      ) : (
        <>
          {/* ── Desktop Table ── */}
          <div className="hidden sm:block bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-100 bg-slate-50/50">
                  <tr>
                    <th className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider px-5 py-3.5">Pharmacy</th>
                    <th className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider px-5 py-3.5 hidden md:table-cell">Contact</th>
                    <th className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider px-5 py-3.5">Status</th>
                    <th className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider px-5 py-3.5 hidden lg:table-cell">License</th>
                    <th className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider px-5 py-3.5 hidden lg:table-cell">Last Seen</th>
                    <th className="px-5 py-3.5"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {machines.map(m => {
                    const daysLeft = m.license_expiry && !m.is_permanent
                      ? Math.ceil((m.license_expiry - Date.now()) / 86400000) : null;
                    const isOnline = m.last_seen && (Date.now() - m.last_seen) < 5 * 60 * 1000;
                    return (
                      <tr key={m.hwid} onClick={() => navigate(`/machines/${encodeURIComponent(m.hwid)}`)}
                        className="hover:bg-sky-50/40 cursor-pointer transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="relative flex-shrink-0">
                              <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center">
                                <Monitor size={14} className="text-sky-500" />
                              </div>
                              <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${isOnline ? 'bg-emerald-400' : 'bg-slate-300'}`} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-800 truncate max-w-[160px]">{m.shop_name}</p>
                              <p className="text-xs text-slate-400 font-mono">{m.hwid?.slice(0, 12)}...</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 hidden md:table-cell">
                          <div className="text-xs text-slate-600 space-y-0.5">
                            {m.phone && <p className="flex items-center gap-1"><Phone size={11} className="text-slate-400" />{m.phone}</p>}
                            {m.city  && <p className="flex items-center gap-1"><MapPin size={11} className="text-slate-400" />{m.city}</p>}
                          </div>
                        </td>
                        <td className="px-5 py-3.5"><Badge status={m.status} /></td>
                        <td className="px-5 py-3.5 hidden lg:table-cell">
                          {m.is_permanent ? (
                            <span className="text-xs font-bold text-emerald-600">Permanent</span>
                          ) : daysLeft !== null ? (
                            <span className={`text-xs font-bold ${daysLeft < 0 ? 'text-red-500' : daysLeft <= 7 ? 'text-amber-500' : 'text-sky-600'}`}>
                              {daysLeft < 0 ? 'Expired' : `${daysLeft}d left`}
                            </span>
                          ) : <span className="text-xs text-slate-400">—</span>}
                        </td>
                        <td className="px-5 py-3.5 hidden lg:table-cell text-xs text-slate-400">
                          {m.last_seen ? formatDistanceToNow(new Date(m.last_seen), { addSuffix: true }) : 'Never'}
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
            {machines.map(m => {
              const daysLeft = m.license_expiry && !m.is_permanent
                ? Math.ceil((m.license_expiry - Date.now()) / 86400000) : null;
              const isOnline = m.last_seen && (Date.now() - m.last_seen) < 5 * 60 * 1000;
              return (
                <div key={m.hwid} onClick={() => navigate(`/machines/${encodeURIComponent(m.hwid)}`)}
                  className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm cursor-pointer hover:shadow-md transition-all">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="relative flex-shrink-0">
                        <div className="w-9 h-9 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center">
                          <Monitor size={15} className="text-sky-500" />
                        </div>
                        <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${isOnline ? 'bg-emerald-400' : 'bg-slate-300'}`} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{m.shop_name}</p>
                        <p className="text-xs text-slate-400 font-mono">{m.hwid?.slice(0, 16)}...</p>
                      </div>
                    </div>
                    <Badge status={m.status} />
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                    {m.phone && <span className="flex items-center gap-1"><Phone size={11} />{m.phone}</span>}
                    {m.city  && <span className="flex items-center gap-1"><MapPin size={11} />{m.city}</span>}
                    {m.last_seen && <span className="flex items-center gap-1"><Clock size={11} />{formatDistanceToNow(new Date(m.last_seen), { addSuffix: true })}</span>}
                    {m.is_permanent && <span className="font-bold text-emerald-600">Permanent</span>}
                    {!m.is_permanent && daysLeft !== null && (
                      <span className={`font-bold ${daysLeft < 0 ? 'text-red-500' : daysLeft <= 7 ? 'text-amber-500' : 'text-sky-600'}`}>
                        {daysLeft < 0 ? 'Expired' : `${daysLeft}d left`}
                      </span>
                    )}
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
