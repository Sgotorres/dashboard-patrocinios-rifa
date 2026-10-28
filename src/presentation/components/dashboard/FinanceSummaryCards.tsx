import React from 'react';
import { DollarSign, AlertCircle, Building2, TrendingUp } from 'lucide-react';

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
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-2xl shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Recaudado</p>
          <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            ${totalRaised.toFixed(2)}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">Dinero en caja / cuenta</p>
        </div>
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
          <DollarSign className="w-5 h-5" />
        </div>
      </div>

      {/* Por Cobrar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-2xl shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Saldo por Cobrar</p>
          <p className="text-xl sm:text-2xl font-black text-amber-500 dark:text-amber-400 mt-1">
            ${pendingReceivable.toFixed(2)}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">Deudores y abonos pendientes</p>
        </div>
        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900">
          <AlertCircle className="w-5 h-5" />
        </div>
      </div>

      {/* Comercios Afiliados */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-2xl shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Comercios Afiliados</p>
          <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
            {merchantsCount}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">Locales patrocinadores</p>
        </div>
        <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900">
          <Building2 className="w-5 h-5" />
        </div>
      </div>

      {/* Total Facturado */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-2xl shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Comprometido</p>
          <p className="text-xl sm:text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
            ${totalInvoiced.toFixed(2)}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">Monto total en tickets vendidos</p>
        </div>
        <div className="p-3 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-900">
          <TrendingUp className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};
