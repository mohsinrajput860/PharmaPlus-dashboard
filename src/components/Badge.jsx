import React from 'react';

const variants = {
  active:   'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  trial:    'bg-blue-500/15 text-blue-400 border-blue-500/30',
  inactive: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
  revoked:  'bg-red-500/15 text-red-400 border-red-500/30',
  expired:  'bg-amber-500/15 text-amber-400 border-amber-500/30',
  default:  'bg-slate-500/15 text-slate-400 border-slate-500/30',
};

const labels = {
  active:   '● Active',
  trial:    '◐ Trial',
  inactive: '○ Inactive',
  revoked:  '✕ Revoked',
  expired:  '⏱ Expired',
};

export default function Badge({ status, className = '' }) {
  const key = status?.toLowerCase() || 'default';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variants[key] || variants.default} ${className}`}>
      {labels[key] || status}
    </span>
  );
}
