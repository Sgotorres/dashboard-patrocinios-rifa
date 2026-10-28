import React from 'react';
import type { Merchant } from '../../../domain/models/Merchant';
import { LogoAvatar } from '../common/LogoAvatar';
import { StatusCell } from '../common/StatusCell';
import {
  MapPin, Phone, MessageCircle, Ticket, DollarSign,
  CheckCircle, Plus, Store, AtSign
} from 'lucide-react';
import { cleanSocialHandle } from '../../../core/utils/logoResolver';

interface Props {
  merchants: Merchant[];
  loading: boolean;
  onSelectMerchant: (merchant: Merchant) => void;
  onOpenAbono: (merchant: Merchant) => void;
  onMarkAsPaid: (id: string) => void;
  onOpenAddTicket: () => void;
}

export const MerchantsDataTable: React.FC<Props> = ({
  merchants,
  loading,
  onSelectMerchant,
  onOpenAbono,
  onMarkAsPaid,
  onOpenAddTicket,
}) => {
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
          No se encontraron comercios
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-4">
          No hay registros coincidentes con los filtros actuales. Puedes registrar un nuevo boleto de patrocinio.
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
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <th className="py-3.5 px-4">Establecimiento</th>
              <th className="py-3.5 px-3 text-center">Tickets</th>
              <th className="py-3.5 px-3">Total Cuota</th>
              <th className="py-3.5 px-3">Abonado</th>
              <th className="py-3.5 px-3">Saldo Deuda</th>
              <th className="py-3.5 px-4 min-w-[170px]">Estado de Cuenta (Click detalle)</th>
              <th className="py-3.5 px-4 text-right">Acciones Rápidas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {merchants.map((m) => {
              const remaining = Math.max(0, m.totalFee - m.amountPaid);
              const cleanPhone = m.phone.replace(/[^0-9]/g, '');
              const waMsg = encodeURIComponent(
                `Hola ${m.name}, te escribimos de la Gran Rifa para coordinar el saldo pendiente de $${remaining.toFixed(2)}.`
              );
              const waUrl = `https://wa.me/${cleanPhone}?text=${waMsg}`;

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

                  {/* Tickets */}
                  <td className="py-3.5 px-3 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-extrabold border border-indigo-200 dark:border-indigo-900/60">
                      <Ticket className="w-3 h-3" />
                      <span>{m.ticketsCount}</span>
                    </span>
                  </td>

                  {/* Total Cuota */}
                  <td className="py-3.5 px-3 font-bold text-slate-900 dark:text-white">
                    ${m.totalFee.toFixed(2)}
                  </td>

                  {/* Abonado */}
                  <td className="py-3.5 px-3 font-bold text-emerald-600 dark:text-emerald-400">
                    ${m.amountPaid.toFixed(2)}
                  </td>

                  {/* Saldo Deuda */}
                  <td className="py-3.5 px-3 font-bold">
                    <span className={remaining > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400'}>
                      ${remaining.toFixed(2)}
                    </span>
                  </td>

                  {/* Casilla de Color Completo (Verde, Amarillo, Rojo) */}
                  <td className="py-3.5 px-4">
                    <StatusCell
                      status={m.paymentStatus}
                      amountPaid={m.amountPaid}
                      totalFee={m.totalFee}
                      onClick={() => onSelectMerchant(m)}
                    />
                  </td>

                  {/* Acciones */}
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

                      {m.paymentStatus !== 'paid' && (
                        <>
                          <button
                            type="button"
                            onClick={() => onOpenAbono(m)}
                            className="px-2.5 py-1 rounded-lg bg-amber-400/20 hover:bg-amber-400/30 text-amber-900 dark:text-amber-300 font-bold text-[11px] border border-amber-300 dark:border-amber-500/40 cursor-pointer flex items-center gap-1"
                            title="Registrar Abono"
                          >
                            <DollarSign className="w-3 h-3" />
                            <span>Abonar</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onMarkAsPaid(m.id)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-800 dark:text-emerald-300 font-bold text-[11px] border border-emerald-500/40 cursor-pointer flex items-center gap-1"
                            title="Marcar como pagado totalmente"
                          >
                            <CheckCircle className="w-3 h-3" />
                            <span>Liquidar</span>
                          </button>
                        </>
                      )}
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
