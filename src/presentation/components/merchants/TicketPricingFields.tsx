import React from 'react';
import { Ticket } from 'lucide-react';

interface Props {
  ticketsCount: string;
  ticketPrice: string;
  totalAmount: number;
  onTicketsChange: (val: string) => void;
  onPriceChange: (val: string) => void;
}

export const TicketPricingFields: React.FC<Props> = ({
  ticketsCount,
  ticketPrice,
  totalAmount,
  onTicketsChange,
  onPriceChange,
}) => {
  return (
    <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/50 rounded-xl space-y-3">
      <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-bold">
        <Ticket className="w-4 h-4" />
        <span>Detalles del Ticket & Cuota</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-slate-600 dark:text-slate-400 mb-1">Cantidad Tickets</label>
          <input
            type="number"
            min="1"
            required
            value={ticketsCount}
            onChange={(e) => onTicketsChange(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-bold text-slate-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-slate-600 dark:text-slate-400 mb-1">Precio Unitario ($)</label>
          <input
            type="number"
            min="0"
            step="0.5"
            value={ticketPrice}
            onChange={(e) => onPriceChange(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-bold text-slate-900 dark:text-white"
          />
        </div>
        <div className="col-span-2 sm:col-span-1 bg-white dark:bg-slate-900/80 p-2 rounded-lg border border-slate-200 dark:border-slate-800 flex flex-col justify-center">
          <span className="text-[10px] text-slate-500">Total a Pagar</span>
          <span className="text-base font-extrabold text-indigo-600 dark:text-indigo-400">
            ${totalAmount.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};
