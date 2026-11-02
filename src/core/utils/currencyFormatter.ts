import type { CurrencyCode, ExchangeRates } from '../../domain/models/Currency';

export function convertFromUsd(
  usdAmount: number,
  targetCurrency: CurrencyCode,
  rates: ExchangeRates
): number {
  if (targetCurrency === 'VES') {
    return usdAmount * rates.usdToVes;
  }
  if (targetCurrency === 'COP') {
    return usdAmount * rates.usdToCop;
  }
  return usdAmount;
}

export function convertToUsd(
  amount: number,
  sourceCurrency: CurrencyCode,
  rates: ExchangeRates
): number {
  if (sourceCurrency === 'VES') {
    return rates.usdToVes > 0 ? amount / rates.usdToVes : 0;
  }
  if (sourceCurrency === 'COP') {
    return rates.usdToCop > 0 ? amount / rates.usdToCop : 0;
  }
  return amount;
}

export function formatUsd(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatVes(amount: number): string {
  const formatted = new Intl.NumberFormat('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  return `Bs. ${formatted}`;
}

export function formatCop(amount: number): string {
  const formatted = new Intl.NumberFormat('es-CO', {
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
  return `$${formatted} COP`;
}

export function formatCurrency(
  amountInUsd: number,
  currency: CurrencyCode,
  rates: ExchangeRates
): string {
  const converted = convertFromUsd(amountInUsd, currency, rates);
  switch (currency) {
    case 'VES':
      return formatVes(converted);
    case 'COP':
      return formatCop(converted);
    case 'USD':
    default:
      return formatUsd(converted);
  }
}

export function getTriCurrencyBreakdown(
  amountInUsd: number,
  rates: ExchangeRates
): { usd: string; ves: string; cop: string } {
  return {
    usd: formatUsd(amountInUsd),
    ves: formatVes(amountInUsd * rates.usdToVes),
    cop: formatCop(amountInUsd * rates.usdToCop),
  };
}
