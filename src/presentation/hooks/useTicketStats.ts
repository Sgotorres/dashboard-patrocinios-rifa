import { useCallback, useEffect, useState } from 'react';
import { raffleRepository } from '../../core/di/container';
import { DEFAULT_RAFFLE_STATS } from '../../data/repositories/LocalRaffleRepo';
import type { RaffleStats, UpdateRaffleStatsDTO } from '../../domain/models/RaffleStats';

export function useTicketStats() {
  const [stats, setStats] = useState<RaffleStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const data = await raffleRepository.getStats();
      setStats(data || DEFAULT_RAFFLE_STATS);
    } catch (err) {
      console.warn('No se pudo obtener la configuración de la rifa, usando valores por defecto:', err);
      setStats(DEFAULT_RAFFLE_STATS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    raffleRepository
      .getStats()
      .then((data) => {
        if (isMounted) {
          setStats(data || DEFAULT_RAFFLE_STATS);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.warn('No se pudo obtener la configuración de la rifa, usando valores por defecto:', err);
        if (isMounted) {
          setStats(DEFAULT_RAFFLE_STATS);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const adjustSold = async (delta: number) => {
    if (!stats) return;
    try {
      const updated = await raffleRepository.adjustTicketsSold(delta);
      setStats(updated);
    } catch (err) {
      console.warn('Error al ajustar boletos vendidos:', err);
    }
  };

  const updateCampaign = async (dto: UpdateRaffleStatsDTO) => {
    try {
      const updated = await raffleRepository.updateStats(dto);
      setStats(updated);
      return updated;
    } catch (err) {
      console.warn('Error al actualizar campaña:', err);
      throw err;
    }
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
