import React, { createContext, useEffect, useState, useCallback } from 'react';
import type { CurrencyCode, ExchangeRates } from '../../domain/models/Currency';
import {
  loadCachedRates,
  saveCachedRates,
  syncLiveRates,
  fetchBcvRate,
  fetchCopRate,
} from '../services/exchangeRateService';
import {
  convertFromUsd as convFromUsd,
  convertToUsd as convToUsd,
  formatCurrency,
  getTriCurrencyBreakdown,
} from '../utils/currencyFormatter';

interface CurrencyContextType {
  activeCurrency: CurrencyCode;
  setActiveCurrency: (c: CurrencyCode) => void;
  rates: ExchangeRates;
  loadingRates: boolean;
  refreshRates: () => Promise<void>;
  setCustomRate: (currency: 'VES' | 'COP', rate: number) => void;
  resetToLiveRate: (currency: 'VES' | 'COP') => Promise<void>;
  formatAmount: (usdAmount: number, targetCurrency?: CurrencyCode) => string;
  convertFromUsd: (usdAmount: number, targetCurrency: CurrencyCode) => number;
  convertToUsd: (amount: number, sourceCurrency: CurrencyCode) => number;
  getTriBreakdown: (usdAmount: number) => { usd: string; ves: string; cop: string };
}

export const CurrencyContext = createContext<CurrencyContextType | null>(null);

const STORAGE_ACTIVE_CURRENCY = 'rifa_active_currency_v2';

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeCurrency, setActiveCurrencyState] = useState<CurrencyCode>(() => {
    const saved = localStorage.getItem(STORAGE_ACTIVE_CURRENCY);
    return (saved === 'VES' || saved === 'COP' || saved === 'USD') ? saved : 'USD';
  });

  const [rates, setRates] = useState<ExchangeRates>(() => loadCachedRates());
  const [loadingRates, setLoadingRates] = useState<boolean>(false);

  const setActiveCurrency = useCallback((c: CurrencyCode) => {
    setActiveCurrencyState(c);
    localStorage.setItem(STORAGE_ACTIVE_CURRENCY, c);
  }, []);

  const refreshRates = useCallback(async () => {
    setLoadingRates(true);
    try {
      const updated = await syncLiveRates(rates);
      setRates(updated);
    } finally {
      setLoadingRates(false);
    }
  }, [rates]);

  // Sincronización automática al cargar la aplicación
  useEffect(() => {
    refreshRates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setCustomRate = useCallback((currency: 'VES' | 'COP', rate: number) => {
    if (rate <= 0 || isNaN(rate)) return;
    setRates((prev) => {
      const updated: ExchangeRates = {
        ...prev,
        ...(currency === 'VES'
          ? { usdToVes: rate, isCustomVes: true, sourceVes: 'Tasa Manual Personalizada' }
          : { usdToCop: rate, isCustomCop: true, sourceCop: 'Tasa Manual Personalizada' }),
      };
      saveCachedRates(updated);
      return updated;
    });
  }, []);

  const resetToLiveRate = useCallback(async (currency: 'VES' | 'COP') => {
    setLoadingRates(true);
    try {
      if (currency === 'VES') {
        const bcv = await fetchBcvRate();
        setRates((prev) => {
          const updated = {
            ...prev,
            usdToVes: bcv.rate,
            vesLastUpdated: bcv.updatedAt,
            isCustomVes: false,
            sourceVes: 'Banco Central de Venezuela (BCV)',
          };
          saveCachedRates(updated);
          return updated;
        });
      } else {
        const cop = await fetchCopRate();
        setRates((prev) => {
          const updated = {
            ...prev,
            usdToCop: cop.rate,
            copLastUpdated: cop.updatedAt,
            isCustomCop: false,
            sourceCop: 'Mercado Oficial / Abierto',
          };
          saveCachedRates(updated);
          return updated;
        });
      }
    } finally {
      setLoadingRates(false);
    }
  }, []);

  const formatAmount = useCallback(
    (usdAmount: number, targetCurrency?: CurrencyCode) => {
      return formatCurrency(usdAmount, targetCurrency || activeCurrency, rates);
    },
    [activeCurrency, rates]
  );

  const convertFromUsdValue = useCallback(
    (usdAmount: number, targetCurrency: CurrencyCode) => {
      return convFromUsd(usdAmount, targetCurrency, rates);
    },
    [rates]
  );

  const convertToUsdValue = useCallback(
    (amount: number, sourceCurrency: CurrencyCode) => {
      return convToUsd(amount, sourceCurrency, rates);
    },
    [rates]
  );

  const getTriBreakdown = useCallback(
    (usdAmount: number) => {
      return getTriCurrencyBreakdown(usdAmount, rates);
    },
    [rates]
  );

  return (
    <CurrencyContext.Provider
      value={{
        activeCurrency,
        setActiveCurrency,
        rates,
        loadingRates,
        refreshRates,
        setCustomRate,
        resetToLiveRate,
        formatAmount,
        convertFromUsd: convertFromUsdValue,
        convertToUsd: convertToUsdValue,
        getTriBreakdown,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};


