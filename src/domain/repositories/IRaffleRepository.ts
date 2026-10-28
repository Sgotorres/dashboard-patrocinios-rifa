import type { RaffleStats, UpdateRaffleStatsDTO } from '../models/RaffleStats';

export interface IRaffleRepository {
  getStats(): Promise<RaffleStats>;
  updateStats(dto: UpdateRaffleStatsDTO): Promise<RaffleStats>;
  adjustTicketsSold(delta: number): Promise<RaffleStats>;
  recalculateSoldFromMerchants(merchantsTicketsSum: number): Promise<RaffleStats>;
}
