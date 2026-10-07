import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { machinesApi } from '../api/client.js';
import Badge from '../components/Badge.jsx';
import ToggleSwitch from '../components/ToggleSwitch.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';
import {
  ArrowLeft, Monitor, Phone, MapPin, User, Calendar, Clock,
  CheckCircle2, ShieldOff, Gift, RefreshCw, Save, Trash2,
  Activity, Hash, Smartphone, CloudUpload,
  Users, Network,
  AlertTriangle, Edit3, X, Check, Info
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

const DURATION_OPTIONS = [
  { label: '7 Days',        days: 7   },
  { label: '30 Days',       days: 30  },
  { label: '90 Days',       days: 90  },
  { label: '6 Months',      days: 180 },
  { label: '1 Year',        days: 365 },
  { label: 'Permanent',     days: 0   },
];

const FEATURE_LIST = [
  { key: 'mobile_app',   icon: Smartphone,  label: 'Mobile App',   desc: 'Companion mobile app connectivity & QR access' },
  { key: 'cloud_backup', icon: CloudUpload, label: 'Cloud Backup', desc: 'Google Drive automatic backup feature' },
  { key: 'multi_user',   icon: Users,       label: 'Multi-User',   desc: 'Multiple staff accounts with permissions' },
  { key: 'lan_sync',     icon: Network,     label: 'LAN Sync',     desc: 'Multi-desktop local network sync' },
];

const LOG_COLORS = {
  authorized:      'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  revoked:         'text-red-400 bg-red-500/10 border-red-500/20',
  trial:           'text-blue-400 bg-blue-500/10 border-blue-500/20',
  registered:      'text-slate-400 bg-slate-500/10 border-slate-500/20',
  feature_updated: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  extended:        'text-amber-400 bg-amber-500/10 border-amber-500/20',
};

export default function MachineDetailPage() {
  const { hwid }   = useParams();
  const navigate   = useNavigate();
  const decodedHwid = decodeURIComponent(hwid);

  const [machine,  setMachine]  = useState(null);
  const [features, setFeatures] = useState({});
  const [logs,     setLogs]     = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [toast,    setToast]    = useState(null);

  // License action state
  const [selDays,  setSelDays]  = useState(30);
  const [authLoading, setAuthLoading] = useState(false);

  // Edit info state
  const [editMode, setEditMode] = useState(false);
  const [editInfo, setEditInfo] = useState({});

  // Confirm modal
  const [modal, setModal] = useState({ open: false, type: '', loading: false });

  async function load() {
    setLoading(true);
    try {
      const { ok, data } = await machinesApi.get(decodedHwid);
      if (ok && data.machine) {
        setMachine(data.machine);
        setLogs(data.logs || []);
        setFeatures({
          mobile_app:     data.machine.mobile_app     ?? 1,
          cloud_backup:   data.machine.cloud_backup   ?? 1,
          multi_user:     data.machine.multi_user     ?? 1,
          lan_sync:       data.machine.lan_sync       ?? 1,
        });
        setEditInfo({
          shop_name:  data.machine.shop_name  || '',
          owner_name: data.machine.owner_name || '',
          phone:      data.machine.phone      || '',
          city:       data.machine.city       || '',
          notes:      data.machine.notes      || '',
        });
      } else {
        navigate('/machines');
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [decodedHwid]);

  function showToast(msg, type = 'success') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  // ── License Actions ───────────────────────────────────────────────────────
  async function handleAuthorize() {
    setAuthLoading(true);
    try {
      const { ok, data } = await machinesApi.authorize(decodedHwid, selDays === 0 ? null : selDays);
      if (ok) {
        showToast(data.message || 'License authorized');
        load();
      } else showToast(data.error || 'Failed', 'error');
    } finally { setAuthLoading(false); }
  }

  async function handleRevoke() {
    setModal(p => ({ ...p, loading: true }));
    try {
      const { ok, data } = await machinesApi.revoke(decodedHwid);
      if (ok) { showToast('License revoked'); setModal({ open: false }); load(); }
      else showToast(data.error || 'Failed', 'error');
    } finally { setModal(p => ({ ...p, loading: false })); }
  }

  async function handleTrial() {
    setModal(p => ({ ...p, loading: true }));
    try {
      const { ok, data } = await machinesApi.trial(decodedHwid);
      if (ok) { showToast('7-day trial granted'); setModal({ open: false }); load(); }
      else showToast(data.error || 'Failed', 'error');
    } finally { setModal(p => ({ ...p, loading: false })); }
  }

  async function handleDelete() {
    setModal(p => ({ ...p, loading: true }));
    try {
      const { ok } = await machinesApi.delete(decodedHwid);
      if (ok) { navigate('/machines'); }
    } finally { setModal(p => ({ ...p, loading: false })); }
  }

  // ── Feature Flags ─────────────────────────────────────────────────────────
  async function saveFeatures() {
    setSaving(true);
    try {
      const { ok, data } = await machinesApi.updateFeatures(decodedHwid, features);
      if (ok) showToast('Feature flags saved');
      else showToast(data.error || 'Failed', 'error');
    } finally { setSaving(false); }
  }

  // ── Edit Info ─────────────────────────────────────────────────────────────
  async function saveInfo() {
    setSaving(true);
    try {
      const { ok, data } = await machinesApi.update(decodedHwid, editInfo);
      if (ok) { showToast('Store info updated'); setEditMode(false); load(); }
      else showToast(data.error || 'Failed', 'error');
    } finally { setSaving(false); }
  }

  // ─────────────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-10 h-10 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
    </div>
  );
  if (!machine) return null;

  const daysLeft = machine.license_expiry && !machine.is_permanent
    ? Math.ceil((machine.license_expiry - Date.now()) / 86400000)
    : null;
  const isExpired = daysLeft !== null && daysLeft < 0;

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto animate-in bg-slate-950 min-h-screen">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-2xl border animate-in text-sm font-medium ${
          toast.type === 'error'
            ? 'bg-red-900/80 border-red-700 text-red-200'
            : 'bg-emerald-900/80 border-emerald-700 text-emerald-200'
        }`}>
          {toast.type === 'error' ? <AlertTriangle size={15} /> : <Check size={15} />}
          {toast.msg}
        </div>
      )}

      {/* Back + Header */}
      <div className="flex items-start gap-3 sm:gap-4 mb-6 sm:mb-8">
        <button onClick={() => navigate('/machines')} className="p-2 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors mt-0.5">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold text-white break-all">{machine.shop_name}</h1>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge status={machine.status} />
              {machine.is_permanent && (
                <span className="text-xs bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded-full">Permanent</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4 mt-1.5 text-sm text-slate-500 flex-wrap">
            {machine.owner_name && <span className="flex items-center gap-1"><User size={13} />{machine.owner_name}</span>}
            {machine.phone      && <span className="flex items-center gap-1"><Phone size={13} />{machine.phone}</span>}
            {machine.city       && <span className="flex items-center gap-1"><MapPin size={13} />{machine.city}</span>}
          </div>
        </div>
        <button
          onClick={load}
          className="p-2 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Refresh"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-6">

          {/* ── License Control ─────────────────────────────────────────── */}
          <section className="bg-slate-900 border border-slate-800 rounded-2xl">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center gap-2">
              <CheckCircle2 size={16} className="text-brand-400" />
              <h2 className="text-sm font-semibold text-white">License Control</h2>
            </div>
            <div className="p-5 space-y-5">
              {/* Current status banner */}
              <div className={`flex items-center gap-3 p-4 rounded-xl border ${
                machine.status === 'active'  ? 'bg-emerald-500/8 border-emerald-500/25' :
                machine.status === 'trial'   ? 'bg-blue-500/8 border-blue-500/25' :
                machine.status === 'revoked' ? 'bg-red-500/8 border-red-500/25' :
                'bg-slate-500/8 border-slate-500/25'
              }`}>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">
                    {machine.status === 'active'   && 'License is Active'}
                    {machine.status === 'trial'    && '7-Day Trial Active'}
                    {machine.status === 'revoked'  && 'License Revoked'}
                    {machine.status === 'inactive' && 'No Active License'}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {machine.is_permanent ? 'Permanent — never expires' :
                     machine.license_expiry ? (
                       isExpired
                         ? `Expired ${formatDistanceToNow(new Date(machine.license_expiry), { addSuffix: true })}`
                         : `Expires ${format(new Date(machine.license_expiry), 'dd MMM yyyy')} (${daysLeft}d left)`
                     ) : 'No expiry set'}
                  </p>
                </div>
                {daysLeft !== null && daysLeft <= 7 && !isExpired && (
                  <span className="text-xs bg-amber-500/15 border border-amber-500/30 text-amber-400 px-2 py-1 rounded-lg font-medium">
                    Expiring soon!
                  </span>
                )}
              </div>

              {/* Authorize */}
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">Grant / Extend License</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {DURATION_OPTIONS.map(opt => (
                    <button
                      key={opt.days}
                      onClick={() => setSelDays(opt.days)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        selDays === opt.days
                          ? 'bg-brand-600 border-brand-500 text-white'
                          : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleAuthorize}
                  disabled={authLoading}
                  className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  {authLoading ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : <CheckCircle2 size={15} />}
                  {selDays === 0 ? 'Grant Permanent License' : `Authorize for ${DURATION_OPTIONS.find(o => o.days === selDays)?.label}`}
                </button>
              </div>

              {/* Quick actions */}
              <div className="flex flex-wrap gap-3 pt-2 border-t border-slate-800">
                <button
                  onClick={() => setModal({ open: true, type: 'trial' })}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 text-xs sm:text-sm font-medium transition-colors"
                >
                  <Gift size={14} /> Grant 7-day Trial
                </button>
                <button
                  onClick={() => setModal({ open: true, type: 'revoke' })}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs sm:text-sm font-medium transition-colors"
                >
                  <ShieldOff size={14} /> Revoke License
                </button>
                <button
                  onClick={() => setModal({ open: true, type: 'delete' })}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-700 text-slate-400 hover:text-red-400 hover:border-red-500/30 text-xs sm:text-sm font-medium transition-colors sm:ml-auto"
                >
                  <Trash2 size={14} /> Delete Record
                </button>
              </div>
            </div>
          </section>

          {/* ── Feature Flags ────────────────────────────────────────────── */}
          <section className="bg-slate-900 border border-slate-800 rounded-2xl">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity size={16} className="text-brand-400" />
                <h2 className="text-sm font-semibold text-white">Feature Flags</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFeatures(Object.fromEntries(Object.keys(features).map(k => [k, 1])))}
                  className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  Enable All
                </button>
                <span className="text-slate-700">|</span>
                <button
                  onClick={() => setFeatures(Object.fromEntries(Object.keys(features).map(k => [k, 0])))}
                  className="text-xs text-red-400 hover:text-red-300 transition-colors"
                >
                  Disable All
                </button>
              </div>
            </div>
            <div className="p-5">
              <div className="grid sm:grid-cols-2 gap-2.5 mb-5">
                {FEATURE_LIST.map(({ key, icon: Icon, label, desc }) => (
                  <ToggleSwitch
                    key={key}
                    checked={!!features[key]}
                    onChange={v => setFeatures(p => ({ ...p, [key]: v ? 1 : 0 }))}
                    label={
                      <span className="flex items-center gap-1.5">
                        <Icon size={14} className="text-slate-400" />
                        {label}
                      </span>
                    }
                    description={desc}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2 p-3 bg-brand-500/5 border border-brand-500/15 rounded-lg mb-4">
                <Info size={13} className="text-brand-400 flex-shrink-0" />
                <p className="text-xs text-slate-400">Changes take effect on next app startup or hourly security check.</p>
              </div>
              <button
                onClick={saveFeatures}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={15} />}
                Save Feature Flags
              </button>
            </div>
          </section>

          {/* ── Activity Log ─────────────────────────────────────────────── */}
          <section className="bg-slate-900 border border-slate-800 rounded-2xl">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center gap-2">
              <Clock size={16} className="text-brand-400" />
              <h2 className="text-sm font-semibold text-white">Activity Log</h2>
            </div>
            <div className="p-5">
              {logs.length === 0 ? (
                <p className="text-slate-500 text-sm">No activity recorded.</p>
              ) : (
                <div className="space-y-2.5">
                  {logs.map(log => (
                    <div key={log.id} className={`flex items-start gap-3 p-3 rounded-lg border text-xs ${LOG_COLORS[log.action] || LOG_COLORS.registered}`}>
                      <span className="font-semibold capitalize w-24 flex-shrink-0 mt-0.5">{log.action}</span>
                      <span className="flex-1 text-slate-300">{log.detail}</span>
                      <span className="text-slate-500 flex-shrink-0">
                        {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-5">
          {/* Machine Info */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Monitor size={16} className="text-brand-400" />
                <h2 className="text-sm font-semibold text-white">Machine Info</h2>
              </div>
              <button
                onClick={() => setEditMode(p => !p)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                {editMode ? <X size={15} /> : <Edit3 size={15} />}
              </button>
            </div>
            <div className="p-5 space-y-3">
              {editMode ? (
                <div className="space-y-3">
                  {[
                    { key: 'shop_name', label: 'Store Name', icon: Monitor },
                    { key: 'owner_name', label: 'Owner Name', icon: User },
                    { key: 'phone', label: 'Phone', icon: Phone },
                    { key: 'city', label: 'City', icon: MapPin },
                  ].map(({ key, label, icon: Icon }) => (
                    <div key={key}>
                      <label className="text-xs text-slate-500 mb-1 block">{label}</label>
                      <div className="relative">
                        <Icon size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                          value={editInfo[key] || ''}
                          onChange={e => setEditInfo(p => ({ ...p, [key]: e.target.value }))}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 pl-7 pr-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/50"
                        />
                      </div>
                    </div>
                  ))}
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">Notes</label>
                    <textarea
                      value={editInfo.notes || ''}
                      onChange={e => setEditInfo(p => ({ ...p, notes: e.target.value }))}
                      rows={3}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/50 resize-none"
                      placeholder="Internal notes..."
                    />
                  </div>
                  <button
                    onClick={saveInfo}
                    disabled={saving}
                    className="w-full flex items-center justify-center gap-2 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={14} />}
                    Save Info
                  </button>
                </div>
              ) : (
                <>
                  <InfoRow icon={Hash}      label="HWID"         value={<span className="font-mono text-xs break-all">{machine.hwid}</span>} />
                  <InfoRow icon={Monitor}   label="App Version"  value={machine.app_version || '—'} />
                  <InfoRow icon={Activity}  label="Open Count"   value={`${machine.open_count || 0} times`} />
                  <InfoRow icon={Calendar}  label="Registered"   value={machine.created_at ? format(new Date(machine.created_at), 'dd MMM yyyy') : '—'} />
                  <InfoRow icon={Clock}     label="Last Seen"    value={machine.last_seen ? formatDistanceToNow(new Date(machine.last_seen), { addSuffix: true }) : 'Never'} />
                  {machine.notes && (
                    <div className="pt-2 border-t border-slate-800">
                      <p className="text-xs text-slate-500 mb-1">Notes</p>
                      <p className="text-sm text-slate-300">{machine.notes}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Features Summary */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl">
            <div className="px-5 py-4 border-b border-slate-800">
              <h2 className="text-sm font-semibold text-white">Feature Summary</h2>
            </div>
            <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
              {FEATURE_LIST.map(({ key, icon: Icon, label }) => (
                <div key={key} className={`flex flex-col items-center gap-1 p-2 rounded-lg border text-center ${
                  features[key]
                    ? 'bg-emerald-500/8 border-emerald-500/20'
                    : 'bg-slate-800/40 border-slate-700/40 opacity-50'
                }`}>
                  <Icon size={14} className={features[key] ? 'text-emerald-400' : 'text-slate-600'} />
                  <span className="text-xs text-slate-400 leading-tight">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Modals */}
      <ConfirmModal
        isOpen={modal.open && modal.type === 'revoke'}
        title="Revoke License"
        message={`Are you sure you want to revoke the license for "${machine.shop_name}"? The app will lock on next startup or hourly check.`}
        confirmLabel="Revoke License"
        confirmColor="red"
        loading={modal.loading}
        onConfirm={handleRevoke}
        onCancel={() => setModal({ open: false })}
      />
      <ConfirmModal
        isOpen={modal.open && modal.type === 'trial'}
        title="Grant 7-Day Trial"
        message={`Grant a 7-day free trial to "${machine.shop_name}"? This will override any existing license.`}
        confirmLabel="Grant Trial"
        confirmColor="blue"
        loading={modal.loading}
        onConfirm={handleTrial}
        onCancel={() => setModal({ open: false })}
      />
      <ConfirmModal
        isOpen={modal.open && modal.type === 'delete'}
        title="Delete Machine Record"
        message={`Permanently delete "${machine.shop_name}" from the system? This cannot be undone. The app will show NOT_REGISTERED on next check.`}
        confirmLabel="Delete Permanently"
        confirmColor="red"
        loading={modal.loading}
        onConfirm={handleDelete}
        onCancel={() => setModal({ open: false })}
      />
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon size={14} className="text-slate-500 flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-sm text-slate-200 mt-0.5">{value}</p>
      </div>
    </div>
  );
}
