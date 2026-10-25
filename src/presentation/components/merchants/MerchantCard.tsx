import React from 'react';
import type { Merchant } from '../../../domain/models/Merchant';
import { StatusBadge } from '../ui/StatusBadge';
import { MapPin, Phone, CheckCircle, Edit, Trash2, DollarSign, MessageCircle } from 'lucide-react';

interface Props {
  merchant: Merchant;
  onEdit: (merchant: Merchant) => void;
  onDelete: (id: string) => void;
  onMarkAsPaid: (id: string) => void;
  onOpenQuickAbono: (merchant: Merchant) => void;
}

export const MerchantCard: React.FC<Props> = ({
  merchant, onEdit, onDelete, onMarkAsPaid, onOpenQuickAbono,
}) => {
  const remaining = Math.max(0, merchant.totalFee - merchant.amountPaid);
  const paidPercent = Math.min(100, Math.round((merchant.amountPaid / merchant.totalFee) * 100));
  const initials = merchant.name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
  const cleanPhone = merchant.phone.replace(/[^0-9]/g, '');
  const waMsg = encodeURIComponent(`Hola ${merchant.name}, te escribimos para coordinar el saldo de $${remaining.toFixed(2)}.`);
  const waUrl = `https://wa.me/${cleanPhone}?text=${waMsg}`;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between hover:border-slate-700/80 transition-all group">
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center font-bold text-indigo-300 text-sm">
              {merchant.logoUrl ? <img src={merchant.logoUrl} alt={merchant.name} className="w-full h-full object-cover rounded-xl" /> : initials || 'CO'}
            </div>
            <div>
              <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">{merchant.name}</h3>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                <span className="truncate max-w-[170px]">{merchant.address}</span>
              </div>
            </div>
          </div>
          <StatusBadge status={merchant.paymentStatus} />
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 py-1.5 border-y border-slate-800/80">
          <div className="flex items-center gap-1 text-slate-300">
            <Phone className="w-3 h-3 text-slate-500" />
            <span>{merchant.phone}</span>
          </div>
          {merchant.paymentStatus !== 'paid' && cleanPhone && (
            <a href={waUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 hover:text-emerald-300">
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Cobrar</span>
            </a>
          )}
        </div>

        <div className="mt-3.5 space-y-1.5">
          <div className="flex justify-between items-baseline text-xs">
            <span className="text-slate-400">Abonado / Cuota</span>
            <span className="font-semibold text-white">${merchant.amountPaid.toFixed(2)} <span className="text-slate-500">/ ${merchant.totalFee.toFixed(2)}</span></span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div className={`h-full transition-all duration-300 ${merchant.paymentStatus === 'paid' ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${paidPercent}%` }} />
          </div>
          {remaining > 0 && <p className="text-[11px] text-right text-amber-400 font-medium">Resta por pagar: ${remaining.toFixed(2)}</p>}
        </div>
      </div>

      <div className="flex items-center justify-between gap-1.5 pt-4 mt-3 border-t border-slate-800/80">
        <div className="flex items-center gap-1.5">
          {merchant.paymentStatus !== 'paid' && (
            <>
              <button onClick={() => onMarkAsPaid(merchant.id)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 text-xs font-semibold border border-emerald-500/30" title="Completar pago">
                <CheckCircle className="w-3 h-3" />
                <span>Liquidar</span>
              </button>
              <button onClick={() => onOpenQuickAbono(merchant)} className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-xs font-semibold border border-amber-500/30" title="Abonar">
                <DollarSign className="w-3 h-3" />
                <span>Abonar</span>
              </button>
            </>
          )}
        </div>
        <div className="flex items-center gap-1 ml-auto">
          <button onClick={() => onEdit(merchant)} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors" title="Editar"><Edit className="w-3.5 h-3.5" /></button>
          <button onClick={() => onDelete(merchant.id)} className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors" title="Eliminar"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      </div>
    </div>
  );
};
