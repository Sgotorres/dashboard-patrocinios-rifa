import React from 'react';
import { Modal } from '../common/Modal';
import { LogoAvatar } from '../common/LogoAvatar';
import type { Merchant } from '../../../domain/models/Merchant';
import {
  MapPin, Phone, MessageCircle, Ticket, DollarSign,
  Calendar, CheckCircle, Plus, Edit, Trash2, Globe, ExternalLink, AtSign
} from 'lucide-react';
import { cleanSocialHandle } from '../../../core/utils/logoResolver';

interface Props {
  merchant: Merchant | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenAbono: (merchant: Merchant) => void;
  onMarkAsPaid: (id: string) => void;
  onEdit: (merchant: Merchant) => void;
  onDelete: (id: string) => void;
  onAddTicket: (merchant: Merchant) => void;
}

export const MerchantDetailModal: React.FC<Props> = ({
  merchant,
  isOpen,
  onClose,
  onOpenAbono,
  onMarkAsPaid,
  onEdit,
  onDelete,
  onAddTicket,
}) => {
  if (!merchant) return null;

  const remaining = Math.max(0, merchant.totalFee - merchant.amountPaid);
  const cleanPhone = merchant.phone.replace(/[^0-9]/g, '');
  const waCobroMsg = encodeURIComponent(
    `Hola ${merchant.name}, te escribimos de la Gran Rifa para coordinar el saldo pendiente de $${remaining.toFixed(2)} por sus ${merchant.ticketsCount} tickets de patrocinio.`
  );
  const waCobroUrl = `https://wa.me/${cleanPhone}?text=${waCobroMsg}`;

  const statusConfigs = {
    paid: { label: 'SOLVENTE / PAGADO', subtitle: 'Comercio al día con sus tickets', bgClass: 'bg-emerald-600 text-white border-emerald-500' },
    pending: { label: 'ABONO PARCIAL', subtitle: `Resta por pagar: $${remaining.toFixed(2)}`, bgClass: 'bg-amber-400 text-amber-950 border-amber-300 font-extrabold' },
    unpaid: { label: 'DEUDOR TOTAL', subtitle: `Debe la totalidad: $${merchant.totalFee.toFixed(2)}`, bgClass: 'bg-rose-600 text-white border-rose-500 font-extrabold' },
  }[merchant.paymentStatus];

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="lg">
      <div className="space-y-4 text-xs">
        {/* Header Profile */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <LogoAvatar
              name={merchant.name}
              logoUrl={merchant.logoUrl}
              socialUrl={merchant.socialUrl}
              size="lg"
            />
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
                {merchant.name}
              </h2>
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 mt-1">
                <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                <span className="line-clamp-1">{merchant.address}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => { onClose(); onEdit(merchant); }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              title="Editar comercio"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                if (confirm(`¿Eliminar ${merchant.name}?`)) {
                  onDelete(merchant.id);
                  onClose();
                }
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              title="Eliminar comercio"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Big Solid Colored Status Bar */}
        <div className={`p-3.5 rounded-xl border shadow-sm flex items-center justify-between ${statusConfigs.bgClass}`}>
          <div>
            <div className="text-sm font-black tracking-wide">{statusConfigs.label}</div>
            <div className="text-xs opacity-90">{statusConfigs.subtitle}</div>
          </div>
          <div className="text-right">
            <div className="text-lg font-black">${merchant.amountPaid.toFixed(2)}</div>
            <div className="text-[10px] opacity-80 uppercase font-semibold">de ${merchant.totalFee.toFixed(2)} total</div>
          </div>
        </div>

        {/* Contact Info & WhatsApp */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <Phone className="w-4 h-4 text-indigo-500 shrink-0" />
            <span className="font-semibold">{merchant.phone}</span>
          </div>
          <div className="flex items-center gap-2">
            {cleanPhone && (
              <a
                href={waCobroUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-xs"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp Cobranza</span>
              </a>
            )}
            {merchant.socialUrl && (() => {
              const cleaned = cleanSocialHandle(merchant.socialUrl);
              return (
                <a
                  href={cleaned.fullUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-pink-500/10 text-pink-600 dark:text-pink-400 hover:bg-pink-500/20 text-xs font-semibold border border-pink-500/30 truncate"
                  title={`Abrir perfil: ${cleaned.fullUrl}`}
                >
                  {cleaned.isInstagram ? <AtSign className="w-3.5 h-3.5 shrink-0" /> : <Globe className="w-3.5 h-3.5 shrink-0" />}
                  <span className="truncate">{cleaned.handle ? `@${cleaned.handle}` : 'Ver Perfil'}</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              );
            })()}
          </div>
        </div>

        {/* Tickets & Finances Summary Grid */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-3 bg-slate-100 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
            <div className="flex items-center justify-center gap-1 text-slate-500 dark:text-slate-400 mb-0.5">
              <Ticket className="w-3.5 h-3.5 text-indigo-500" />
              <span className="text-[11px]">Tickets</span>
            </div>
            <div className="text-lg font-black text-indigo-600 dark:text-indigo-400">{merchant.ticketsCount}</div>
            <div className="text-[10px] text-slate-400">${merchant.ticketPrice.toFixed(2)} c/u</div>
          </div>

          <div className="p-3 bg-slate-100 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
            <div className="flex items-center justify-center gap-1 text-slate-500 dark:text-slate-400 mb-0.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-[11px]">Abonado</span>
            </div>
            <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">${merchant.amountPaid.toFixed(2)}</div>
            <div className="text-[10px] text-slate-400">Total pagado</div>
          </div>

          <div className="p-3 bg-slate-100 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
            <div className="flex items-center justify-center gap-1 text-slate-500 dark:text-slate-400 mb-0.5">
              <span className="text-[11px]">Saldo Deuda</span>
            </div>
            <div className={`text-lg font-black ${remaining > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400'}`}>
              ${remaining.toFixed(2)}
            </div>
            <div className="text-[10px] text-slate-400">{remaining > 0 ? 'Pendiente' : 'Al día'}</div>
          </div>
        </div>

        {/* Abono Payment History */}
        <div className="space-y-2">
          <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
            <span>Historial de Abonos Registrados</span>
            <span className="text-[11px] font-normal text-slate-500">
              {merchant.paymentHistory.length} transacciones
            </span>
          </h4>

          {merchant.paymentHistory.length === 0 ? (
            <p className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl text-slate-400 text-center">
              No tiene abonos registrados aún. Estado: Deudor.
            </p>
          ) : (
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {merchant.paymentHistory.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-lg"
                >
                  <div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">+${p.amount.toFixed(2)}</span>
                      <span className="text-[11px] text-slate-500">{p.note || 'Abono'}</span>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(p.date).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          {merchant.paymentStatus !== 'paid' && (
            <>
              <button
                onClick={() => { onClose(); onOpenAbono(merchant); }}
                className="flex-1 min-w-[120px] py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              >
                <DollarSign className="w-4 h-4" />
                <span>Registrar Abono</span>
              </button>
              <button
                onClick={() => { onMarkAsPaid(merchant.id); onClose(); }}
                className="flex-1 min-w-[120px] py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Liquidar Deuda</span>
              </button>
            </>
          )}
          <button
            onClick={() => { onClose(); onAddTicket(merchant); }}
            className="py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tickets</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
