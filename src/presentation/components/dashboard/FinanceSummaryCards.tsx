import React, { useState } from 'react';
import { DollarSign, AlertCircle, Building2, TrendingUp, CalendarCheck } from 'lucide-react';
import type { CurrencyFinances } from '../../hooks/useMerchants';
import type { CurrencyCode } from '../../../domain/models/Merchant';
import { formatMoney } from '../../../core/utils/currencyFormatter';

interface Props {
  finances: {
    cop: CurrencyFinances;
    usd: CurrencyFinances;
  };
  todayCashbox: {
    totalTodayCOP: number;
    totalTodayUSD: number;
    countToday: number;
  };
  counts: {
    cop: number;
    usd: number;
    all: number;
  };
}

export const FinanceSummaryCards: React.FC<Props> = ({
  finances,
  todayCashbox,
  counts,
}) => {
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>('COP');

  const currentFinances = selectedCurrency === 'USD' ? finances.usd : finances.cop;
  const currentToday = selectedCurrency === 'USD' ? todayCashbox.totalTodayUSD : todayCashbox.totalTodayCOP;
  const currentCount = selectedCurrency === 'USD' ? counts.usd : counts.cop;

  return (
    <div className="space-y-3">
      {/* Selector de Moneda y Resumen Rápido Bimoneda */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 sm:px-4 rounded-2xl shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            Moneda del Resumen:
          </span>
          <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl gap-1">
            <button
              type="button"
              onClick={() => setSelectedCurrency('COP')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedCurrency === 'COP'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>🇨🇴</span>
              <span>Pesos (COP)</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${selectedCurrency === 'COP' ? 'bg-blue-800' : 'bg-slate-200 dark:bg-slate-700'}`}>
                {counts.cop}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedCurrency('USD')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedCurrency === 'USD'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>💵</span>
              <span>Dólares (USD)</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${selectedCurrency === 'USD' ? 'bg-emerald-800' : 'bg-slate-200 dark:bg-slate-700'}`}>
                {counts.usd}
              </span>
            </button>
          </div>
        </div>

        {/* Cierre Bimoneda en Línea */}
        <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
          <span>Recaudado Total:</span>
          <span className="font-bold text-blue-600 dark:text-blue-400">
            {formatMoney(finances.cop.totalRaised, 'COP', true)}
          </span>
          <span>•</span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400">
            {formatMoney(finances.usd.totalRaised, 'USD', true)}
          </span>
        </div>
      </div>

      {/* Tarjetas KPI para la moneda activa */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Recaudado Hoy (Arqueo Diario) */}
        <div className={`p-4 rounded-2xl shadow-sm border-2 flex items-center justify-between ${
          selectedCurrency === 'COP'
            ? 'bg-gradient-to-br from-blue-500/10 via-white to-white dark:from-blue-950/40 dark:via-slate-900 dark:to-slate-900 border-blue-500/40 dark:border-blue-600/40'
            : 'bg-gradient-to-br from-emerald-500/10 via-white to-white dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-900 border-emerald-500/40 dark:border-emerald-600/40'
        }`}>
          <div>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full animate-pulse ${selectedCurrency === 'COP' ? 'bg-blue-500' : 'bg-emerald-500'}`} />
              <p className={`text-xs font-bold ${selectedCurrency === 'COP' ? 'text-blue-800 dark:text-blue-300' : 'text-emerald-800 dark:text-emerald-300'}`}>
                Cobrado Hoy ({selectedCurrency})
              </p>
            </div>
            <p className={`text-xl sm:text-2xl font-black mt-1 ${selectedCurrency === 'COP' ? 'text-blue-700 dark:text-blue-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
              {formatMoney(currentToday, selectedCurrency)}
            </p>
            <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
              {todayCashbox.countToday} abonos en total hoy
            </p>
          </div>
          <div className={`p-3 rounded-xl text-white shadow-md ${selectedCurrency === 'COP' ? 'bg-blue-600 shadow-blue-600/20' : 'bg-emerald-600 shadow-emerald-600/20'}`}>
            <CalendarCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Total Recaudado Acumulado */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Recaudado ({selectedCurrency})</p>
            <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
              {formatMoney(currentFinances.totalRaised, selectedCurrency)}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">Dinero en caja acumulado</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        {/* Saldo Por Cobrar */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Saldo por Cobrar ({selectedCurrency})</p>
            <p className="text-xl sm:text-2xl font-black text-amber-500 dark:text-amber-400 mt-1">
              {formatMoney(currentFinances.pendingReceivable, selectedCurrency)}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">Saldos pendientes de cobro</p>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>

        {/* Patrocinadores en esta Moneda */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Patrocinadores ({selectedCurrency})</p>
            <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
              {currentCount}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">{counts.all} patrocinadores en total</p>
          </div>
          <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        {/* Total Comprometido */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Facturado ({selectedCurrency})</p>
            <p className="text-xl sm:text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
              {formatMoney(currentFinances.totalInvoiced, selectedCurrency)}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">Total pactado en publicidad</p>
          </div>
          <div className="p-3 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-900">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>
    </div>
  );
};
