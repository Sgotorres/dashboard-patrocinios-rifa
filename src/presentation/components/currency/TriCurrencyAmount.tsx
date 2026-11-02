import React from 'react';
import { useCurrency } from '../../hooks/useCurrency';

interface Props {
  amountInUsd: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSecondary?: boolean;
  className?: string;
}

export const TriCurrencyAmount: React.FC<Props> = ({
  amountInUsd,
  size = 'md',
  showSecondary = true,
  className = '',
}) => {
  const { activeCurrency, formatAmount, getTriBreakdown } = useCurrency();
  const breakdown = getTriBreakdown(amountInUsd);

  const primaryText = formatAmount(amountInUsd);

  // Subtítulo con las 2 monedas que no están activas actualmente
  const secondaryItems: string[] = [];
  if (activeCurrency !== 'USD') secondaryItems.push(breakdown.usd);
  if (activeCurrency !== 'VES') secondaryItems.push(breakdown.ves);
  if (activeCurrency !== 'COP') secondaryItems.push(breakdown.cop);

  const sizeClasses = {
    sm: 'text-xs font-bold',
    md: 'text-sm font-extrabold',
    lg: 'text-lg sm:text-xl font-black',
    xl: 'text-xl sm:text-2xl font-black',
  }[size];

  return (
    <div className={`inline-flex flex-col ${className}`}>
      <span className={sizeClasses}>{primaryText}</span>
      {showSecondary && (
        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium tracking-tight">
          {secondaryItems.join(' • ')}
        </span>
      )}
    </div>
  );
};
