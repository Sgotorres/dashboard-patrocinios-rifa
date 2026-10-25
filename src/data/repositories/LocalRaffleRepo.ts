import { db, ensureSeedData } from '../../core/config/dbClient';
import type { RaffleStats } from '../../domain/models/RaffleStats';
import type { IRaffleRepository } from '../../domain/repositories/IRaffleRepository';

const CAMPAIGN_ID = 'main-campaign';

export class LocalRaffleRepo implements IRaffleRepository {
  async getStats(): Promise<RaffleStats> {
    await ensureSeedData();
    const stats = await db.raffleStats.get(CAMPAIGN_ID);
    if (!stats) throw new Error('Configuración de rifa no encontrada');
    return stats;
  }

  async updateTicketsSold(newCount: number): Promise<RaffleStats> {
    const current = await this.getStats();
    const clampedCount = Math.max(0, Math.min(current.totalTickets, newCount));
    const updated: RaffleStats = { ...current, ticketsSold: clampedCount };
    await db.raffleStats.put(updated);
    return updated;
  }

  async updateTotalTickets(newTotal: number): Promise<RaffleStats> {
    const current = await this.getStats();
    const validTotal = Math.max(1, newTotal);
    const updated: RaffleStats = {
      ...current,
      totalTickets: validTotal,
      ticketsSold: Math.min(current.ticketsSold, validTotal),
    };
    await db.raffleStats.put(updated);
    return updated;
  }
}
