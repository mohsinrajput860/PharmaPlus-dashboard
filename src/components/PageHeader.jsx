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
    <div className="mb-5 sm:mb-6">
      {/* Top row: icon + title + actions */}
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 mt-0.5 ${colors[color]}`}>
          <Icon size={18} />
        </div>

        {/* Title block */}
        <div className="flex-1 min-w-0">
          <h1 className="text-lg sm:text-xl font-bold text-slate-800 leading-tight">{title}</h1>
          {subtitle && (
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5 leading-snug">{subtitle}</p>
          )}
        </div>

        {/* Actions — right side */}
        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
          {children}
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-600 hover:bg-slate-50 transition-colors whitespace-nowrap shadow-sm"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              <span className="hidden xs:inline">Refresh</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
