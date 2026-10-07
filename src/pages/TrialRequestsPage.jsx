import React, { useEffect, useState } from 'react';
import { Bell, Phone, MapPin, User, Hash, Check, X, Store, Clock, RefreshCw } from 'lucide-react';
import { trialRequestsApi, machinesApi } from '../api/client.js';
import PageHeader from '../components/PageHeader.jsx';
import { formatDistanceToNow } from 'date-fns';

export default function TrialRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [actioning, setActioning] = useState(null);
  const [toast, setToast] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const { ok, data } = await trialRequestsApi.list('pending');
      if (ok) setRequests(data.requests || []);
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  function showToast(msg, type = 'success') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function handleAction(id, hwid, action) {
    setActioning(id + action);
    try {
      const fn = action === 'approve' ? trialRequestsApi.approve : trialRequestsApi.reject;
      const { ok, data } = await fn(id);
      if (ok) {
        showToast(action === 'approve' ? '✅ Trial approved! App will unlock on next startup.' : '❌ Request rejected.');
        setRequests(prev => prev.filter(r => r.id !== id));
      } else {
        showToast(data.error || 'Failed', 'error');
      }
    } finally { setActioning(null); }
  }

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl shadow-xl text-sm font-medium border ${
          toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
        }`}>
          {toast.msg}
        </div>
      )}

      <PageHeader
        icon={Bell}
        title="Received Requests"
        subtitle="Free trial requests from new pharmacies"
        color="emerald"
        onRefresh={load}
        loading={loading}
      >
        <span className={`text-xs sm:text-sm font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${
          requests.length > 0
            ? 'bg-amber-50 text-amber-700 border border-amber-200'
            : 'bg-slate-100 text-slate-500 border border-slate-200'
        }`}>
          {requests.length} Pending
        </span>
      </PageHeader>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-sky-200 border-t-sky-500 rounded-full animate-spin" />
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl py-16 text-center">
          <div className="w-14 h-14 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Bell size={24} className="text-emerald-400" />
          </div>
          <p className="font-semibold text-slate-700">No Pending Requests</p>
          <p className="text-sm text-slate-400 mt-1">New trial requests will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map(req => (
            <div key={req.id} className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md hover:border-slate-300 transition-all">
              {/* Header */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0">
                    <Store size={20} className="text-emerald-500" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{req.shop_name || 'Unknown Store'}</p>
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                      <Clock size={11} />
                      {formatDistanceToNow(new Date(req.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <span className="bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold px-3 py-1 rounded-full flex-shrink-0">
                  7-Day Trial
                </span>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <InfoItem icon={User}  label="Owner Name"   value={req.owner_name || '—'} />
                <InfoItem icon={Phone} label="Phone"        value={req.phone} highlight />
                <InfoItem icon={MapPin}label="Location"     value={req.city || req.owner_name || '—'} />
                <InfoItem icon={Store} label="App Version"  value={req.app_version || '—'} />
              </div>

              {/* HWID */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 mb-4">
                <p className="text-xs font-medium text-slate-400 mb-1 flex items-center gap-1">
                  <Hash size={11} /> Machine ID
                </p>
                <code className="text-xs text-slate-700 font-mono break-all">{req.hwid}</code>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                <button
                  onClick={() => handleAction(req.id, req.hwid, 'approve')}
                  disabled={actioning !== null}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
                >
                  {actioning === req.id + 'approve'
                    ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <Check size={15} />}
                  Approve Trial
                </button>
                <button
                  onClick={() => handleAction(req.id, req.hwid, 'reject')}
                  disabled={actioning !== null}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 border border-red-200 bg-red-50 hover:bg-red-100 disabled:opacity-50 text-red-600 text-sm font-semibold rounded-xl transition-colors"
                >
                  {actioning === req.id + 'reject'
                    ? <span className="w-4 h-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
                    : <X size={15} />}
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function InfoItem({ icon: Icon, label, value, highlight }) {
  return (
    <div className="flex items-start gap-2.5 bg-slate-50 rounded-xl px-3 py-2.5">
      <Icon size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className={`text-sm font-semibold mt-0.5 ${highlight ? 'text-sky-600' : 'text-slate-700'}`}>{value}</p>
      </div>
    </div>
  );
}
