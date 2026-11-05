import { useCallback, useEffect, useState } from 'react';
import { raffleRepository } from '../../core/di/container';
import type { RaffleStats, UpdateRaffleStatsDTO } from '../../domain/models/RaffleStats';

export function useTicketStats(actualTicketsSold?: number) {
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

  // Si se provee la suma real de boletos de los comercios registrados, sincronizar con la DB
  useEffect(() => {
    if (actualTicketsSold !== undefined && stats && stats.ticketsSold !== actualTicketsSold) {
      raffleRepository.recalculateSoldFromMerchants(actualTicketsSold).then((updated) => {
        setStats(updated);
      });
    }
  }, [actualTicketsSold, stats]);

  const updateCampaign = async (dto: UpdateRaffleStatsDTO) => {
    const updated = await raffleRepository.updateStats(dto);
    setStats(updated);
    return updated;
  };

  const effectiveSold = actualTicketsSold !== undefined
    ? actualTicketsSold
    : (stats?.ticketsSold ?? 0);

  const totalTickets = stats?.totalTickets ?? 500;

  const percentage = totalTickets > 0
    ? Math.min(100, Math.round((effectiveSold / totalTickets) * 100))
    : 0;

  const remainingTickets = Math.max(0, totalTickets - effectiveSold);

  const effectiveStats: RaffleStats | null = stats
    ? { ...stats, ticketsSold: effectiveSold }
    : null;

  return {
    stats: effectiveStats,
    percentage,
    remainingTickets,
    loading,
    updateCampaign,
    refresh: fetchStats,
  };
}
