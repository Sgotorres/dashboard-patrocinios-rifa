import type { IMerchantRepository } from '../repositories/IMerchantRepository';
import type { IRaffleRepository } from '../repositories/IRaffleRepository';

export class ClearAllMerchantsUseCase {
  private readonly merchantRepo: IMerchantRepository;
  private readonly raffleRepo: IRaffleRepository;

  constructor(merchantRepo: IMerchantRepository, raffleRepo: IRaffleRepository) {
    this.merchantRepo = merchantRepo;
    this.raffleRepo = raffleRepo;
  }

  async execute(): Promise<void> {
    await this.merchantRepo.deleteAll();
    const stats = await this.raffleRepo.getStats();
    if (stats) {
      await this.raffleRepo.updateStats({ ticketsSold: 0 });
    }
  }
}
