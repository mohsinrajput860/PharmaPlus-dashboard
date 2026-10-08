import React, { useEffect, useState } from 'react';
import { pricingApi } from '../api/client.js';
import PageHeader from '../components/PageHeader.jsx';
import {
  Tag, Plus, Edit3, Trash2, Star, Check, X,
  Save, AlertTriangle, Package, ToggleLeft, ToggleRight
} from 'lucide-react';

const DURATION_PRESETS = ['Monthly', 'Quarterly', '6 Months', 'Annual', 'Lifetime'];

const EMPTY_FORM = {
  name: '', price: '', duration: 'Monthly',
  description: '', is_popular: false, is_active: true, sort_order: 0,
};

export default function PricingPage() {
  const [packages,  setPackages]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [toast,     setToast]     = useState(null);
  const [showForm,  setShowForm]  = useState(false);
  const [editId,    setEditId]    = useState(null);
  const [form,      setForm]      = useState(EMPTY_FORM);
  const [deleteId,  setDeleteId]  = useState(null);
  const [errors,    setErrors]    = useState({});

  async function load() {
    setLoading(true);
    try {
      const { ok, data } = await pricingApi.list();
      if (ok) setPackages(data.packages || []);
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  function showToast(msg, type = 'success') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  function openAdd() {
    setEditId(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setShowForm(true);
  }

  function openEdit(pkg) {
    setEditId(pkg.id);
    setForm({
      name:        pkg.name,
      price:       pkg.price.toString(),
      duration:    pkg.duration,
      description: pkg.description || '',
      is_popular:  !!pkg.is_popular,
      is_active:   pkg.is_active !== 0,
      sort_order:  pkg.sort_order || 0,
    });
    setErrors({});
    setShowForm(true);
  }

  function validate() {
    const e = {};
    if (!form.name.trim())  e.name  = 'Package name required';
    if (!form.price || isNaN(form.price) || parseInt(form.price) <= 0) e.price = 'Valid price required';
    if (!form.duration.trim()) e.duration = 'Duration required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        name:        form.name.trim(),
        price:       parseInt(form.price),
        duration:    form.duration.trim(),
        description: form.description.trim(),
        is_popular:  form.is_popular ? 1 : 0,
        is_active:   form.is_active  ? 1 : 0,
        sort_order:  parseInt(form.sort_order) || 0,
      };
      const { ok, data } = editId
        ? await pricingApi.update(editId, payload)
        : await pricingApi.create(payload);
      if (ok) {
        showToast(editId ? 'Package updated!' : 'Package created!');
        setShowForm(false);
        load();
      } else {
        showToast(data?.error || 'Failed to save', 'error');
      }
    } finally { setSaving(false); }
  }

  async function handleDelete(id) {
    setSaving(true);
    try {
      const { ok } = await pricingApi.delete(id);
      if (ok) { showToast('Package deleted'); setDeleteId(null); load(); }
      else showToast('Failed to delete', 'error');
    } finally { setSaving(false); }
  }

  async function toggleActive(pkg) {
    await pricingApi.update(pkg.id, { is_active: pkg.is_active ? 0 : 1 });
    load();
  }

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl shadow-xl text-sm font-medium border ${
          toast.type === 'error'
            ? 'bg-red-50 border-red-200 text-red-700'
            : 'bg-emerald-50 border-emerald-200 text-emerald-700'
        }`}>
          {toast.type === 'error' ? <AlertTriangle size={14} className="inline mr-1.5" /> : <Check size={14} className="inline mr-1.5" />}
          {toast.msg}
        </div>
      )}

      <PageHeader
        icon={Tag}
        title="Pricing & Packages"
        subtitle="Manage subscription plans shown to customers"
        color="sky"
        onRefresh={load}
        loading={loading}
      >
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
        >
          <Plus size={15} /> Add Package
        </button>
      </PageHeader>

      {/* ── Add/Edit Form ── */}
      {showForm && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 sm:p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Package size={16} className="text-sky-500" />
              {editId ? 'Edit Package' : 'New Package'}
            </h3>
            <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
              <X size={16} />
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Package Name *</label>
              <input
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Monthly Plan"
                className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 transition-colors ${errors.name ? 'border-red-300' : 'border-slate-200'}`}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            {/* Price */}
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Price (Rs.) *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">Rs.</span>
                <input
                  type="number"
                  value={form.price}
                  onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
                  placeholder="2500"
                  className={`w-full border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 transition-colors ${errors.price ? 'border-red-300' : 'border-slate-200'}`}
                />
              </div>
              {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
            </div>

            {/* Duration */}
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Duration *</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {DURATION_PRESETS.map(d => (
                  <button key={d} type="button" onClick={() => setForm(p => ({ ...p, duration: d }))}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      form.duration === d ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}>
                    {d}
                  </button>
                ))}
              </div>
              <input
                value={form.duration}
                onChange={e => setForm(p => ({ ...p, duration: e.target.value }))}
                placeholder="or type custom..."
                className={`w-full border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 ${errors.duration ? 'border-red-300' : 'border-slate-200'}`}
              />
              {errors.duration && <p className="text-red-500 text-xs mt-1">{errors.duration}</p>}
            </div>

            {/* Sort Order */}
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Sort Order</label>
              <input
                type="number"
                value={form.sort_order}
                onChange={e => setForm(p => ({ ...p, sort_order: e.target.value }))}
                placeholder="0"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400"
              />
              <p className="text-xs text-slate-400 mt-1">Lower number = shown first</p>
            </div>

            {/* Description — full width */}
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Description / Features</label>
              <textarea
                value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                rows={3}
                placeholder="e.g. Full access · All features · Priority support"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 resize-none"
              />
            </div>

            {/* Toggles */}
            <div className="sm:col-span-2 flex flex-wrap gap-4">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <div
                  onClick={() => setForm(p => ({ ...p, is_popular: !p.is_popular }))}
                  className={`w-10 h-6 rounded-full transition-colors relative flex-shrink-0 ${form.is_popular ? 'bg-amber-400' : 'bg-slate-200'}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.is_popular ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700">Mark as Popular</p>
                  <p className="text-xs text-slate-400">Shows a "Most Popular" badge</p>
                </div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <div
                  onClick={() => setForm(p => ({ ...p, is_active: !p.is_active }))}
                  className={`w-10 h-6 rounded-full transition-colors relative flex-shrink-0 ${form.is_active ? 'bg-emerald-400' : 'bg-slate-200'}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.is_active ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700">Active</p>
                  <p className="text-xs text-slate-400">Show this package publicly</p>
                </div>
              </label>
            </div>
          </div>

          {/* Save button */}
          <div className="flex items-center gap-3 mt-5 pt-5 border-t border-slate-100">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white font-semibold text-sm rounded-xl transition-colors"
            >
              {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={15} />}
              {editId ? 'Save Changes' : 'Create Package'}
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2.5 text-sm text-slate-500 hover:text-slate-700 font-medium">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── Package Cards ── */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-sky-200 border-t-sky-500 rounded-full animate-spin" />
        </div>
      ) : packages.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl py-16 text-center">
          <div className="w-14 h-14 bg-sky-50 border border-sky-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Tag size={24} className="text-sky-400" />
          </div>
          <p className="font-semibold text-slate-700">No packages yet</p>
          <p className="text-sm text-slate-400 mt-1 mb-4">Add your first pricing package to get started.</p>
          <button onClick={openAdd} className="flex items-center gap-2 px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-semibold text-sm rounded-xl mx-auto transition-colors">
            <Plus size={15} /> Add First Package
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {packages.map(pkg => (
            <div key={pkg.id} className={`bg-white border rounded-2xl overflow-hidden shadow-sm transition-all hover:shadow-md ${
              !pkg.is_active ? 'opacity-60' : ''
            } ${pkg.is_popular ? 'border-amber-300 ring-1 ring-amber-200' : 'border-slate-200'}`}>

              {/* Popular badge */}
              {pkg.is_popular && (
                <div className="bg-amber-400 text-white text-xs font-black uppercase tracking-wider text-center py-1.5 flex items-center justify-center gap-1">
                  <Star size={11} fill="white" /> Most Popular
                </div>
              )}

              <div className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-800 truncate">{pkg.name}</h3>
                    <span className="inline-block text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full mt-1">{pkg.duration}</span>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${pkg.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                    {pkg.is_active ? 'Active' : 'Hidden'}
                  </span>
                </div>

                {/* Price */}
                <div className="mb-3">
                  <span className="text-3xl font-black text-slate-800">Rs. {pkg.price.toLocaleString()}</span>
                  <span className="text-slate-400 text-sm ml-1">/ {pkg.duration}</span>
                </div>

                {/* Description */}
                {pkg.description && (
                  <p className="text-xs text-slate-500 leading-relaxed mb-4 border-t border-slate-100 pt-3">
                    {pkg.description}
                  </p>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                  <button onClick={() => openEdit(pkg)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-sky-600 bg-sky-50 hover:bg-sky-100 rounded-lg transition-colors">
                    <Edit3 size={12} /> Edit
                  </button>
                  <button onClick={() => toggleActive(pkg)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-500 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors">
                    {pkg.is_active ? <ToggleRight size={12} /> : <ToggleLeft size={12} />}
                    {pkg.is_active ? 'Hide' : 'Show'}
                  </button>
                  <button onClick={() => setDeleteId(pkg.id)}
                    className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <div className="w-12 h-12 bg-red-50 border border-red-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Trash2 size={20} className="text-red-500" />
            </div>
            <h3 className="text-base font-bold text-slate-800 text-center mb-1">Delete Package?</h3>
            <p className="text-sm text-slate-500 text-center mb-5">This package will be permanently removed.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 border border-slate-200 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-50">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteId)} disabled={saving}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors">
                {saving ? '...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
