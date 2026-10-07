import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, MapPin, User, Monitor, Clock, Hash } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

export default function MachineCard({ machine, actions, showExpiry = true }) {
  const navigate = useNavigate();

  const daysLeft = machine.license_expiry && !machine.is_permanent
    ? Math.ceil((machine.license_expiry - Date.now()) / 86400000)
    : null;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md hover:border-slate-300 transition-all">
      {/* Top row */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center flex-shrink-0">
            <Monitor size={18} className="text-sky-500" />
          </div>
          <div>
            <p className="font-semibold text-slate-800 text-sm">{machine.shop_name || 'Unknown Store'}</p>
            {machine.owner_name && (
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                <User size={11} /> {machine.owner_name}
              </p>
            )}
          </div>
        </div>
        {/* Expiry badge */}
        {showExpiry && machine.license_expiry && !machine.is_permanent && (
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${
            daysLeft < 0   ? 'bg-red-50 text-red-600 border border-red-200' :
            daysLeft <= 3  ? 'bg-red-50 text-red-600 border border-red-200' :
            daysLeft <= 7  ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                             'bg-emerald-50 text-emerald-600 border border-emerald-200'
          }`}>
            {daysLeft < 0 ? 'Expired' : `${daysLeft}d left`}
          </span>
        )}
        {machine.is_permanent && showExpiry && (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex-shrink-0">
            Permanent
          </span>
        )}
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {machine.phone && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Phone size={12} className="text-slate-400 flex-shrink-0" />
            <span className="truncate">{machine.phone}</span>
          </div>
        )}
        {machine.city && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <MapPin size={12} className="text-slate-400 flex-shrink-0" />
            <span className="truncate">{machine.city}</span>
          </div>
        )}
        {machine.license_expiry && !machine.is_permanent && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Clock size={12} className="text-slate-400 flex-shrink-0" />
            <span>{format(new Date(machine.license_expiry), 'dd MMM yyyy')}</span>
          </div>
        )}
        {machine.last_seen && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Monitor size={12} className="text-slate-400 flex-shrink-0" />
            <span>{formatDistanceToNow(new Date(machine.last_seen), { addSuffix: true })}</span>
          </div>
        )}
      </div>

      {/* HWID */}
      <div className="bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 mb-4">
        <p className="text-xs text-slate-400 mb-0.5 flex items-center gap-1"><Hash size={10} /> Machine ID</p>
        <code className="text-xs text-slate-600 font-mono break-all">{machine.hwid}</code>
      </div>

      {/* Actions */}
      {actions && (
        <div className="flex items-center gap-2 flex-wrap">
          {actions}
          <button
            onClick={() => navigate(`/machines/${encodeURIComponent(machine.hwid)}`)}
            className="ml-auto text-xs text-sky-600 hover:text-sky-700 font-medium"
          >
            View Details →
          </button>
        </div>
      )}
    </div>
  );
}
