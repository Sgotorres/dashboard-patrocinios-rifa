import type { CreateMerchantDTO, Merchant } from '../models/Merchant';

export interface IMerchantRepository {
  getAll(): Promise<Merchant[]>;
  create(data: CreateMerchantDTO): Promise<Merchant>;
  update(id: string, data: Partial<CreateMerchantDTO>): Promise<Merchant>;
  markAsPaid(id: string): Promise<Merchant>;
  addPayment(id: string, additionalAmount: number): Promise<Merchant>;
  delete(id: string): Promise<void>;
}
