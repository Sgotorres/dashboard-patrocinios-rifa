export type CurrencyCode = 'COP' | 'USD';

export function formatMoney(
  amount: number = 0,
  currency: CurrencyCode = 'COP',
  showCode: boolean = false
): string {
  const clean = isNaN(amount) ? 0 : amount;

  if (currency === 'COP') {
    // Formato estándar Colombia: sin decimales, separador de miles con punto
    const num = Math.round(clean);
    const formatted = new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    }).format(num);

    return showCode ? `${formatted} COP` : formatted;
  }

  // Formato Dólares USD
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(clean);

  return showCode ? `${formatted} USD` : formatted;
}

export function getCurrencyBadge(currency: CurrencyCode = 'COP'): {
  label: string;
  flag: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
} {
  if (currency === 'USD') {
    return {
      label: 'USD',
      flag: '💵',
      bgClass: 'bg-emerald-50 dark:bg-emerald-950/60',
      textClass: 'text-emerald-700 dark:text-emerald-300',
      borderClass: 'border-emerald-200 dark:border-emerald-900',
    };
  }

  return {
    label: 'COP',
    flag: '🇨🇴',
    bgClass: 'bg-blue-50 dark:bg-blue-950/60',
    textClass: 'text-blue-700 dark:text-blue-300',
    borderClass: 'border-blue-200 dark:border-blue-900',
  };
}
