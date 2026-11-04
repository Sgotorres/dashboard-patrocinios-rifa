import type { Merchant } from '../models/Merchant';
import type { IMerchantRepository } from '../repositories/IMerchantRepository';
import type { IRaffleRepository } from '../repositories/IRaffleRepository';

export class AddTicketsUseCase {
  private readonly merchantRepo: IMerchantRepository;
  private readonly raffleRepo: IRaffleRepository;

  constructor(merchantRepo: IMerchantRepository, raffleRepo: IRaffleRepository) {
    this.merchantRepo = merchantRepo;
    this.raffleRepo = raffleRepo;
  }

  async execute(id: string, ticketsDelta: number): Promise<Merchant> {
    const updated = await this.merchantRepo.addTickets(id, ticketsDelta);
    await this.raffleRepo.adjustTicketsSold(ticketsDelta);
    return updated;
  }
}
