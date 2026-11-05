import React from 'react';
import type { CurrencyCode } from '../../../domain/models/Currency';
import { useCurrency } from '../../hooks/useCurrency';

interface Props {
  className?: string;
  compact?: boolean;
}

export const CurrencySelector: React.FC<Props> = ({ className = '', compact = false }) => {
  const { activeCurrency, setActiveCurrency } = useCurrency();

  const options: { code: CurrencyCode; label: string; shortLabel: string }[] = [
    { code: 'USD', label: 'USD ($)', shortLabel: '$ USD' },
    { code: 'VES', label: 'Bs. (BCV)', shortLabel: 'Bs.' },
    { code: 'COP', label: 'COP ($)', shortLabel: 'COP' },
  ];

  return (
    <div
      className={`inline-flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 ${className}`}
      role="group"
      aria-label="Seleccionar moneda"
    >
      {options.map((opt) => {
        const isActive = activeCurrency === opt.code;
        return (
          <button
            key={opt.code}
            type="button"
            onClick={() => setActiveCurrency(opt.code)}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              isActive
                ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>{compact ? opt.shortLabel : opt.label}</span>
          </button>
        );
      })}
    </div>
  );
};
