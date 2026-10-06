import React from 'react';

export default function ToggleSwitch({ checked, onChange, disabled = false, label, description }) {
  return (
    <label className={`flex items-center justify-between gap-4 p-3 rounded-lg border border-slate-700/50 bg-slate-800/40 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-slate-800/70 transition-colors'}`}>
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-200">{label}</p>
        {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
      </div>
      <div
        onClick={() => !disabled && onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${checked ? 'bg-brand-600' : 'bg-slate-700'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
      </div>
    </label>
  );
}
