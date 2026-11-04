import type { Merchant } from '../models/Merchant';
import type { IMerchantRepository } from '../repositories/IMerchantRepository';

export class MarkAsPaidUseCase {
  private readonly merchantRepo: IMerchantRepository;

  constructor(merchantRepo: IMerchantRepository) {
    this.merchantRepo = merchantRepo;
  }

  async execute(id: string): Promise<Merchant> {
    return this.merchantRepo.markAsPaid(id);
  }
}
