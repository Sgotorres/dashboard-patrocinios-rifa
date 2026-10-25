import type { RaffleStats } from '../models/RaffleStats';

export interface IRaffleRepository {
  getStats(): Promise<RaffleStats>;
  updateTicketsSold(newCount: number): Promise<RaffleStats>;
  updateTotalTickets(newTotal: number): Promise<RaffleStats>;
}
