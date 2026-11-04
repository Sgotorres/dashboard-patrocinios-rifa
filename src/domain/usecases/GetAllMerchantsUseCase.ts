import type { Merchant } from '../models/Merchant';
import type { IMerchantRepository } from '../repositories/IMerchantRepository';
import type { IRaffleRepository } from '../repositories/IRaffleRepository';

export class GetAllMerchantsUseCase {
  private readonly merchantRepo: IMerchantRepository;
  private readonly raffleRepo: IRaffleRepository;

  constructor(merchantRepo: IMerchantRepository, raffleRepo: IRaffleRepository) {
    this.merchantRepo = merchantRepo;
    this.raffleRepo = raffleRepo;
  }

  async execute(): Promise<Merchant[]> {
    const list = await this.merchantRepo.getAll();
    const sumTickets = list.reduce((acc, m) => acc + m.ticketsCount, 0);
    await this.raffleRepo.recalculateSoldFromMerchants(sumTickets);
    return list;
  }
}
