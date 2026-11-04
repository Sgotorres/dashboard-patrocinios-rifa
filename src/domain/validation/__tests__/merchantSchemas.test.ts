import { describe, it, expect } from 'vitest';
import {
  createMerchantSchema,
  updateMerchantSchema,
  paymentSchema,
} from '../merchantSchemas';

describe('Merchant Validation Schemas (Zod)', () => {
  describe('createMerchantSchema', () => {
    it('debe validar exitosamente un patrocinador válido', () => {
      const valid = {
        name: 'Restaurante El Paisa',
        phone: '3001234567',
        currency: 'COP',
        ticketsCount: 4,
        ticketPrice: 50000,
      };

      const result = createMerchantSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('debe rechazar nombres muy cortos y teléfonos menores a 5 dígitos', () => {
      const invalid = {
        name: 'A',
        phone: '12',
        ticketsCount: 1,
        ticketPrice: 50000,
      };

      const result = createMerchantSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        const issues = result.error.issues.map((i) => i.path[0]);
        expect(issues).toContain('name');
        expect(issues).toContain('phone');
      }
    });

    it('debe rechazar ticketsCount menor a 1 o precios negativos', () => {
      const invalid = {
        name: 'Comercio Valido',
        phone: '3001234567',
        ticketsCount: 0,
        ticketPrice: -100,
      };

      const result = createMerchantSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('paymentSchema', () => {
    it('debe aceptar montos positivos', () => {
      const result = paymentSchema.safeParse({ amount: 50000, note: 'Efectivo' });
      expect(result.success).toBe(true);
    });

    it('debe rechazar montos negativos o cero', () => {
      expect(paymentSchema.safeParse({ amount: 0 }).success).toBe(false);
      expect(paymentSchema.safeParse({ amount: -50 }).success).toBe(false);
    });
  });

  describe('updateMerchantSchema', () => {
    it('debe permitir actualizaciones parciales válidas', () => {
      const result = updateMerchantSchema.safeParse({
        name: 'Nuevo Nombre',
        ticketsCount: 10,
      });
      expect(result.success).toBe(true);
    });
  });
});
