import React from 'react';
import type { Merchant } from '../../../domain/models/Merchant';
import { LogoAvatar } from '../common/LogoAvatar';
import { StatusCell } from '../common/StatusCell';
import {
  MapPin, Phone, MessageCircle, Ticket, DollarSign,
  CheckCircle, Plus, Store, AtSign, X
} from 'lucide-react';
import { cleanSocialHandle } from '../../../core/utils/logoResolver';
import { formatMoney, getCurrencyBadge } from '../../../core/utils/currencyFormatter';
import { useMerchantsStore } from '../../stores/useMerchantsStore';

interface Props {
  merchants: Merchant[];
  loading: boolean;
  onSelectMerchant: (merchant: Merchant) => void;
  onOpenAbono: (merchant: Merchant) => void;
  onMarkAsPaid: (id: string) => void;
  onOpenAddTicket: () => void;
  onDeleteMerchant?: (id: string, name: string) => void | Promise<void>;
}

export const MerchantsDataTable: React.FC<Props> = ({
  merchants,
  loading,
  onSelectMerchant,
  onOpenAbono,
  onMarkAsPaid,
  onOpenAddTicket,
  onDeleteMerchant,
}) => {
  const storeDeleteMerchant = useMerchantsStore((s) => s.deleteMerchant);

  const handleDeleteClick = (e: React.MouseEvent, m: Merchant) => {
    e.stopPropagation();
    const confirmed = window.confirm(
      `¿Deseas eliminar a "${m.name}"?\nEsta acción eliminará sus abonos registrados y ajustará los boletos asignados al sorteo.`
    );
    if (!confirmed) return;

    if (onDeleteMerchant) {
      onDeleteMerchant(m.id, m.name);
    } else {
      storeDeleteMerchant(m.id);
    }
  };
  if (loading) {
    return (
      <div className="py-16 text-center text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
        <p className="text-xs font-semibold animate-pulse">Cargando registros...</p>
      </div>
    );
  }

  if (merchants.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-10 text-center flex flex-col items-center">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-slate-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-3">
          <Store className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
          No se encontraron patrocinadores
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-4">
          No hay registros coincidentes con los filtros actuales. Puedes registrar un nuevo espacio publicitario con boletos de sorteo.
        </p>
        <button
          onClick={onOpenAddTicket}
          className="text-xs font-bold px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer shadow-xs transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Primer Patrocinador</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
      {/* ============================================================== */}
      {/* VISTA MÓVIL (Tarjetas ergonómicas para pantalla de teléfono)   */}
      {/* ============================================================== */}
      <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-800">
        {merchants.map((m) => {
          const currency = m.currency || 'COP';
          const remaining = Math.max(0, m.totalFee - m.amountPaid);
          const cleanPhone = m.phone.replace(/[^0-9]/g, '');
          const waMsg = encodeURIComponent(
            `Hola ${m.name}, te escribimos de la Gestión de Publicidad para coordinar el saldo pendiente de ${formatMoney(remaining, currency, true)}.`
          );
          const waUrl = `https://wa.me/${cleanPhone}?text=${waMsg}`;
          const currBadge = getCurrencyBadge(currency);

          return (
            <div key={m.id} className="p-4 space-y-3">
              {/* Encabezado Comercio */}
              <div className="flex items-start justify-between gap-2.5">
                <button
                  type="button"
                  onClick={() => onSelectMerchant(m)}
                  className="flex items-center gap-3 text-left min-w-0 flex-1 cursor-pointer"
                >
                  <LogoAvatar
                    name={m.name}
                    logoUrl={m.logoUrl}
                    socialUrl={m.socialUrl}
                    size="md"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                        {m.name}
                      </h4>
                      <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-md border ${currBadge.bgClass} ${currBadge.textClass} ${currBadge.borderClass}`}>
                        {currBadge.flag} {currBadge.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{m.address}</span>
                    </div>
                  </div>
                </button>

                <div className="shrink-0 flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-extrabold text-[11px] border border-indigo-200 dark:border-indigo-900/60">
                    <Ticket className="w-3 h-3" />
                    <span>{m.ticketsCount}</span>
                  </span>
                  <button
                    type="button"
                    onClick={(e) => handleDeleteClick(e, m)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-transparent hover:border-rose-200 dark:hover:border-rose-900/60 transition-all cursor-pointer"
                    title={`Eliminar ${m.name}`}
                    aria-label={`Eliminar ${m.name}`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Casilla de Estado / Montos */}
              <div
                onClick={() => onSelectMerchant(m)}
                className="cursor-pointer"
              >
                <StatusCell
                  status={m.paymentStatus}
                  amountPaid={m.amountPaid}
                  totalFee={m.totalFee}
                  currency={currency}
                  onClick={() => onSelectMerchant(m)}
                />
              </div>

              {/* Barra de Acciones Móviles */}
              <div className="flex items-center gap-2 pt-1">
                {cleanPhone && remaining > 0 && (
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2 px-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Cobrar WhatsApp</span>
                  </a>
                )}

                {m.paymentStatus !== 'paid' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => onOpenAbono(m)}
                      className="flex-1 py-2 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                    >
                      <DollarSign className="w-4 h-4" />
                      <span>+ Abono / Cobrar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onMarkAsPaid(m.id)}
                      className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1 cursor-pointer active:scale-95 transition-all"
                      title="Liquidar Total"
                    >
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span className="hidden sm:inline">Liquidar</span>
                    </button>
                  </>
                ) : (
                  <div className="flex-1 py-1.5 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-extrabold text-xs border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Pago Totalmente Solvente</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ============================================================== */}
      {/* VISTA ESCRITORIO (Tabla expandida para laptop)                */}
      {/* ============================================================== */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <th className="py-3.5 px-4">Establecimiento</th>
              <th className="py-3.5 px-3 text-center">Moneda</th>
              <th className="py-3.5 px-3 text-center">Espacios</th>
              <th className="py-3.5 px-3">Total Pautado</th>
              <th className="py-3.5 px-3">Abonado</th>
              <th className="py-3.5 px-3">Saldo Deuda</th>
              <th className="py-3.5 px-4 min-w-[170px]">Estado de Cuenta (Click detalle)</th>
              <th className="py-3.5 px-4 text-right">Acciones Rápidas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {merchants.map((m) => {
              const currency = m.currency || 'COP';
              const remaining = Math.max(0, m.totalFee - m.amountPaid);
              const cleanPhone = m.phone.replace(/[^0-9]/g, '');
              const waMsg = encodeURIComponent(
                `Hola ${m.name}, te escribimos de la Gestión de Publicidad para coordinar el saldo pendiente de ${formatMoney(remaining, currency, true)}.`
              );
              const waUrl = `https://wa.me/${cleanPhone}?text=${waMsg}`;
              const currBadge = getCurrencyBadge(currency);

              return (
                <tr
                  key={m.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
                >
                  {/* Establecimiento */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <LogoAvatar
                        name={m.name}
                        logoUrl={m.logoUrl}
                        socialUrl={m.socialUrl}
                        size="md"
                      />
                      <div className="min-w-0 max-w-[210px]">
                        <button
                          type="button"
                          onClick={() => onSelectMerchant(m)}
                          className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate text-left block cursor-pointer transition-colors"
                        >
                          {m.name}
                        </button>
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{m.address}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{m.phone}</span>
                        </div>
                        {m.socialUrl && (() => {
                          const cleaned = cleanSocialHandle(m.socialUrl);
                          return (
                            <div className="mt-0.5">
                              <a
                                href={cleaned.fullUrl}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-pink-600 dark:text-pink-400 hover:underline"
                                title={`Abrir perfil directo: ${cleaned.fullUrl}`}
                              >
                                <AtSign className="w-3 h-3 shrink-0" />
                                <span className="truncate max-w-[150px]">{cleaned.handle ? `@${cleaned.handle}` : 'Instagram'}</span>
                              </a>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </td>

                  {/* Moneda */}
                  <td className="py-3.5 px-3 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-extrabold border ${currBadge.bgClass} ${currBadge.textClass} ${currBadge.borderClass}`}>
                      <span>{currBadge.flag}</span>
                      <span>{currBadge.label}</span>
                    </span>
                  </td>

                  {/* Tickets */}
                  <td className="py-3.5 px-3 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-extrabold border border-indigo-200 dark:border-indigo-900/60">
                      <Ticket className="w-3 h-3" />
                      <span>{m.ticketsCount}</span>
                    </span>
                  </td>

                  {/* Total Cuota */}
                  <td className="py-3.5 px-3 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                    {formatMoney(m.totalFee, currency)}
                  </td>

                  {/* Abonado */}
                  <td className="py-3.5 px-3 font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                    {formatMoney(m.amountPaid, currency)}
                  </td>

                  {/* Saldo Deuda */}
                  <td className="py-3.5 px-3 font-bold whitespace-nowrap">
                    <span className={remaining > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400'}>
                      {formatMoney(remaining, currency)}
                    </span>
                  </td>

                  {/* Casilla de Color Completo (Verde, Amarillo, Rojo) */}
                  <td className="py-3.5 px-4">
                    <StatusCell
                      status={m.paymentStatus}
                      amountPaid={m.amountPaid}
                      totalFee={m.totalFee}
                      currency={currency}
                      onClick={() => onSelectMerchant(m)}
                    />
                  </td>

                  {/* Acciones Rápidas */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {cleanPhone && remaining > 0 && (
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors"
                          title="Cobrar por WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>
                      )}

                      {m.paymentStatus !== 'paid' ? (
                        <>
                          <button
                            type="button"
                            onClick={() => onOpenAbono(m)}
                            className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-xs cursor-pointer flex items-center gap-1.5 transition-all active:scale-95"
                            title="Registrar cobro o abono inmediato (1-Clic)"
                          >
                            <DollarSign className="w-3.5 h-3.5" />
                            <span>+ Abono</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onMarkAsPaid(m.id)}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-600/10 hover:bg-emerald-600 text-emerald-700 hover:text-white dark:text-emerald-400 dark:hover:text-white font-bold text-xs border border-emerald-500/30 transition-all cursor-pointer flex items-center gap-1"
                            title="Marcar pagado totalmente con 1 clic"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Liquidar</span>
                          </button>
                        </>
                      ) : (
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-extrabold text-[11px] border border-emerald-200 dark:border-emerald-800/60 inline-flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          <span>Al día</span>
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={(e) => handleDeleteClick(e, m)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-transparent hover:border-rose-200 dark:hover:border-rose-900/60 transition-all cursor-pointer"
                        title={`Eliminar comercio: ${m.name}`}
                        aria-label={`Eliminar ${m.name}`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
