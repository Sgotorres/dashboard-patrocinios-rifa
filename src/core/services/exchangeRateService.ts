import type { ExchangeRates } from '../../domain/models/Currency';

const CACHE_KEY = 'rifa_exchange_rates_v2';

const DEFAULT_RATES: ExchangeRates = {
  usdToVes: 889.58,
  usdToCop: 3200,
  vesLastUpdated: new Date().toISOString(),
  copLastUpdated: new Date().toISOString(),
  isCustomVes: false,
  isCustomCop: false,
  sourceVes: 'Banco Central de Venezuela (BCV)',
  sourceCop: 'Tasa Abierta / Frontera',
};

export async function fetchBcvRate(): Promise<{ rate: number; updatedAt: string }> {
  try {
    const res = await fetch('https://ve.dolarapi.com/v1/dolares/oficial', {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const rate = Number(data.promedio || data.venta || data.compra);
    if (!rate || isNaN(rate) || rate <= 0) throw new Error('Tasa BCV inválida');
    return {
      rate,
      updatedAt: data.fechaActualizacion || new Date().toISOString(),
    };
  } catch {
    // Intento con endpoint general de respaldo
    const resBackup = await fetch('https://ve.dolarapi.com/v1/dolares');
    if (!resBackup.ok) throw new Error('Fallo al conectar con API BCV');
    const list = await resBackup.json();
    const oficial = Array.isArray(list) ? list.find((item: { fuente?: string }) => item.fuente === 'oficial') : null;
    if (oficial && oficial.promedio) {
      return {
        rate: Number(oficial.promedio),
        updatedAt: oficial.fechaActualizacion || new Date().toISOString(),
      };
    }
    throw new Error('No se pudo obtener la tasa oficial del BCV');
  }
}

export async function fetchCopRate(): Promise<{ rate: number; updatedAt: string }> {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const cop = Number(data?.rates?.COP);
    if (!cop || isNaN(cop) || cop <= 0) throw new Error('Tasa COP inválida');
    return {
      rate: Math.round(cop * 100) / 100,
      updatedAt: data.time_last_update_utc || new Date().toISOString(),
    };
  } catch {
    throw new Error('No se pudo obtener la tasa COP');
  }
}

export function loadCachedRates(): ExchangeRates {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_RATES, ...parsed };
    }
  } catch {
    // Si falla el parseo, usar valores por defecto
  }
  return DEFAULT_RATES;
}

export function saveCachedRates(rates: ExchangeRates): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(rates));
  } catch {
    // Ignorar errores de almacenamiento
  }
}

export async function syncLiveRates(currentRates: ExchangeRates): Promise<ExchangeRates> {
  const updated: ExchangeRates = { ...currentRates };

  // 1. Tasa BCV Oficial
  if (!currentRates.isCustomVes) {
    try {
      const bcv = await fetchBcvRate();
      updated.usdToVes = bcv.rate;
      updated.vesLastUpdated = bcv.updatedAt;
      updated.sourceVes = 'Banco Central de Venezuela (BCV)';
    } catch {
      // Mantener tasa previa si la API falla temporalmente
    }
  }

  // 2. Tasa COP
  if (!currentRates.isCustomCop) {
    try {
      const cop = await fetchCopRate();
      updated.usdToCop = cop.rate;
      updated.copLastUpdated = cop.updatedAt;
      updated.sourceCop = 'Mercado Oficial / Abierto';
    } catch {
      // Mantener tasa previa si la API falla
    }
  }

  saveCachedRates(updated);
  return updated;
}
