import React from 'react';
import { Plus, Settings2, ShieldCheck, Palmtree, Waves, Sun, Sparkles } from 'lucide-react';
import type { RaffleStats } from '../../../domain/models/RaffleStats';

interface Props {
  stats: RaffleStats | null;
  percentage: number;
  remainingTickets: number;
  onOpenConfig: () => void;
  onOpenAddTicket: () => void;
}

export const TicketProgressBar: React.FC<Props> = ({
  stats,
  percentage,
  remainingTickets,
  onOpenConfig,
  onOpenAddTicket,
}) => {
  const sold = stats?.ticketsSold ?? 0;
  const total = stats?.totalTickets ?? 500;

  const barColor =
    percentage >= 100
      ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
      : percentage >= 50
      ? 'bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500'
      : 'bg-gradient-to-r from-cyan-500 to-teal-500';

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm relative overflow-hidden transition-all">
      {/* Decorative coastal background glow */}
      <div className="absolute top-0 right-0 w-80 h-32 bg-gradient-to-bl from-teal-500/10 via-cyan-500/5 to-transparent pointer-events-none rounded-tr-3xl" />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800 relative">
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <div className="p-3 rounded-2xl bg-gradient-to-tr from-teal-600 via-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/25">
              <Palmtree className="w-6 h-6" />
            </div>
            <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-amber-400 text-amber-950 shadow-xs">
              <Sun className="w-3 h-3" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
                <span>Gran Rifa Viaje a la Playa</span>
                <span className="text-sm">🏖️</span>
              </h2>
              <button
                type="button"
                onClick={onOpenConfig}
                className="p-1 rounded-lg text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                title="Configurar meta de boletos y precio"
              >
                <Settings2 className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
              <span>Progreso de ventas auditado &bull; Cada ticket respaldado por un comercio</span>
            </p>
          </div>
        </div>

        {/* Counter & Action */}
        <div className="flex items-center justify-between sm:justify-end gap-3.5">
          <button
            type="button"
            onClick={onOpenAddTicket}
            className="text-left sm:text-right group cursor-pointer p-1 rounded-xl transition-colors"
            title="Presiona para registrar o declarar venta de tickets"
          >
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-none group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
              {sold} <span className="text-slate-400 text-base font-semibold">/ {total}</span>
            </div>
            <div className="text-xs font-bold text-teal-600 dark:text-teal-400 mt-1 flex items-center gap-1 sm:justify-end">
              <Waves className="w-3.5 h-3.5" />
              <span>{percentage}% completado ({remainingTickets} por vender)</span>
            </div>
          </button>

          <button
            type="button"
            onClick={onOpenAddTicket}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 hover:from-teal-500 hover:to-cyan-500 text-white font-bold text-xs shadow-md shadow-cyan-600/25 cursor-pointer transition-all active:scale-95 whitespace-nowrap"
            title="Declarar ticket: vincula comercio, teléfono, dirección y logotipo"
          >
            <Plus className="w-4 h-4" />
            <span>Declarar Ticket (+1)</span>
          </button>
        </div>
      </div>

      {/* Modern Wave Track Progress Bar */}
      <div className="pt-5 space-y-2.5">
        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-4.5 overflow-hidden p-0.5 border border-slate-200/80 dark:border-slate-800 shadow-inner">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${barColor} shadow-xs relative`}
            style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
          />
        </div>

        <div className="flex justify-between items-center text-[11px] font-semibold text-slate-500 dark:text-slate-400">
          <span>0 boletos</span>
          <span className="font-extrabold text-teal-700 dark:text-teal-300 flex items-center gap-1">
            {remainingTickets === 0 ? (
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                ¡Meta lograda! ¡Nos vamos a la playa!
              </span>
            ) : (
              <span>Faltan {remainingTickets} boletos para la meta</span>
            )}
          </span>
          <span>Meta: {total} boletos</span>
        </div>
      </div>

      {/* Quick Prompt */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
        <span className="text-slate-500 dark:text-slate-400">
          ¿Nuevo patrocinador interesado en comprar boletos?
        </span>
        <button
          onClick={onOpenAddTicket}
          className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:text-teal-700 hover:underline cursor-pointer flex items-center gap-1"
        >
          <span>Registrar venta declarada &rarr;</span>
        </button>
      </div>
    </div>
  );
};
