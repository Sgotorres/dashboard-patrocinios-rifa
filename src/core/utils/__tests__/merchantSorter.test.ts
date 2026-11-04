import { describe, it, expect } from 'vitest';
import { sortMerchants } from '../merchantSorter';
import type { Merchant } from '../../../domain/models/Merchant';

const createMockMerchant = (partial: Partial<Merchant>): Merchant => ({
  id: partial.id || 'id-default',
  name: partial.name || 'Default Name',
  address: 'Calle Falsa 123',
  phone: '3001234567',
  currency: partial.currency || 'COP',
  ticketsCount: partial.ticketsCount ?? 1,
  ticketPrice: partial.ticketPrice ?? 50000,
  totalFee: partial.totalFee ?? 50000,
  amountPaid: partial.amountPaid ?? 0,
  paymentStatus: partial.paymentStatus || 'unpaid',
  paymentHistory: [],
  createdAt: partial.createdAt || '2026-01-01T10:00:00.000Z',
  updatedAt: partial.updatedAt || '2026-01-01T10:00:00.000Z',
});

describe('merchantSorter', () => {
  const m1 = createMockMerchant({
    id: 'm1',
    name: 'Zapatería Central',
    totalFee: 100000,
    amountPaid: 20000, // deuda: 80000
    ticketsCount: 2,
    createdAt: '2026-01-01T10:00:00.000Z',
  });

  const m2 = createMockMerchant({
    id: 'm2',
    name: 'Almacén París',
    totalFee: 200000,
    amountPaid: 50000, // deuda: 150000
    ticketsCount: 4,
    createdAt: '2026-01-03T10:00:00.000Z',
  });

  const m3 = createMockMerchant({
    id: 'm3',
    name: 'Bodega El Sol',
    totalFee: 300000,
    amountPaid: 250000, // deuda: 50000
    ticketsCount: 6,
    createdAt: '2026-01-02T10:00:00.000Z',
  });

  const list = [m1, m2, m3];

  it('debe ordenar alfabéticamente por nombre', () => {
    const sorted = sortMerchants(list, 'name');
    expect(sorted.map((m) => m.name)).toEqual([
      'Almacén París',
      'Bodega El Sol',
      'Zapatería Central',
    ]);
  });

  it('debe ordenar por mayor deuda descendente (debt-desc)', () => {
    const sorted = sortMerchants(list, 'debt-desc');
    // deudas: m2 = 150000, m1 = 80000, m3 = 50000
    expect(sorted.map((m) => m.id)).toEqual(['m2', 'm1', 'm3']);
  });

  it('debe ordenar por mayor abono descendente (paid-desc)', () => {
    const sorted = sortMerchants(list, 'paid-desc');
    // abonos: m3 = 250000, m2 = 50000, m1 = 20000
    expect(sorted.map((m) => m.id)).toEqual(['m3', 'm2', 'm1']);
  });

  it('debe ordenar por más boletos descendente (tickets-desc)', () => {
    const sorted = sortMerchants(list, 'tickets-desc');
    // tickets: m3 = 6, m2 = 4, m1 = 2
    expect(sorted.map((m) => m.id)).toEqual(['m3', 'm2', 'm1']);
  });

  it('debe ordenar por fecha reciente descendente (recent)', () => {
    const sorted = sortMerchants(list, 'recent');
    // fechas: m2 (03 de enero), m3 (02 de enero), m1 (01 de enero)
    expect(sorted.map((m) => m.id)).toEqual(['m2', 'm3', 'm1']);
  });
});
