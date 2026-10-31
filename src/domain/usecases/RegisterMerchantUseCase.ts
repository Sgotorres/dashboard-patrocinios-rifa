import type { CreateMerchantDTO, Merchant } from '../models/Merchant';
import type { IMerchantRepository } from '../repositories/IMerchantRepository';
import type { IRaffleRepository } from '../repositories/IRaffleRepository';

export class RegisterMerchantUseCase {
  private merchantRepo: IMerchantRepository;
  private raffleRepo: IRaffleRepository;

  constructor(merchantRepo: IMerchantRepository, raffleRepo: IRaffleRepository) {
    this.merchantRepo = merchantRepo;
    this.raffleRepo = raffleRepo;
  }

  async execute(dto: CreateMerchantDTO): Promise<Merchant> {
    const created = await this.merchantRepo.create(dto);
    await this.raffleRepo.adjustTicketsSold(created.ticketsCount);
    return created;
  }
}
