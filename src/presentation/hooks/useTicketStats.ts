import { useCallback, useEffect, useState } from 'react';
import { raffleRepository } from '../../core/di/container';
import type { RaffleStats, UpdateRaffleStatsDTO } from '../../domain/models/RaffleStats';

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
    const updated = await raffleRepository.adjustTicketsSold(delta);
    setStats(updated);
  };

  const updateCampaign = async (dto: UpdateRaffleStatsDTO) => {
    const updated = await raffleRepository.updateStats(dto);
    setStats(updated);
    return updated;
  };

  const percentage = stats && stats.totalTickets > 0
    ? Math.min(100, Math.round((stats.ticketsSold / stats.totalTickets) * 100))
    : 0;

  const remainingTickets = stats ? Math.max(0, stats.totalTickets - stats.ticketsSold) : 0;

  return {
    stats,
    percentage,
    remainingTickets,
    loading,
    adjustSold,
    updateCampaign,
    refresh: fetchStats,
  };
}
