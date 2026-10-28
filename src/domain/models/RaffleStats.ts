export interface RaffleStats {
  id: string;
  campaignName: string;
  totalTickets: number; // Meta impuesta de tickets
  ticketsSold: number;  // Total tickets vendidos
  ticketPrice: number;  // Precio base por ticket
  targetRevenue: number;// Total meta financiera
}

export interface UpdateRaffleStatsDTO {
  campaignName?: string;
  totalTickets?: number;
  ticketsSold?: number;
  ticketPrice?: number;
}
