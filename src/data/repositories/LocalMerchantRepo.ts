import { db, ensureSeedData } from '../../core/config/dbClient';
import type { CreateMerchantDTO, Merchant, PaymentRecord, PaymentStatus, UpdateMerchantDTO } from '../../domain/models/Merchant';
import type { IMerchantRepository } from '../../domain/repositories/IMerchantRepository';

export class LocalMerchantRepo implements IMerchantRepository {
  private calculateStatus(totalFee: number, amountPaid: number, explicitStatus?: PaymentStatus): { status: PaymentStatus; paid: number } {
    if (explicitStatus === 'paid' || amountPaid >= totalFee) {
      return { status: 'paid', paid: totalFee };
    }
    if (explicitStatus === 'unpaid' || amountPaid <= 0) {
      return { status: 'unpaid', paid: 0 };
    }
    return { status: 'pending', paid: amountPaid };
  }

  async getAll(): Promise<Merchant[]> {
    await ensureSeedData();
    const list = await db.merchants.toArray();
    return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async getById(id: string): Promise<Merchant | undefined> {
    await ensureSeedData();
    return db.merchants.get(id);
  }

  async create(data: CreateMerchantDTO): Promise<Merchant> {
    await ensureSeedData();
    const tickets = Math.max(1, data.ticketsCount || 1);
    const unitPrice = Math.max(0, data.ticketPrice || 10);
    const totalFee = data.totalFee ?? (tickets * unitPrice);
    const { status, paid } = this.calculateStatus(totalFee, data.amountPaid || 0, data.paymentStatus);

    const now = new Date().toISOString();
    const history: PaymentRecord[] = [];
    if (paid > 0) {
      history.push({
        id: crypto.randomUUID(),
        amount: paid,
        date: now,
        note: data.initialNote || 'Abono inicial al registrar ticket',
      });
    }

    const newMerchant: Merchant = {
      id: crypto.randomUUID(),
      name: data.name.trim(),
      address: data.address.trim(),
      phone: data.phone.trim(),
      socialUrl: data.socialUrl?.trim() || '',
      logoUrl: data.logoUrl?.trim() || '',
      ticketsCount: tickets,
      ticketPrice: unitPrice,
      totalFee,
      amountPaid: paid,
      paymentStatus: status,
      paymentHistory: history,
      createdAt: now,
      updatedAt: now,
    };

    await db.merchants.add(newMerchant);
    return newMerchant;
  }

  async update(id: string, data: UpdateMerchantDTO): Promise<Merchant> {
    await ensureSeedData();
    const current = await db.merchants.get(id);
    if (!current) throw new Error('Comercio no encontrado');

    const tickets = data.ticketsCount !== undefined ? Math.max(1, data.ticketsCount) : current.ticketsCount;
    const unitPrice = data.ticketPrice !== undefined ? Math.max(0, data.ticketPrice) : current.ticketPrice;
    const totalFee = data.totalFee !== undefined ? data.totalFee : (tickets * unitPrice);
    const rawPaid = data.amountPaid !== undefined ? data.amountPaid : current.amountPaid;
    const { status, paid } = this.calculateStatus(totalFee, rawPaid, data.paymentStatus);

    const updated: Merchant = {
      ...current,
      ...data,
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

    const remaining = Math.max(0, current.totalFee - current.amountPaid);
    const history = [...current.paymentHistory];
    if (remaining > 0) {
      history.push({
        id: crypto.randomUUID(),
        amount: remaining,
        date: new Date().toISOString(),
        note: 'Liquidación completa de saldo',
      });
    }

    const updated: Merchant = {
      ...current,
      amountPaid: current.totalFee,
      paymentStatus: 'paid',
      paymentHistory: history,
      updatedAt: new Date().toISOString(),
    };

    await db.merchants.put(updated);
    return updated;
  }

  async addPayment(id: string, amount: number, note?: string): Promise<Merchant> {
    const current = await db.merchants.get(id);
    if (!current) throw new Error('Comercio no encontrado');

    const cleanAmount = Math.max(0, amount);
    const newPaid = Math.min(current.totalFee, current.amountPaid + cleanAmount);
    const { status } = this.calculateStatus(current.totalFee, newPaid);

    const newRecord: PaymentRecord = {
      id: crypto.randomUUID(),
      amount: cleanAmount,
      date: new Date().toISOString(),
      note: note || 'Abono a cuenta',
    };

    const updated: Merchant = {
      ...current,
      amountPaid: newPaid,
      paymentStatus: status,
      paymentHistory: [newRecord, ...current.paymentHistory],
      updatedAt: new Date().toISOString(),
    };

    await db.merchants.put(updated);
    return updated;
  }

  async addTickets(id: string, ticketsDelta: number): Promise<Merchant> {
    const current = await db.merchants.get(id);
    if (!current) throw new Error('Comercio no encontrado');

    const newTickets = Math.max(1, current.ticketsCount + ticketsDelta);
    const newTotalFee = newTickets * current.ticketPrice;
    const { status } = this.calculateStatus(newTotalFee, current.amountPaid);

    const updated: Merchant = {
      ...current,
      ticketsCount: newTickets,
      totalFee: newTotalFee,
      paymentStatus: status,
      updatedAt: new Date().toISOString(),
    };

    await db.merchants.put(updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    await db.merchants.delete(id);
  }
}
