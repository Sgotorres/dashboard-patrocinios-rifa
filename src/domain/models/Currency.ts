export type CurrencyCode = 'USD' | 'VES' | 'COP';

export interface ExchangeRates {
  usdToVes: number;       // Tasa oficial BCV (Bs. por USD)
  usdToCop: number;       // Tasa de cambio COP (Pesos por USD)
  vesLastUpdated: string; // Fecha/hora última actualización BCV
  copLastUpdated: string; // Fecha/hora última actualización COP
  isCustomVes: boolean;   // Si el usuario configuró una tasa manual para Bs
  isCustomCop: boolean;   // Si el usuario configuró una tasa manual para COP
  sourceVes: string;      // 'Banco Central de Venezuela (BCV)'
  sourceCop: string;      // 'Mercado Oficial / Abierto'
}

export interface CurrencyConfig {
  code: CurrencyCode;
  label: string;
  symbol: string;
  prefix: string;
  suffix: string;
  flag: string;
  description: string;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  USD: {
    code: 'USD',
    label: 'USD ($)',
    symbol: '$',
    prefix: '$',
    suffix: '',
    flag: 'USD',
    description: 'Dólar Estadounidense (Moneda base)',
  },
  VES: {
    code: 'VES',
    label: 'Bs. (VES)',
    symbol: 'Bs.',
    prefix: 'Bs. ',
    suffix: '',
    flag: 'VES',
    description: 'Bolívar Digital (Tasa Oficial BCV)',
  },
  COP: {
    code: 'COP',
    label: 'COP ($)',
    symbol: 'COP',
    prefix: '$',
    suffix: ' COP',
    flag: 'COP',
    description: 'Peso Colombiano',
  },
};
