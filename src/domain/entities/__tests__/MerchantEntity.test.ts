import { describe, it, expect } from 'vitest';
import { MerchantEntity } from '../MerchantEntity';
import type { Merchant } from '../../models/Merchant';

describe('MerchantEntity', () => {
  describe('calculateStatus', () => {
    it('debe marcar como unpaid si amountPaid es 0', () => {
      const result = MerchantEntity.calculateStatus(250000, 0);
      expect(result.status).toBe('unpaid');
      expect(result.paid).toBe(0);
    });

    it('debe marcar como pending si amountPaid es menor que totalFee', () => {
      const result = MerchantEntity.calculateStatus(250000, 100000);
      expect(result.status).toBe('pending');
      expect(result.paid).toBe(100000);
    });

    it('debe marcar como paid si amountPaid cubre o supera totalFee', () => {
      const result = MerchantEntity.calculateStatus(250000, 250000);
      expect(result.status).toBe('paid');
      expect(result.paid).toBe(250000);

      const overpaid = MerchantEntity.calculateStatus(250000, 300000);
      expect(overpaid.status).toBe('paid');
    });

    it('debe respetar el estado paid si se fuerza explícitamente', () => {
      const result = MerchantEntity.calculateStatus(250000, 0, 'paid');
      expect(result.status).toBe('paid');
      expect(result.paid).toBe(250000);
    });
  });

  describe('liquidate', () => {
    it('debe liquidar completamente la deuda y registrar en el historial de pagos', () => {
      const initial: Merchant = {
        id: 'm1',
        name: 'Test Comercio',
        address: 'Calle 1',
        phone: '12345',
        currency: 'COP',
        ticketsCount: 2,
        ticketPrice: 50000,
        totalFee: 100000,
        amountPaid: 30000,
        paymentStatus: 'pending',
        paymentHistory: [],
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      };

      const liquidated = MerchantEntity.liquidate(initial);
      expect(liquidated.amountPaid).toBe(100000);
      expect(liquidated.paymentStatus).toBe('paid');
      expect(liquidated.paymentHistory).toHaveLength(1);
      expect(liquidated.paymentHistory[0].amount).toBe(70000);
    });
  });

  describe('applyPayment', () => {
    it('debe sumar el abono y actualizar el estado a paid si liquida el total', () => {
      const initial: Merchant = {
        id: 'm1',
        name: 'Comercio A',
        address: 'Calle 2',
        phone: '12345',
        currency: 'USD',
        ticketsCount: 5,
        ticketPrice: 10,
        totalFee: 50,
        amountPaid: 20,
        paymentStatus: 'pending',
        paymentHistory: [],
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      };

      const withPayment = MerchantEntity.applyPayment(initial, 30, 'Segundo abono');
      expect(withPayment.amountPaid).toBe(50);
      expect(withPayment.paymentStatus).toBe('paid');
      expect(withPayment.paymentHistory).toHaveLength(1);
      expect(withPayment.paymentHistory[0].note).toBe('Segundo abono');
    });
  });

  describe('adjustTickets', () => {
    it('debe incrementar tickets y recalcular totalFee proporcionalmente', () => {
      const initial: Merchant = {
        id: 'm1',
        name: 'Comercio B',
        address: 'Calle 3',
        phone: '12345',
        currency: 'COP',
        ticketsCount: 2,
        ticketPrice: 50000,
        totalFee: 100000,
        amountPaid: 100000,
        paymentStatus: 'paid',
        paymentHistory: [],
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      };

      const adjusted = MerchantEntity.adjustTickets(initial, 3);
      expect(adjusted.ticketsCount).toBe(5);
      expect(adjusted.totalFee).toBe(250000);
      expect(adjusted.amountPaid).toBe(100000);
      expect(adjusted.paymentStatus).toBe('pending');
    });
  });

  describe('roundMoney', () => {
    it('debe redondear a enteros para COP y a 2 decimales para USD', () => {
      expect(MerchantEntity.roundMoney(50000.75, 'COP')).toBe(50001);
      expect(MerchantEntity.roundMoney(12.3456, 'USD')).toBe(12.35);
    });
  });
});
