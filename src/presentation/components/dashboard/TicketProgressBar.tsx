import React from 'react';
import { Plus, Settings2, ShieldCheck, Megaphone } from 'lucide-react';
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
  const total = stats?.totalTickets ?? 1000;

  const barColor =
    percentage >= 100
      ? 'bg-emerald-500'
      : percentage >= 60
      ? 'bg-indigo-600 dark:bg-indigo-500'
      : 'bg-cyan-500';

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm relative overflow-hidden transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400">
            <Megaphone className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                Meta de Espacios Publicitarios
              </h2>
              <button
                type="button"
                onClick={onOpenConfig}
                className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                title="Configurar meta de espacios y precios"
              >
                <Settings2 className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>{stats?.campaignName || 'Campaña de Venta de Publicidad'}</span>
            </p>
          </div>
        </div>

        {/* Counter and Dedicated Declare Ticket Button */}
        <div className="flex items-center justify-between sm:justify-end gap-3">
          <button
            type="button"
            onClick={onOpenAddTicket}
            className="text-left sm:text-right group cursor-pointer p-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
            title="Presiona para registrar venta de espacios publicitarios"
          >
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-none group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {sold} <span className="text-slate-400 text-base font-semibold">/ {total}</span>
            </div>
            <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-1">
              {percentage}% cumplido ({remainingTickets} espacios disponibles)
            </div>
          </button>

          <button
            type="button"
            onClick={onOpenAddTicket}
            className="px-3.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/20 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">+ Vender Espacio</span>
          </button>
        </div>
      </div>

      {/* Progress Bar Track */}
      <div className="pt-4 space-y-2">
        <div className="h-3.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-800">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${barColor}`}
            style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
          <span className="font-semibold">0 espacios</span>
          <span className="font-bold text-slate-600 dark:text-slate-300">
            {sold} espacios colocados con anunciantes
          </span>
          <span className="font-semibold">{total} meta total</span>
        </div>
      </div>
    </div>
  );
};
