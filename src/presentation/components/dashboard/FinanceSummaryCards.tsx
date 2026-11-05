import React from 'react';
import { DollarSign, AlertCircle, Building2, TrendingUp } from 'lucide-react';
import { TriCurrencyAmount } from '../currency/TriCurrencyAmount';

interface Props {
  totalRaised: number;
  pendingReceivable: number;
  totalInvoiced: number;
  merchantsCount: number;
}

export const FinanceSummaryCards: React.FC<Props> = ({
  totalRaised,
  pendingReceivable,
  totalInvoiced,
  merchantsCount,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Recaudado */}
      <div className="bg-white dark:bg-slate-900 border border-emerald-500/20 dark:border-emerald-500/20 p-4 sm:p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex items-center justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full pointer-events-none" />
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Recaudado</p>
          <div className="text-emerald-600 dark:text-emerald-400 mt-1">
            <TriCurrencyAmount amountInUsd={totalRaised} size="lg" />
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">En caja / banco para el viaje</p>
        </div>
        <div className="p-3 shrink-0 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
          <DollarSign className="w-5 h-5" />
        </div>
      </div>

      {/* Por Cobrar */}
      <div className="bg-white dark:bg-slate-900 border border-amber-500/20 dark:border-amber-500/20 p-4 sm:p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex items-center justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full pointer-events-none" />
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Saldo por Cobrar</p>
          <div className="text-amber-500 dark:text-amber-400 mt-1">
            <TriCurrencyAmount amountInUsd={pendingReceivable} size="lg" />
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Deudores y abonos pendientes</p>
        </div>
        <div className="p-3 shrink-0 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900">
          <AlertCircle className="w-5 h-5" />
        </div>
      </div>

      {/* Comercios Afiliados */}
      <div className="bg-white dark:bg-slate-900 border border-teal-500/20 dark:border-teal-500/20 p-4 sm:p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex items-center justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-bl-full pointer-events-none" />
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Comercios Afiliados</p>
          <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
            {merchantsCount}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">Patrocinadores de la rifa</p>
        </div>
        <div className="p-3 shrink-0 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-900">
          <Building2 className="w-5 h-5" />
        </div>
      </div>

      {/* Total Facturado */}
      <div className="bg-white dark:bg-slate-900 border border-cyan-500/20 dark:border-cyan-500/20 p-4 sm:p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex items-center justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-bl-full pointer-events-none" />
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Comprometido</p>
          <div className="text-cyan-700 dark:text-cyan-400 mt-1">
            <TriCurrencyAmount amountInUsd={totalInvoiced} size="lg" />
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Monto total en tickets emitidos</p>
        </div>
        <div className="p-3 shrink-0 rounded-2xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-900">
          <TrendingUp className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};
