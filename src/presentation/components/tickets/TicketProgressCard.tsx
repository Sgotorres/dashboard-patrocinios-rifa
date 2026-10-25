import React from 'react';
import { Ticket, DollarSign, AlertCircle, Building2 } from 'lucide-react';
import { TicketQuickActions } from './TicketQuickActions';
import type { RaffleStats } from '../../../domain/models/RaffleStats';

interface Props {
  stats: RaffleStats | null;
  percentage: number;
  totalRaised: number;
  pendingReceivable: number;
  merchantsCount: number;
  onAdjustSold: (delta: number) => void;
}

export const TicketProgressCard: React.FC<Props> = ({
  stats,
  percentage,
  totalRaised,
  pendingReceivable,
  merchantsCount,
  onAdjustSold,
}) => {
  const sold = stats?.ticketsSold ?? 0;
  const total = stats?.totalTickets ?? 500;

  const barColor =
    percentage >= 80 ? 'bg-emerald-500' : percentage >= 40 ? 'bg-indigo-500' : 'bg-cyan-500';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-5 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Ticket className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Venta de Tickets</h2>
            <p className="text-xs text-slate-400">Progreso general de la campaña de rifa</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-2xl font-extrabold text-white">
              {sold} <span className="text-slate-500 text-lg font-medium">/ {total}</span>
            </div>
            <div className="text-xs font-semibold text-indigo-400">{percentage}% vendido</div>
          </div>
          <TicketQuickActions onAdjust={onAdjustSold} />
        </div>
      </div>

      <div className="pt-5 space-y-2">
        <div className="w-full bg-slate-800 rounded-full h-3.5 overflow-hidden p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${barColor}`}
            style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-400 font-medium">
          <span>0 tickets</span>
          <span>Meta: {total} tickets</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-5 mt-4 border-t border-slate-800/80">
        <div className="bg-slate-800/40 border border-slate-800 p-3 rounded-xl flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
            <DollarSign className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Total Recaudado</p>
            <p className="text-base font-bold text-emerald-400">${totalRaised.toFixed(2)}</p>
          </div>
        </div>
        <div className="bg-slate-800/40 border border-slate-800 p-3 rounded-xl flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Por Cobrar</p>
            <p className="text-base font-bold text-amber-400">${pendingReceivable.toFixed(2)}</p>
          </div>
        </div>
        <div className="bg-slate-800/40 border border-slate-800 p-3 rounded-xl flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Comercios Afiliados</p>
            <p className="text-base font-bold text-slate-100">{merchantsCount}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
