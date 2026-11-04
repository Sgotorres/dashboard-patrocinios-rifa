import type { Merchant, UpdateMerchantDTO } from '../models/Merchant';
import type { IMerchantRepository } from '../repositories/IMerchantRepository';
import type { IRaffleRepository } from '../repositories/IRaffleRepository';

export class UpdateMerchantUseCase {
  private readonly merchantRepo: IMerchantRepository;
  private readonly raffleRepo: IRaffleRepository;

  constructor(merchantRepo: IMerchantRepository, raffleRepo: IRaffleRepository) {
    this.merchantRepo = merchantRepo;
    this.raffleRepo = raffleRepo;
  }

  async execute(id: string, dto: UpdateMerchantDTO): Promise<Merchant> {
    const current = await this.merchantRepo.getById(id);
    const updated = await this.merchantRepo.update(id, dto);

    if (current && dto.ticketsCount !== undefined) {
      const diff = updated.ticketsCount - current.ticketsCount;
      if (diff !== 0) {
        await this.raffleRepo.adjustTicketsSold(diff);
      }
    }

    return updated;
  }
}
