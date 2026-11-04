import { db } from '../../core/config/dbClient';
import type { RaffleStats, UpdateRaffleStatsDTO } from '../../domain/models/RaffleStats';
import type { IRaffleRepository } from '../../domain/repositories/IRaffleRepository';

export const CAMPAIGN_ID = 'main-campaign';

export const DEFAULT_RAFFLE_STATS: RaffleStats = {
  id: CAMPAIGN_ID,
  campaignName: 'Publicidad de Cine & Sorteo a la Playa 2026',
  totalTickets: 1000,
  ticketsSold: 0,
  ticketPrice: 50000,
  ticketPriceCOP: 50000,
  ticketPriceUSD: 10,
  targetRevenue: 50000000,
};

export class LocalRaffleRepo implements IRaffleRepository {
  async getStats(): Promise<RaffleStats> {
    try {
      const stats = await db.raffleStats.get(CAMPAIGN_ID);
      if (stats) return stats;

      // Auto-reparación transparente: si no existe registro inicial en IndexedDB,
      // guardamos los valores por defecto y los retornamos sin romper la UI.
      await db.raffleStats.put(DEFAULT_RAFFLE_STATS);
      return DEFAULT_RAFFLE_STATS;
    } catch (err) {
      console.warn('Advertencia al consultar raffleStats en IndexedDB, usando valores por defecto:', err);
      return DEFAULT_RAFFLE_STATS;
    }
  }

  async updateStats(dto: UpdateRaffleStatsDTO): Promise<RaffleStats> {
    const current = await this.getStats();
    const totalTickets = dto.totalTickets !== undefined ? Math.max(1, dto.totalTickets) : current.totalTickets;
    const ticketPrice = dto.ticketPrice !== undefined ? Math.max(0, dto.ticketPrice) : current.ticketPrice;
    const ticketsSold = dto.ticketsSold !== undefined ? Math.max(0, dto.ticketsSold) : current.ticketsSold;
    const campaignName = dto.campaignName?.trim() || current.campaignName;
    const targetRevenue = totalTickets * ticketPrice;

    const updated: RaffleStats = {
      id: CAMPAIGN_ID,
      campaignName,
      totalTickets,
      ticketsSold: Math.min(ticketsSold, totalTickets),
      ticketPrice,
      ticketPriceCOP: dto.ticketPriceCOP ?? current.ticketPriceCOP ?? 50000,
      ticketPriceUSD: dto.ticketPriceUSD ?? current.ticketPriceUSD ?? 10,
      targetRevenue,
    };

    await db.raffleStats.put(updated);
    return updated;
  }

  async adjustTicketsSold(delta: number): Promise<RaffleStats> {
    const current = await this.getStats();
    const nextSold = Math.max(0, Math.min(current.totalTickets, current.ticketsSold + delta));
    const updated: RaffleStats = { ...current, ticketsSold: nextSold };
    await db.raffleStats.put(updated);
    return updated;
  }

  async recalculateSoldFromMerchants(merchantsTicketsSum: number): Promise<RaffleStats> {
    const current = await this.getStats();
    const clampedSold = Math.max(merchantsTicketsSum, current.ticketsSold);
    const updated: RaffleStats = { ...current, ticketsSold: clampedSold };
    await db.raffleStats.put(updated);
    return updated;
  }
}
