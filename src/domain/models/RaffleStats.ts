export interface RaffleStats {
  id: string;
  campaignName: string;
  totalTickets: number; // Meta impuesta de tickets / espacios (1000, 2000, etc.)
  ticketsSold: number;  // Total tickets vendidos
  ticketPrice: number;  // Precio base
  ticketPriceCOP?: number; // Precio sugerido en Pesos Colombianos (COP)
  ticketPriceUSD?: number; // Precio sugerido en Dólares (USD)
  targetRevenue: number;// Total meta financiera calculada
}

export interface UpdateRaffleStatsDTO {
  campaignName?: string;
  totalTickets?: number;
  ticketsSold?: number;
  ticketPrice?: number;
  ticketPriceCOP?: number;
  ticketPriceUSD?: number;
}
