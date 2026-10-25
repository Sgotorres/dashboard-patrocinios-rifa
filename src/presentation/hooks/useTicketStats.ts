import { useCallback, useEffect, useState } from 'react';
import { raffleRepository } from '../../core/di/container';
import type { RaffleStats } from '../../domain/models/RaffleStats';

export function useTicketStats() {
  const [stats, setStats] = useState<RaffleStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const data = await raffleRepository.getStats();
      setStats(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const adjustSold = async (delta: number) => {
    if (!stats) return;
    const next = stats.ticketsSold + delta;
    const updated = await raffleRepository.updateTicketsSold(next);
    setStats(updated);
  };

  const setTotal = async (total: number) => {
    const updated = await raffleRepository.updateTotalTickets(total);
    setStats(updated);
  };

  const percentage = stats && stats.totalTickets > 0
    ? Math.round((stats.ticketsSold / stats.totalTickets) * 100)
    : 0;

  return {
    stats,
    percentage,
    loading,
    adjustSold,
    setTotal,
    refresh: fetchStats,
  };
}
