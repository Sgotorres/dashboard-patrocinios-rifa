import type { Merchant } from '../models/Merchant';
import type { IMerchantRepository } from '../repositories/IMerchantRepository';

export class RegisterPaymentUseCase {
  private merchantRepo: IMerchantRepository;

  constructor(merchantRepo: IMerchantRepository) {
    this.merchantRepo = merchantRepo;
  }

  async execute(merchantId: string, amount: number, note?: string): Promise<Merchant> {
    return this.merchantRepo.addPayment(merchantId, amount, note);
  }
}
