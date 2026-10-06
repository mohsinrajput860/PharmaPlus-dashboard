import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { machinesApi } from '../api/client.js';
import Badge from '../components/Badge.jsx';
import {
  Search, Monitor, RefreshCw, ChevronRight,
  Clock, Wifi, WifiOff, Filter
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

const STATUS_FILTERS = ['all', 'active', 'trial', 'inactive', 'revoked'];

export default function MachinesPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [machines, setMachines]   = useState([]);
  const [total,    setTotal]      = useState(0);
  const [loading,  setLoading]    = useState(true);
  const [search,   setSearch]     = useState(searchParams.get('search') || '');
  const [status,   setStatus]     = useState(searchParams.get('status') || 'all');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: 100 };
      if (search.trim()) params.search = search.trim();
      if (status && status !== 'all') params.status = status;

      const { ok, data } = await machinesApi.list(params);
      if (ok) {
        setMachines(data.machines || []);
        setTotal(data.total || 0);
      }
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => { load(); }, [load]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(load, 400);
    return () => clearTimeout(t);
  }, [search]);

  function handleStatusFilter(s) {
    setStatus(s);
    setSearchParams(p => {
      if (s === 'all') p.delete('status'); else p.set('status', s);
      return p;
    });
  }

  const isOnline = (last_seen) => last_seen && (Date.now() - last_seen) < 5 * 60 * 1000;

  return (
    <div className="p-6 max-w-7xl mx-auto animate-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Machines</h1>
          <p className="text-slate-400 text-sm mt-0.5">{total} registered stores</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-300 hover:bg-slate-700 transition-colors">
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by store name, owner, city, or HWID..."
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/50 transition-colors"
          />
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-700 rounded-lg p-1">
          <Filter size={14} className="text-slate-500 ml-1.5 mr-0.5 flex-shrink-0" />
          {STATUS_FILTERS.map(s => (
            <button
              key={s}
              onClick={() => handleStatusFilter(s)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors ${
                status === s
                  ? 'bg-brand-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
          </div>
        ) : machines.length === 0 ? (
          <div className="text-center py-16">
            <Monitor size={32} className="text-slate-700 mx-auto mb-3" />
            <p className="text-slate-400 font-medium">No machines found</p>
            <p className="text-slate-600 text-sm mt-1">Try adjusting your search or filter</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3.5">Store</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3.5 hidden md:table-cell">HWID</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3.5">Status</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3.5 hidden lg:table-cell">Expiry</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3.5 hidden lg:table-cell">Last Seen</th>
                  <th className="px-5 py-3.5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {machines.map(m => {
                  const online = isOnline(m.last_seen);
                  const daysLeft = m.license_expiry && !m.is_permanent
                    ? Math.ceil((m.license_expiry - Date.now()) / 86400000)
                    : null;

                  return (
                    <tr
                      key={m.hwid}
                      onClick={() => navigate(`/machines/${encodeURIComponent(m.hwid)}`)}
                      className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0">
                              <Monitor size={16} className="text-slate-400" />
                            </div>
                            <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${online ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-white truncate">{m.shop_name}</p>
                            <p className="text-xs text-slate-500 truncate">{m.owner_name || m.city || '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell">
                        <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-1 rounded">
                          {m.hwid?.slice(0, 16)}...
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <Badge status={m.status} />
                      </td>
                      <td className="px-5 py-4 hidden lg:table-cell">
                        {m.is_permanent ? (
                          <span className="text-xs text-emerald-400 font-medium">Permanent</span>
                        ) : m.license_expiry ? (
                          <div>
                            <p className={`text-sm font-medium ${daysLeft !== null && daysLeft <= 7 ? 'text-amber-400' : daysLeft !== null && daysLeft < 0 ? 'text-red-400' : 'text-slate-300'}`}>
                              {daysLeft !== null && daysLeft < 0 ? 'Expired' : daysLeft !== null ? `${daysLeft}d left` : '—'}
                            </p>
                            <p className="text-xs text-slate-500">
                              {format(new Date(m.license_expiry), 'dd MMM yyyy')}
                            </p>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-600">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4 hidden lg:table-cell">
                        {m.last_seen ? (
                          <div className="flex items-center gap-1.5">
                            {online ? <Wifi size={13} className="text-emerald-400" /> : <WifiOff size={13} className="text-slate-600" />}
                            <span className="text-xs text-slate-400">
                              {formatDistanceToNow(new Date(m.last_seen), { addSuffix: true })}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-600">Never</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <ChevronRight size={16} className="text-slate-600" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
