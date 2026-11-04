import { db } from '../../core/config/dbClient';
import { MerchantEntity } from '../../domain/entities/MerchantEntity';
import type { CreateMerchantDTO, Merchant, UpdateMerchantDTO } from '../../domain/models/Merchant';
import type { IMerchantRepository } from '../../domain/repositories/IMerchantRepository';

export class LocalMerchantRepo implements IMerchantRepository {
  async getAll(): Promise<Merchant[]> {
    const list = await db.merchants.toArray();
    return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async getById(id: string): Promise<Merchant | undefined> {
    return db.merchants.get(id);
  }

  async create(data: CreateMerchantDTO): Promise<Merchant> {
    const newMerchant = MerchantEntity.create(data);
    await db.merchants.add(newMerchant);
    return newMerchant;
  }

  async update(id: string, data: UpdateMerchantDTO): Promise<Merchant> {
    const current = await db.merchants.get(id);
    if (!current) throw new Error('Comercio no encontrado');

    const targetCurrency = data.currency || current.currency || 'COP';
    const tickets = data.ticketsCount !== undefined ? Math.max(1, data.ticketsCount) : current.ticketsCount;
    const unitPrice = data.ticketPrice !== undefined
      ? MerchantEntity.roundMoney(Math.max(0, data.ticketPrice), targetCurrency)
      : current.ticketPrice;
    const totalFee = data.totalFee !== undefined
      ? MerchantEntity.roundMoney(data.totalFee, targetCurrency)
      : MerchantEntity.roundMoney(tickets * unitPrice, targetCurrency);
    const rawPaid = data.amountPaid !== undefined
      ? MerchantEntity.roundMoney(data.amountPaid, targetCurrency)
      : current.amountPaid;
    const { status, paid } = MerchantEntity.calculateStatus(totalFee, rawPaid, data.paymentStatus);

    const updated: Merchant = {
      ...current,
      ...data,
      currency: targetCurrency,
      ticketsCount: tickets,
      ticketPrice: unitPrice,
      totalFee,
      amountPaid: paid,
      paymentStatus: status,
      updatedAt: new Date().toISOString(),
    };

    await db.merchants.put(updated);
    return updated;
  }

  async markAsPaid(id: string): Promise<Merchant> {
    const current = await db.merchants.get(id);
    if (!current) throw new Error('Comercio no encontrado');

    const updated = MerchantEntity.liquidate(current);
    await db.merchants.put(updated);
    return updated;
  }

  async addPayment(id: string, amount: number, note?: string): Promise<Merchant> {
    const current = await db.merchants.get(id);
    if (!current) throw new Error('Comercio no encontrado');

    const updated = MerchantEntity.applyPayment(current, amount, note);
    await db.merchants.put(updated);
    return updated;
  }

  async addTickets(id: string, ticketsDelta: number): Promise<Merchant> {
    const current = await db.merchants.get(id);
    if (!current) throw new Error('Comercio no encontrado');

    const updated = MerchantEntity.adjustTickets(current, ticketsDelta);
    await db.merchants.put(updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    await db.merchants.delete(id);
  }

  async deleteAll(): Promise<void> {
    await db.merchants.clear();
  }
}
