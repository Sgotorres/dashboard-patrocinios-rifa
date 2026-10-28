import { db, ensureSeedData } from '../../core/config/dbClient';
import type { RaffleStats, UpdateRaffleStatsDTO } from '../../domain/models/RaffleStats';
import type { IRaffleRepository } from '../../domain/repositories/IRaffleRepository';

const CAMPAIGN_ID = 'main-campaign';

export class LocalRaffleRepo implements IRaffleRepository {
  async getStats(): Promise<RaffleStats> {
    await ensureSeedData();
    const stats = await db.raffleStats.get(CAMPAIGN_ID);
    if (!stats) throw new Error('Configuración de rifa no encontrada');
    return stats;
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
