import { useCallback, useEffect, useMemo, useState, useDeferredValue } from 'react';
import {
  addTicketsUseCase,
  deleteMerchantUseCase,
  getAllMerchantsUseCase,
  markAsPaidUseCase,
  registerMerchantUseCase,
  registerPaymentUseCase,
  updateMerchantUseCase,
} from '../../core/di/container';
import { sortMerchants, type SortOption } from '../../core/utils/merchantSorter';
import type {
  CreateMerchantDTO,
  CurrencyCode,
  Merchant,
  PaymentStatus,
  UpdateMerchantDTO,
} from '../../domain/models/Merchant';

export type { SortOption };
export type FilterStatus = 'all' | PaymentStatus;
export type CurrencyFilter = 'all' | CurrencyCode;

export interface CurrencyFinances {
  totalInvoiced: number;
  totalRaised: number;
  pendingReceivable: number;
  totalTicketsBought: number;
}

export interface UseMerchantsOptions {
  onTicketsChanged?: () => void | Promise<void>;
}

export function useMerchants(options?: UseMerchantsOptions) {
  const onTicketsChanged = options?.onTicketsChanged;
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [currencyFilter, setCurrencyFilter] = useState<CurrencyFilter>('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [todayStr] = useState(() => new Date().toISOString().slice(0, 10));

  // React 19 useDeferredValue para evitar jank en búsqueda de texto
  const deferredSearch = useDeferredValue(search);

  const loadMerchants = useCallback(async () => {
    try {
      const data = await getAllMerchantsUseCase.execute();
      setMerchants(data);
      if (onTicketsChanged) await onTicketsChanged();
    } finally {
      setLoading(false);
    }
  }, [onTicketsChanged]);

  useEffect(() => {
    loadMerchants();
  }, [loadMerchants]);

  const createMerchant = async (dto: CreateMerchantDTO) => {
    const created = await registerMerchantUseCase.execute(dto);
    setMerchants((prev) => [created, ...prev]);
    if (onTicketsChanged) await onTicketsChanged();
    return created;
  };

  const updateMerchant = async (id: string, dto: UpdateMerchantDTO) => {
    const updated = await updateMerchantUseCase.execute(id, dto);
    setMerchants((prev) => prev.map((m) => (m.id === id ? updated : m)));
    if (onTicketsChanged) await onTicketsChanged();
    return updated;
  };

  const markAsPaid = async (id: string) => {
    const updated = await markAsPaidUseCase.execute(id);
    setMerchants((prev) => prev.map((m) => (m.id === id ? updated : m)));
    return updated;
  };

  const addPayment = async (id: string, amount: number, note?: string) => {
    const updated = await registerPaymentUseCase.execute(id, amount, note);
    setMerchants((prev) => prev.map((m) => (m.id === id ? updated : m)));
    return updated;
  };

  const addTickets = async (id: string, ticketsDelta: number) => {
    const updated = await addTicketsUseCase.execute(id, ticketsDelta);
    setMerchants((prev) => prev.map((m) => (m.id === id ? updated : m)));
    if (onTicketsChanged) await onTicketsChanged();
    return updated;
  };

  const deleteMerchant = async (id: string) => {
    await deleteMerchantUseCase.execute(id);
    setMerchants((prev) => prev.filter((m) => m.id !== id));
    if (onTicketsChanged) await onTicketsChanged();
  };

  const counts = useMemo(() => {
    return merchants.reduce(
      (acc, m) => {
        acc[m.paymentStatus] += 1;
        acc.all += 1;
        if (m.currency === 'USD') acc.usd += 1;
        else acc.cop += 1;
        return acc;
      },
      { all: 0, paid: 0, pending: 0, unpaid: 0, cop: 0, usd: 0 },
    );
  }, [merchants]);

  // Finanzas discriminadas por Pesos Colombianos (COP) y Dólares (USD)
  const finances = useMemo(() => {
    const cop: CurrencyFinances = { totalInvoiced: 0, totalRaised: 0, pendingReceivable: 0, totalTicketsBought: 0 };
    const usd: CurrencyFinances = { totalInvoiced: 0, totalRaised: 0, pendingReceivable: 0, totalTicketsBought: 0 };

    for (const m of merchants) {
      const target = m.currency === 'USD' ? usd : cop;
      target.totalInvoiced += m.totalFee;
      target.totalRaised += m.amountPaid;
      target.pendingReceivable += Math.max(0, m.totalFee - m.amountPaid);
      target.totalTicketsBought += m.ticketsCount;
    }

    return { cop, usd };
  }, [merchants]);

  // Arqueo de caja diario para cada moneda
  const todayCashbox = useMemo(() => {
    let totalTodayCOP = 0;
    let totalTodayUSD = 0;
    let countToday = 0;

    for (const m of merchants) {
      if (m.paymentHistory && Array.isArray(m.paymentHistory)) {
        for (const p of m.paymentHistory) {
          if (p.date && p.date.startsWith(todayStr)) {
            if (m.currency === 'USD') {
              totalTodayUSD += p.amount;
            } else {
              totalTodayCOP += p.amount;
            }
            countToday += 1;
          }
        }
      }
    }

    return {
      totalTodayCOP: Math.round(totalTodayCOP),
      totalTodayUSD: Math.round((totalTodayUSD + Number.EPSILON) * 100) / 100,
      countToday,
    };
  }, [merchants, todayStr]);

  const filteredMerchants = useMemo(() => {
    const query = deferredSearch.toLowerCase().trim();
    const filtered = merchants.filter((m) => {
      const matchesFilter = filter === 'all' || m.paymentStatus === filter;
      const matchesCurrency = currencyFilter === 'all' || (m.currency || 'COP') === currencyFilter;
      const matchesSearch =
        !query ||
        m.name.toLowerCase().includes(query) ||
        m.phone.toLowerCase().includes(query) ||
        m.address.toLowerCase().includes(query) ||
        (m.socialUrl && m.socialUrl.toLowerCase().includes(query));
      return matchesFilter && matchesCurrency && matchesSearch;
    });

    return sortMerchants(filtered, sortBy);
  }, [merchants, filter, currencyFilter, deferredSearch, sortBy]);

  return {
    merchants: filteredMerchants,
    allMerchants: merchants,
    loading,
    filter,
    setFilter,
    currencyFilter,
    setCurrencyFilter,
    search,
    setSearch,
    sortBy,
    setSortBy,
    counts,
    finances,
    todayCashbox,
    createMerchant,
    updateMerchant,
    markAsPaid,
    addPayment,
    addTickets,
    deleteMerchant,
    refresh: loadMerchants,
  };
}
