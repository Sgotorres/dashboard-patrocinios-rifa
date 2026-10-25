import { useCallback, useEffect, useMemo, useState } from 'react';
import { merchantRepository } from '../../core/di/container';
import type { CreateMerchantDTO, Merchant, PaymentStatus } from '../../domain/models/Merchant';

export type FilterStatus = 'all' | PaymentStatus;

export function useMerchants() {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [search, setSearch] = useState('');

  const loadMerchants = useCallback(async () => {
    try {
      const data = await merchantRepository.getAll();
      setMerchants(data);
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
    return created;
  };

  const updateMerchant = async (id: string, dto: Partial<CreateMerchantDTO>) => {
    const updated = await merchantRepository.update(id, dto);
    setMerchants((prev) => prev.map((m) => (m.id === id ? updated : m)));
    return updated;
  };

  const markAsPaid = async (id: string) => {
    const updated = await merchantRepository.markAsPaid(id);
    setMerchants((prev) => prev.map((m) => (m.id === id ? updated : m)));
  };

  const addPayment = async (id: string, amount: number) => {
    const updated = await merchantRepository.addPayment(id, amount);
    setMerchants((prev) => prev.map((m) => (m.id === id ? updated : m)));
  };

  const deleteMerchant = async (id: string) => {
    await merchantRepository.delete(id);
    setMerchants((prev) => prev.filter((m) => m.id !== id));
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
        acc.totalRaised += m.amountPaid;
        acc.pendingReceivable += Math.max(0, m.totalFee - m.amountPaid);
        return acc;
      },
      { totalRaised: 0, pendingReceivable: 0 }
    );
  }, [merchants]);

  const filteredMerchants = useMemo(() => {
    return merchants.filter((m) => {
      const matchesFilter = filter === 'all' || m.paymentStatus === filter;
      const matchesSearch =
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.phone.toLowerCase().includes(search.toLowerCase()) ||
        m.address.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [merchants, filter, search]);

  return {
    merchants: filteredMerchants,
    allMerchants: merchants,
    loading,
    filter,
    setFilter,
    search,
    setSearch,
    counts,
    finances,
    createMerchant,
    updateMerchant,
    markAsPaid,
    addPayment,
    deleteMerchant,
    refresh: loadMerchants,
  };
}
