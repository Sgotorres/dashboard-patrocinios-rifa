import { db, ensureSeedData } from '../../core/config/dbClient';
import type { CreateMerchantDTO, Merchant, PaymentStatus } from '../../domain/models/Merchant';
import type { IMerchantRepository } from '../../domain/repositories/IMerchantRepository';

export class LocalMerchantRepo implements IMerchantRepository {
  private normalizeFinances(
    status: PaymentStatus,
    totalFee: number,
    amountPaid: number
  ): { paymentStatus: PaymentStatus; amountPaid: number } {
    if (status === 'paid' || amountPaid >= totalFee) {
      return { paymentStatus: 'paid', amountPaid: totalFee };
    }
    if (status === 'unpaid' || amountPaid <= 0) {
      return { paymentStatus: 'unpaid', amountPaid: 0 };
    }
    return { paymentStatus: 'pending', amountPaid };
  }

  async getAll(): Promise<Merchant[]> {
    await ensureSeedData();
    const list = await db.merchants.toArray();
    return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async create(data: CreateMerchantDTO): Promise<Merchant> {
    await ensureSeedData();
    const finances = this.normalizeFinances(data.paymentStatus, data.totalFee, data.amountPaid);
    const newMerchant: Merchant = {
      ...data,
      ...finances,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    await db.merchants.add(newMerchant);
    return newMerchant;
  }

  async update(id: string, data: Partial<CreateMerchantDTO>): Promise<Merchant> {
    await ensureSeedData();
    const current = await db.merchants.get(id);
    if (!current) throw new Error('Comercio no encontrado');

    const totalFee = data.totalFee ?? current.totalFee;
    const rawStatus = data.paymentStatus ?? current.paymentStatus;
    const rawPaid = data.amountPaid ?? current.amountPaid;
    const finances = this.normalizeFinances(rawStatus, totalFee, rawPaid);

    const updated: Merchant = { ...current, ...data, totalFee, ...finances };
    await db.merchants.put(updated);
    return updated;
  }

  async markAsPaid(id: string): Promise<Merchant> {
    const current = await db.merchants.get(id);
    if (!current) throw new Error('Comercio no encontrado');
    return this.update(id, { paymentStatus: 'paid', amountPaid: current.totalFee });
  }

  async addPayment(id: string, additionalAmount: number): Promise<Merchant> {
    const current = await db.merchants.get(id);
    if (!current) throw new Error('Comercio no encontrado');
    const newPaid = Math.min(current.totalFee, current.amountPaid + additionalAmount);
    const newStatus: PaymentStatus = newPaid >= current.totalFee ? 'paid' : 'pending';
    return this.update(id, { paymentStatus: newStatus, amountPaid: newPaid });
  }

  async delete(id: string): Promise<void> {
    await db.merchants.delete(id);
  }
}
