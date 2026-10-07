import React from 'react';
import { RefreshCw } from 'lucide-react';

export default function PageHeader({ icon: Icon, title, subtitle, color = 'sky', onRefresh, loading, children }) {
  const colors = {
    sky:     'bg-sky-50 border-sky-200 text-sky-600',
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-600',
    amber:   'bg-amber-50 border-amber-200 text-amber-600',
    red:     'bg-red-50 border-red-200 text-red-600',
    slate:   'bg-slate-100 border-slate-200 text-slate-600',
  };
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${colors[color]}`}>
          <Icon size={20} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">{title}</h1>
          {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {children}
        {onRefresh && (
          <button onClick={onRefresh} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-600 hover:bg-slate-50 transition-colors">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        )}
      </div>
    </div>
  );
}
