import React from 'react';
import { Modal } from '../common/Modal';
import { LogoAvatar } from '../common/LogoAvatar';
import type { Merchant } from '../../../domain/models/Merchant';
import {
  MapPin, Phone, MessageCircle, DollarSign,
  Ticket, Calendar, CheckCircle, Edit, Trash2, Globe, AtSign, PlusCircle, ExternalLink
} from 'lucide-react';
import { cleanSocialHandle } from '../../../core/utils/logoResolver';
import { formatMoney, getCurrencyBadge } from '../../../core/utils/currencyFormatter';

interface Props {
  merchant: Merchant | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenAbono: (merchant: Merchant) => void;
  onMarkAsPaid: (id: string) => void;
  onEdit: (merchant: Merchant) => void;
  onDelete: (id: string) => void;
  onAddTicket: () => void;
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

  const currency = merchant.currency || 'COP';
  const remaining = Math.max(0, merchant.totalFee - merchant.amountPaid);
  const cleanPhone = merchant.phone.replace(/[^0-9]/g, '');
  const waCobroMsg = encodeURIComponent(
    `Hola ${merchant.name}, te escribimos de la Gestión de Publicidad para coordinar el saldo pendiente de ${formatMoney(remaining, currency, true)} por sus ${merchant.ticketsCount} espacios publicitarios.`
  );
  const waCobroUrl = `https://wa.me/${cleanPhone}?text=${waCobroMsg}`;
  const currBadge = getCurrencyBadge(currency);

  const statusConfigs = {
    paid: { label: 'SOLVENTE / PAGADO', subtitle: 'Patrocinador al día con su publicidad', bgClass: 'bg-emerald-600 text-white border-emerald-500' },
    pending: { label: 'ABONO PARCIAL', subtitle: `Resta por pagar: ${formatMoney(remaining, currency, true)}`, bgClass: 'bg-amber-400 text-amber-950 border-amber-300 font-extrabold' },
    unpaid: { label: 'DEUDOR TOTAL', subtitle: `Debe la totalidad: ${formatMoney(merchant.totalFee, currency, true)}`, bgClass: 'bg-rose-600 text-white border-rose-500 font-extrabold' },
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
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
                  {merchant.name}
                </h2>
                <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-md border ${currBadge.bgClass} ${currBadge.textClass} ${currBadge.borderClass}`}>
                  {currBadge.flag} {currBadge.label}
                </span>
              </div>
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
              title="Editar patrocinador"
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
              title="Eliminar patrocinador"
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
            <div className="text-lg font-black">{formatMoney(merchant.amountPaid, currency)}</div>
            <div className="text-[10px] opacity-80 uppercase font-semibold">de {formatMoney(merchant.totalFee, currency)} total</div>
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
              <span className="text-[11px]">Espacios Pautados</span>
            </div>
            <div className="text-lg font-black text-indigo-600 dark:text-indigo-400">{merchant.ticketsCount}</div>
            <div className="text-[10px] text-slate-400">{formatMoney(merchant.ticketPrice, currency)} c/u</div>
          </div>

          <div className="p-3 bg-slate-100 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
            <div className="flex items-center justify-center gap-1 text-slate-500 dark:text-slate-400 mb-0.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-[11px]">Abonado</span>
            </div>
            <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">{formatMoney(merchant.amountPaid, currency)}</div>
            <div className="text-[10px] text-slate-400">Total pagado</div>
          </div>

          <div className="p-3 bg-slate-100 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
            <div className="flex items-center justify-center gap-1 text-slate-500 dark:text-slate-400 mb-0.5">
              <span className="text-[11px]">Saldo Deuda</span>
            </div>
            <div className={`text-lg font-black ${remaining > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400'}`}>
              {formatMoney(remaining, currency)}
            </div>
            <div className="text-[10px] text-slate-400">{remaining > 0 ? 'Pendiente' : 'Al día'}</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {merchant.paymentStatus !== 'paid' && (
            <>
              <button
                onClick={() => {
                  onClose();
                  onOpenAbono(merchant);
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <DollarSign className="w-4 h-4" />
                <span>Registrar Abono ({currency})</span>
              </button>
              <button
                onClick={() => {
                  onMarkAsPaid(merchant.id);
                  onClose();
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Liquidar Deuda Total</span>
              </button>
            </>
          )}

          <button
            onClick={() => {
              onClose();
              onAddTicket();
            }}
            className="py-2 px-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-bold flex items-center gap-1 border border-indigo-200 dark:border-indigo-900 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Añadir Espacios</span>
          </button>
        </div>

        {/* Historial de Abonos */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
              Historial de Pagos y Abonos ({merchant.paymentHistory.length})
            </span>
            <span className="text-[11px] text-slate-400">Orden cronológico</span>
          </div>

          {merchant.paymentHistory.length === 0 ? (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-center text-slate-400">
              No se han registrado abonos previos para este patrocinador.
            </div>
          ) : (
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {merchant.paymentHistory.map((p) => {
                const dateStr = new Date(p.date).toLocaleDateString('es-CO', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div
                    key={p.id}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {p.note || 'Abono a cuenta'}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        <span>{dateStr}</span>
                      </div>
                    </div>
                    <div className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
                      +{formatMoney(p.amount, currency, true)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
