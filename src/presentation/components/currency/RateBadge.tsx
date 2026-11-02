import React, { useState } from 'react';
import { useCurrency } from '../../hooks/useCurrency';
import { ExchangeRateModal } from './ExchangeRateModal';
import { Sliders, RefreshCw } from 'lucide-react';

interface Props {
  className?: string;
}

export const RateBadge: React.FC<Props> = ({ className = '' }) => {
  const { rates, loadingRates } = useCurrency();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formattedVes = rates.usdToVes.toLocaleString('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const formattedCop = Math.round(rates.usdToCop).toLocaleString('es-CO');

  return (
    <>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className={`group flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700/80 text-xs font-semibold cursor-pointer transition-all ${className}`}
        title="Ver y configurar tasas de cambio (BCV y COP)"
      >
        {/* Pulsing live dot or spinner if refreshing */}
        {loadingRates ? (
          <RefreshCw className="w-2.5 h-2.5 text-indigo-500 animate-spin" />
        ) : (
          <span className="relative flex h-2 w-2">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                rates.isCustomVes ? 'bg-amber-400' : 'bg-emerald-400'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                rates.isCustomVes ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
            />
          </span>
        )}

        {/* BCV Pill */}
        <span className="text-slate-700 dark:text-slate-200 flex items-center gap-1">
          <span className="font-extrabold text-indigo-600 dark:text-indigo-400">BCV:</span>
          <span>Bs. {formattedVes}</span>
        </span>

        <span className="text-slate-300 dark:text-slate-600">|</span>

        {/* COP Pill */}
        <span className="hidden sm:inline text-slate-600 dark:text-slate-300">
          <span className="font-bold text-emerald-600 dark:text-emerald-400">COP:</span> ${formattedCop}
        </span>

        <Sliders className="w-3 h-3 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 ml-0.5" />
      </button>

      <ExchangeRateModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};
