import type { CreateMerchantDTO, CurrencyCode, Merchant, PaymentRecord, PaymentStatus } from '../models/Merchant';

export class MerchantEntity {
  /**
   * Redondeo monetario seguro: entero para COP (Pesos Colombianos) y 2 decimales para USD.
   */
  static roundMoney(amount: number, currency: CurrencyCode = 'COP'): number {
    if (currency === 'COP') return Math.round(amount);
    return Math.round((amount + Number.EPSILON) * 100) / 100;
  }

  /**
   * Determina el estado de pago del comercio en base al total y monto abonado.
   */
  static calculateStatus(
    totalFee: number,
    amountPaid: number,
    explicitStatus?: PaymentStatus
  ): { status: PaymentStatus; paid: number } {
    const cleanTotal = Math.max(0, totalFee);
    const cleanPaid = Math.max(0, amountPaid);

    if (explicitStatus === 'paid' || cleanPaid >= cleanTotal) {
      return { status: 'paid', paid: cleanTotal };
    }
    if (explicitStatus === 'unpaid' || cleanPaid <= 0) {
      return { status: 'unpaid', paid: 0 };
    }
    return { status: 'pending', paid: cleanPaid };
  }

  /**
   * Genera un nuevo objeto Merchant aplicando las reglas de negocio de creación.
   */
  static create(data: CreateMerchantDTO): Merchant {
    const currency = data.currency || 'COP';
    const tickets = Math.max(1, data.ticketsCount || 1);
    const defaultPrice = currency === 'COP' ? 50000 : 10;
    const unitPrice = this.roundMoney(Math.max(0, data.ticketPrice || defaultPrice), currency);
    const totalFee = data.totalFee !== undefined
      ? this.roundMoney(data.totalFee, currency)
      : this.roundMoney(tickets * unitPrice, currency);

    const { status, paid } = this.calculateStatus(totalFee, data.amountPaid || 0, data.paymentStatus);
    const now = new Date().toISOString();

    const history: PaymentRecord[] = [];
    if (paid > 0) {
      history.push({
        id: crypto.randomUUID(),
        amount: paid,
        date: now,
        note: data.initialNote || 'Abono inicial al registrar patrocinio',
        currency,
      });
    }

    return {
      id: crypto.randomUUID(),
      name: data.name.trim(),
      address: data.address.trim(),
      phone: data.phone.trim(),
      socialUrl: data.socialUrl?.trim() || '',
      logoUrl: data.logoUrl?.trim() || '',
      currency,
      ticketsCount: tickets,
      ticketPrice: unitPrice,
      totalFee,
      amountPaid: paid,
      paymentStatus: status,
      paymentHistory: history,
      createdAt: now,
      updatedAt: now,
    };
  }

  /**
   * Registra un abono a cuenta y genera el registro en el historial.
   */
  static applyPayment(current: Merchant, rawAmount: number, note?: string): Merchant {
    const currency = current.currency || 'COP';
    const cleanAmount = this.roundMoney(Math.max(0, rawAmount), currency);
    if (cleanAmount <= 0) return current;

    const remaining = this.roundMoney(Math.max(0, current.totalFee - current.amountPaid), currency);
    const finalAmount = Math.min(remaining, cleanAmount);
    const newPaid = this.roundMoney(current.amountPaid + finalAmount, currency);
    const { status } = this.calculateStatus(current.totalFee, newPaid);

    const newRecord: PaymentRecord = {
      id: crypto.randomUUID(),
      amount: finalAmount,
      date: new Date().toISOString(),
      note: note?.trim() || 'Abono a cuenta',
      currency,
    };

    return {
      ...current,
      amountPaid: newPaid,
      paymentStatus: status,
      paymentHistory: [newRecord, ...current.paymentHistory],
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Liquida completamente la deuda del comercio.
   */
  static liquidate(current: Merchant, note?: string): Merchant {
    const currency = current.currency || 'COP';
    const remaining = this.roundMoney(Math.max(0, current.totalFee - current.amountPaid), currency);
    const history = [...current.paymentHistory];

    if (remaining > 0) {
      history.unshift({
        id: crypto.randomUUID(),
        amount: remaining,
        date: new Date().toISOString(),
        note: note || 'Liquidación total de saldo',
        currency,
      });
    }

    return {
      ...current,
      amountPaid: current.totalFee,
      paymentStatus: 'paid',
      paymentHistory: history,
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Incrementa o reduce la cantidad de tickets del comercio recalculando la cuota.
   */
  static adjustTickets(current: Merchant, ticketsDelta: number): Merchant {
    const currency = current.currency || 'COP';
    const newTickets = Math.max(1, current.ticketsCount + ticketsDelta);
    const newTotalFee = this.roundMoney(newTickets * current.ticketPrice, currency);
    const { status } = this.calculateStatus(newTotalFee, current.amountPaid);

    return {
      ...current,
      ticketsCount: newTickets,
      totalFee: newTotalFee,
      paymentStatus: status,
      updatedAt: new Date().toISOString(),
    };
  }
}
