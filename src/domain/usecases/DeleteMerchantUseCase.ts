import type { IMerchantRepository } from '../repositories/IMerchantRepository';
import type { IRaffleRepository } from '../repositories/IRaffleRepository';

export class DeleteMerchantUseCase {
  private readonly merchantRepo: IMerchantRepository;
  private readonly raffleRepo: IRaffleRepository;

  constructor(merchantRepo: IMerchantRepository, raffleRepo: IRaffleRepository) {
    this.merchantRepo = merchantRepo;
    this.raffleRepo = raffleRepo;
  }

  async execute(id: string): Promise<void> {
    const target = await this.merchantRepo.getById(id);
    await this.merchantRepo.delete(id);
    if (target) {
      await this.raffleRepo.adjustTicketsSold(-target.ticketsCount);
    }
  }
}
