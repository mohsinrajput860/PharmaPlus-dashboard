import React from 'react';

export default function StatCard({ icon: Icon, label, value, sub, color = 'blue', onClick }) {
  const colors = {
    blue:   { bg: 'bg-blue-500/10',    border: 'border-blue-500/20',    icon: 'text-blue-400',    value: 'text-blue-300' },
    green:  { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: 'text-emerald-400', value: 'text-emerald-300' },
    amber:  { bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   icon: 'text-amber-400',   value: 'text-amber-300' },
    red:    { bg: 'bg-red-500/10',     border: 'border-red-500/20',     icon: 'text-red-400',     value: 'text-red-300' },
    purple: { bg: 'bg-purple-500/10',  border: 'border-purple-500/20',  icon: 'text-purple-400',  value: 'text-purple-300' },
    slate:  { bg: 'bg-slate-500/10',   border: 'border-slate-500/20',   icon: 'text-slate-400',   value: 'text-slate-300' },
  };
  const c = colors[color] || colors.blue;

  return (
    <div
      onClick={onClick}
      className={`${c.bg} border ${c.border} rounded-xl p-5 ${onClick ? 'cursor-pointer hover:scale-[1.02] transition-transform' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-400 text-sm font-medium">{label}</p>
          <p className={`text-3xl font-bold mt-1 ${c.value}`}>{value}</p>
          {sub && <p className="text-slate-500 text-xs mt-1">{sub}</p>}
        </div>
        <div className={`${c.bg} border ${c.border} p-2.5 rounded-lg`}>
          <Icon size={20} className={c.icon} />
        </div>
      </div>
    </div>
  );
}
