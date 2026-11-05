import { db, ensureSeedData } from '../../core/config/dbClient';
import type { CreateMerchantDTO, Merchant, PaymentRecord, PaymentStatus, UpdateMerchantDTO } from '../../domain/models/Merchant';
import type { IMerchantRepository } from '../../domain/repositories/IMerchantRepository';

export class LocalMerchantRepo implements IMerchantRepository {
  private calculateStatus(
    totalFee: number,
    amountPaid: number,
    explicitStatus?: PaymentStatus
  ): { status: PaymentStatus; paid: number } {
    const fee = Math.round(totalFee * 100) / 100;
    const paid = Math.round(amountPaid * 100) / 100;
    const remaining = fee - paid;

    // Tolerancia de 5 céntimos para cierres contables por tasa de cambio
    if (explicitStatus === 'paid' || remaining <= 0.05) {
      return { status: 'paid', paid: fee };
    }
    if (explicitStatus === 'unpaid' && paid <= 0) {
      return { status: 'unpaid', paid: 0 };
    }
    if (paid > 0) {
      return { status: 'pending', paid };
    }
    return { status: 'unpaid', paid: 0 };
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
    const unitPrice = Math.max(0, data.ticketPrice ?? 10);
    const totalFee = Math.round((data.totalFee ?? (tickets * unitPrice)) * 100) / 100;
    const { status, paid } = this.calculateStatus(totalFee, data.amountPaid || 0, data.paymentStatus);

    const now = new Date().toISOString();
    const history: PaymentRecord[] = [];
    if (paid > 0) {
      history.push({
        id: crypto.randomUUID(),
        amount: paid,
        date: now,
        note: data.initialNote || (status === 'paid' ? 'Pago total al registrar ticket' : 'Abono inicial al registrar ticket'),
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
    const totalFee = data.totalFee !== undefined ? data.totalFee : Math.round(tickets * unitPrice * 100) / 100;
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

    const remaining = Math.max(0, Math.round((current.totalFee - current.amountPaid) * 100) / 100);
    const history = [...current.paymentHistory];
    if (remaining > 0) {
      history.unshift({
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

    const cleanAmount = Math.max(0, Math.round(amount * 100) / 100);
    let newPaid = Math.round((current.amountPaid + cleanAmount) * 100) / 100;

    // Si resta 5 céntimos o menos tras el abono, cerrar en solvente total
    if (current.totalFee - newPaid <= 0.05) {
      newPaid = current.totalFee;
    }

    const { status, paid } = this.calculateStatus(current.totalFee, newPaid);

    const newRecord: PaymentRecord = {
      id: crypto.randomUUID(),
      amount: cleanAmount,
      date: new Date().toISOString(),
      note: note || 'Abono a cuenta',
    };

    const updated: Merchant = {
      ...current,
      amountPaid: paid,
      paymentStatus: status,
      paymentHistory: [newRecord, ...current.paymentHistory],
      updatedAt: new Date().toISOString(),
    };

    await db.merchants.put(updated);
    return updated;
  }

  async addTickets(
    id: string,
    ticketsDelta: number,
    unitPrice?: number,
    paymentAmount?: number,
    paymentNote?: string
  ): Promise<Merchant> {
    const current = await db.merchants.get(id);
    if (!current) throw new Error('Comercio no encontrado');

    const effectivePrice = unitPrice !== undefined && unitPrice >= 0 ? unitPrice : current.ticketPrice;
    const newTickets = Math.max(1, current.ticketsCount + ticketsDelta);
    const addedFee = Math.round(ticketsDelta * effectivePrice * 100) / 100;
    const newTotalFee = Math.round((current.totalFee + addedFee) * 100) / 100;

    let newPaid = current.amountPaid;
    const history = [...current.paymentHistory];

    if (paymentAmount && paymentAmount > 0) {
      const cleanPayment = Math.round(paymentAmount * 100) / 100;
      newPaid = Math.round((newPaid + cleanPayment) * 100) / 100;
      history.unshift({
        id: crypto.randomUUID(),
        amount: cleanPayment,
        date: new Date().toISOString(),
        note: paymentNote || `Abono de ${cleanPayment}$ al sumar ${ticketsDelta} tickets`,
      });
    }

    const { status, paid } = this.calculateStatus(newTotalFee, newPaid);

    const updated: Merchant = {
      ...current,
      ticketsCount: newTickets,
      ticketPrice: effectivePrice,
      totalFee: newTotalFee,
      amountPaid: paid,
      paymentStatus: status,
      paymentHistory: history,
      updatedAt: new Date().toISOString(),
    };

    await db.merchants.put(updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    await db.merchants.delete(id);
  }
}
