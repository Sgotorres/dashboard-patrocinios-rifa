import { z } from 'zod';

export const currencySchema = z.enum(['COP', 'USD']);

export const paymentStatusSchema = z.enum(['unpaid', 'pending', 'paid']);

export const createMerchantSchema = z.object({
  name: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres'),
  address: z.string().trim().default(''),
  phone: z.string().trim().min(5, 'El teléfono debe tener al menos 5 dígitos'),
  socialUrl: z.string().trim().default(''),
  logoUrl: z.string().trim().default(''),
  currency: currencySchema.default('COP'),
  ticketsCount: z.number().int('Debe ser un número entero').min(1, 'Debe asignar al menos 1 boleto'),
  ticketPrice: z.number().min(0, 'El precio no puede ser negativo'),
  totalFee: z.number().min(0, 'La cuota total no puede ser negativa').optional(),
  amountPaid: z.number().min(0, 'El monto abonado no puede ser negativo').default(0),
  paymentStatus: paymentStatusSchema.optional(),
  initialPaymentNote: z.string().trim().optional(),
});

export const updateMerchantSchema = z.object({
  name: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres').optional(),
  address: z.string().trim().optional(),
  phone: z.string().trim().min(5, 'El teléfono debe tener al menos 5 dígitos').optional(),
  socialUrl: z.string().trim().optional(),
  logoUrl: z.string().trim().optional(),
  currency: currencySchema.optional(),
  ticketsCount: z.number().int().min(1, 'Debe asignar al menos 1 boleto').optional(),
  ticketPrice: z.number().min(0, 'El precio no puede ser negativo').optional(),
  totalFee: z.number().min(0, 'La cuota total no puede ser negativa').optional(),
  amountPaid: z.number().min(0, 'El monto abonado no puede ser negativo').optional(),
  paymentStatus: paymentStatusSchema.optional(),
});

export const paymentSchema = z.object({
  amount: z.number().positive('El monto del abono debe ser mayor a 0'),
  note: z.string().trim().optional(),
});

export type CreateMerchantInput = z.infer<typeof createMerchantSchema>;
export type UpdateMerchantInput = z.infer<typeof updateMerchantSchema>;
export type PaymentInput = z.infer<typeof paymentSchema>;
