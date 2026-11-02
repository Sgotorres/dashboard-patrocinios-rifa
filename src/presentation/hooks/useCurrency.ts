import { useContext } from 'react';
import { CurrencyContext } from '../../core/context/CurrencyContext';

export const useCurrency = () => {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    throw new Error('useCurrency debe utilizarse dentro de un CurrencyProvider');
  }
  return ctx;
};
