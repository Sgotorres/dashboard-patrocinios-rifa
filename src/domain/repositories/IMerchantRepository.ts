import type { CreateMerchantDTO, Merchant, UpdateMerchantDTO } from '../models/Merchant';

export interface IMerchantRepository {
  getAll(): Promise<Merchant[]>;
  getById(id: string): Promise<Merchant | undefined>;
  create(dto: CreateMerchantDTO): Promise<Merchant>;
  update(id: string, dto: UpdateMerchantDTO): Promise<Merchant>;
  markAsPaid(id: string): Promise<Merchant>;
  addPayment(id: string, amount: number, note?: string): Promise<Merchant>;
  addTickets(id: string, ticketsDelta: number): Promise<Merchant>;
  delete(id: string): Promise<void>;
}
