import { useCallback, useEffect, useMemo, useState } from 'react';
import { merchantRepository, raffleRepository } from '../../core/di/container';
import type { CreateMerchantDTO, Merchant, PaymentStatus, UpdateMerchantDTO } from '../../domain/models/Merchant';

export type FilterStatus = 'all' | PaymentStatus;
export type SortOption = 'recent' | 'name' | 'debt-desc' | 'paid-desc' | 'tickets-desc';

export function useMerchants() {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('recent');

  const loadMerchants = useCallback(async () => {
    try {
      const data = await merchantRepository.getAll();
      setMerchants(data);
      const sumTickets = data.reduce((acc, m) => acc + m.ticketsCount, 0);
      await raffleRepository.recalculateSoldFromMerchants(sumTickets);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMerchants();
  }, [loadMerchants]);

  const createMerchant = async (dto: CreateMerchantDTO) => {
    const created = await merchantRepository.create(dto);
    setMerchants((prev) => [created, ...prev]);
    await raffleRepository.adjustTicketsSold(created.ticketsCount);
    return created;
  };

  const updateMerchant = async (id: string, dto: UpdateMerchantDTO) => {
    const current = merchants.find((m) => m.id === id);
    const updated = await merchantRepository.update(id, dto);
    setMerchants((prev) => prev.map((m) => (m.id === id ? updated : m)));
    if (current && dto.ticketsCount !== undefined) {
      const diff = updated.ticketsCount - current.ticketsCount;
      if (diff !== 0) await raffleRepository.adjustTicketsSold(diff);
    }
    return updated;
  };

  const markAsPaid = async (id: string) => {
    const updated = await merchantRepository.markAsPaid(id);
    setMerchants((prev) => prev.map((m) => (m.id === id ? updated : m)));
    return updated;
  };

  const addPayment = async (id: string, amount: number, note?: string) => {
    const updated = await merchantRepository.addPayment(id, amount, note);
    setMerchants((prev) => prev.map((m) => (m.id === id ? updated : m)));
    return updated;
  };

  const addTickets = async (id: string, ticketsDelta: number) => {
    const updated = await merchantRepository.addTickets(id, ticketsDelta);
    setMerchants((prev) => prev.map((m) => (m.id === id ? updated : m)));
    await raffleRepository.adjustTicketsSold(ticketsDelta);
    return updated;
  };

  const deleteMerchant = async (id: string) => {
    const target = merchants.find((m) => m.id === id);
    await merchantRepository.delete(id);
    setMerchants((prev) => prev.filter((m) => m.id !== id));
    if (target) {
      await raffleRepository.adjustTicketsSold(-target.ticketsCount);
    }
  };

  const counts = useMemo(() => {
    return merchants.reduce(
      (acc, m) => {
        acc[m.paymentStatus] += 1;
        acc.all += 1;
        return acc;
      },
      { all: 0, paid: 0, pending: 0, unpaid: 0 }
    );
  }, [merchants]);

  const finances = useMemo(() => {
    return merchants.reduce(
      (acc, m) => {
        acc.totalInvoiced += m.totalFee;
        acc.totalRaised += m.amountPaid;
        acc.pendingReceivable += Math.max(0, m.totalFee - m.amountPaid);
        acc.totalTicketsBought += m.ticketsCount;
        return acc;
      },
      { totalInvoiced: 0, totalRaised: 0, pendingReceivable: 0, totalTicketsBought: 0 }
    );
  }, [merchants]);

  const filteredMerchants = useMemo(() => {
    const query = search.toLowerCase().trim();
    let result = merchants.filter((m) => {
      const matchesFilter = filter === 'all' || m.paymentStatus === filter;
      const matchesSearch =
        !query ||
        m.name.toLowerCase().includes(query) ||
        m.phone.toLowerCase().includes(query) ||
        m.address.toLowerCase().includes(query) ||
        (m.socialUrl && m.socialUrl.toLowerCase().includes(query));
      return matchesFilter && matchesSearch;
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
  }, [merchants, filter, search, sortBy]);

  return {
    merchants: filteredMerchants,
    allMerchants: merchants,
    loading,
    filter,
    setFilter,
    search,
    setSearch,
    sortBy,
    setSortBy,
    counts,
    finances,
    createMerchant,
    updateMerchant,
    markAsPaid,
    addPayment,
    addTickets,
    deleteMerchant,
    refresh: loadMerchants,
  };
}
