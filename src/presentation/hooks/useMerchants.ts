import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  merchantRepository,
  raffleRepository,
  registerMerchantUseCase,
  registerPaymentUseCase,
} from '../../core/di/container';
import type { CreateMerchantDTO, CurrencyCode, Merchant, PaymentStatus, UpdateMerchantDTO } from '../../domain/models/Merchant';

export type FilterStatus = 'all' | PaymentStatus;
export type CurrencyFilter = 'all' | CurrencyCode;
export type SortOption = 'recent' | 'name' | 'debt-desc' | 'paid-desc' | 'tickets-desc';

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

  const loadMerchants = useCallback(async () => {
    try {
      const data = await merchantRepository.getAll();
      setMerchants(data);
      const sumTickets = data.reduce((acc, m) => acc + m.ticketsCount, 0);
      await raffleRepository.recalculateSoldFromMerchants(sumTickets);
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
    const current = merchants.find((m) => m.id === id);
    const updated = await merchantRepository.update(id, dto);
    setMerchants((prev) => prev.map((m) => (m.id === id ? updated : m)));
    if (current && dto.ticketsCount !== undefined) {
      const diff = updated.ticketsCount - current.ticketsCount;
      if (diff !== 0) {
        await raffleRepository.adjustTicketsSold(diff);
        if (onTicketsChanged) await onTicketsChanged();
      }
    }
    return updated;
  };

  const markAsPaid = async (id: string) => {
    const updated = await merchantRepository.markAsPaid(id);
    setMerchants((prev) => prev.map((m) => (m.id === id ? updated : m)));
    return updated;
  };

  const addPayment = async (id: string, amount: number, note?: string) => {
    const updated = await registerPaymentUseCase.execute(id, amount, note);
    setMerchants((prev) => prev.map((m) => (m.id === id ? updated : m)));
    return updated;
  };

  const addTickets = async (id: string, ticketsDelta: number) => {
    const updated = await merchantRepository.addTickets(id, ticketsDelta);
    setMerchants((prev) => prev.map((m) => (m.id === id ? updated : m)));
    await raffleRepository.adjustTicketsSold(ticketsDelta);
    if (onTicketsChanged) await onTicketsChanged();
    return updated;
  };

  const deleteMerchant = async (id: string) => {
    const target = merchants.find((m) => m.id === id);
    await merchantRepository.delete(id);
    setMerchants((prev) => prev.filter((m) => m.id !== id));
    if (target) {
      await raffleRepository.adjustTicketsSold(-target.ticketsCount);
      if (onTicketsChanged) await onTicketsChanged();
    }
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
      { all: 0, paid: 0, pending: 0, unpaid: 0, cop: 0, usd: 0 }
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
    const query = search.toLowerCase().trim();
    let result = merchants.filter((m) => {
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

    result = [...result].sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'debt-desc') {
        const debtA = Math.max(0, a.totalFee - a.amountPaid);
        const debtB = Math.max(0, b.totalFee - b.amountPaid);
        return debtB - debtA;
      }
      if (sortBy === 'paid-desc') return b.amountPaid - a.amountPaid;
      if (sortBy === 'tickets-desc') return b.ticketsCount - a.ticketsCount;
      return b.createdAt.localeCompare(a.createdAt);
    });

    return result;
  }, [merchants, filter, currencyFilter, search, sortBy]);

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
